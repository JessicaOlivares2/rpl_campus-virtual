'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CalendarClock } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginUser } from '@/lib/actions';

const loginSchema = z.object({
  email: z.string().email({ message: 'Ingrese un email válido' }),
  password: z.string().min(1, { message: 'La contraseña es requerida' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await loginUser({
        email: values.email,
        password: values.password,
      });

      // You can add a success toast here if the action returns successfully (no redirect).
      // However, since the server action redirects, this code is typically not reached.

    } catch (error) {
      // Check if the error is a Next.js redirect signal.
      if (error && (error as Error).message.includes('NEXT_REDIRECT')) {
        // The redirect is handled on the server, so we do nothing here.
      } else {
        // Handle actual login errors (e.g., invalid credentials).
        toast.error('Error al iniciar sesión', {
          description: error instanceof Error ? error.message : 'Ocurrió un error inesperado. Intenta nuevamente.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <CalendarClock className="h-6 w-6 text-teal-600" />
            <span className="text-xl font-bold text-teal-600">Campus Virtual</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm border">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
              <p className="text-gray-600 mt-1">Ingresa tus datos para continuar</p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ejemplo@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </Button>
              </form>
            </Form>
            <div className="mt-6 text-center text-sm">
              ¿No tienes una cuenta?{' '}
              <Link href="/register" className="text-teal-600 hover:underline font-medium">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}