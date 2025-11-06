import { test, expect } from "@playwright/test";

const nombreMateria = "Algoritmos y Estructuras";

test.beforeEach(async ({ page }) => {
  // Login como Docente
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("docente@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("docenteuba");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // CORRECCIÓN ESTABILIDAD: Damos más tiempo al login
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
    timeout: 15000,
  });
});

// Implementación de la limpieza (test.afterEach)
test.afterEach(async ({ page }) => {
  // 1. Ir al Dashboard
  await page.goto("http://localhost:3000/dashboard");

  // 2. Localizar la tarjeta del último curso creado
  const cursoCreadoLink = page
    .getByRole("link", { name: nombreMateria })
    .last();

  if (await cursoCreadoLink.isVisible()) {
    const cursoCardLocator = cursoCreadoLink.locator("..");

    // 3. Clic en el botón "Eliminar" de la tarjeta
    await cursoCardLocator.getByRole("button", { name: "Eliminar" }).click();

    // 4. CORRECCIÓN CLAVE: Clic en el botón de confirmación del modal.
    // Usamos .last() para seleccionar el botón del modal y evitar el strict mode violation.
    await page.getByRole("button", { name: "Eliminar" }).last().click();

    // 5. Aserción de limpieza
    await expect(cursoCreadoLink).not.toBeVisible();
  }
});

test("El docente puede crear un curso con campos obligatorios y verlo en su lista", async ({
  page,
}) => {
  const comision = "3B";
  const generacion = "2025";
  const descripcion = "Test de validación de campos obligatorios.";

  // Creación del Curso
  await page.getByRole("link", { name: "+ Crear Nuevo Curso" }).click();
  await page.getByLabel("Nombre de la Materia").selectOption(nombreMateria);
  await page.getByLabel("Comisión").selectOption(comision);
  await page.getByLabel("Generación").selectOption(generacion);
  await page
    .getByRole("textbox", { name: "Descripción del Curso" })
    .fill(descripcion);
  await page.getByRole("button", { name: "Crear Curso" }).click();

  // Validación de la Creación
  await page.waitForURL("**/dashboard");
  const nuevoCursoLink = page.getByRole("link", { name: nombreMateria }).last();
  await expect(nuevoCursoLink).toBeVisible();

  // Validación de contenido
  await nuevoCursoLink.click();
  await expect(
    page.getByRole("heading", { name: nombreMateria }).first()
  ).toBeVisible();
  await expect(page.getByText(descripcion)).toBeVisible();
});
