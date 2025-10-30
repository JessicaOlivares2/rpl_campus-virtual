import { test, expect } from '@playwright/test';
import * as path from 'path'; 

// --- Datos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const COURSE_SLUG = 'bases-de-datos';
const COMISION = '3B';
const BASE_URL = 'http://localhost:3000';
const TIMESTAMP = new Date().getTime(); 
const UNIDAD_TITULO_COMPLEX = `Unidad-CON-EJ-${TIMESTAMP}`; 
const EJERCICIO_TITULO = `Ej-Bloqueo-${TIMESTAMP}`; 
const TIPO_EJERCICIO = 'Lección';

const TEST_FILE_PATH = '/home/etec/Descargas/test_suma_simple.py'; 
//const TEST_FILE_PATH = 'C:\\Users\\User\\Downloads\\test_suma_simple.py'; 


test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('docente@etec.uba.ar');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('docenteuba');
    
    await Promise.all([
        page.waitForURL("**/dashboard", { timeout: 15000 }),
        page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
    ]);

    await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible();
});

test('Debe impedir la eliminación de una unidad que tiene ejercicios asociados', async ({ page }) => {
    
    await test.step('PREREQUISITO: Crear Unidad y añadir un ejercicio', async () => {
        
        await page.getByRole('link', { name: `${CURSO_NOMBRE} Comisión: ${COMISION}` }).first().click();
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

        await page.getByRole('link', { name: '+ Crear Unidad' }).click();
        await page.getByRole('textbox', { name: 'Título' }).fill(UNIDAD_TITULO_COMPLEX);
        await page.getByRole('button', { name: 'Crear Unidad' }).click();
        await page.waitForTimeout(2000); 
        await page.goto(`${BASE_URL}/dashboard/3/${COURSE_SLUG}`); // Forzar recarga

        const unidadTitulo = page.getByText(UNIDAD_TITULO_COMPLEX).first();
        await unidadTitulo.click(); 
        
        const crearEjercicioLocator = page.getByText('+ Crear Ejercicio').first();
        
        await crearEjercicioLocator.click(); 
        
        await expect(page.getByRole('heading', { name: /Crear Ejercicio para/i })).toBeVisible();
        await page.getByRole('textbox', { name: 'Título' }).fill(EJERCICIO_TITULO);
        
        await page.locator('input[type="file"]').setInputFiles(TEST_FILE_PATH);
        await page.getByLabel('Tipo de Ejercicio').selectOption(TIPO_EJERCICIO);
        await page.getByRole('button', { name: 'Crear Ejercicio' }).click();
        
        await page.waitForTimeout(2000); 
        await page.goto(`${BASE_URL}/dashboard/3/${COURSE_SLUG}`);
        await page.getByText(UNIDAD_TITULO_COMPLEX).first().click(); 
        await expect(page.getByRole('link', { name: EJERCICIO_TITULO })).toBeVisible({ timeout: 10000 });
    });

    await test.step('Intentar eliminar la unidad y confirmar el bloqueo', async () => {
        
        await page.getByText(UNIDAD_TITULO_COMPLEX).first().click();
        
        const eliminarButtonName = `Eliminar Unidad: ${UNIDAD_TITULO_COMPLEX}`;
        const eliminarButton = page.getByRole('button', { name: eliminarButtonName });
        await eliminarButton.click();
        
        const modalHeading = page.getByRole('heading', { name: 'Confirmar Eliminación de Unidad' });
        await expect(modalHeading).toBeVisible({ timeout: 5000 });
        
        const confirmarButton = page.getByRole('button', { name: 'Sí, Eliminar Unidad' });
        await confirmarButton.click();
        
  
        const errorMessage = 'No se puede eliminar la unidad, tiene ejercicios asociados. Elimina todos los ejercicios primero.';
        const errorLocator = page.getByText(errorMessage);
        
        await expect(errorLocator).toBeVisible({ timeout: 10000 });
    });

    await test.step('Verificar que la unidad NO desapareció', async () => {
        
        const unidadLink = page.getByText(UNIDAD_TITULO_COMPLEX).first();
        await expect(unidadLink).toBeVisible();
    });
});