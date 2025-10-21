import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
// ⬅️ Este componente DEBE ser un Client Component ahora, ya que contiene el Editor
import AssignmentInteractiveContent from '@/components/AssignmentInteractiveContent'; 
import { cookies } from 'next/headers';
import { getEnunciadoComponent } from '@/lib/enunciado-loader'; 
// Eliminamos import dynamic, useState, DynamicCodeEditor de aquí.

export default async function AssignmentDetailPage({ params }: { params: { courseId: string; courseSlug: string; assignmentId: string } }) {
    
    // 1. Lógica de autenticación
    const sessionCookie = (await cookies()).get('session');
    if (!sessionCookie) {
        notFound(); 
    }
    const session = JSON.parse(sessionCookie.value);
    const studentId = session.userId;
    
    const assignmentId = parseInt(params.assignmentId);

    if (isNaN(assignmentId)) {
        notFound();
    }

    // 2. Carga los datos necesarios
    const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
            module: {
                include: {
                    course: true,
                },
            },
            progress: {
                where: { studentId },
            },
            submissions: {
                where: { studentId },
                orderBy: { submittedAt: 'desc' },
            } as any, 
            testFiles: true,
        },
    });

    if (!assignment) {
        notFound();
    }
    
    // 3. Cargar el componente del enunciado MDX (usando el slug del ejercicio)
    const EnunciadoComponent = await getEnunciadoComponent(assignment.slug);

    // 4. Determinar el código inicial para el editor: 
    const lastSubmissionCode = assignment.submissions.length > 0 
        ? assignment.submissions[0].codeSubmitted 
        : assignment.module.course.language === 'python' 
            ? 'def solution():\n    pass' // Código base por defecto si no hay submission
            : ''; 

    const isCompletedInitial = assignment.progress.length > 0 && assignment.progress[0].isCompleted;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <Header />
            <div className="container mx-auto">
                
                {/* Cabecera del Ejercicio */}
                <div className="bg-blue-800 text-white p-8 rounded-lg shadow-md mb-8">
                    <h1 className="text-4xl font-bold">{assignment.title}</h1>
                    <p className="mt-2 text-blue-200">Materia: {assignment.module.course.title}</p>
                    <p className="mt-1 text-blue-200">Unidad: {assignment.module.title}</p>
                </div>

                {/* ESTRUCTURA PRINCIPAL DE DOS COLUMNAS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* COLUMNA IZQUIERDA: ENUNCIADO CARGADO DINÁMICAMENTE (MDX) */}
                    <div className="bg-white p-8 rounded-lg shadow-md h-fit">
                        <h2 className="text-2xl font-bold mb-6">Enunciado</h2>
                        <EnunciadoComponent />
                    </div>

                    {/* COLUMNA DERECHA: EDITOR INTERACTIVO (Client Component) */}
                    <div>
                        <AssignmentInteractiveContent
                            assignmentId={assignmentId}
                            isCompletedInitial={isCompletedInitial}
                            studentId={studentId}
                            assignmentType={assignment.type}
                            initialSubmissions={assignment.submissions as any}
                            initialCode={lastSubmissionCode} // ⬅️ Código inicial (última entrega o default)
                            // Puedes pasar el lenguaje si lo tienes en el modelo Course
                            // language={assignment.module.course.language} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}