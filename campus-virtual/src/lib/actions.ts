// src/lib/actions.ts

"use server";

import { redirect } from "next/navigation";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from 'fs/promises';
import path from 'path';
import { slugify } from '@/lib/utils';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { simpleSlugify } from '@/lib/utils';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'test-files'); 

/*function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Elimina caracteres no alfanuméricos
    .replace(/[\s_-]+/g, '-') // Reemplaza espacios y guiones con un solo guión
    .replace(/^-+|-+$/g, ''); // Elimina guiones al principio y al final
}
*/
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
  testFile: z.instanceof(File, { message: "El archivo de prueba es obligatorio para ejercicios de código." }).optional(), // Hacemos opcional si no es tipo 'Quiz' o 'Project'

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
// ========================================================================
// ⭐ NUEVA FUNCIÓN: submitCode (Para el Alumno)
// ========================================================================

/**
 * Simula la ejecución del código del alumno contra las pruebas del docente,
 * guarda la Submission en la DB y devuelve el resultado.
 * ⚠️ NOTA: Este es un placeholder de simulación. La implementación real
 * requiere un entorno seguro (sandbox/Docker) para ejecutar código de usuario.
 */
interface TestResult {
    passed: boolean;
    failureDetails: string;
}

// ⭐ FUNCIÓN CLAVE: Extrae metadata del test.py subido
function extractGradingMetadata(testCodeContent: string): any {
    const metadata: any = { solutionCode: null, customMessage: null, detailedFailures: [] };

    // 1. Solución y Mensaje Base: Usamos ([^\r\n]*) para capturar SÓLO hasta el final de la línea
    const solutionMatch = testCodeContent.match(/#\s*SOLUTION:\s*([^\r\n]*)/i);
    const messageMatch = testCodeContent.match(/#\s*FAILURE_MESSAGE:\s*([^\r\n]*)/i);
    
    metadata.solutionCode = solutionMatch ? solutionMatch[1].trim() : null;
    metadata.customMessage = messageMatch ? messageMatch[1].trim() : null;

    // 2. Buscar nuevos tests de detección específicos (Múltiples líneas)
    // También aplicamos la restricción en la búsqueda de contenido (match[2])
    const detailMatches = testCodeContent.matchAll(/#\s*FAILURE_DETECT_IF_CONTAINS_(.+?):\s*([^\r\n]*)/gi);

    for (const match of detailMatches) {
        const keyword = match[1].toLowerCase(); 
        const contentToDetect = match[2].trim(); 
        
        // Buscamos el mensaje asociado (También restringido a una sola línea)
        const messageMatchDetail = testCodeContent.match(new RegExp(`#\\s*FAILURE_MESSAGE_${keyword}:\\s*([^\r\n]*)`, 'i'));

        if (messageMatchDetail) {
             metadata.detailedFailures.push({
                 keyword: contentToDetect,
                 message: messageMatchDetail[1].trim()
             });
        }
    }
    return metadata;
}
// -----------------------------------------------------------------
// FUNCIÓN CENTRAL DE SIMULACIÓN (LIMPIA)
// -----------------------------------------------------------------

function simulateTestRun(studentCode: string, testCodeContent: string, executionTimeMs: number): TestResult {
    
    const metadata = extractGradingMetadata(testCodeContent);
    const expectedSolution = metadata.solutionCode;
    const customFailureMessage = metadata.customMessage;

    // 1. NORMALIZACIÓN DE CÓDIGO para ignorar sangrías y saltos de línea (Python legible)
    const cleanStudentCode = studentCode.replace(/\s/g, ''); 

    // 2. Chequeo de Fallos Detallados por contenido (PRIORIDAD AL FEEDBACK ESPECÍFICO)
    for (const failure of metadata.detailedFailures) {
        // Limpiamos el keyword por si tiene espacios (aunque en la DB es mejor ponerlo limpio)
        const cleanKeyword = failure.keyword.replace(/\s/g, ''); 
        
        if (cleanStudentCode.includes(cleanKeyword)) {
            // Falla por un error conocido y da feedback específico
            return {
                passed: false,
                failureDetails: `
================================= FAILURES ==================================
E SpecificError: ${failure.message}
E  > [Regla de Estilo Rota. Se detectó la palabra clave: '${failure.keyword}' en su código.]
========================= 1 failed, 0 passed en ${executionTimeMs/1000}s =========================
                `.trim()
            };
        }
    }
    
    // 3. Chequeo de Fallo de Solución Base (String Matching)
    let isSuccessful = false;
    
    if (expectedSolution) {
        const cleanExpectedSolution = expectedSolution.replace(/\s/g, ''); 
        isSuccessful = cleanStudentCode.includes(cleanExpectedSolution);
    } else {
        isSuccessful = false; 
    }
    
    // 4. Generación del Feedback Final
    let failureDetails = '';
    
    if (isSuccessful) {
        failureDetails = `========================= Todos los tests han sido exitosos en ${executionTimeMs/1000}s =========================`;
    } else {
        // Usa el mensaje base si falló el string matching
        const baseError = customFailureMessage || "Error: El código no implementa la lógica esperada o está incompleto. Verifique el enunciado.";
        
        failureDetails = `
================================= FAILURES ==================================
E AssertionError: ${baseError}
E  > [Se intentó validar que su código contenga: "${expectedSolution || 'N/A: Solución no configurada.'}" en su forma más simple.]
========================= 1 failed, 0 passed en ${executionTimeMs/1000}s =========================
        `.trim();
    }

    return { passed: isSuccessful, failureDetails };
}

// =================================================================
// 2. SERVER ACTIONS
// =================================================================

// -----------------------------------------------------------------
// SUBMIT CODE (H1, H2, H3)
// -----------------------------------------------------------------

export async function submitCode(studentId: number, assignmentId: number, code: string) {
    console.log("------------------- ID RECIBIDO -------------------");
    console.log("assignmentId recibido:", assignmentId);
    console.log("---------------------------------------------------");
    
    // 1. BUSCAR EL EJERCICIO Y EL CÓDIGO DE PRUEBA DESDE LA DB (H3)
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: { testFiles: { take: 1, select: { content: true } } } 
    });

    // Validación de configuración (H3)
    if (!assignment || assignment.testFiles.length === 0 || !assignment.testFiles[0].content) {
         return { 
             success: false, 
             passed: false,
             message: "Error de configuración: El ejercicio no tiene pruebas asociadas.",
             details: "El administrador debe subir y configurar el archivo de pruebas (.py)."
         };
    }
    
    const testCodeContent = assignment.testFiles[0].content;
    
    // ⭐ DETECCIÓN DE BUCLE/TIMEOUT
    const isLoopDetected = code.includes("for") || code.includes("while"); 
    let executionTimeMs = 0;
    const TIMEOUT_LIMIT = 5000; // 5 segundos

    // 2. SIMULACIÓN DEL DELAY/TIMEOUT (H2)
    if (isLoopDetected) {
        // Simulación de timeout, esperamos 8s (más de 5s)
        console.log(`[EXEC] Simulación de proceso de larga ejecución (8s) por bucle detectado...`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        executionTimeMs = 8000;
    } else {
        // Ejecución rápida
        executionTimeMs = Math.floor(Math.random() * 2000) + 100;
    }
    
    // 3. EJECUTAR LA SIMULACIÓN
    let testResult: TestResult; 

    // ⭐ LÓGICA DE FEEDBACK DE TIMEOUT (PRIORIDAD AL TIMEOUT) ⭐
    if (isLoopDetected && executionTimeMs > TIMEOUT_LIMIT) { 
        // Si detectamos un bucle Y el tiempo simulado excede el límite
        testResult = {
            passed: false,
            failureDetails: `
================================= TIMEOUT ERROR ==================================
E Error: La ejecución del código excedió el límite de ${TIMEOUT_LIMIT/1000} segundos.
E  > El proceso fue terminado automáticamente para proteger la plataforma.
E  > Revisa si tu código contiene un bucle infinito o cálculos ineficientes.
========================= 1 failed (TIMEOUT), 0 passed =========================
            `.trim(),
        };
    } else {
        // Si no es un timeout, ejecuta la simulación normal de lógica (Tests Detallados o String Matching)
        testResult = simulateTestRun(code, testCodeContent, executionTimeMs); 
    }
    // ⭐ FIN DE LÓGICA DE TIMEOUT ⭐
    
    // 4. PERSISTENCIA DE DATOS (Prisma)
    try {
        const newSubmission = await prisma.submission.create({
            data: {
                studentId,
                assignmentId,
                codeSubmitted: code,
                isSuccessful: testResult.passed,
                executionTimeMs,
                submittedAt: new Date(),
            },
        });

        // 5. Actualizar progreso si pasa
        if (testResult.passed) {
             await prisma.studentProgress.upsert({
                 where: {
                     studentId_assignmentId: { studentId, assignmentId },
                 },
                 update: { isCompleted: true, completionDate: new Date() },
                 create: { studentId, assignmentId, isCompleted: true, completionDate: new Date() },
             });
             // Asume revalidatePath está importado o lo eliminas si no es necesario.
        }
        
        // 6. Devolver el resultado (H1)
        return { 
            success: true,
            passed: testResult.passed, 
            message: testResult.passed
                ? `✅ ¡Prueba Superada! Tiempo: ${executionTimeMs}ms` 
                : `❌ Prueba Fallida. Revisa el detalle.`,
            details: testResult.failureDetails,
            submission: newSubmission, 
        };

    } catch (error) {
        console.error("Error al procesar la submission en Prisma:", error);
        return { 
            success: false, 
            passed: false,
            message: "Error interno del servidor al guardar el resultado.",
            details: `Ocurrió un error en la base de datos.`,
            submission: null, 
        };
    }
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


