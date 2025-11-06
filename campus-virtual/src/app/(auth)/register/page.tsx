"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CalendarClock } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerUser } from "@/lib/actions";

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
    lastName: z
      .string()
      .min(2, { message: "El apellido debe tener al menos 2 caracteres" }),
    email: z.string().email({ message: "Ingrese un email válido" }),
    DNI: z.string().regex(/^\d{7,8}$/, {
      message: "El DNI debe tener 7 u 8 dígitos sin puntos ni espacios",
    }),
    birthDate: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, {
      message: "Formato de fecha inválido (dd/mm/aaaa)",
    }),
    commissionCode: z
      .string()
      .min(1, { message: "El código de comisión es requerido" }),
    password: z
      .string()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      lastName: "",
      email: "",
      DNI: "",
      birthDate: "",
      commissionCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true);
    try {
      await registerUser({
        name: values.name,
        lastName: values.lastName,
        email: values.email,
        DNI: values.DNI,
        birthDate: values.birthDate,
        commissionCode: values.commissionCode,
        password: values.password,
        confirmPassword: ""
      });
    } catch (error) {
      if (error && (error as Error).message.includes("NEXT_REDIRECT")) {
        // Ignorar el error de redirección
      } else {
        toast.error("Error al registrarse", {
          description:
            error instanceof Error
              ? error.message
              : "Ocurrió un error inesperado. Intenta nuevamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 via-blue-100 to-white">
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
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

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl bg-white p-8 rounded-xl shadow-xl border border-gray-200">
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

          <h1 className="text-3xl font-semibold text-gray-800 text-center">
            Crear una Cuenta
          </h1>
          <p className="text-gray-600 text-center mt-2">
            Únete a nuestra plataforma educativa
          </p>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 mt-6"
            >
              {/* Nombre y Apellido */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Ingresa tu apellido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Correo Electrónico */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
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

              {/* DNI y Fecha de Nacimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="DNI"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DNI</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Sin puntos ni espacios"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
                      <FormControl>
                        <Input placeholder="dd/mm/aaaa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Código de Comisión */}
              <FormField
                control={form.control}
                name="commissionCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código de Comisión</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="El docente debe darte este código"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Contraseñas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Crea una contraseña segura"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Repite tu contraseña"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Botón de Envío */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 rounded-md"
                disabled={isLoading}
              >
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-sm text-center">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
