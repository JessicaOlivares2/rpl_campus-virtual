// tests/login-incorrecto.spec.ts
import { test, expect } from "@playwright/test";

test("Debe mostrar errores de validación de formulario", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  // 1. Probar la validación de credenciales incorrectas
  await page
    .getByPlaceholder("ejemplo@etec.uba.ar")
    .fill("usuario-invalido@etec.uba.ar");
  await page
    .getByPlaceholder("Ingresa tu contraseña")
    .fill("contraseña-incorrecta");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Verificar que el mensaje de error de credenciales incorrectas aparezca
  // Selecciona el mensaje de error del campo de email.
  await expect(
    page.locator("form").getByText("Credenciales inválidas").first()
  ).toBeVisible();

  // 2. Probar la validación de campos vacíos
  await page.getByPlaceholder("ejemplo@etec.uba.ar").fill("");
  await page.getByPlaceholder("Ingresa tu contraseña").fill("");

  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Verificar que los mensajes de error de los campos aparezcan
  await expect(page.getByText("Ingrese un email válido")).toBeVisible();
  await expect(page.getByText("La contraseña es requerida")).toBeVisible();
});
