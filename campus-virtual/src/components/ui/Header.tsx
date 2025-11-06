// components/ui/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">
          <Link href="/" className="hover:text-blue-600">
            rpl.etec
          </Link>
        </div>
        <nav className="space-x-6 flex items-center">
          <Link
            href="/dashboard"
            className="text-blue-600 font-medium hover:text-blue-800"
            aria-label="Ir a Mis Cursos"
          >
            Mis cursos
          </Link>
          <form action="/logout" method="post" className="inline-block">
            <button
              type="submit"
              className="text-red-600 font-medium hover:text-red-800"
              aria-label="Cerrar sesión"
            >
              Cerrar sesión
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
