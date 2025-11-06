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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Previene el comportamiento predeterminado de enviar el formulario

    const formData = new FormData(event.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()); // Convierte el FormData a un objeto simple

    setError('');
    setIsSubmitting(true);

    try {
      const result = await createCourse(formData); // Envía los datos al servidor como un objeto JSON

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      setError('Hubo un error al crear el curso.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Crear Nuevo Curso</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo para la Materia */}
        <div>
          <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">Nombre de la Materia</label>
          <select
            id="subject"
            name="subject"
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
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
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            required
          >
            <option value="">Selecciona la generación</option>
            {generations.map((gen) => (
              <option key={gen} value={gen}>{gen}</option>
            ))}
          </select>
        </div>
        
        {/* Campo para la Descripción */}
        <div>
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Descripción del Curso</label>
          <textarea
            id="description"
            name="description"
            rows={4} // Ajusta el número de filas para una mejor visualización
            className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 transition duration-300"
            required
          />
        </div>
        
        {/* Error */}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Botón para enviar */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creando...' : 'Crear Curso'}
        </button>
      </form>

      {/* Enlace para volver a los cursos */}
      <div className="mt-6 text-center">
        <Link href="/dashboard" className="text-blue-600 hover:text-blue-700 hover:underline">Volver a Mis Cursos</Link>
      </div>
    </div>
  );
}
