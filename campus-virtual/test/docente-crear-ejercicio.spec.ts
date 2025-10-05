import { test, expect } from '@playwright/test';

// --- datsos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba'; 
const TIMESTAMP = new Date().getTime(); 
const EJERCICIO_TITULO = `prueba-${TIMESTAMP}-Ej Nuevo`; 
const EJERCICIO_CONSIGNA = 'ejercicio de prueba';
const TIPO_EJERCICIO = 'Lección'; 

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

test('El docente puede crear un ejercicio y verificar su existencia', async ({ page }) => {
  // ir al curso
  const cursoLinkLocator = page.getByRole('link', { name: CURSO_NOMBRE }).first();
  await cursoLinkLocator.click(); 
  await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

  // Localizadores
  const unidadHeading = page.getByRole('heading', { name: UNIDAD_NOMBRE });
  const unidadContenedor = page.locator('div', { has: unidadHeading });
  const crearEjercicioButton = unidadContenedor.getByText(/Crear Ejercicio/i).first();

  // despliegue unidad 
  await unidadHeading.click();
  await expect(crearEjercicioButton).toBeVisible({ timeout: 10000 });
  await crearEjercicioButton.click();
  
  //formulario
  await expect(page.getByRole('heading', { name: /Crear Ejercicio para/i })).toBeVisible();
  await page.getByRole('textbox', { name: 'Título' }).fill(EJERCICIO_TITULO);
  await page.getByRole('textbox', { name: 'Descripción (Opcional)' }).fill(EJERCICIO_CONSIGNA);
  await page.getByLabel('Tipo de Ejercicio').selectOption(TIPO_EJERCICIO);
  
  // crear y publicar el ejercicio
  const crearButton = page.getByRole('button', { name: 'Crear Ejercicio' });
 
  await Promise.all([
     
      page.waitForURL('**/bases-de-datos', { timeout: 20000 }), 
      crearButton.click(),
  ]);
  

  await unidadHeading.click(); 
  
  // esperamos que el ejercicio sew cargue
  await expect(crearEjercicioButton).toBeVisible({ timeout: 10000 }); 

  // Busqueda y Aserción Final
  const ejercicioLink = page.getByRole('link', { name: EJERCICIO_TITULO });
  
  // Aserción estricta
  await expect(ejercicioLink).toBeAttached({ timeout: 15000 }); 
  await expect(ejercicioLink).toBeVisible();
});