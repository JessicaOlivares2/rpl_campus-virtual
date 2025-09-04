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
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Credenciales inválidas");
    }

    // Configura la cookie de sesión
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
    };

    (await cookies()).set("session", JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });

    // Agrega la revalidación de la ruta para el dashboard
    revalidatePath("/dashboard");

    redirect("/dashboard");
  } catch (error) {
    // Si el error es una redirección de Next.js, lo dejamos pasar.
    if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    // Si es un error de código, lo manejamos.
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