"use server";

import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import db from '@/lib/db'; 
import { DocenteEntregasTable } from './DocenteEntregasTable';
import BackButton from '@/components/BackButton'; // 👈 importamos el botón
import Link from 'next/link';

// Tipos
interface EntregaData {
  id: number;
  submittedAt: Date;
  isSuccessful: boolean | null;
  student: { name: string; lastName: string };
  assignment: { title: string };
}

interface DeliveriesPageProps {
  params: {
    courseId: string;
    courseSlug: string;
  };
}

export default async function CourseDeliveriesPage({ params }: DeliveriesPageProps) {
  // 1️⃣ Verificar sesión
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) redirect('/login');

  const session = JSON.parse(sessionCookie.value);
  if (session.role !== 'TEACHER') {
    redirect(`/dashboard/${params.courseId}/${params.courseSlug}`);
  }

  const courseIdNumber = parseInt(params.courseId);
  if (isNaN(courseIdNumber)) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-8 rounded-xl shadow-sm max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-2">Error: ID inválido</h2>
          <p>El identificador del curso no es válido.</p>
          <Link
            href="/dashboard"
            className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }

  // 2️⃣ Cargar entregas
  try {
    const entregas: EntregaData[] = await db.submission.findMany({
      where: {
        assignment: {
          module: { courseId: courseIdNumber },
        },
      },
      select: {
        id: true,
        submittedAt: true,
        isSuccessful: true,
        student: { select: { name: true, lastName: true } },
        assignment: { select: { title: true } },
      },
      orderBy: { submittedAt: 'desc' },
    }) as EntregaData[];

    const nombreCurso = params.courseSlug
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ');

    // 3️⃣ Renderizado elegante
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          
          {/* --- Encabezado con botón atrás --- */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <BackButton /> {/* 👈 Tu botón reutilizable */}
            <div className="text-center sm:text-right">
              <h1 className="text-3xl font-bold text-gray-800">📘 Historial de Entregas</h1>
              <p className="text-gray-600 mt-1">Curso: {nombreCurso}</p>
            </div>
          </div>

          {/* --- Tabla de entregas --- */}
          <DocenteEntregasTable
            entregas={entregas}
            courseId={params.courseId}
            courseSlug={params.courseSlug}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error al cargar entregas:", error);
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-10 rounded-xl shadow-md max-w-lg text-center">
          <h2 className="text-2xl font-bold mb-2">⚠️ Error de carga</h2>
          <p>No se pudo conectar con la base de datos o la consulta falló.</p>
          <Link
            href="/dashboard"
            className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Volver al panel
          </Link>
        </div>
      </div>
    );
  }
}
