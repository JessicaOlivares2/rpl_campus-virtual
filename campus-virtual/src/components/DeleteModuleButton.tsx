// src/components/DeleteModuleButton.tsx
'use client';

import { useState } from 'react';
import { deleteModule } from '@/lib/actions'; 
import { Trash2 } from 'lucide-react'; // Ícono para eliminar

interface DeleteModuleButtonProps {
    moduleId: number;
    moduleTitle: string;
}

export default function DeleteModuleButton({ moduleId, moduleTitle }: DeleteModuleButtonProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setIsLoading(true);
        setError(null);
        
        const result = await deleteModule(moduleId);

        setIsLoading(false);
        setIsModalOpen(false);

        if (!result.success) {
            // Muestra el error de restricción (ej. "tiene ejercicios asociados")
            setError(result.message); 
            // El error se muestra fuera del modal para que el docente lo vea
            setTimeout(() => setError(null), 5000); // Oculta el error después de 5 segundos
        } else {
            // No hacemos nada, Next.js revalidará la página y la unidad desaparecerá
        }
    };

    return (
        <>
            {/* 1. Botón de Eliminar */}
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
                className="p-1 text-red-600 hover:bg-red-100 rounded-full transition disabled:opacity-50 ml-2"
                title={`Eliminar Unidad: ${moduleTitle}`}
            >
                <Trash2 className="w-4 h-4" /> 
            </button>

            {/* Mensaje de error (visible si la unidad no está vacía) */}
            {error && (
                <div className="absolute top-0 right-0 mt-4 mr-4 p-3 bg-red-100 text-red-700 rounded-lg shadow-md z-50">
                    {error}
                </div>
            )}

            {/* 2. Modal de Confirmación */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
                        <h3 className="text-xl font-bold mb-4">Confirmar Eliminación de Unidad</h3>
                        <p className="mb-6">
                            ¿Estás seguro de que quieres eliminar la unidad **{moduleTitle}**? 
                            Solo podrás eliminarla si está completamente vacía (sin ejercicios).
                        </p>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                disabled={isLoading}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-red-400"
                            >
                                {isLoading ? 'Verificando...' : 'Sí, Eliminar Unidad'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}