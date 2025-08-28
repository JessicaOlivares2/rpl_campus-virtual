// components/ui/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-gray-800">rpl.etec</div>
        <nav className="space-x-4 flex items-center">
          <Link href="/dashboard" className="text-blue-600 font-medium hover:text-blue-800">
            Mis cursos
          </Link>
          <form action="/api/auth/signout" method="post">
            <button type="submit" className="text-gray-600 font-medium hover:text-gray-800">
              Cerrar sesión
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}