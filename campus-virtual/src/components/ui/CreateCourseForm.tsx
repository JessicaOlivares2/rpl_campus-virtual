"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createCourse } from "@/lib/actions";
import Link from 'next/link';

interface CreateCourseFormProps {
  commissions: {
    id: number;
    name: string;
    registrationCode: string;
  }[];
}

const generations = ['2023', '2024', '2025'];
const subjects = ['Introducción a la Programación', 'Bases de Datos', 'Algoritmos y Estructuras'];

export default function CreateCourseForm({ commissions }: CreateCourseFormProps) {
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setError('');
    setIsSubmitting(true);

    const result = await createCourse(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">Crear Nuevo Curso</h1>
      <form action={handleSubmit} className="space-y-6">
        {/* Campo para la Materia */}
        <div>
          <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Nombre de la Materia</label>
          <select
            id="subject"
            name="subject"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona una materia</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
        
        {/* Campo para la Comisión */}
        <div>
          <label htmlFor="commission" className="block text-gray-700 font-medium mb-2">Comisión</label>
          <select
            id="commission"
            name="commission"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona la comisión</option>
            {commissions.map((comm) => (
              <option key={comm.id} value={comm.name}>{comm.name}</option>
            ))}
          </select>
        </div>
        
        {/* Campo para la Generación */}
        <div>
          <label htmlFor="generation" className="block text-gray-700 font-medium mb-2">Generación</label>
          <select
            id="generation"
            name="generation"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Selecciona la generación</option>
            {generations.map((gen) => (
              <option key={gen} value={gen}>{gen}</option>
            ))}
          </select>
        </div>
        
        {/* Campo para la Descripción (CORREGIDO) */}
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Descripción del Curso</label>
          <textarea
            id="description"
            name="description"
            rows={2} // Puedes ajustar el número de filas
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        {/* ... (el resto de tu formulario) */}
        {error && <p className="text-red-500 text-center">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-4 py-3 bg-blue-800 text-white font-bold rounded-lg shadow-md hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando...' : 'Crear Curso'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/dashboard" className="text-blue-600 hover:underline">Volver a Mis Cursos</Link>
      </div>
    </div>
  );
}

