import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
import AssignmentInteractiveContent from '@/components/AssignmentInteractiveContent';
import { cookies } from 'next/headers';

export default async function AssignmentDetailPage({ params }: { params: { courseId: string; courseSlug: string; assignmentId: string } }) {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    notFound(); // O redirigir a la página de login
  }
  const session = JSON.parse(sessionCookie.value);
  const studentId = session.userId;
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

  const isCompletedInitial = assignment.progress.length > 0 && assignment.progress[0].isCompleted;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Header />
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
          {/* Renderiza el nuevo componente de cliente */}
          <AssignmentInteractiveContent
            assignmentId={assignmentId}
            isCompletedInitial={isCompletedInitial}
            studentId={studentId}
          />
        </div>
      </div>
    </div>
  );
}