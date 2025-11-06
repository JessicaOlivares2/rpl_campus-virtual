"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginUser } from "@/lib/actions";

const loginSchema = z.object({
  email: z.string().email({ message: "Ingrese un email válido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true);
    try {
      await loginUser({
        email: values.email,
        password: values.password,
      });
    } catch (error) {
      if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
        // La redirección es exitosa. No hacemos nada.
      } else {
        // Si hay un error real (credenciales incorrectas),
        // lo mostramos en los campos del formulario.
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.";

        // Marcar ambos campos, email y contraseña, con el mismo error.
        form.setError("email", {
          type: "server",
          message: errorMessage,
        });
        form.setError("password", {
          type: "server",
          message: errorMessage,
        });

        // Opcional: también puedes usar un toast para un mensaje de error global
        toast.error("Error de autenticación", {
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-xl font-bold text-gray-800">rpl.etec</div>
          <nav className="space-x-4 flex items-center">
            <Link
              href="/login"
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-gray-600 font-medium hover:text-gray-800"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <div className="flex justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-folder-open-dot"
              >
                <path d="M19 20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-4h5a2 2 0 0 1 2 2v13z" />
                <circle cx="12" cy="13" r="1" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-1">
              Bienvenido a la plataforma educativa
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-6"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="sr-only">
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ejemplo@etec.uba.ar"
                          {...field}
                        />
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
                      <FormLabel className="sr-only">Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Ingresa tu contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-700 text-white font-bold"
                  disabled={isLoading}
                >
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>
            </Form>

            <div className="mt-4 text-sm text-center">
              <a href="#" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <div className="mt-6 text-sm">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
