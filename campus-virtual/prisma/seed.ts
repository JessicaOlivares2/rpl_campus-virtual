// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Crear comisiones de prueba
  const comisionA = await prisma.commission.create({
    data: { name: '3A', registrationCode: '3A-2024' },
  });

  const comisionB = await prisma.commission.create({
    data: { name: '3B', registrationCode: '3B-2024' },
  });

  // 2. Crear un usuario de prueba (docente)
  const teacherUser = await prisma.user.create({
    data: {
      email: 'docente@etec.uba.ar',
      password: await bcrypt.hash('teacher1234', 10),
      name: 'Docente',
      lastName: 'Ejemplo',
      DNI: '98765432',
      birthDate: new Date('1985-05-10'),
      role: 'TEACHER',
    },
  });

  // 3. Crear cursos y asignarlos a las comisiones
  // El curso de Matemáticas es solo para la Comisión 3A
  const matematicas = await prisma.course.create({
    data: {
      title: 'Matemáticas Avanzadas',
      description: 'Curso de cálculo y álgebra lineal.',
      teacherId: teacherUser.id,
      commissions: {
        connect: [{ id: comisionA.id }],
      },
    },
  });

  // El curso de Programación es solo para la Comisión 3B
  const programacion = await prisma.course.create({
    data: {
      title: 'Introducción a la Programación',
      description: 'Fundamentos de la programación con Python.',
      teacherId: teacherUser.id,
      commissions: {
        connect: [{ id: comisionB.id }],
      },
    },
  });

  // 4. Crear ejercicios para los cursos
  const matematicasAssignment1 = await prisma.assignment.create({
    data: {
      title: 'Guía de ejercicios 1',
      description: 'Resolución de ecuaciones de primer grado.',
      courseId: matematicas.id,
    },
  });

  const programacionAssignment1 = await prisma.assignment.create({
    data: {
      title: 'Tarea 1: Hola Mundo',
      description: 'Crea tu primer programa en Python.',
      courseId: programacion.id,
    },
  });

  console.log('Datos de prueba con comisiones creados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
