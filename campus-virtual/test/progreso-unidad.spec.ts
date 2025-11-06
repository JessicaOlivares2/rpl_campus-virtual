import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("lopez@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("valeria123");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Espera una URL más genérica, pero espera el HEADING para asegurar la carga
  await page.waitForURL("**/dashboard");
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
    timeout: 10000,
  });

  // ✅ CORRECCIÓN 1: Usar el nombre COMPLETO del enlace del curso para mayor precisión.
  await page
    .getByRole("link", { name: "Introducción a la Programación" })
    .click();

  // ✅ CORRECCIÓN 2: Usar la URL codificada, ya que es la URL real.
  await page.waitForURL(
    "**/dashboard/**/introducci%C3%B3n-a-la-programaci%C3%B3n"
  );

  // ✅ Validación extra: Asegura que el título del curso sea visible después de la navegación.
  await expect(
    page.getByRole("heading", { name: "Introducción a la Programación" })
  ).toBeVisible();
});

const UNIDAD_TARGET = "Unidad 1: Conceptos Básicos"; 
test("Se puede ver el progreso de la unidad", async ({ page }) => {
  // Ya estamos en la página del curso (CourseDetailPage)

 // 1. Localizar el encabezado/elemento principal de la unidad
  // Esto será nuestro localizador para desplegar.
  const unidadHeading = page.getByRole("heading", { name: UNIDAD_TARGET }).first();

  // Assertions de la estructura principal
  await expect(
    page.getByRole("heading", { name: "Guías de Ejercicios" })
  ).toBeVisible();
  await expect(unidadHeading).toBeVisible();

  // Assertions del progreso (asumiendo que está visible en el mismo elemento o cerca)
  await expect(page.getByText("Progreso: 0%")).toBeVisible();

 await unidadHeading.click();

  // 3. Verificar la visibilidad del botón '▲' (si aplica)
  // Si el ícono cambia a '▲', verifícalo. Si no, omite esta línea.
  // await expect(page.getByRole("button", { name: "▲" })).toBeVisible();

  // 4. Verificar que los ejercicios están visibles
  // Usar 'link' o 'text' según corresponda, y usar el texto completo.
  await expect(
    page.getByRole("link", { name: "Hola Mundo con Python" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Variables y Tipos de Datos" })
  ).toBeVisible();
});
