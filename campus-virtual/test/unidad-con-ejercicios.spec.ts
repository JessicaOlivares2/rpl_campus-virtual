import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("lopez@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("valeria123");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  await page.waitForURL("http://localhost:3000/dashboard");
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
    timeout: 10000,
  });
  //aca navega hacia la materia que seleccionamos
  await page
    .getByRole("link", { name: "Introducción a la Programación" })
    .click();
  await page.waitForURL((url) =>
    url.pathname.includes("introducci%C3%B3n-a-la-programaci%C3%B3n")
  );
});

const UNIDAD_TARGET = "Unidad 1: Conceptos Básicos";

test("La sección de Unidades con ejercicios asociados es visible", async ({
  page,
}) => {
  await expect(page.getByText("Introducción a la Programación")).toBeVisible();
   await expect(page.getByText("Guías de Ejercicios")).toBeVisible();
 const unidadHeading = page.getByText(UNIDAD_TARGET).first();
   await expect(unidadHeading).toBeVisible();
   await unidadHeading.click();;
   //tiene que aparecer los ejercicios
   await expect(page.getByText("Hola Mundo con Python")).toBeVisible();
   await expect(page.getByText("Variables y Tipos de Datos")).toBeVisible();
});
