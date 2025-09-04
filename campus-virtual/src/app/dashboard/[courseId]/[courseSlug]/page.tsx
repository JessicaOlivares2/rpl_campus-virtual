// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/page.tsx

import { notFound } from 'next/navigation';
import prisma from '@/lib/db';

export default async function CourseDetailPage({ params }: { params: { courseId: string; courseSlug: string } }) {
  // Aquí obtienes el ID del estudiante de la sesión o del contexto de autenticación
  const studentId = 1;

  const course = await prisma.course.findUnique({
    where: {
      id: parseInt(params.courseId),
    },
    include: {
      modules: {
        include: {
          assignments: {
            include: {
              progress: {
                where: { studentId },
              },
              resources: true, // ¡NUEVO! Incluye los recursos del ejercicio
            },
          },
        },
      },
      teacher: true,
    },
  });

  if (!course) {
    notFound();
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
          {course.modules.length > 0 ? (
            <ul className="space-y-6">
              {course.modules.map(module => (
                <li key={module.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center cursor-pointer">
                    <h3 className="text-xl font-semibold">{module.title}</h3>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Progreso: {Math.round((module.assignments.filter(a => a.progress.length > 0 && a.progress[0].isCompleted).length / module.assignments.length) * 100)}%</span>
                      <button>▼</button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ul className="space-y-2">
                      {module.assignments.map(assignment => (
                        <li key={assignment.id} className="flex items-center space-x-3">
                          {assignment.type === 'Lesson' && <span className="text-2xl">📖</span>}
                          {assignment.type === 'Quiz' && <span className="text-2xl">📝</span>}
                          {assignment.type === 'Project' && <span className="text-2xl">✍️</span>}
                          <a href={`/dashboard/${course.id}/${params.courseSlug}/${assignment.id}`} className="text-gray-700 hover:text-blue-600">
                            {assignment.title}
                          </a>
                          {assignment.progress.length > 0 && assignment.progress[0].isCompleted ? (
                            <span className="text-green-500">✅</span>
                          ) : (
                            <span className="text-gray-400"></span>
                          )}
                          
                          {/* Sección de Recursos (NUEVO) */}
                          {assignment.resources.length > 0 && (
                            <div className="mt-4 border-t pt-4">
                              <h4 className="text-sm font-bold text-gray-700 mb-2">Materiales:</h4>
                              <div className="grid grid-cols-2 gap-2">
                                {/* PDFs */}
                                {assignment.resources.filter(r => r.type === 'PDF').length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold">PDFs:</h5>
                                    <ul className="list-disc ml-4 text-sm text-gray-600">
                                      {assignment.resources.filter(r => r.type === 'PDF').map(pdf => (
                                        <li key={pdf.id}>
                                          <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {pdf.title}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {/* Enlaces y otros */}
                                {assignment.resources.filter(r => r.type !== 'PDF').length > 0 && (
                                  <div>
                                    <h5 className="text-xs font-semibold">Enlaces:</h5>
                                    <ul className="list-disc ml-4 text-sm text-gray-600">
                                      {assignment.resources.filter(r => r.type !== 'PDF').map(link => (
                                        <li key={link.id}>
                                          <a href={link.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {link.title} ({link.type})
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
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