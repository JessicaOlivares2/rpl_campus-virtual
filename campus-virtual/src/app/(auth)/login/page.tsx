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
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-100 via-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="text-2xl font-semibold text-gray-800">rpl.etec</div>
          <nav className="space-x-6">
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-lg shadow-xl border border-gray-100">
          {/* Logo / Icon */}
          <div className="flex justify-center mb-6">
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
              className="lucide lucide-folder-open-dot text-blue-600"
            >
              <path d="M19 20a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-4h5a2 2 0 0 1 2 2v13z" />
              <circle cx="12" cy="13" r="1" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold text-gray-800 text-center">
            Iniciar Sesión
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Bienvenido de nuevo, ingresa a tu cuenta
          </p>

          {/* Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-6"
            >
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="ejemplo@etec.uba.ar"
                        {...field}
                        className="border-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
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
                        className="border-2 border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </Form>

          {/* Forgot Password */}
          <div className="mt-4 text-sm text-center">
            <a
              href="#"
              className="text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-sm text-center">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
