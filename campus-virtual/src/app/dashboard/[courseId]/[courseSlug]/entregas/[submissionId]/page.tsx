import { redirect } from 'next/navigation';
import { cookies } from "next/headers";
import db from '@/lib/db'; 
import { SubmissionReviewView } from './SubmissionReviewView';

interface ReviewPageProps {
    params: {
        courseId: string; 
        courseSlug: string; 
        submissionId: string; 
    };
}

// ⚠️ TEMPORAL: Eliminado docenteComment de este tipo hasta la migración
type SubmissionDetail = {
    id: number;
    submittedAt: Date;
    codeSubmitted: string;
    isSuccessful: boolean | null;
    student: {
        name: string;
        lastName: string;
    };
    assignment: {
        title: string;
        module: {
            courseId: number;
        }
    };
};


export default async function ReviewSubmissionPage({ params }: ReviewPageProps) {
    
    // ... (Validaciones de sesión y rol)
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie) {
        redirect('/login');
    }
    const session = JSON.parse(sessionCookie.value);
    const isTeacher = session.role === 'TEACHER'; 

    if (!isTeacher) {
        redirect(`/dashboard/${params.courseId}/${params.courseSlug}`); 
    }
    
    const submissionIdNumber = parseInt(params.submissionId);

    if (isNaN(submissionIdNumber)) {
        return <div className="p-6 text-red-600">Error: ID de entrega (Submission) inválido.</div>;
    }

    let submission: SubmissionDetail | null = null;
    try {
        submission = await db.submission.findUnique({
            where: {
                id: submissionIdNumber,
            },
            select: {
                id: true,
                submittedAt: true,
                codeSubmitted: true,
                isSuccessful: true,
                // ❌ LÍNEA ELIMINADA: docenteComment: true, 👈 Ya no se consulta
                student: {
                    select: { name: true, lastName: true },
                },
                assignment: {
                    select: { 
                        title: true, 
                        module: {
                            select: { courseId: true }
                        }
                    },
                },
            },
        }) as SubmissionDetail | null;

        if (!submission) {
            return (
                <div className="p-12 text-center text-gray-500">
                    <h1 className="text-3xl font-bold mb-4">404 - Entrega No Encontrada</h1>
                    <p>La entrega con ID "{params.submissionId}" no existe.</p>
                </div>
            );
        }

        // 3. Renderizado de la Vista
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="container mx-auto">
                    <SubmissionReviewView 
                        submission={submission}
                        courseId={params.courseId} 
                        courseSlug={params.courseSlug} 
                    />
                </div>
            </div>
        );

    } catch (error) {
        console.error(
            "Error al cargar la entrega (DB o Servidor):", 
            error instanceof Error ? error.message : error
        );
        return (
             <div className="p-6 text-red-600 bg-red-100 border border-red-300 rounded-lg">
                <h2 className="font-bold">Error de Carga</h2>
                <p>No se pudo obtener la información de la entrega desde la base de datos. (Verifique si la migración de Prisma está aplicada).</p>
            </div>
        );
    }
}