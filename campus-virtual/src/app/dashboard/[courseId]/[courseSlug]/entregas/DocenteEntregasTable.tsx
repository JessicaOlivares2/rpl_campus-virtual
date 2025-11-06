'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// --- Tipos ---
interface EntregaData {
  id: number;
  submittedAt: Date;
  isSuccessful: boolean | null;
  student: {
    name: string;
    lastName: string;
  };
  assignment: {
    title: string;
  };
}

interface DocenteEntregasTableProps {
  entregas: EntregaData[];
  courseId: string;
  courseSlug: string;
}

// --- Estado visual según resultado ---
const getEstado = (isSuccessful: boolean | null) => {
  if (isSuccessful === true) return { text: 'Aprobado', color: 'text-green-600 bg-green-50 border-green-200' };
  if (isSuccessful === false) return { text: 'Desaprobado', color: 'text-red-600 bg-red-50 border-red-200' };
  return { text: 'Pendiente', color: 'text-orange-600 bg-orange-50 border-orange-200' };
};

// --- Componente principal ---
export function DocenteEntregasTable({ entregas, courseId, courseSlug }: DocenteEntregasTableProps) {
  const router = useRouter();

  // Si no hay entregas
  if (entregas.length === 0) {
    return (
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md border border-gray-200 p-8 mt-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Volver atrás</span>
          </button>

          <h2 className="text-2xl font-semibold text-gray-800">Entregas del curso</h2>
        </div>

        <p className="text-gray-500 text-center py-10">
          No hay entregas pendientes o registradas para este curso.
        </p>
      </div>
    );
  }

  // Si hay entregas
  return (
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8">
      {/* --- ENCABEZADO + BOTÓN ATRÁS --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        

        <h2 className="text-2xl font-semibold text-gray-800 text-center sm:text-right">
          📚 Entregas del curso
        </h2>
      </div>

      {/* --- TABLA DE ENTREGAS --- */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full bg-white text-sm">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
              <th className="py-3 px-4 border-b">Alumno</th>
              <th className="py-3 px-4 border-b">Ejercicio</th>
              <th className="py-3 px-4 border-b">Fecha de Entrega</th>
              <th className="py-3 px-4 border-b">Estado</th>
              <th className="py-3 px-4 border-b text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map((entrega) => {
              const estado = getEstado(entrega.isSuccessful);
              return (
                <tr key={entrega.id} className="border-t hover:bg-gray-50 transition-colors">
                  {/* Alumno */}
                  <td className="py-3 px-4">{entrega.student.lastName}, {entrega.student.name}</td>

                  {/* Ejercicio */}
                  <td className="py-3 px-4">{entrega.assignment.title}</td>

                  {/* Fecha */}
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(entrega.submittedAt).toLocaleDateString()} {' '}
                    {new Date(entrega.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>

                  {/* Estado */}
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${estado.color}`}>
                      {estado.text}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/dashboard/${courseId}/${courseSlug}/entregas/${entrega.id}`}
                      className="inline-block px-3 py-1.5 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Revisar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
