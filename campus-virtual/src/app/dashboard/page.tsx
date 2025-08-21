// src/app/(dashboard)/dashboard/page.tsx

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";

export default async function DashboardPage() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie) {
    redirect("/login");
  }

  const session = JSON.parse(sessionCookie.value);
  const userId = session.userId;

  const userWithCourses = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      coursesJoined: true, // Incluye los cursos en los que el usuario está inscrito
    },
  });

  if (!userWithCourses) {
    (await cookies()).delete("session");
    redirect("/login");
  }

  const enrolledCourses = userWithCourses.coursesJoined;

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Barra de navegación superior con el nombre del sitio y el enlace de cerrar sesión */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">rpl.etec</div>
          <nav className="space-x-4">
            <a
              href="/dashboard"
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Mis cursos
            </a>
            <a href="/login" className="text-gray-600 hover:text-red-500">
              Cerrar sesión
            </a>
          </nav>
        </div>
      </header>

      {/* Sección principal de la página */}
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          {/* Encabezado con el título y el subtítulo */}
          <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-bold">Mis Cursos</h1>
            <p className="mt-2 text-blue-200">
              Bienvenido a tu espacio de aprendizaje
            </p>
          </div>

          {/* Grid de tarjetas de cursos */}
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105"
                >
                  <div className="w-full h-4 bg-yellow-400"></div>{" "}
                  {/* Banda de color */}
                  <div className="p-6">
                    <div className="flex items-center justify-center h-24 w-24 bg-gray-200 rounded-full mx-auto mb-4">
                      <span className="text-2xl font-bold text-gray-600">
                        {/* Puedes poner una inicial del curso aquí, si lo deseas */}
                        T
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-center mb-2">
                      {course.title}
                    </h2>
                    <p className="text-gray-600 text-center text-sm">
                      {course.description}
                    </p>
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                      <span>{/* 1 unidades */}</span>
                      <span className="font-medium">{/* DOCENTE */}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-10">
              No estás inscrito en ningún curso todavía.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
