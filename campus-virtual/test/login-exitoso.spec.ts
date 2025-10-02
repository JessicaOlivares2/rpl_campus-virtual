// tests/login-exitoso.spec.ts

import { test, expect } from "@playwright/test";

test("login exitoso y redirección a la página de mis cursos", async ({
  page,
}) => {
  // 1. Navegar a la página de login
  await page.goto("http://localhost:3000/login");

  // 2. Llenar el formulario de login con credenciales válidas
  await page.getByPlaceholder("ejemplo@etec.uba.ar").fill("lopez@etec.uba.ar");
  await page.getByPlaceholder("Ingresa tu contraseña").fill("valeria123");

  // 3. Hacer clic en el botón de iniciar sesión
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // 4. Esperar a la redirección a la página de "Mis Cursos"
  await page.waitForURL("http://localhost:3000/dashboard");

  // 5. Verificar que el título principal de la página "Mis Cursos" esté visible
  //    Usar getByRole('heading') para evitar la ambigüedad.
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible();

  // 6. Verificar el subtítulo para confirmar la correcta carga de la página
  await expect(
    page.getByText("Bienvenido a tu espacio de aprendizaje")
  ).toBeVisible();
});