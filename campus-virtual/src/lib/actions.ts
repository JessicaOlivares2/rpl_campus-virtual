// src/lib/actions.ts

"use server";

import { redirect } from "next/navigation";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import * as fs from 'fs/promises';
import * as path from 'path';
import { slugify } from '@/lib/utils';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { simpleSlugify } from '@/lib/utils';
// ⬇️ NUEVAS IMPORTACIONES REQUERIDAS PARA EJECUCIÓN REAL ⬇️
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import util from 'util';
const execPromise = promisify(exec);
// ⬆️ FIN NUEVAS IMPORTACIONES ⬆️

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'test-files'); 

// Esquema de Zod para la validación de la entrada
const registerSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  lastName: z.string().min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Ingrese un email válido" }),
  DNI: z.string().regex(/^\d{7,8}$/, {
    message: "El DNI debe tener 7 u 8 dígitos sin puntos ni espacios",
  }),
  birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: "Formato de fecha inválido (dd/mm/aaaa)",
  }),
  commissionCode: z.string().min(1, { message: "El código de comisión es requerido" }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const moduleSchema = z.object({
  title: z.string().min(1, "El título es obligatorio."),
  courseId: z.string(),
});

const assignmentSchema = z.object({
  title: z.string().min(1, "El título es obligatorio."),
  description: z.string().optional(),
  type: z.enum(["Lesson", "Quiz", "Project"]),
  moduleId: z.string(),
  testFile: z.instanceof(File, { message: "El archivo de prueba es obligatorio para ejercicios de código." }).optional(), 
});

// Función de utilidad para convertir la fecha de 'dd/mm/aaaa' a 'mm/dd/aaaa'
function convertDate(dateString: string) {
  const [day, month, year] = dateString.split("/");
  return `${month}/${day}/${year}`;
}

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (existingUser) {
      throw new Error("El email ya está registrado");
    }

    // Buscar la comisión por el código, eliminando cualquier espacio en blanco
    const commission = await prisma.commission.findFirst({
      where: { registrationCode: values.commissionCode.trim() },
      include: {
        courses: true,
      },
    });

    if (!commission) {
      throw new Error("Código de comisión inválido");
    }

    // Convertir la fecha antes de crear el objeto Date
    const convertedDate = convertDate(values.birthDate);
    const birthDateObject = new Date(convertedDate);

    // Validar si el objeto de fecha es válido
    if (isNaN(birthDateObject.getTime())) {
      throw new Error("Formato de fecha de nacimiento inválido");
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await prisma.user.create({
      data: {
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        DNI: values.DNI,
        birthDate: birthDateObject,
        password: hashedPassword,
        role: "STUDENT",
        // Conecta el usuario a la comisión
        commissionId: commission.id,
        // Conecta el usuario a todos los cursos de esa comisión
        coursesJoined: {
          connect: commission.courses.map((course: { id: any; }) => ({ id: course.id })),
        },
      },
    });

    revalidatePath("/login");
    redirect("/login");
  } catch (error) {
    if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error en registerUser:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Error al registrar el usuario");
  }
}

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  try {
    let user = null;
    let role = null;

    // 1. Intentar encontrar al usuario como un DOCENTE
    const teacher = await prisma.teacher.findUnique({
      where: { email },
    });

    if (teacher) {
      // Necesitas un campo `password` en tu modelo `Teacher`
      const isPasswordValid = await bcrypt.compare(password, teacher.password);
      if (!isPasswordValid) {
        throw new Error("Credenciales inválidas");
      }
      user = teacher;
      role = "TEACHER";
    } else {
      // 2. Si no es un docente, intentar encontrarlo como un ALUMNO
      const student = await prisma.user.findUnique({
        where: { email },
      });

      if (!student) {
        throw new Error("Credenciales inválidas");
      }

      const isPasswordValid = await bcrypt.compare(password, student.password);
      if (!isPasswordValid) {
        throw new Error("Credenciales inválidas");
      }
      user = student;
      role = "STUDENT";
    }

    // 3. Configurar la cookie de sesión con el ID y el rol
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: role, // Guarda el rol para futuras validaciones
    };

    (await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // Revalida la ruta del dashboard después del login
    revalidatePath("/dashboard");

    // Redirige a la página principal del dashboard
    redirect("/dashboard");
  } catch (error) {
    if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error en loginUser:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Error al iniciar sesión");
  }
}
export async function logoutUser() {
  (await cookies()).delete("session");
  redirect("/login");
}

