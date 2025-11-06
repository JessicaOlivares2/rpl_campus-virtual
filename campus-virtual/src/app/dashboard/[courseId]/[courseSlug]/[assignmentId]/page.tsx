import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
import AssignmentInteractiveContent from '@/components/AssignmentInteractiveContent'; 
import { cookies } from 'next/headers';
import { getEnunciadoComponent } from '@/lib/enunciado-loader'; 
import BackButton from '@/components/BackButton'; // ⬅️ Importamos el botón

export default async function AssignmentDetailPage({ params }: { params: { courseId: string; courseSlug: string; assignmentId: string } }) {
    
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie) notFound();
    const session = JSON.parse(sessionCookie.value);
    const studentId = session.userId;
    
    const assignmentId = parseInt(params.assignmentId);
    if (isNaN(assignmentId)) notFound();

    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            module: { include: { course: true } },
            progress: { where: { studentId } },
            submissions: { where: { studentId }, orderBy: { submittedAt: 'desc' } } as any,
            testFiles: true,
        },
    });

    if (!assignment) notFound();
    
    const EnunciadoComponent = await getEnunciadoComponent(assignment.slug);

    const lastSubmissionCode = assignment.submissions.length > 0 
        ? assignment.submissions[0].codeSubmitted 
        : assignment.module.course.language === 'python' 
            ? 'def solution():\n    pass' 
            : ''; 

    const isCompletedInitial = assignment.progress.length > 0 && assignment.progress[0].isCompleted;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Header />
            <div className="container mx-auto">
                
                {/* BOTÓN DE ATRÁS */}
                <BackButton />

                {/* Cabecera del Ejercicio */}
                <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
                    <h1 className="text-4xl font-bold">{assignment.title}</h1>
                    <p className="mt-2 text-blue-200">Materia: {assignment.module.course.title}</p>
                    <p className="mt-1 text-blue-200">Unidad: {assignment.module.title}</p>
                </div>

                {/* ESTRUCTURA PRINCIPAL DE DOS COLUMNAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: ENUNCIADO */}
                    <div className="bg-white p-8 rounded-lg shadow-md h-fit">
                        <h2 className="text-2xl font-bold mb-6">Enunciado</h2>
                        <EnunciadoComponent />
                    </div>

                    {/* COLUMNA DERECHA: EDITOR INTERACTIVO */}
                    <div>
                        <AssignmentInteractiveContent
                            assignmentId={assignmentId}
                            isCompletedInitial={isCompletedInitial}
                            studentId={studentId}
                            assignmentType={assignment.type}
                            initialSubmissions={assignment.submissions as any}
                            initialCode={lastSubmissionCode}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
