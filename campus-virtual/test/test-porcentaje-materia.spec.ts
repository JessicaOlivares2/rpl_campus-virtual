import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("lopez@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("valeria123");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await page.waitForURL("http://localhost:3000/dashboard");
});

test("La materia muestra el porcentaje de ejercicios completados", async ({
  page,
}) => {
  const introCourseCard = page.getByRole("link", {
    name: "Introducción a la Programación",
  });
  await expect(introCourseCard.getByText("0% completado")).toBeVisible();
});
