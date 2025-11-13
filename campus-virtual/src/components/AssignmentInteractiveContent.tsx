'use client';

import { useState } from 'react';
import { updateStudentProgress, submitCode } from '@/lib/actions'; 
import { DynamicCodeEditor } from '@/components/ui/CodeEditor'; 
import { CheckCircle, XCircle, Clock, Send, Loader2, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

// -------------------------------------------------------------------
// 1. INTERFACES Y TIPOS
// -------------------------------------------------------------------
interface Submission {
    id: number;
    codeSubmitted: string;
    submittedAt: Date; 
    isSuccessful: boolean | null;
    executionTimeMs: number | null;
}

interface FeedbackState {
    message: string;
    success: boolean | null;
    details?: string; // Campo para el output detallado de las pruebas (H1)
}

interface AssignmentInteractiveContentProps {
    assignmentId: number;
    isCompletedInitial: boolean;
    studentId: number;
    assignmentType: string; 
    initialSubmissions: Submission[];
    initialCode: string; 
}

const CODE_ASSIGNMENT_TYPES = ['Quiz', 'Project']; 
const TIMEOUT_MS = 5000; // 5 segundos para el criterio H2

// -------------------------------------------------------------------
// 2. COMPONENTE PRINCIPAL
// -------------------------------------------------------------------
export default function AssignmentInteractiveContent({ 
    assignmentId, 
    isCompletedInitial, 
    studentId, 
    assignmentType, 
    initialSubmissions,
    initialCode 
}: AssignmentInteractiveContentProps) {
    
    // Estados
    const [code, setCode] = useState(initialCode); 
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
    const [isLoading, setIsLoading] = useState(false);
    const [submissions, setSubmissions] = useState(initialSubmissions); 

    const isCodeAssignment = CODE_ASSIGNMENT_TYPES.includes(assignmentType);

    // -------------------------------------------------------------------
    // Manejador: Envío de Código
    // -------------------------------------------------------------------
    const handleSubmitCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setIsLoading(true);

        if (code.trim().length === 0) {
            setFeedback({ message: "El código no puede estar vacío.", success: false });
            setIsLoading(false);
            return;
        }

        // Lógica de Timeout (H2)
        const timeoutPromise: Promise<any> = new Promise((_, reject) =>
            setTimeout(() => {
                reject(new Error("TimeoutError: Proceso de ejecución excedido.")); 
            }, TIMEOUT_MS)
        );

        try {
            const actionPromise = submitCode(studentId, assignmentId, code);
            const result: any = await Promise.race([actionPromise, timeoutPromise]);
            
            setIsLoading(false);

            if (result.success) {
                if (result.submission) setSubmissions(prev => [result.submission, ...prev]);
                
                setFeedback({ 
                    message: result.message, 
                    success: result.passed,
                    details: result.details, 
                });

                if (result.passed) {
                    setIsCompleted(true);
                }
            } else {
                setFeedback({ 
                    message: result.message || "Error desconocido al enviar el código.", 
                    success: false,
                    details: result.details || "Verifique su conexión o la Server Action.",
                });
            }

        } catch (error) {
            setIsLoading(false);
            
            const errorMessage = error instanceof Error ? error.message : "Error desconocido.";
            
            if (errorMessage.includes("TimeoutError")) {
                // MANEJO ESPECÍFICO DEL TIMEOUT (H2)
                setFeedback({ 
                    success: false, 
                    message: "🚨 Proceso Cancelado: Se excedió el límite de 5 segundos.",
                    details: `La ejecución tardó más de ${TIMEOUT_MS / 1000} segundos. Esto puede ser causado por un bucle infinito.`,
                });
            } else {
                console.error('Error durante el envío de código:', error);
                setFeedback({ 
                    success: false, 
                    message: "Error de conexión o servidor interno.",
                    details: errorMessage,
                });
            }
        }
    };

    // Manejador: Marcar Lección como Completada
    const handleMarkCompleted = async () => {
        setIsLoading(true);
        const result = await updateStudentProgress(studentId, assignmentId); 
        if (result.success) setIsCompleted(true);
        setIsLoading(false);
    };

    // -------------------------------------------------------------------
    // 3. VISTA CÓDIGO
    // -------------------------------------------------------------------
    if (isCodeAssignment) {
        return (
            <div className="flex flex-col h-full space-y-6">
                
                {/* CARD EDITOR - AÑADIDA ALTURA MÍNIMA DE 500PX */}
                <div className="flex flex-col flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-hidden **min-h-[500px]**"> 
                    <h3 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Editor de Código</h3>
                    <form onSubmit={handleSubmitCode} className="flex flex-col flex-1 space-y-4">
                        
                        {/* Editor - Ahora con flex-1 para estirarse en el espacio restante */}
                        <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden">
                            <DynamicCodeEditor
                                initialCode={initialCode} 
                                onCodeChange={(newCode) => setCode(newCode)}
                                language="python"
                                theme="vs-dark"
                            />
                        </div>

                        {/* Feedback y Botón de Enviar */}
                        <div className="flex justify-between items-start pt-2 flex-col sm:flex-row space-y-4 sm:space-y-0">
                            
                            {/* Feedback Principal + Detalle */}
                            {feedback ? (
                                <div className='w-full sm:w-2/3'>
                                    <div 
                                        className={`flex flex-col space-y-2 p-3 rounded-lg font-bold transition-all duration-300 w-full ${
                                            feedback.success
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                        }`}
                                    >
                                        {/* Mensaje principal */}
                                        <div className='flex items-center space-x-2'> 
                                            {feedback.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                                            <span className='text-base'>{feedback.message}</span> 
                                            
                                            {/* Tiempo de Ejecución (Solo si pasó) */}
                                            {feedback.success && submissions.length > 0 && submissions[0].executionTimeMs !== null && (
                                                <span className='text-sm font-normal flex items-center space-x-1 ml-auto text-green-500'>
                                                    <Clock className='h-4 w-4'/>
                                                    <span>{submissions[0].executionTimeMs}ms</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* DETALLE DE PRUEBAS (H1) - Siempre debajo del feedback principal */}
                                    {feedback.details && !feedback.success && (
                                        <div className='mt-4 p-4 rounded-lg bg-gray-900 text-white shadow-inner w-full'>
                                            <p className='font-bold mb-2 text-sm text-red-400'>Detalle de Pruebas:</p>
                                            <pre className="text-xs max-h-40 overflow-auto whitespace-pre-wrap">
                                                {feedback.details}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : <div className="h-10 invisible w-full sm:w-2/3"></div> } 

                            {/* Botón de Enviar */}
                            <div className={`flex justify-end w-full sm:w-auto ${!feedback && 'mt-4'}`}>
                                <button 
                                    type="submit" 
                                    disabled={isLoading || code.trim().length === 0}
                                    className="flex items-center justify-center space-x-2 px-8 py-3 bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:shadow-none min-w-[200px] w-full sm:w-auto" 
                                >
                                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                                    <span>{isLoading ? 'Enviando...' : 'Enviar Código'}</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* CARD HISTORIAL (se mantiene igual) */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h4 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Historial de Entregas ({submissions.length})</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {submissions.map((sub, index) => (
                            <div 
                                key={sub.id || index} 
                                className={`p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm transition-colors shadow-sm ${
                                    sub.isSuccessful ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                                }`}
                            >
                                <div className='flex items-center space-x-2 mb-1 sm:mb-0'>
                                    <span className={`font-bold text-sm flex items-center space-x-1 ${sub.isSuccessful ? 'text-green-700' : 'text-red-700'}`}>
                                        {sub.isSuccessful ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                        <span>{sub.isSuccessful ? 'PASÓ' : 'FALLÓ'}</span>
                                    </span>
                                    <span className="font-mono text-xs text-gray-700 overflow-hidden whitespace-nowrap text-ellipsis max-w-xs sm:max-w-md">
                                        {sub.codeSubmitted.split('\n')[0].trim() || 'Entrega vacía'}
                                    </span>
                                </div>
                                <div className="flex flex-col text-right text-gray-500 text-xs sm:ml-auto">
                                    {sub.executionTimeMs !== null && (
                                        <span className='flex items-center justify-end space-x-1'>
                                            <Clock className='h-3 w-3'/>
                                            <span className='font-medium'>{sub.executionTimeMs} ms</span>
                                        </span>
                                    )}
                                    <span>{format(new Date(sub.submittedAt), 'dd MMM, HH:mm')}</span>
                                </div>
                            </div>
                        ))}
                        {submissions.length === 0 && <p className="text-gray-500 text-center py-4 text-sm">Aún no hay entregas. ¡Empieza a codificar!</p>}
                    </div>
                </div>
            </div>
        );
    }

    // -------------------------------------------------------------------
    // 4. VISTA LECCIÓN
    // -------------------------------------------------------------------
    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Lección</h3>
            <p className="text-gray-700 mb-8 flex items-center space-x-2">
                <BookOpen className='h-5 w-5 text-blue-500'/>
                <span>Marca esta lección como completada cuando hayas terminado de revisar el material.</span>
            </p>

            <div className="flex justify-center">
            {isCompleted ? (
                <span className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg flex items-center space-x-2">
                    <CheckCircle className='h-5 w-5'/> 
                    <span>¡Lección Completada!</span>
                </span>
            ) : (
                <button
                onClick={handleMarkCompleted}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 disabled:opacity-50"
                >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Marcar como completado'}
                </button>
            )}
            </div>
        </div>
    );
}