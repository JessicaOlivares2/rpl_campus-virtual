import { test, expect } from '@playwright/test';

import * as path from 'path'; 

// --- Datos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const COURSE_SLUG = 'bases-de-datos'; 
const TIMESTAMP = new Date().getTime();
const EJERCICIO_TITULO = `prueba-${TIMESTAMP}-Ej Nuevo`;
const EJERCICIO_CONSIGNA = 'ejercicio de prueba';
const TIPO_EJERCICIO = 'Lección';


// Usamos el archivo 'test_suma_simple.py' 
///MODIFICAR ESTE PARRAFO DE CODIGO SIEMPRE (o hasta q lo mueva a una carperta pero meh)
//const TEST_FILE_PATH = '/home/etec/Descargas/test_suma_simple.py'; 

const TEST_FILE_PATH = 'C:\\Users\\User\\Downloads\\test_suma_simple.py'; 



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
    
    // --- PASO 1: Navegar al formulario ---
    const cursoLinkLocator = page.getByRole('link', { name: CURSO_NOMBRE }).first();
    await Promise.all([
        page.waitForURL(`**/${COURSE_SLUG}`),
        cursoLinkLocator.click(),
    ]);
    await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

    // Localizadores
    const unidadHeading = page.getByText(UNIDAD_NOMBRE).first(); 
    const crearEjercicioLink = page.getByRole('link', { name: '+ Crear Ejercicio' });

    // despliegue unidad
    await unidadHeading.click();
    await expect(crearEjercicioLink).toBeVisible({ timeout: 10000 });
    await crearEjercicioLink.click();

    // formulario
    await expect(page.getByRole('heading', { name: /Crear Ejercicio para/i })).toBeVisible();
    await page.getByRole('textbox', { name: 'Título' }).fill(EJERCICIO_TITULO);
    await page.getByRole('textbox', { name: 'Descripción (Opcional)' }).fill(EJERCICIO_CONSIGNA);
    
    await page.locator('input[type="file"]').setInputFiles(TEST_FILE_PATH);
    
    await page.getByLabel('Tipo de Ejercicio').selectOption(TIPO_EJERCICIO);

    // --- PASO 2: Crear el ejercicio y forzar navegación (WORKAROUND) ---
    const crearButton = page.getByRole('button', { name: 'Crear Ejercicio' });
    
    // Clic sin esperar redirección, ya que el servidor falla en eso.
    await crearButton.click();
    
    // Esperamos 2 segundos para dar tiempo a la solicitud POST de terminar.
    await page.waitForTimeout(2000); 
    
    // Forzamos la navegación de vuelta a la página del curso.
    await page.goto(`http://localhost:3000/dashboard/3/${COURSE_SLUG}`);
    await expect(page.getByRole('heading', { name: 'Guías de Ejercicios' })).toBeVisible({ timeout: 10000 });

    // --- PASO 3: Verificación ---
    // Re-despliegue unidad 
    await unidadHeading.click();

    // Busqueda y Aserción Final
    const ejercicioLink = page.getByRole('link', { name: EJERCICIO_TITULO });

    // Aserción estricta
    await expect(ejercicioLink).toBeAttached({ timeout: 15000 });
    await expect(ejercicioLink).toBeVisible();
});