// ejercicios:
export async function updateStudentProgress(studentId: number, assignmentId: number) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { module: { include: { course: true } } },
    });

    if (!assignment) {
      throw new Error("Ejercicio no encontrado.");
    }

    await prisma.studentProgress.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        isCompleted: true,
        completionDate: new Date(),
      },
      create: {
        studentId,
        assignmentId,
        isCompleted: true,
        completionDate: new Date(),
      },
    });

    revalidatePath(`/dashboard/${assignment.module.course.id}/course-slug`);
    
    return { success: true, message: "Ejercicio marcado como completado." };
  } catch (error) {
    console.error("Error al actualizar el progreso del estudiante:", error);
    return { success: false, message: "Hubo un error al actualizar el progreso." };
  }
}

//Docente-crear curso deaa
// ... (importaciones y demás código)

export async function createCourse(formData: FormData) {
  const subject = formData.get('subject') as string;
  const commission = formData.get('commission') as string;
  const generation = formData.get('generation') as string;
  const description = formData.get('description') as string;
  // Asumimos que tienes el ID del docente en la sesión.
  const teacherId = 1;

  if (!subject || !commission || !generation || !description) {
    return { error: 'Todos los campos son obligatorios.' };
  }

  // **********************************************
  // 1. Genera el slug A PARTIR del título
  // **********************************************
  const generatedSlug = slugify(subject);
  
  try {
    // 2. Encuentra la comisión y a todos sus estudiantes.
    const commissionRecord = await prisma.commission.findFirst({
      where: { name: commission },
      include: {
        students: true, // Incluye a los estudiantes de la comisión
      },
    });

    if (!commissionRecord) {
      return { error: 'La comisión seleccionada no existe.' };
    }
    
    // 3. Crea el nuevo curso y lo conecta a la comisión.
    const newCourse = await prisma.course.create({
      data: {
        title: `${subject}`,
        slug: generatedSlug, // slug
        description: description,
        teacherId: teacherId,
        commissions: {
          connect: {
            id: commissionRecord.id,
          },
        },
        // Opcional: También puedes conectar a los estudiantes directamente aquí
       students: {
          connect: commissionRecord.students.map(student => ({ id: student.id })),
        },
      },
    });

    console.log('Curso creado con éxito:', newCourse);
    revalidatePath("/dashboard/cursos");
    return { success: true };
  } catch (error) {
    console.error('Error al crear el curso:', error);
    return { error: 'Ocurrió un error al guardar el curso.' };
  }
}

//Eliminar curso Docente prr
export async function deleteCourse(formData: FormData) {
  const courseId = formData.get('courseId') as string;

  if (!courseId) {
    return { error: 'ID del curso no proporcionado.' };
  }

  try {
    // Elimina el curso de la base de datos
    await prisma.course.delete({
      where: {
        id: parseInt(courseId),
      },
    });

    console.log(`Curso con ID ${courseId} eliminado con éxito.`);
    return { success: true };
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    return { error: 'Ocurrió un error al eliminar el curso.' };
  }
}

