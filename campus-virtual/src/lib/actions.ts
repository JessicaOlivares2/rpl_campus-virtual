// src/lib/actions.ts

'use server';

import { redirect } from 'next/navigation';
import prisma from './db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

// Define the schema for the input data to ensure it's correct
const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function registerUser(values: z.infer<typeof registerSchema>) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: values.email },
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    await prisma.user.create({
      data: {
        email: values.email,
        password: hashedPassword,
        name: values.name,
        role: 'STUDENT',
      },
    });

    // Revalida la página para reflejar los cambios en la base de datos.
    revalidatePath('/login');
    
    // Realiza la redirección en el servidor
    redirect('/login');

  } catch (error) {
    console.error('Error en registerUser:', error);
    if (error instanceof Error) {
      // Si el error es una redirección, lo dejamos pasar.
      if (error.message.includes('NEXT_REDIRECT')) {
        throw error;
      }
      throw new Error(error.message);
    }
    throw new Error('Error al registrar el usuario');
  }
}
export async function loginUser({ email, password }: { email: string; password: string; }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Configura la cookie de sesión
    const session = {
      userId: user.id,
      name: user.name,
      email: user.email,
    };

    (await cookies()).set('session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 semana
    });
    
    // Agrega la revalidación de la ruta para el dashboard
    revalidatePath('/dashboard');

    redirect('/dashboard');

  } catch (error) {
    // Si el error es una redirección de Next.js, lo dejamos pasar.
    if (error && (error as Error).message.includes('NEXT_REDIRECT')) {
      throw error;
    }
    
    // Si es un error de código, lo manejamos.
    console.error('Error en loginUser:', error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error('Error al iniciar sesión');
  }
}

export async function logoutUser() {
  (await cookies()).delete('session');
  redirect('/login');
}