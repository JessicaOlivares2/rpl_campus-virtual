import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
import { deleteCourse } from '@/lib/actions'; // Asegúrate de que esta ruta sea correcta
import Link from 'next/link';
import DeleteCourseButton from '@/components/DeleteCourseButton';

async function getCourseProgress(userId: number, courseId: number) {
  const totalAssignments = await prisma.assignment.count({
    where: {
      module: {
        courseId,
      },
    },
  });

  if (totalAssignments === 0) {
    return 0;
  }
  
  const completedSubmissions = await prisma.studentProgress.count({
    where: {
      studentId: userId,
      assignment: {
        module: {
          courseId,
        },
      },
    },
  });

  return (completedSubmissions / totalAssignments) * 100;
}

export default async function DashboardPage() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    redirect('/login');
  }
  
  const session = JSON.parse(sessionCookie.value);
  const userId = session.userId;
  const userRole = session.role;

  // Lógica para el docente
  if (userRole === "TEACHER") {
    const teacherCourses = await prisma.course.findMany({
      where: {
        teacherId: userId,
      },
      include: {
        commissions: true,
      },
    });

    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 p-8">
          <div className="container mx-auto">
            <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
              <h1 className="text-4xl font-bold">Mis Cursos</h1>
              <p className="mt-2 text-blue-200">
                Bienvenido, docente. Aquí tienes un resumen de tus cursos.
              </p>
            </div>

            {/* Botón para crear nuevo curso */}
            <div className="mb-8">
              <Link href="/dashboard/cursos/crear" className="inline-block px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition">
                + Crear Nuevo Curso
              </Link>
            </div>

            {teacherCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses.map((course) => (
                  // ----- El cambio está aquí, de <a> a <div> -----
                  <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden relative">
                    {/* El enlace para ir a la página de detalles del curso */}
                    <Link href={`/dashboard/${course.id}/${course.title.toLowerCase().replace(/ /g, '-')}`} className="block transition-transform transform hover:scale-105">
                      <div className="w-full h-4 bg-purple-500"></div>
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-center mb-2">{course.title}</h2>
                        <p className="text-gray-600 text-center text-sm">
                          Comisión: {course.commissions.map((c) => c.name).join(', ')}
                        </p>
                      </div>
                    </Link>

                    {/* El formulario y botón para la acción de eliminar */}
                    <div className="absolute top-2 right-2">
                      
                      <DeleteCourseButton courseId={course.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-10">Aún no has creado ningún curso.</p>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Lógica para el alumno
  const userWithCourses = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesJoined: {
        include: {
          modules: {
            include: {
              assignments: true,
            },
          },
        },
      },
    },
  });

  if (!userWithCourses) {
    (await cookies()).delete('session');
    redirect('/login');
  }

  const enrolledCourses = userWithCourses.coursesJoined;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-bold">Mis Cursos</h1>
            <p className="mt-2 text-blue-200">
              Bienvenido, aquí tienes tu progreso.
            </p>
          </div>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map(async (course) => {
                const progress = await getCourseProgress(userId, course.id);
                const courseSlug = course.title.toLowerCase().replace(/ /g, '-');

                return (
                  <a key={course.id} href={`/dashboard/${course.id}/${courseSlug}`} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
                    <div className="w-full h-4 bg-yellow-400"></div>
                    <div className="p-6">
                      <h2 className="text-xl font-bold text-center mb-2">{course.title}</h2>
                      <p className="text-gray-600 text-center text-sm">{course.description}</p>
                      <div className="mt-4 text-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{progress.toFixed(0)}% completado</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No estás inscrito en ningún curso todavía.</p>
          )}
        </div>
      </main>
    </div>
  );
}
