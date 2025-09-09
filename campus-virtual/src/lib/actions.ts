// src/lib/actions.ts

"use server";

import { redirect } from "next/navigation";
import prisma from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

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
  
  try {
    // 1. Encuentra la comisión y a todos sus estudiantes.
    const commissionRecord = await prisma.commission.findFirst({
      where: { name: commission },
      include: {
        students: true, // Incluye a los estudiantes de la comisión
      },
    });

    if (!commissionRecord) {
      return { error: 'La comisión seleccionada no existe.' };
    }
    
    // 2. Crea el nuevo curso y lo conecta a la comisión.
    const newCourse = await prisma.course.create({
      data: {
        title: `${subject}`,
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