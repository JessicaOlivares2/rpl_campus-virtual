import { test, expect } from '@playwright/test';

// --- Datos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba'; 
const EJERCICIO_CONSIGNA = 'ejercicio de prueba';
const TIPO_EJERCICIO = 'Lección'; 
const CURSO_LINK_NAME = `${CURSO_NOMBRE} Comisión: 3B`; 


test.beforeEach(async ({ page }) => {
  // Login como Docente
  await page.goto('http://localhost:3000/login');
  await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('docente@etec.uba.ar');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('docenteuba');
  await page.getByRole('button', { name: 'Iniciar Sesión' }).click();

  // Estabilidad del Login
  await page.waitForURL("**/dashboard", { timeout: 20000 }); 
  await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible({
      timeout: 15000, 
  });
});

test('Debe mostrar feedback de error al intentar crear sin Título', async ({ page }) => {
  // 1. Navegar al formulario de creación
  const cursoLinkLocator = page.getByRole('link', { name: CURSO_LINK_NAME }).first();
  await expect(cursoLinkLocator).toBeVisible({ timeout: 10000 }); 
  await cursoLinkLocator.click(); 
  
  // Despliegue unidad y clic en +Crear Ejercicio
  // CORRECCIÓN: Usamos getByText tolerante para clickear la unidad.
  await page.getByText(UNIDAD_NOMBRE, { exact: false }).first().click(); 
  
  const crearEjercicioLink = page.getByRole('link', { name: '+ Crear Ejercicio' });
  await expect(crearEjercicioLink).toBeVisible();
  await crearEjercicioLink.click();
  
  // 2. Localizar campos
  const tituloInput = page.getByRole('textbox', { name: 'Título' });
  const descripcionInput = page.getByRole('textbox', { name: 'Descripción (Opcional)' });
  const crearButton = page.getByRole('button', { name: 'Crear Ejercicio' });
  
  // Localizador para verificar la permanencia en la página
  const paginaCrearEjercicioHeader = page.getByRole('heading', { name: `Crear Ejercicio para "${UNIDAD_NOMBRE}"` });
  await expect(paginaCrearEjercicioHeader).toBeVisible();
  
  // 3. Llenar consigna y tipo, pero sin titulo
  await tituloInput.fill(''); 
  await descripcionInput.fill(EJERCICIO_CONSIGNA);
  await page.getByLabel('Tipo de Ejercicio').selectOption(TIPO_EJERCICIO);

  // 4. Hacemos clic. La validación nativa debe bloquear el envío y la navegación.
  await crearButton.click();
  
  // 5. se fija que el encabezado de la página de creación siga siendo visible.
  // Esto confirma que la validación de 'Rellena este campo' bloqueó el formulario.
  await expect(paginaCrearEjercicioHeader).toBeVisible({ timeout: 5000 }); 
  
  // Aparte, confirmamos que NO se creó el ejercicio (verificando que NO se redirigió al dashboard)
  const dashboardHeader = page.getByRole("heading", { name: "Guías de Ejercicios" });
  await expect(dashboardHeader).not.toBeVisible({ timeout: 5000 });
});