//crear unidad /(docentre)
export async function createModule(formData: FormData) {
  const parsed = moduleSchema.safeParse({
    title: formData.get("title"),
    courseId: formData.get("courseId"),
  });

  if (!parsed.success) {
    const flattenedErrors = parsed.error.flatten();
    console.error(flattenedErrors.fieldErrors); 
    return {
      success: false,
      errors: flattenedErrors.fieldErrors, 
    };
  }

  const { title, courseId } = parsed.data;

  try {
    await prisma.module.create({
      data: {
        title,
        courseId: parseInt(courseId),
      },
    });
    revalidatePath(`/dashboard/cursos/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Error al crear el módulo:", error);
    return {
      success: false,
      error: "Error al crear el módulo. Inténtalo de nuevo.",
    };
  }
}

//crear ejercicie /(docente)
// Esta función auxiliar procesa el archivo subido y extrae su contenido (string)
async function processTestFile(testFile: File, assignmentId: number) {
    const buffer = Buffer.from(await testFile.arrayBuffer());
    const testCodeContent = buffer.toString('utf-8');

    await prisma.testFile.create({
        data: {
            filename: testFile.name,
            content: testCodeContent, // Guardamos el contenido en lugar del path de almacenamiento
            assignmentId: assignmentId,
        }
    });
}

export async function createAssignment(formData: FormData) {
    
    // Extracción de datos (adaptada a tu estructura)
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const type = formData.get('type') as string; 
    const moduleIdStr = formData.get('moduleId') as string;
    const testFile = formData.get('testFile') as File | null;
    
    const moduleId = parseInt(moduleIdStr);

    if (!title || !moduleId) {
         return { success: false, message: "Error de validación: Título y Módulo son requeridos." };
    }
    
    const slug = simpleSlugify(title) + '-' + Date.now().toString().slice(-4);
    
    // Validación de negocio: debe haber archivo para Quiz/Project
    const isCodeAssignment = type === 'Quiz' || type === 'Project';
    if (isCodeAssignment && (!testFile || testFile.size === 0)) {
        return { success: false, message: "Debe subir un archivo de pruebas (.py) para Exámenes y Proyectos." };
    }
    
    try {
        // Crear la Asignación
        const newAssignment = await prisma.assignment.create({
            data: { title, slug, description, type, moduleId }
        });

        // Procesar y guardar el CONTENIDO del archivo de prueba (si existe)
        if (testFile && testFile.size > 0) {
            await processTestFile(testFile, newAssignment.id);
        }

        // Lógica de Redirección
        const moduleRecord = await prisma.module.findUnique({
             where: { id: moduleId },
             select: { course: { select: { id: true, slug: true } } }
        });

        const courseId = moduleRecord?.course?.id;
        const courseSlug = moduleRecord?.course?.slug;

        if (courseId && courseSlug) {
            const correctPath = `/dashboard/${courseId}/${courseSlug}`;
            revalidatePath(correctPath);
            redirect(correctPath); 
        } 
        
        revalidatePath(`/dashboard`);
        return { success: true, assignment: newAssignment };
        
    } catch (error) {
        
        if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
            throw error;
        }

        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
             return { success: false, message: "Ya existe un ejercicio con un título muy similar. Intenta ser más específico." };
        }
        
        console.error("Error al crear la asignación:", error);
        return { success: false, message: "Error interno al crear la asignación. Inténtalo de nuevo." };
    }
}



const TEMP_DIR = path.join(process.cwd(), 'temp-executions');
const PYTHON_CMD = process.platform === 'win32'
  ? "C:/venvs/campus/Scripts/python.exe"
  : "python3";
  const DEFAULT_TIMEOUT_MS = 7000;

await fs.mkdir(TEMP_DIR, { recursive: true });

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  raw?: string;
}

// -----------------------------------------------------------------
// ⭐ EJECUCIÓN DE PYTEST SOBRE CÓDIGO DEL ALUMNO ⭐
// -----------------------------------------------------------------

export async function realExecuteTests(
  studentCode: string,
  testFilesContent: { filename: string, content: string }[],
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const uniqueId = Date.now() + '-' + Math.floor(Math.random() * 9999);
  const tempDir = path.join(process.cwd(), 'temp-executions', `submission-${uniqueId}`);
  await fs.mkdir(tempDir, { recursive: true });

  // Guardar codigo del alumno
  await fs.writeFile(path.join(tempDir, "solucion.py"), studentCode, "utf8");

  // Guardar archivos de test
  for (const t of testFilesContent) {
    await fs.writeFile(path.join(tempDir, t.filename), t.content, "utf8");
  }

  const cmd = `${PYTHON_CMD} -u -m pytest "${tempDir}" --tb=short --color=no -v`;

  try {
    const { stdout, stderr } = await execPromise(cmd, { cwd: tempDir, timeout: timeoutMs, shell: true });
    
    console.log("========== PYTEST RAW STDOUT ==========");
    console.log(stdout);
    console.log("========== PYTEST RAW STDERR ==========");
    console.log(stderr);
    console.log("========================================");

    const raw = stdout + stderr;

    const testResults = parsePytest(raw);
    console.log("========== PARSING PYTEST OUTPUT ==========");
    console.log(raw);
    console.log("===========================================");

    const passed = testResults.every(t => t.passed);
    
    return { passed, testResults, rawOutput: raw };
    
  } catch (err: any) {
    const raw = (err.stdout || "") + (err.stderr || "");
    const parsed = parsePytest(raw);

    return {
      passed: false,
      testResults: parsed.length ? parsed : [{
        name: "Error ejecución",
        passed: false,
        message: err.message || "Error desconocido al ejecutar tests",
        raw
      }],
      rawOutput: raw
    };
  }
}


// -----------------------------------------------------------
//  PARSING ROBUSTO DE PYTEST
// -----------------------------------------------------------
// Detecta líneas tipo:
// test_archivo.py::test_nombre PASSED
// test_archivo.py::test_nombre FAILED
// test_archivo.py::test_nombre ERROR
// -----------------------------------------------------------
function parsePytest(output: string) {
  console.log("===== parsePytest: OUTPUT RECIBIDO =====");
  console.log(output);
  console.log("========================================");

  const results = [];
  const lines = output.split("\n");
  
  console.log("===== parsePytest: LÍNEAS =====");
  console.log(lines);
  console.log("================================");

  for (const line of lines) {
        console.log("Analizando línea:", line);

    const m = line.match(/(test_[\w]+)\s+(PASSED|FAILED|ERROR)/i);
    if (!m) continue;
    console.log("MATCH ENCONTRADO:", m);
    const testName = m[1];
    const status = m[2].toUpperCase();

    results.push({
      name: testName,
      passed: status === "PASSED",
      message: status === "PASSED" ? "OK" : "ERROR",
      raw: line
    });
  }

  // ⚠ Si pytest no mostró ningún test, marcamos error real
  if (results.length === 0) {
    results.push({
      name: "Desconocido",
      passed: false,
      message: "❌ Test no ejecutado correctamente",
      raw: output
    });
  }

  return results;
}

// -----------------------------------------------------------------
// ⭐ SERVER ACTION: SUBMIT CODE Y GUARDADO EN DB ⭐
// -----------------------------------------------------------------
export async function submitCode(
  studentId: number,
  assignmentId: number,
  code: string
) {
  const testFiles = await prisma.testFile.findMany({ where: { assignmentId } });
  const testFilesContent = testFiles.map(tf => ({ filename: tf.filename, content: tf.content }));

  const { passed, testResults, rawOutput } = await realExecuteTests(code, testFilesContent);

  const submission = await prisma.submission.create({
    data: {
      studentId,
      assignmentId,
      codeSubmitted: code,
      isSuccessful: passed,
      rawResult: rawOutput,
      passedTests: testResults.filter(t => t.passed).length,
      failedTests: testResults.filter(t => !t.passed).length,
    },
  });

  return {
    success: true,
    passed,
    message: passed ? "✅ Todos los tests pasaron" : "❌ Algunos tests fallaron",
    testResults, // cada test tiene {name, passed, message, raw}
    submission,
  };
}

// -----------------------------------------------------------------
// ⭐ FUNCIONES AUXILIARES DE PARSEO DE PYTEST ⭐
// -----------------------------------------------------------------
function parsePytestOutput(stdout: string, stderr: string): { testResults: TestResult[], rawOutput: string } {
  const full = (stdout || '') + '\n' + (stderr || '');
  const testResults: TestResult[] = [];

  const testBlocks = full.split(/\n(?=test_)/); // separa por cada test
  for (const block of testBlocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const testNameMatch = trimmed.match(/(test_[a-zA-Z0-9_]+)/);
    const testName = testNameMatch ? testNameMatch[1] : 'Desconocido';

    if (/PASSED/.test(trimmed)) {
      testResults.push({ name: testName, passed: true, message: '✅ Passed', raw: trimmed });
    } else if (/FAILED|E\s+/.test(trimmed)) {
      testResults.push({ name: testName, passed: false, message: trimmed, raw: trimmed });
    } else {
      testResults.push({ name: testName, passed: false, message: '❌ Test no ejecutado correctamente', raw: trimmed });
    }
  }

  return { testResults, rawOutput: full };
}


// -----------------------------------------------------------------
// ⭐ EXTRACCIÓN DE METADATA PARA TEST SIMULADO ⭐
// -----------------------------------------------------------------
export async function extractGradingMetadata(testCodeContent: string): Promise<any> {
  const metadata: any = { solutionCode: null, customMessage: null, detailedFailures: [] };
  const solutionMatch = testCodeContent.match(/#\s*SOLUTION:\s*([^\r\n]*)/i);
  const messageMatch = testCodeContent.match(/#\s*FAILURE_MESSAGE:\s*([^\r\n]*)/i);

  metadata.solutionCode = solutionMatch ? solutionMatch[1].trim() : null;
  metadata.customMessage = messageMatch ? messageMatch[1].trim() : null;

  const detailMatches = testCodeContent.matchAll(/#\s*FAILURE_DETECT_IF_CONTAINS_(.+?):\s*([^\r\n]*)/gi);
  for (const match of detailMatches) {
    const keyword = match[1].toLowerCase();
    const contentToDetect = match[2].trim();
    const messageMatchDetail = testCodeContent.match(new RegExp(`#\\s*FAILURE_MESSAGE_${keyword}:\\s*([^\r\n]*)`, 'i'));
    if (messageMatchDetail) {
      metadata.detailedFailures.push({ keyword: contentToDetect, message: messageMatchDetail[1].trim() });
    }
  }

  return metadata;
}


export async function deleteAssignment(assignmentId: number) {
    // Nota: Deberías añadir aquí la verificación del rol TEACHER antes de proceder.

    try {
        // Usamos una transacción para asegurar que todas las eliminaciones ocurran o ninguna lo haga
        await prisma.$transaction(async (tx) => {
            
            // 1. Eliminar archivos de prueba (TestFile)
            await tx.testFile.deleteMany({
                where: { assignmentId: assignmentId },
            });

            // 2. Eliminar historial de entregas (Submission)
            await tx.submission.deleteMany({
                where: { assignmentId: assignmentId },
            });

            // 3. Eliminar progreso del estudiante (StudentProgress)
            await tx.studentProgress.deleteMany({
                where: { assignmentId: assignmentId },
            });

            // 4. Finalmente, eliminar el Ejercicio
            await tx.assignment.delete({
                where: { id: assignmentId },
            });
        });

        // ⭐ Importante: Revalidar la caché de la vista de la lista del curso/módulo.
        // Asumiendo que la lista se ve en la ruta raíz del dashboard o similar.
         revalidatePath(`/dashboard`, 'layout'); 

        return { success: true, message: "Ejercicio eliminado correctamente." };

    } catch (error) {
        console.error("Error al eliminar el ejercicio:", error);
        return { success: false, message: "Hubo un error al eliminar el ejercicio y sus datos asociados." };
    }
}

export async function deleteModule(moduleId: number) {
    try {
        // 1. Verificar si existen ejercicios asociados (Assignments)
        const assignmentsCount = await prisma.assignment.count({
            where: { moduleId: moduleId },
        });

        if (assignmentsCount > 0) {
            return { 
                success: false, 
                message: "No se puede eliminar la unidad, tiene ejercicios asociados. Elimina todos los ejercicios primero." 
            };
        }

        // 2. Si no hay ejercicios, se procede con la eliminación del Módulo
        await prisma.module.delete({
            where: { id: moduleId },
        });

        // 3. Revalidar la caché para actualizar la lista de unidades en el dashboard
        revalidatePath(`/dashboard`, 'layout'); 

        return { success: true, message: "Unidad eliminada correctamente." };

    } catch (error) {
        console.error("Error al eliminar la unidad:", error);
        return { success: false, message: "Hubo un error al eliminar la unidad." };
    }
}


//////////
interface ReviewData {
    submissionId: number;
    comment: string;
    status: 'APPROVED' | 'REJECTED' | 'PENDING';
    courseId: string;
    courseSlug: string;
}

/**
 * Función que actualiza el estado (isSuccessful) y el comentario (docenteComment) de una Submission.
 * @param data Datos de la revisión enviados desde el frontend.
 * @returns Un objeto con éxito o error.
 */
export async function saveDocenteReview(data: ReviewData) {
    // 1. Convertir el estado de string (frontend) a boolean/null (Prisma)
    let isSuccessful: boolean | null;
    if (data.status === 'APPROVED') {
        isSuccessful = true;
    } else if (data.status === 'REJECTED') {
        isSuccessful = false;
    } else {
        isSuccessful = null; // PENDING
    }

    try {
        // 2. Actualizar la Submission en la base de datos
        await prisma.submission.update({
            where: {
                id: data.submissionId,
            },
            data: {
                isSuccessful: isSuccessful, // Actualiza el estado de la calificación
                docenteComment: data.comment, // Asumo que este campo existe en tu modelo Submission
            },
        });

        // 3. Revalidar la página del historial de entregas para que el cambio se refleje
        // Esto obliga a Next.js a refrescar la tabla después de guardar.
        revalidatePath(`/dashboard/${data.courseId}/${data.courseSlug}/entregas`);

        return { success: true, message: "Revisión guardada exitosamente." };

    } catch (error) {
        console.error("Error al guardar la revisión del docente:", error);
        return { success: false, message: "Error en el servidor al guardar la revisión." };
    }
}