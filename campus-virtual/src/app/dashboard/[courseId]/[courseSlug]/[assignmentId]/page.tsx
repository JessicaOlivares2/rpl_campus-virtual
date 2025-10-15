// src/app/dashboard/[courseId]/[courseSlug]/[assignmentId]/page.tsx

import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import Header from '@/components/ui/Header';
import AssignmentInteractiveContent from '@/components/AssignmentInteractiveContent';
import { cookies } from 'next/headers';
// Se eliminan las importaciones de fs/promises y path

// ⭐ FUNCIÓN DE UTILIDAD: Extrae el stub de la descripción
function getStubFromDescription(description: string | null): string {
    if (!description) {
        return "def solucion_incompleta():\n    pass";
    }
    // Busca la estructura 'implementar una función llamada [nombre_funcion(arg1, arg2)]'
    const match = description.match(/implementar una función llamada\s*(\w+\(.*\))/i);
    
    if (match && match[1]) {
        // Devuelve 'def sumar(a, b):\n    pass'
        return `def ${match[1]}:\n    pass`;
    }
    // Valor por defecto si no se encuentra la función en la descripción
    return "def solucionar():\n    pass";
}


export default async function AssignmentDetailPage({ params }: { params: { courseId: string; courseSlug: string; assignmentId: string } }) {
    
    // 1. Lógica de autenticación con cookies
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
            testFiles: true, // Se mantiene por si es útil, aunque ya no se lee su contenido aquí.
        },
    });

    if (!assignment) {
        notFound();
    }
    
    // ⭐ 3. Lógica para obtener el STUB del código inicial
    const codeStub = getStubFromDescription(assignment.description);

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
                    
                    {/* COLUMNA IZQUIERDA: ENUNCIADO Y DESCRIPCIÓN */}
                    <div className="bg-white p-8 rounded-lg shadow-md h-fit">
                        <h2 className="text-2xl font-bold mb-6">Enunciado</h2>
                        <p className="text-gray-700 whitespace-pre-line">
                            {assignment.description || 'No hay una descripción detallada para este ejercicio.'}
                        </p>
                        
                        {/* ⭐ BLOQUE DE CÓDIGO BASE (Ejemplo) */}
                        <div className="mt-8 p-6 bg-gray-900 rounded-lg text-white">
                            <h3 className="text-xl font-semibold mb-4 text-gray-200">Código Base:</h3>
                            <pre className="text-sm overflow-x-auto p-2 border border-gray-700 rounded bg-gray-800">
                                <code className="language-python">
                                    {codeStub}
                                </code>
                            </pre>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: EDITOR INTERACTIVO */}
                    <div>
                        <AssignmentInteractiveContent
                            assignmentId={assignmentId}
                            isCompletedInitial={isCompletedInitial}
                            studentId={studentId}
                            assignmentType={assignment.type}
                            initialSubmissions={assignment.submissions as any}
                            initialCode={codeStub} // ⭐ PASA EL STUB AL EDITOR
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}