// src/app/page.tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Bienvenido al Campus Virtual</h1>
      <p className="text-lg mb-8">La plataforma para estudiantes y docentes.</p>
      <div className="space-x-4">
        <Link href="/login" className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600">
          Iniciar Sesión
        </Link>
        <Link href="/register" className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600">
          Registrarse
        </Link>
      </div>
    </div>
  );
}