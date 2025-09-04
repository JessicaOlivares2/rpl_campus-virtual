// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/[assignmentId]/page.tsx

'use client';

import { notFound } from 'next/navigation';
import { useState } from 'react';
import { updateStudentProgress } from "@/lib/actions";
import prisma from '@/lib/db';

export default async function AssignmentDetailPage({ params }: { params: { courseId: string; courseSlug: string; assignmentId: string } }) {
  const studentId = 1;
  const assignmentId = parseInt(params.assignmentId);

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      module: {
        include: {
          course: true,
        },
      },
      progress: {
        where: { studentId },
      },
    },
  });

  if (!assignment) {
    notFound();
  }

  const [isCompleted, setIsCompleted] = useState(assignment.progress.length > 0 && assignment.progress[0].isCompleted);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleComplete = async () => {
    setIsSubmitting(true);
    const result = await updateStudentProgress(studentId, assignmentId);
    if (result.success) {
      setIsCompleted(true);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="container mx-auto">
        <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold">{assignment.title}</h1>
          <p className="mt-2 text-blue-200">
            Materia: {assignment.module.course.title}
          </p>
          <p className="mt-1 text-blue-200">
            Unidad: {assignment.module.title}
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Contenido del Ejercicio</h2>
          <p className="text-gray-700">
            {assignment.description || 'No hay una descripción detallada para este ejercicio.'}
          </p>
          <div className="mt-8 p-6 bg-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Ejemplo de contenido:</h3>
            <p className="text-gray-800">
              Aquí iría el contenido real del ejercicio. Si es de Matemáticas, podría haber una ecuación o un problema. Si es de Programación, podría haber un editor de código interactivo o un video tutorial.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            {isCompleted ? (
              <span className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg">✅ ¡Ejercicio Completado!</span>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
              >
                {isSubmitting ? 'Marcando...' : 'Marcar como completado'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}