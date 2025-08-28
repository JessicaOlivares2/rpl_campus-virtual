// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/page.tsx
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';

// El parámetro de la URL se pasa a la función como `params`
export default async function CourseDetailPage({ params }: { params: { courseId: string; courseSlug: string } }) {
  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(params.courseId),
    },
    include: {
      assignments: true, // Incluye todos los ejercicios de este curso
      teacher: true, // Incluye la información del docente
    },
  });

  if (!course) {
    notFound(); // Si el curso no existe, muestra la página 404
  }

  return (
    
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2 text-blue-200">
            {course.description}
          </p>
          <p className="mt-4 text-sm text-blue-300">
            Docente: {course.teacher.name} {course.teacher.lastName}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Guías de Ejercicios</h2>
          
          {course.assignments.length > 0 ? (
            <ul className="space-y-4">
              {course.assignments.map(assignment => (
                <li key={assignment.id} className="border-b pb-4">
                  <h3 className="text-lg font-semibold">{assignment.title}</h3>
                  <p className="text-gray-600 mt-1">{assignment.description}</p>
                  {/* Aquí podrías agregar un enlace para ver el detalle de la tarea */}
                  <a href="#" className="text-blue-600 hover:underline mt-2 inline-block">Ver Ejercicio</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No hay ejercicios asignados para este curso todavía.</p>
          )}
        </div>
      </div>
    </div>
  );
}