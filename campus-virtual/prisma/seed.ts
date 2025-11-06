import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar la base de datos en el orden correcto
  await prisma.studentProgress.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.submission.deleteMany(); // Asegúrate de limpiar también las Submission si no lo hacías antes
  await prisma.testFile.deleteMany(); // Y los archivos de prueba
  await prisma.assignment.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.commission.deleteMany();

  // 1. Crear comisiones de prueba
  const comisionA = await prisma.commission.create({
    data: { name: '3A', registrationCode: '3A-2025' },
  });

  const comisionB = await prisma.commission.create({
    data: { name: '3B', registrationCode: '3B-2025' },
  });

  // 2. Crear un registro de docente en el modelo Teacher
  const teacherUser = await prisma.teacher.create({
    data: {
      email: 'docente@etec.uba.ar',
      password: await bcrypt.hash('docenteuba', 10),
      name: 'Docente',
      lastName: 'Ejemplo',
    },
  });

  // 3. Crear un usuario de prueba (estudiante)
  const studentUser = await prisma.user.create({
    data: {
      email: 'lopez@etec.uba.ar',
      password: await bcrypt.hash('valeria123', 10),
      name: 'valeria',
      lastName: 'lopez',
      DNI: '12345678',
      birthDate: new Date('2000-01-01'),
      role: 'STUDENT',
      commissionId: comisionB.id,
    },
  });

  // 4. Crear cursos con sus módulos y ejercicios anidados
  const matematicas = await prisma.course.create({
    data: {
      title: 'Matemáticas Avanzadas',
      slug: 'matematicas-avanzadas',
      description: 'Curso de cálculo y álgebra lineal.',
      teacherId: teacherUser.id,
      commissions: {
        connect: [{ id: comisionA.id }],
      },
      // Crear módulos y ejercicios anidados
      modules: {
        create: [
          {
            title: 'Unidad 1: Ecuaciones',
            assignments: {
              create: [
                {
                  title: 'Ejercicios de Ecuaciones de Primer Grado',
                  slug: 'ejercicios-ecuaciones-primer-grado', // SLUG AÑADIDO
                  type: 'Lesson',
                  resources: {
                    createMany: {
                      data: [
                        { title: 'Ejercicios Resueltos de Ecuaciones', type: 'PDF', url: 'https://example.com/matematicas/ejercicios-resueltos.pdf' },
                        { title: 'Video Tutorial de Álgebra', type: 'Video', url: 'https://www.youtube.com/watch?v=tutorial-algebra' },
                      ],
                    },
                  },
                },
                {
                  title: 'Guía de Problemas con Ecuaciones',
                  slug: 'guia-problemas-ecuaciones', // SLUG AÑADIDO
                  type: 'Quiz',
                  resources: {
                    createMany: {
                      data: [
                        { title: 'Guía de Estudio Adicional', type: 'PDF', url: 'https://example.com/matematicas/guia-adicional.pdf' },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  const programacion = await prisma.course.create({
    data: {
      title: 'Introducción a la Programación',
      slug: 'introduccion-a-la-programacion',
      description: 'Fundamentos de la programación con Python.',
      teacherId: teacherUser.id,
      commissions: {
        connect: [{ id: comisionB.id }],
      },
      // Crear módulos y ejercicios anidados con recursos
      modules: {
        create: [
          {
            title: 'Unidad 1: Conceptos Básicos',
            assignments: {
              create: [
                {
                  title: 'Hola Mundo con Python',
                  slug: 'hola-mundo-python', // SLUG AÑADIDO
                  type: 'Lesson',
                  resources: {
                    createMany: {
                      data: [
                        { title: 'Guía de Sintaxis Básica', type: 'PDF', url: 'https://example.com/programacion/guia-sintaxis.pdf' },
                        { title: 'Video: Tu primer programa', type: 'Video', url: 'https://www.youtube.com/watch?v=primer-programa' },
                      ],
                    },
                  },
                },
                {
                  title: 'Variables y Tipos de Datos',
                  slug: 'variables-tipos-datos', // SLUG AÑADIDO
                  type: 'Lesson',
                  resources: {
                    createMany: {
                      data: [
                        { title: 'Tabla de Tipos de Datos', type: 'PDF', url: 'https://example.com/programacion/tabla-tipos.pdf' },
                        { title: 'Referencia en línea: Datos', type: 'Link', url: 'https://www.w3schools.com/python/python_datatypes.asp' },
                      ],
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });

  // 5. Conectar al estudiante al curso de programación para que lo vea en su dashboard
  await prisma.user.update({
    where: { id: studentUser.id },
    data: {
      coursesJoined: {
        connect: [{ id: programacion.id }],
      },
    },
  });

  console.log('Datos de prueba creados exitosamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
