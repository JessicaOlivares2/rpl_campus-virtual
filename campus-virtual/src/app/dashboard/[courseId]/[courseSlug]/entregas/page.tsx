"use server" // Es necesario para usar 'cookies'
import { redirect } from 'next/navigation';
import { cookies } from "next/headers"; // Usamos cookies para obtener la sesión
import db from '@/lib/db'; 
import { DocenteEntregasTable } from './DocenteEntregasTable';

// Tipos basados en la consulta de Prisma
interface EntregaData {
    id: number;
    submittedAt: Date;
    isSuccessful: boolean | null;
    student: { name: string; lastName: string; };
    assignment: { title: string; };
}

interface DeliveriesPageProps {
  params: {
    courseId: string; // ID numérico del curso (ej: 3)
    courseSlug: string; // Slug del curso (ej: bases-de-datos)
  };
}

export default async function CourseDeliveriesPage({ params }: DeliveriesPageProps) {
  
  // 🔒 1. VERIFICACIÓN DE ROL USANDO COOKIES
  const sessionCookie = (await cookies()).get('session');

  if (!sessionCookie) {
    redirect('/login'); // Redirigir si no hay sesión
  }

  const session = JSON.parse(sessionCookie.value);
  // NOTA: Tu modelo User usa 'TEACHER' y 'STUDENT'
  const isTeacher = session.role === 'TEACHER'; 

  // Redirigir si no es docente (CONTROL DE ACCESO)
  if (!isTeacher) {
    redirect(`/dashboard/${params.courseId}/${params.courseSlug}`); 
  }
  
  const courseIdNumber = parseInt(params.courseId);
  if (isNaN(courseIdNumber)) {
    return <div className="p-6 text-red-600">Error: ID de curso inválido.</div>;
  }

  // ⚙️ 2. OBTENCIÓN DE DATOS (Lógica de Servidor con Prisma)
  try {
    const entregas: EntregaData[] = await db.submission.findMany({
      where: {
        assignment: { 
          module: { 
            courseId: courseIdNumber, 
          },
        },
      },
      select: {
        id: true,
        submittedAt: true, 
        isSuccessful: true, 
        student: { 
          select: { name: true, lastName: true },
        },
        assignment: { 
          select: { title: true },
        },
      },
      orderBy: {
        submittedAt: 'desc', 
      },
    }) as EntregaData[]; // Forzamos el tipo para que coincida con la interfaz

    // 3. RENDERIZADO DE LA VISTA
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="container mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Historial de Entregas</h1>
            <p className="text-gray-600 mb-8">
              Revisión de todas las entregas para el curso: {params.courseSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}.
            </p>
            
<DocenteEntregasTable 
              entregas={entregas} 
              courseId={params.courseId} 
              courseSlug={params.courseSlug} // 🚨 ¡Añadido! 🚨
          />      
              </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error("Error al cargar entregas:", error);
    // Un error 500 elegante en caso de fallo de DB
    return <div className="p-6 text-red-600 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="font-bold">Error de Carga</h2>
        <p>No se pudo establecer conexión con la base de datos o la consulta falló.</p>
    </div>
  }
}