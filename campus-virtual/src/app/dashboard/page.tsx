import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header'; // Import the new Header component

async function getCourseProgress(userId: number, courseId: number) {
  // Corregido para contar los ejercicios a través del módulo
  const totalAssignments = await prisma.assignment.count({
    where: {
      module: {
        courseId,
      },
    },
  });

  if (totalAssignments === 0) {
    return 0; // Evita la división por cero si no hay ejercicios
  }

  // Corregido para buscar las entregas a través del módulo y el curso
  const completedSubmissions = await prisma.studentProgress.count({
    where: {
      studentId: userId,
      assignment: {
        module: {
          courseId,
        },
      },
      isCompleted: true,
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

  // Corregida la consulta para incluir assignments a través de modules
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
      <Header /> {/* Add the Header component here */}
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-bold">Mis Cursos</h1>
            <p className="mt-2 text-blue-200">
              Bienvenido a tu espacio de aprendizaje
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
                      <div className="flex items-center justify-center h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4">
                        <span className="text-2xl font-bold text-gray-600">
                          {course.title.charAt(0)}
                        </span>
                      </div>
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
