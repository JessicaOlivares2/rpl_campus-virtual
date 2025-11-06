import SubmissionReviewView from './SubmissionReviewView';
import db from '@/lib/db';

interface SubmissionReviewPageProps {
  params: {
    submissionId: string;
  };
}

export default async function SubmissionReviewPage({ params }: SubmissionReviewPageProps) {
  const { submissionId } = params;

  // 1. OBTENER DATOS DE LA ENTREGA (Submission)
  const submission = await db.submission.findUnique({
    where: {
      id: parseInt(submissionId),
    },
    select: {
      id: true,
      codeSubmitted: true,
      isSuccessful: true,
      submittedAt: true,
      docenteComment: true,
      student: { select: { name: true, lastName: true } },
      assignment: { select: { title: true } },
    },
  });

  // 🛑 Si no se encuentra la entrega, mostrar un mensaje elegante
  if (!submission) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-md">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Entrega no encontrada</h2>
          <p className="text-gray-600 mb-6">
            La entrega solicitada no existe o fue eliminada.
          </p>
          <a
            href="/dashboard" // 👈 Puedes cambiar la ruta según tu app
            className="inline-block px-5 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-all"
          >
            Volver al panel
          </a>
        </div>
      </div>
    );
  }

  // 2. Renderizar la vista principal
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* --- ENCABEZADO --- */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧾 Revisión de Entrega
          </h1>
          <p className="text-gray-600">
            Revisa y califica la entrega de tu estudiante.
          </p>
        </div>

        {/* --- COMPONENTE PRINCIPAL --- */}
        <SubmissionReviewView initialSubmission={submission} />
      </div>
    </div>
  );
}
