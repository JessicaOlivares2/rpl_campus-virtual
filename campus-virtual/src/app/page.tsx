import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Título principal */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-blue-900 mb-6 text-center drop-shadow-lg">
        Bienvenido al Campus Virtual
      </h1>

      {/* Subtítulo */}
      <p className="text-lg md:text-xl text-blue-800 mb-12 text-center max-w-2xl mx-4">
        La plataforma definitiva para estudiantes y docentes: organiza, aprende y gestiona tus cursos de manera eficiente y profesional.
      </p>

      {/* Botones */}
      <div className="flex space-x-6">
        <Link
          href="/login"
          className="bg-blue-700 text-white py-3 px-10 rounded-2xl shadow-lg hover:shadow-xl hover:bg-blue-800 transition-all font-semibold transform hover:-translate-y-1"
        >
          Iniciar Sesión
        </Link>
        <Link
          href="/register"
          className="bg-[#FDEBD0] text-blue-900 py-3 px-10 rounded-2xl shadow-lg hover:shadow-xl hover:bg-[#FCE5C7] transition-all font-semibold transform hover:-translate-y-1"
        >
          Registrarse
        </Link>
      </div>

  
    </div>
  );
}
