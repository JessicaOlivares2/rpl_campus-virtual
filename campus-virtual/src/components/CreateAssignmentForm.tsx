"use client";

import { createAssignment } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreateAssignmentFormProps {
  moduleId: number;
  courseId: number;
}

export default function CreateAssignmentForm({ moduleId, courseId }: CreateAssignmentFormProps) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    // Llama a la acción de servidor y maneja el resultado
    const result = await createAssignment(formData);

    if (result.success) {
      setSuccessMessage("¡Ejercicio creado con éxito!");
      setErrors({});
      // Redirige al usuario a la página del módulo después de un breve retraso
      setTimeout(() => {
        router.push(`/dashboard/cursos/${courseId}`);
      }, 1500);
    } else {
      setSuccessMessage(null);
      if (result.errors) {
        setErrors(result.errors);
      } else {
        setErrors({ general: [result.error || "Hubo un error desconocido."] });
      }
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {successMessage && <div className="p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}
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
        <Link href={`/dashboard/cursos/${courseId}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Cancelar
        </Link>
        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition">
          Crear Ejercicio
        </button>
      </div>
    </form>
  );
}
