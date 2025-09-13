// src/app/(dashboard)/dashboard/[courseId]/[courseSlug]/page.tsx
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/db";
import Link from "next/link";
import ModuleList from "./ModuleList";
import { cookies } from "next/headers";
import Header from "@/components/ui/Header";

export default async function CourseDetailPage({
  params,
}: {
  params: { courseId: string; courseSlug: string };
}) {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    redirect('/login');
  }

  const session = JSON.parse(sessionCookie.value);
  const userRole = session.role;
  const isTeacher = userRole === "TEACHER";
  
  const studentId = session.userId; // Obtenemos el ID del usuario logueado

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
              resources: true,
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
      <Header /> {/* Agregué el componente Header que falta */}
      <div className="container mx-auto">
        <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2 text-blue-200">{course.description}</p>
          <p className="mt-4 text-sm text-blue-300">
            Docente: {course.teacher.name} {course.teacher.lastName}
          </p>
          <Link
            href={`/dashboard/${course.id}/${params.courseSlug}/materiales`}
          >
            <button className="mt-4 px-4 py-2 bg-white text-blue-800 font-bold rounded-lg shadow-md hover:bg-gray-100 transition">
              Ver Materiales
            </button>
          </Link>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Guías de Ejercicios</h2>
          {isTeacher && (
            <div className="mb-6">
              <Link
                href={`/dashboard/${course.id}/modules/crear`}
                className="inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition"
              >
                + Crear Unidad
              </Link>
            </div>
          )}
          <ModuleList
            modules={course.modules}
            courseId={course.id}
            courseSlug={params.courseSlug}
            isTeacher={isTeacher}
          />
        </div>
      </div>
    </div>
  );
}
