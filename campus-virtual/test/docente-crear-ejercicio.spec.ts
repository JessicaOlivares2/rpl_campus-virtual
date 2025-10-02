import { test, expect } from "@playwright/test";

// --- Variables de Prueba ---
const CURSO_NOMBRE = "Bases de Datos";
const UNIDAD_NOMBRE = "unidad 2 prueba";
const EJERCICIO_TITULO = "prueba3 - Ejercicio Nuevo";
const EJERCICIO_CONSIGNA = "ejercicio de prueba";
const TIPO_EJERCICIO = "Lección";

test.beforeEach(async ({ page }) => {
  // Login como Docente
  await page.goto("http://localhost:3000/login");
  await page
    .getByRole("textbox", { name: "Correo Electrónico" })
    .fill("docente@etec.uba.ar");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("docenteuba");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  // Estabilidad del Login
  await page.waitForURL("**/dashboard", { timeout: 20000 });
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
    timeout: 15000,
  });
});

test("El docente puede crear un ejercicio y verificar su existencia", async ({
  page,
}) => {
  // 1. Navegar al curso
  await page.getByRole("link", { name: CURSO_NOMBRE }).first().click();
  await expect(page.getByRole("heading", { name: CURSO_NOMBRE })).toBeVisible();

  // 2. DESPLIEGUE DE LA UNIDAD: Clic en el encabezado para revelar el botón.
  await page.getByRole("heading", { name: UNIDAD_NOMBRE }).click();

  // 3. ACCESO AL FORMULARIO
  const unidadLocator = page
    .getByRole("heading", { name: UNIDAD_NOMBRE })
    .locator("..");

  // CORRECCIÓN FINAL: Usamos getByRole('button') dentro del contenedor de la unidad.
  await unidadLocator
    .getByRole("button", { name: "+Crear Ejercicio" })
    .click({ force: true });

  // 4. LLENAR FORMULARIO
  await expect(
    page.getByRole("heading", { name: /Crear Ejercicio para/i })
  ).toBeVisible();

  await page.getByRole("textbox", { name: "Título" }).fill(EJERCICIO_TITULO);
  await page
    .getByRole("textbox", { name: "Descripción (Opcional)" })
    .fill(EJERCICIO_CONSIGNA);
  await page.getByLabel("Tipo de Ejercicio").selectOption(TIPO_EJERCICIO);

  // 5. CREAR Y PUBLICAR
  await page.getByRole("button", { name: "Crear Ejercicio" }).click();

  // 6. VALIDAR LA CREACIÓN
  await page.waitForURL("**/dashboard/**");

  const unidadActualizadaLocator = page
    .getByRole("heading", { name: UNIDAD_NOMBRE })
    .locator("..");
  await expect(
    unidadActualizadaLocator.getByRole("link", { name: EJERCICIO_TITULO })
  ).toBeVisible();
});
