"use server"
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
  // LECTURA Y CONVERSIÓN DE PARAMS AL INICIO (CORRECTO)
  const courseId = parseInt(params.courseId);


  const sessionCookie = (await cookies()).get('session');

  if (!sessionCookie) {
    redirect('/login');
  }

  const session = JSON.parse(sessionCookie.value);
  // NOTA: Asumo que el rol "TEACHER" en la sesión es consistente con el enum 'Role'
  const userRole = session.role;
  const isTeacher = userRole === "TEACHER";
  
  const studentId = session.userId; // Obtenemos el ID del usuario logueado

    const course = await prisma.course.findUnique({
    where: {
      id: courseId, 
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
      <Header /> 
      <div className="container mx-auto">
        <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-4xl font-bold">{course.title}</h1>
          <p className="mt-2 text-blue-200">{course.description}</p>
          <p className="mt-4 text-sm text-blue-300">
            Docente: {course.teacher.name} {course.teacher.lastName}
          </p>
          
          {/* 🚨 BLOQUE DE BOTONES PARA EL DOCENTE/ALUMNO 🚨 */}
          <div className="mt-6 flex space-x-4">
            
            {/* Botón: Ver Materiales (General) */}
            <Link
              href={`/dashboard/${course.id}/${params.courseSlug}/materiales`}
              passHref
            >
              <button className="px-4 py-2 bg-white text-blue-800 font-bold rounded-lg shadow-md hover:bg-gray-100 transition">
                Ver Materiales
              </button>
            </Link>

            {/* Botón CONDICIONAL: Historial de Entregas (Solo Docente) */}
            {isTeacher && (
              <Link 
                // Esta es la nueva ruta que creamos
                href={`/dashboard/${course.id}/${params.courseSlug}/entregas`}
                passHref
              >
                <button className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg shadow-md hover:bg-red-600 transition">
                  Historial de Entregas
                </button>
              </Link>
            )}
            
          </div>
          {/* ---------------------------------------------------- */}
          
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