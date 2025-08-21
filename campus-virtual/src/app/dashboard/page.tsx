// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';

export default async function DashboardPage() {
  // Get the session from cookies
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    redirect('/login');
  }

  const session = JSON.parse(sessionCookie.value);
  const userId = session.userId;

  // Fetch user and their enrolled courses
  const userWithCourses = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesJoined: true,
    },
  });

  if (!userWithCourses) {
    // If the user doesn't exist, log them out and redirect
    (await
          // If the user doesn't exist, log them out and redirect
          cookies()).delete('session');
    redirect('/login');
  }

  const enrolledCourses = userWithCourses.coursesJoined;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mis Cursos</h1>
      {enrolledCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map(course => (
            <div key={course.id} className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="mt-2 text-gray-600">{course.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No estás inscrito en ningún curso todavía.</p>
      )}
    </div>
  );
}