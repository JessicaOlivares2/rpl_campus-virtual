'use client';

import { useState } from 'react';
import { updateStudentProgress } from "@/lib/actions";

interface AssignmentInteractiveContentProps {
  assignmentId: number;
  isCompletedInitial: boolean;
  studentId: number;
}

export default function AssignmentInteractiveContent({ assignmentId, isCompletedInitial, studentId }: AssignmentInteractiveContentProps) {
  const [isCompleted, setIsCompleted] = useState(isCompletedInitial);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleComplete = async () => {
    setIsSubmitting(true);
    const result = await updateStudentProgress(studentId, assignmentId);
    if (result.success) {
      setIsCompleted(true);
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-8 flex justify-center">
      {isCompleted ? (
        <span className="px-6 py-3 bg-green-500 text-white font-bold rounded-full shadow-lg">✅ ¡Ejercicio Completado!</span>
      ) : (
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition duration-300"
        >
          {isSubmitting ? 'Marcando...' : 'Marcar como completado'}
        </button>
      )}
      {message && <p className="mt-4 text-center text-sm text-gray-600">{message}</p>}
    </div>
  );
}