"use client";

import { createAssignment } from "@/lib/actions";
import { useState } from "react";
import Link from "next/link";

interface CreateAssignmentFormProps {
  moduleId: number;
  courseId: number;
  courseSlug: string;
}

export default function CreateAssignmentForm({
  moduleId,
  courseId,
  courseSlug,
}: CreateAssignmentFormProps) {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setErrors({});
    setSuccessMessage(null);

    const result = await createAssignment(formData);

    if (result.success) {
      setSuccessMessage("✅ Ejercicio creado con éxito!");
      setErrors({});
    } else {
      if (result.errors) setErrors(result.errors);
      else setErrors({ general: [result.error || "Hubo un error desconocido."] });
    }
  };

  return (
    <form
      className="space-y-6 p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto"
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleSubmit(formData);
      }}
    >
      {successMessage && (
        <div className="p-4 bg-green-100 text-green-700 rounded-md">{successMessage}</div>
      )}
      {errors.general && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">{errors.general[0]}</div>
      )}

      <input type="hidden" name="moduleId" value={moduleId} />

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="title">
          Título
        </label>
        <input
          type="text"
          id="title"
          name="title"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title[0]}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="description">
          Descripción (Opcional)
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
      </div>

      {/* Archivo de Pruebas */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="testFile">
          Archivo de Pruebas (.py)
        </label>
        <input
          type="file"
          id="testFile"
          name="testFile"
          accept=".py"
          required
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300
                     rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
        {errors.testFile && <p className="text-red-500 text-sm mt-1">{errors.testFile[0]}</p>}
        <p className="mt-1 text-xs text-gray-500">
          Sube el archivo Python que contiene los casos de prueba para el ejercicio.
        </p>
      </div>

      {/* Tipo de Ejercicio */}
      <div>
        <label className="block text-sm font-medium text-gray-700" htmlFor="type">
          Tipo de Ejercicio
        </label>
        <select
          id="type"
          name="type"
          required
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm
                     focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        >
          <option value="Lesson">Lección</option>
          <option value="Quiz">Examen</option>
          <option value="Project">Proyecto</option>
        </select>
        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type[0]}</p>}
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4">
        <Link
          href={`/dashboard/${courseId}/${courseSlug}`}
          className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-200 transition"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition"
        >
          Crear Ejercicio
        </button>
      </div>
    </form>
  );
}
