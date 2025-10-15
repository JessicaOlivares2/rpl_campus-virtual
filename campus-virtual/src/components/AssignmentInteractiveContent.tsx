// src/components/AssignmentInteractiveContent.tsx
"use client";

import { useState } from 'react';
import { updateStudentProgress, submitCode } from '@/lib/actions'; 

// 1. Definir la interfaz Submission
interface Submission {
  id: number;
  codeSubmitted: string;
  submittedAt: Date; 
  isSuccessful: boolean | null;
  executionTimeMs: number | null;
}

// 2. Definir las props extendidas
interface AssignmentInteractiveContentProps {
  assignmentId: number;
  isCompletedInitial: boolean;
  studentId: number;
  assignmentType: string; 
  initialSubmissions: Submission[];
  initialCode: string; // ⭐ NUEVA PROP
}

// Tipos de ejercicio que requieren el editor de código
const CODE_ASSIGNMENT_TYPES = ['Quiz', 'Project']; 

export default function AssignmentInteractiveContent({ 
  assignmentId, 
  isCompletedInitial, 
  studentId, 
  assignmentType, 
  initialSubmissions,
  initialCode // ⭐ RECIBIR LA PROP
}: AssignmentInteractiveContentProps) {
  
  // Estados
  // ⭐ USAR initialCode para inicializar el editor
  const [code, setCode] = useState(initialCode); 
  const [feedback, setFeedback] = useState<{ message: string, success: boolean | null } | null>(null);
  const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
  const [isLoading, setIsLoading] = useState(false);
  const [submissions, setSubmissions] = useState(initialSubmissions); // Historial

  // Determinar si mostramos el editor
  const isCodeAssignment = CODE_ASSIGNMENT_TYPES.includes(assignmentType);

  // ----------------------------------------------------
  // MANEJO DEL ENVÍO DE CÓDIGO (Para Quiz/Project)
  // ----------------------------------------------------
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    const result = await submitCode(studentId, assignmentId, code); 
    
    setIsLoading(false);

    if (result.success) {
        if (result.submission) {
             setSubmissions(prev => [result.submission, ...prev]);
        }
        
        if (result.passed) {
            setFeedback({ message: result.message, success: true });
            setIsCompleted(true);
        } else {
            setFeedback({ message: result.message, success: false });
        }
    } else {
      setFeedback({ message: result.message || "Error desconocido al enviar el código.", success: false });
    }
  };

  // ----------------------------------------------------
  // MANEJO DE MARCAR COMO COMPLETADO (Solo para Lesson)
  // ----------------------------------------------------
  const handleMarkCompleted = async () => {
    setIsLoading(true);
    const result = await updateStudentProgress(studentId, assignmentId); 
    if (result.success) {
        setIsCompleted(true);
    }
    setIsLoading(false);
  };
  
  // ----------------------------------------------------
  // RENDERING CONDICIONAL
  // ----------------------------------------------------
  
  // VISTA 1: Ejercicios de CÓDIGO (Quiz/Project)
  if (isCodeAssignment) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold mb-6">Editor de Código</h3>
        
        <form onSubmit={handleSubmitCode} className="space-y-4">
          <textarea
            name="codeSubmitted"
            rows={15}
            value={code} // Usa el estado inicial (que contiene el stub)
            onChange={(e) => setCode(e.target.value)}
            className="w-full border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:border-blue-500 focus:ring-blue-500 p-3" 
            placeholder="# Escribe tu codigo aquí..." 
            disabled={isLoading}
          />
          
          <div className="flex justify-end items-center space-x-4">
            {feedback && (
              <div 
                className={`p-2 rounded-lg text-sm font-semibold ${
                  feedback.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {feedback.message}
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isLoading || code.length === 0}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isLoading ? 'Enviando...' : 'Enviar Respuesta y Obtener Feedback'}
            </button>
          </div>
        </form>
        
        {/* Historial de Entregas */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg shadow-inner">
             <h4 className="text-lg font-bold mb-3 border-b pb-2">Historial de Entregas ({submissions.length})</h4>
             {submissions.map((sub, index) => (
                <div key={sub.id || index} className="p-3 border-b last:border-b-0 text-sm flex justify-between items-center">
                    <span className="font-mono text-xs overflow-hidden whitespace-nowrap text-ellipsis max-w-xs">{sub.codeSubmitted.substring(0, 50)}...</span>
                    <span className={`font-bold text-xs w-20 text-right ${sub.isSuccessful ? 'text-green-600' : 'text-red-600'}`}>
                        {sub.isSuccessful ? 'PASÓ' : 'FALLÓ'}
                    </span>
                    <span className="text-gray-500 text-xs w-32 text-right">
                        {new Date(sub.submittedAt).toLocaleString()}
                    </span>
                </div>
             ))}
             {submissions.length === 0 && <p className="text-gray-500 text-sm mt-1">Aún no hay entregas.</p>}
        </div>
      </div>
    );
  }

  // VISTA 2: Ejercicios de LECTURA (Lesson)
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold mb-6">Lección</h3>
        <p className="text-gray-700 mb-8">Marca esta lección como completada cuando hayas terminado de revisar el material.</p>

        <div className="flex justify-center">
        {isCompleted ? (
            <span className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg">✅ ¡Ejercicio Completado!</span>
        ) : (
            <button
            onClick={handleMarkCompleted}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300 disabled:opacity-50"
            >
            {isLoading ? 'Marcando...' : 'Marcar como completado'}
            </button>
        )}
        </div>
    </div>
  );
}