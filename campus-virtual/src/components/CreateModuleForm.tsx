"use client";

import { createModule } from '@/lib/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CreateModuleFormProps {
  courseId: number;
  courseSlug: string;
}

export default function CreateModuleForm({ courseId, courseSlug }: CreateModuleFormProps) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    const result = await createModule(formData);

    if (result.success) {
      setSuccessMessage("¡Unidad creada con éxito!");
      setErrors({});
      setTimeout(() => {
        router.push(`/dashboard/${courseId}/${courseSlug}`);
      }, 1500);
    } else {
      setSuccessMessage(null);
      setErrors(result.errors || { general: [result.error || "Hubo un error desconocido."] });
    }
  };

  return (
    <form action={handleSubmit} className="space-y-6">
      {successMessage && <div className="p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>}
      {errors.general && <div className="p-4 bg-red-100 text-red-700 rounded-md">{errors.general[0]}</div>}

      <input type="hidden" name="courseId" value={courseId} />

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

      <div className="flex justify-end space-x-4">
        <Link href={`/dashboard/${courseId}/${courseSlug}`} className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Cancelar
        </Link>
        <button type="submit" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition">
          Crear Unidad
        </button>
      </div>
    </form>
  );
}
