import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
import DeleteCourseButton from '@/components/DeleteCourseButton';
import Link from 'next/link';

async function getCourseProgress(userId: number, courseId: number) {
  const totalAssignments = await prisma.assignment.count({
    where: { module: { courseId } },
  });

  if (totalAssignments === 0) return 0;

  const completedSubmissions = await prisma.studentProgress.count({
    where: { studentId: userId, assignment: { module: { courseId } } },
  });

  return (completedSubmissions / totalAssignments) * 100;
}

export default async function DashboardPage() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) redirect('/login');

  const session = JSON.parse(sessionCookie.value);
  const userId = session.userId;
  const userRole = session.role;

  // ===== Dashboard Docente =====
  if (userRole === 'TEACHER') {
    const teacherCourses = await prisma.course.findMany({
      where: { teacherId: userId },
      include: { commissions: true },
    });

    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <main className="flex-1 p-8">
          <div className="container mx-auto">
            <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-2xl shadow-lg mb-8">
              <h1 className="text-4xl font-extrabold">Mis Cursos</h1>
              <p className="mt-2 text-blue-200">
                Bienvenido, docente. Aquí tienes un resumen de tus cursos.
              </p>
            </div>


            {/* Botón para crear nuevo curso */}
            
            <div className="mb-8 text-center">
              <Link
                href="/dashboard/cursos/crear"
                className="inline-block px-6 py-3 bg-blue-700 text-white font-bold rounded-xl shadow-md hover:bg-blue-800 transition"
              >
                + Crear Nuevo Curso
              </Link>
            </div>

            {teacherCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacherCourses.map((course) => (
                  <div key={course.id} className="relative bg-white rounded-2xl shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-2xl">
                    <Link
                      href={`/dashboard/${course.id}/${course.title.toLowerCase().replace(/ /g, '-')}`}
                      className="block"
                    >
                      <div className="h-2 w-full bg-gray-200">
                        {/* Barra superior azul */}
                        <div className="h-2 rounded-full bg-blue-600"></div>
                      </div>

                      <div className="p-6">
                        <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">{course.title}</h2>
                        <p className="text-gray-500 text-center text-sm">
                          Comisión: {course.commissions.map((c) => c.name).join(', ')}
                        </p>
                      </div>
                    </Link>

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

  // ===== Dashboard Alumno =====
  const userWithCourses = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesJoined: {
        include: {
          modules: { include: { assignments: true } },
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
          <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-8 rounded-2xl shadow-lg mb-8">
            <h1 className="text-4xl font-extrabold">Mis Cursos</h1>
            <p className="mt-2 text-blue-200">Bienvenido, aquí tienes tu progreso.</p>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {await Promise.all(
                enrolledCourses.map(async (course) => {
                  const progress = await getCourseProgress(userId, course.id);
                  const courseSlug = course.title.toLowerCase().replace(/ /g, '-');

                  return (
                    <Link
                      key={course.id}
                      href={`/dashboard/${course.id}/${courseSlug}`}
                      className="bg-white rounded-2xl shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-2xl"
                    >
                      <div className="h-2 w-full bg-gray-200">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${progress}%`, backgroundColor: "#FACC15" }}
                        ></div>
                      </div>

                      <div className="p-6">
                        <h2 className="text-2xl font-bold text-blue-900 text-center mb-2">{course.title}</h2>
                        <p className="text-gray-500 text-center text-sm mb-4">{course.description}</p>
                        <div className="mt-4 text-center">
                          <p className="text-sm font-medium text-blue-700">{progress.toFixed(0)}% completado</p>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">No estás inscrito en ningún curso todavía.</p>
          )}
        </div>
      </main>
    </div>
  );
}
