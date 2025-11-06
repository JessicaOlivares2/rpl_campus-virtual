'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// --- INTERFAZ DE DATOS ---
interface SubmissionWithDetails {
  id: number;
  codeSubmitted: string;
  isSuccessful: boolean | null;
  submittedAt: Date;
  docenteComment: string | null;
  student: { name: string; lastName: string };
  assignment: { title: string };
}

interface SubmissionReviewViewProps {
  initialSubmission: SubmissionWithDetails;
}

// --- COMPONENTE PRINCIPAL ---
export default function SubmissionReviewView({ initialSubmission }: SubmissionReviewViewProps) {
  const router = useRouter();
  const [comment, setComment] = useState(initialSubmission.docenteComment || '');
  const [grade, setGrade] = useState(initialSubmission.isSuccessful ?? null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      submissionId: initialSubmission.id,
      finalComment: comment,
      passed: grade,
    };

    try {
      console.log('Enviando revisión:', payload);
      // Aquí podrías mostrar un toast o redirigir
    } catch (error) {
      console.error('Error al enviar la revisión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-8">
      {/* --- BOTÓN VOLVER ATRÁS --- */}
      <div>
        <button
          type="button"
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
      </div>

      {/* --- TARJETA DE INFORMACIÓN DE LA ENTREGA --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">
          {initialSubmission.assignment.title}
        </h2>
        <p className="text-gray-600 mb-1">
          Alumno: <span className="font-medium">{initialSubmission.student.name} {initialSubmission.student.lastName}</span>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Fecha de entrega: {new Date(initialSubmission.submittedAt).toLocaleString()}
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Código entregado:</h3>
          <pre className="text-sm bg-gray-900 text-green-200 rounded-md p-4 overflow-auto">
            {initialSubmission.codeSubmitted}
          </pre>
        </div>
      </div>

      {/* --- SECCIÓN DE COMENTARIO --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Comentario del docente</h2>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 resize-none"
          placeholder="Escribe tu comentario de revisión aquí..."
        />
      </div>

      {/* --- SECCIÓN DE CALIFICACIÓN --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setGrade(true)}
            className={`px-5 py-2 rounded-md font-medium transition-all ${
              grade === true
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            ✅ Aprobar
          </button>

          <button
            type="button"
            onClick={() => setGrade(false)}
            className={`px-5 py-2 rounded-md font-medium transition-all ${
              grade === false
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            ❌ Reprobar
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-150 ease-in-out disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar revisión'}
        </button>
      </div>
    </form>
  );
}
