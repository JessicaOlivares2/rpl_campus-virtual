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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'test-files'); 

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Elimina caracteres no alfanuméricos
    .replace(/[\s_-]+/g, '-') // Reemplaza espacios y guiones con un solo guión
    .replace(/^-+|-+$/g, ''); // Elimina guiones al principio y al final
}

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
export async function createAssignment(formData: FormData) {
  // 1. Parsed data con el campo File
  const parsed = assignmentSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    type: formData.get("type"),
    moduleId: formData.get("moduleId"),
    testFile: formData.get("testFile"), // Zod lo identificará como un objeto File
  });

  if (!parsed.success) {
    const flattenedErrors = parsed.error.flatten();
    return {
      success: false,
      errors: flattenedErrors.fieldErrors,
      error: "Error de validación: Comprueba los campos obligatorios."
    };
  }

  const { title, description, type, moduleId, testFile } = parsed.data;

  // Validación lógica: Si es un ejercicio de código (Quiz/Project), debe tener un archivo no vacío
  const isCodeAssignment = type === 'Quiz' || type === 'Project';
  if (isCodeAssignment && (!testFile || testFile.size === 0)) {
    return {
      success: false,
      errors: { testFile: ["Para ejercicios tipo Quiz o Project, el archivo de pruebas es obligatorio."] },
      error: "Falta el archivo de pruebas requerido."
    };
  }

  let testFileStoragePath = null;
  let testFileName = null;
  
  try {
    // 2. Manejo y Guardado del Archivo (Si existe)
    if (testFile && testFile.size > 0) {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      const fileExtension = path.extname(testFile.name);
      // Creamos un nombre único para el archivo guardado
      testFileName = `${slugify(title)}-${Date.now()}${fileExtension}`; 
      testFileStoragePath = path.join(UPLOAD_DIR, testFileName);
      
      // Convertir File a Buffer y escribir en el disco
      const bytes = await testFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await fs.writeFile(testFileStoragePath, buffer);
    }
    
    // 3. Crear la Asignación y el TestFile asociado
    await prisma.assignment.create({
      data: {
        title,
        description,
        type,
        moduleId: parseInt(moduleId),
        // Conectar el TestFile si fue subido
        ...(testFileStoragePath && {
          testFiles: {
            create: {
              filename: testFile!.name,
              storagePath: `/test-files/${testFileName}`, // Guardamos la ruta relativa
            },
          },
        }),
      },
    });

    // 4. Lógica de Redirección (igual que antes)
    const moduleRecord = await prisma.module.findUnique({
      where: { id: parseInt(moduleId) },
      select: { 
        course: {
          select: { 
            id: true,
            slug: true 
          }
        }
      }
    });

    const courseId = moduleRecord?.course?.id;
    const courseSlug = moduleRecord?.course?.slug;

    if (courseId && courseSlug) {
      const correctPath = `/dashboard/${courseId}/${courseSlug}`;
      revalidatePath(correctPath);
      redirect(correctPath);
    } else {
      revalidatePath(`/dashboard`);
      return { success: true };
    }
  } catch (error) {
    if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
        throw error;
    }
    
    // Manejo de error: Si la DB falla, limpiamos el archivo que ya habíamos guardado
    if (testFileStoragePath) {
        try { await fs.unlink(testFileStoragePath); } catch (e) { console.error("Fallo al limpiar el archivo:", e); }
    }

    console.error("Error al crear la asignación:", error);
    return {
      success: false,
      error: "Error al crear la asignación. Inténtalo de nuevo.",
    };
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
export async function submitCode(studentId: number, assignmentId: number, code: string) {
  // Lógica de simulación: Éxito si incluye la solución esperada, falla si incluye un error
  const isSuccessful = code.includes("return a + b") && !code.includes("a * b"); 
  const executionTimeMs = Math.floor(Math.random() * 2000) + 100; // Simula entre 100ms y 2100ms
  
  try {
    // 1. Crear la Submission (Historial de Entrega)
    const newSubmission = await prisma.submission.create({
      data: {
        studentId,
        assignmentId,
        codeSubmitted: code,
        isSuccessful,
        executionTimeMs,
      },
    });

    // 2. Si es exitoso, marcar el Assignment como completado.
    if (isSuccessful) {
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
    }
    
    // 3. Devolver el resultado de la prueba Y la submission para actualizar el historial en el cliente
    return { 
        success: true,
        passed: isSuccessful, 
        message: isSuccessful ? `¡Prueba Superada! Tiempo: ${executionTimeMs}ms` : `Prueba Fallida. Revisa tu lógica.`,
        submission: newSubmission,
    };
  } catch (error) {
    console.error("Error al procesar la submission:", error);
    return { 
        success: false, 
        passed: false,
        message: "Error interno del servidor al procesar tu código." 
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