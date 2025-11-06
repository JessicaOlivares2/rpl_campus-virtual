import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("lopez@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("valeria123");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  await page.waitForURL("**/dashboard"); // Espera que la URL termine en /dashboard
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
    timeout: 10000,
  });
});

test("Los materiales estan categorizados depediendo el tipo de archivo(pdf,links)", async ({
  page,
}) => {
  // 1. Navegación al curso
  await page
    .getByRole("link", { name: "Introducción a la Programación" })
    .click();

  // 2. Espera de la URL codificada o el título (¡Más robusto!)
  // Usar la URL codificada es más seguro. El '**/dashboard/**' ignora la base.
  await page.waitForURL(
    "**/dashboard/**/introducci%C3%B3n-a-la-programaci%C3%B3n"
  );

  // Confirmar que el contenido de la página cargó
  await expect(
    page.getByRole("heading", { name: "Introducción a la Programación" })
  ).toBeVisible();

  // 3. Navegación a Materiales
await page.getByRole("link", { name: "Ver Materiales" }).click();
  // 4. Esperar que la URL de materiales cargue (si es una ruta distinta)
  await page.waitForURL("**/materiales");

  // 5. Assertions de Contenido
  await expect(
    page.getByRole("heading", { name: "Materiales del Curso" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Unidad 1: Conceptos Básicos" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Archivos PDF" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Enlaces y Videos" })
  ).toBeVisible();

  // Asegúrate de que el localizador sea preciso si el texto se repite
  await expect(
    page.getByRole("link", { name: "Guía de Sintaxis Básica" })
  ).toBeVisible();

  // Nota: Usa getByRole('link') si es un enlace o el selector más preciso.
  await expect(page.getByText("Video: Tu primer programa")).toBeVisible();
  await expect(page.getByText("Referencia en línea: Datos")).toBeVisible();
});
