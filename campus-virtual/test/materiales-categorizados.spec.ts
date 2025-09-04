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
});

test("Los materiales estan categorizados depediendo el tipo de archivo(pdf,links)", async ({
  page,
}) => {
  await page
    .getByRole("link", { name: "I Introducción a la Programación" })
    .click();

  await page.waitForURL((url) =>
    url.pathname.includes("introducci%C3%B3n-a-la-programaci%C3%B3n")
  );

  await expect(page.getByText("Introducción a la Programación")).toBeVisible();
  await page.getByRole("button", { name: "Ver Materiales" }).click();
  await expect(page.getByText("Materiales del Curso")).toBeVisible();
  await expect(page.getByText("Unidad 1: Conceptos Básicos")).toBeVisible();
  await expect(page.getByText("Archivos PDF")).toBeVisible();
  await expect(page.getByText("Enlaces y Videos")).toBeVisible();
  await expect(page.getByText("Guía de Sintaxis Básica")).toBeVisible();
  await expect(page.getByText("Video: Tu primer programa")).toBeVisible();
  await expect(page.getByText("Referencia en línea: Datos")).toBeVisible();
});
