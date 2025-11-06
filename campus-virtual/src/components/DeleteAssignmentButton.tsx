// src/components/DeleteAssignmentButton.tsx
'use client';

import { useState } from 'react';
import { deleteAssignment } from '@/lib/actions'; 
// Asume que tienes un ícono de tacho de basura o similar
import { Trash2 } from 'lucide-react'; 

interface DeleteAssignmentButtonProps {
    assignmentId: number;
    assignmentTitle: string;
}

export default function DeleteAssignmentButton({ assignmentId, assignmentTitle }: DeleteAssignmentButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        
        const result = await deleteAssignment(assignmentId);

        setIsLoading(false);
        
        if (result.success) {
            // Cierra el modal, la revalidación de Next.js recargará la lista automáticamente
            setIsModalOpen(false);
        } else {
            // Muestra un error si la eliminación falla
            setError(result.message); 
            setIsModalOpen(false); // Cierra el modal para que el error sea visible
        }
    };

    return (
        <>
            {/* 1. Botón de Eliminar */}
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="p-2 ml-4 text-red-600 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                title={`Eliminar ejercicio: ${assignmentTitle}`}
            >
                <Trash2 className="w-5 h-5" /> 
            </button>

            {/* Mensaje de error (si ocurre después de intentar eliminar) */}
            {error && (
                <div className="absolute top-0 right-0 m-4 p-3 bg-red-100 text-red-700 rounded-lg shadow-md">
                    {error}
                </div>
            )}

            {/* 2. Modal de Confirmación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Confirmar Eliminación</h3>
                        <p className="mb-6">
                            ¿Estás seguro de que quieres eliminar el ejercicio 
                            <span className="font-semibold text-red-600"> {assignmentTitle}</span>? 
                            Esta acción es permanente y eliminará todo el historial de entregas de los estudiantes.
                        </p>

                        <div className="flex justify-end space-x-3">
                            {/* Botón de Cancelar */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            
                            {/* Botón de Confirmar (Eliminar) */}
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                            >
                                {isLoading ? 'Eliminando...' : 'Sí, Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}