import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpiar la base de datos en el orden correcto
  await prisma.studentProgress.deleteMany();
  await prisma.resource.deleteMany();
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
    password: await bcrypt.hash('docenteuba', 10), // ¡Agrega esta línea!
    name: 'Docente',
    lastName: 'Ejemplo',
  },
});

  // 3. Crear un usuario de prueba (estudiante)
  const studentUser = await prisma.user.create({
    data: {
      email: 'estudiante@etec.uba.ar',
      password: await bcrypt.hash('student1234', 10),
      name: 'Estudiante',
      lastName: 'Prueba',
      DNI: '12345678',
      birthDate: new Date('2000-01-01'),
      role: 'STUDENT',
      commissionId: comisionA.id,
    },
  });

  // 4. Crear cursos con sus módulos y ejercicios anidados
  const matematicas = await prisma.course.create({
    data: {
      title: 'Matemáticas Avanzadas',
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