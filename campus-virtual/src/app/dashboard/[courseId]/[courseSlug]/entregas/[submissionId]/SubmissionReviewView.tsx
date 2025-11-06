"use client";

import React, { useState } from 'react';
import { CodeEditor } from '@/components/ui/CodeEditor'; 
import { saveDocenteReview } from '@/lib/actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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

interface SubmissionReviewViewProps {
    submission: SubmissionDetail; 
    courseId: string;
    courseSlug: string; 
}

export function SubmissionReviewView({ submission, courseId, courseSlug }: SubmissionReviewViewProps) {
    const router = useRouter();
    
    // ✅ CORRECCIÓN TEMPORAL: Inicializamos con cadena vacía
    const [comentarioDocente, setComentarioDocente] = useState(''); 
    
    const [estadoFinal, setEstadoFinal] = useState<'APPROVED' | 'REJECTED' | 'PENDING'>(
        submission.isSuccessful === true ? 'APPROVED' : submission.isSuccessful === false ? 'REJECTED' : 'PENDING'
    );
    const [isSaving, setIsSaving] = useState(false);
    
    // ... (El resto de la lógica handleSaveReview queda igual) ...
    const handleSaveReview = async () => {
        setIsSaving(true);
        
        const data = {
            submissionId: submission.id,
            comment: comentarioDocente, // Envía el comentario aunque el campo esté vacío
            status: estadoFinal,
            courseId: courseId,
            courseSlug: courseSlug,
        };

        const result = await saveDocenteReview(data);

        setIsSaving(false);

        if (result.success) {
            toast.success(result.message); 
            router.push(`/dashboard/${courseId}/${courseSlug}/entregas`);
        } else {
            // 🛑 ADVERTENCIA: Esta parte puede fallar si la BD no tiene el campo docenteComment
            // ya que la Server Action intentará INSERTAR/ACTUALIZAR ese campo.
            toast.error("Error al guardar: Esto podría deberse a que la base de datos aún no tiene el campo 'docenteComment'.");
        }
    };

    return (
        // ... (Todo tu JSX es correcto y no necesita cambios) ...
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna 1 y 2: Información de la Entrega */}
            <div className="lg:col-span-2">
                <h1 className="text-3xl font-bold mb-4">{submission.assignment.title}</h1>
                <p className="text-gray-600 mb-8">
                    Alumno: **{submission.student.lastName}, {submission.student.name}** | 
                    Entregado: {new Date(submission.submittedAt).toLocaleString()}
                </p>
                
                {/* Código Enviado */}
                <h2 className="text-xl font-semibold mb-3">Código del Alumno</h2>
                <CodeEditor 
                    value={submission.codeSubmitted} 
                    readOnly={true} 
                    language="python"
                    className="h-96 w-full shadow-lg border border-gray-200 rounded-lg overflow-hidden" 
                />

                {/* Resultados de Pruebas Automáticas (Si aplica) */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-inner">
                    <h3 className="font-semibold text-lg">Resultado Automático:</h3>
                    <p className={submission.isSuccessful ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        {submission.isSuccessful === true ? '✅ Pruebas Pasadas' : 
                         submission.isSuccessful === false ? '❌ Pruebas Fallidas' : 
                         '🟡 Pendiente de Pruebas'
                        }
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Este es el resultado de la ejecución automática de la entrega.</p>
                </div>
            </div>

            {/* Columna 3: Formulario de Revisión Docente */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 bg-white p-6 rounded-xl shadow-2xl border border-blue-100">
                    <h2 className="text-2xl font-bold mb-6 text-blue-800">Calificación Final</h2>
                    
                    {/* Selector de Estado Manual */}
                    <label htmlFor="estado-final" className="block text-sm font-medium text-gray-700 mb-2">Estado de Aprobación</label>
                    <select
                        id="estado-final"
                        value={estadoFinal}
                        onChange={(e) => setEstadoFinal(e.target.value as 'APPROVED' | 'REJECTED' | 'PENDING')}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg shadow-sm appearance-none cursor-pointer"
                    >
                        <option value="APPROVED">✅ Aprobado</option>
                        <option value="REJECTED">❌ Desaprobado</option>
                        <option value="PENDING">🟡 Revisión Pendiente</option>
                    </select>

                    {/* Área de Comentarios */}
                    <label htmlFor="comentario" className="block text-sm font-medium text-gray-700 mt-6 mb-2">Comentario Docente</label>
                    <textarea
                        id="comentario"
                        rows={8} 
                        value={comentarioDocente}
                        onChange={(e) => setComentarioDocente(e.target.value)}
                        placeholder="Escribe tu feedback detallado aquí. Este comentario será visible para el alumno."
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-lg p-3 resize-none"
                    />

                    {/* Botón de Guardar */}
                    <button
                        onClick={handleSaveReview}
                        disabled={isSaving}
                        className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Guardando...
                            </>
                        ) : 'Guardar Revisión y Calificar'}
                    </button>
                </div>
            </div>
        </div>
    );
}