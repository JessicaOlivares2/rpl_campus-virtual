"use client";

import { createAssignment } from '@/lib/actions';
import { useState } from 'react';
import Link from 'next/link';

// ✨ CORRECCIÓN: Añadimos courseSlug a las props
interface CreateAssignmentFormProps {
  moduleId: number;
  courseId: number;
  courseSlug: string; // Nuevo campo requerido
}

// ✨ CORRECCIÓN: Recibimos courseSlug en los argumentos
export default function CreateAssignmentForm({ moduleId, courseId, courseSlug }: CreateAssignmentFormProps) {
  // Usaremos el estado para manejar los errores
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  
  const handleSubmit = async (formData: FormData) => {
    // Limpiamos errores previos
    setErrors({});

    const result = await createAssignment(formData);

    if (!result.success) {
      if (result.errors) {
        setErrors(result.errors);
      } else if (result.error) {
        setErrors({ general: [result.error] });
      } else {
        setErrors({ general: ["Hubo un error desconocido al crear el ejercicio."] });
      }
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6" encType="multipart/form-data">
      {errors.general && <div className="p-4 bg-red-100 text-red-700 rounded-md">{errors.general[0]}</div>}

      <input type="hidden" name="moduleId" value={moduleId} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        ></textarea>
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
      </div>
        <div>
        <label htmlFor="testFile" className="block text-sm font-medium text-gray-700">Archivo de Pruebas (.py)</label>
        <input
          type="file"
          id="testFile"
          name="testFile" // ¡IMPORTANTE! Usaremos este nombre en actions.ts
          accept=".py" // Filtra a solo archivos Python
          required={true} // Opcional, pero para ejercicios de código, es un requisito.
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        {errors.testFile && <p className="text-red-500 text-sm mt-1">{errors.testFile[0]}</p>}
        <p className="mt-1 text-xs text-gray-500">Sube el archivo Python que contiene los casos de prueba para el ejercicio.</p>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Ejercicio</label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value="Lesson">Lección</option>
          <option value="Quiz">Examen</option>
          <option value="Project">Proyecto</option>
        </select>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type[0]}</p>}
      </div>

      <div className="flex justify-end space-x-4">
        {/* ✨ CORRECCIÓN: Usamos el courseSlug para crear la ruta completa y correcta */}
        <Link href={`/dashboard/${courseId}/${courseSlug}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Cancelar
        </Link>
        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition">
          Crear Ejercicio
        </button>
      </div>
    </form>
  );
}