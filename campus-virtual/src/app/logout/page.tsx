// app/logout/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Realiza el proceso de logout (limpiar cookies, tokens, etc.)
    // Redirigir al usuario después de cerrar sesión.
    router.push('/login');  // Redirige a la página de login después del logout.
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Cerrando sesión...</p>
    </div>
  );
}
