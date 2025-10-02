// src/app/dashboard/[courseId]/modules/[moduleId]/assignments/crear/page.tsx

import Header from '@/components/ui/Header';
import CreateAssignmentForm from '@/components/CreateAssignmentForm';
import { notFound, redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { cookies } from 'next/headers';

export default async function CreateAssignmentPage({ params }: { params: { courseId: string; moduleId: string } }) {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) {
    redirect('/login');
  }

  const session = JSON.parse(sessionCookie.value);
  const userRole = session.role;
  if (userRole !== "TEACHER") {
    notFound();
  }

  const courseId = parseInt(params.courseId);
  const moduleId = parseInt(params.moduleId);
  
  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: {
        // 🚨 MODIFICACIÓN: Seleccionamos el título Y el slug del curso
        select: { title: true, slug: true } // Asumo que el campo se llama 'slug'
      }
    }
  });
  
  if (!module || !module.course.slug) {
    // Si el módulo no existe o el curso no tiene slug, redirigir
    notFound();
  }

  // 🚨 OBTENEMOS EL SLUG DEL CURSO
  const courseSlug = module.course.slug; 

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 p-8">
        <div className="container mx-auto">
          <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
            <h1 className="text-4xl font-bold">Crear Ejercicio para "{module.title}"</h1>
            <p className="mt-2 text-blue-200">Curso: {module.course.title}</p>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
            {/* 🚨 MODIFICACIÓN: Pasamos el nuevo prop courseSlug al formulario */}
            <CreateAssignmentForm moduleId={moduleId} courseId={courseId} courseSlug={courseSlug} />
          </div>
        </div>
      </main>
    </div>
  );
}