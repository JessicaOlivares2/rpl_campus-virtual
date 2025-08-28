// tests/login-incorrecto.spec.ts
import { test, expect } from "@playwright/test";

test("Debe mostrar errores de validación de formulario", async ({ page }) => {
  await page.goto("http://localhost:3000/login");

  await page
    .getByPlaceholder("ejemplo@etec.uba.ar")
    .fill("usuario-invalido@etec.uba.ar");
  await page
    .getByPlaceholder("Ingresa tu contraseña")
    .fill("contraseña-incorrecta");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  await expect(
    page.locator("form").getByText("Credenciales inválidas").first()
  ).toBeVisible();

  await page.getByPlaceholder("ejemplo@etec.uba.ar").fill("");
  await page.getByPlaceholder("Ingresa tu contraseña").fill("");

  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  await expect(page.getByText("Ingrese un email válido")).toBeVisible();
  await expect(page.getByText("La contraseña es requerida")).toBeVisible();
});
