// test/detalle-ejercicio.spec.ts

import { test, expect } from '@playwright/test';

// --- Datos de Prueba ---
const ALUMNO_EMAIL = 'lopez@etec.uba.ar'; 
const ALUMNO_PASSWORD = 'valeria123'; 
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const EJERCICIO_NOMBRE = 'suma part2'; 
const BASE_URL = 'http://localhost:3000';
// Solución que se enviará al editor
const SOLUCION_CORRECTA = 'def sumar(a, b):\n    return a + b'; 

test.beforeEach(async ({ page }) => {
    // Login estándar
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(ALUMNO_EMAIL);
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(ALUMNO_PASSWORD);
    
    await Promise.all([
        page.waitForURL("**/dashboard", { timeout: 15000 }),
        page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
    ]);

    await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible();
});

test('El alumno puede resolver un ejercicio, enviarlo y ver el feedback exitoso', async ({ page }) => {
    
    await test.step('1. Acceder a la página de detalle del ejercicio', async () => {
        
        // 1. Clic en el curso 
        const cursoLink = page.getByRole('link', { name: new RegExp(CURSO_NOMBRE) }).first();
        await cursoLink.click({ timeout: 15000 });

        // Verificar que estamos en la página del curso
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

        // 2. Localizar la unidad y su contenedor
        const unidadClickLocator = page.getByText(UNIDAD_NOMBRE, { exact: false }).first();
        const unidadContenedor = page.getByRole('listitem').filter({ hasText: UNIDAD_NOMBRE }).first();

        // 3. Intentar desplegar forzadamente
        await unidadClickLocator.click();
        await page.waitForTimeout(500); 

        // 4. Buscar el enlace (usando RegExp para mayor tolerancia)
        const ejercicioLink = unidadContenedor.getByRole('link', { name: new RegExp(EJERCICIO_NOMBRE) }).first();
        
        // 5. Verificar visibilidad con lógica de re-clic para asegurar el despliegue
        try {
            await expect(ejercicioLink).toBeVisible({ timeout: 2000 });
        } catch (e) {
            console.log("⚠️ Enlace no visible. Re-clickeando la unidad...");
            await unidadClickLocator.click(); // Re-clic forzado
            await expect(ejercicioLink).toBeVisible({ timeout: 5000 });
        }

        // 6. Clic en el ejercicio
        await ejercicioLink.click();
        
        // Verificación final de la página de detalle
        await expect(page.getByRole('heading', { name: EJERCICIO_NOMBRE })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Editor de Código' })).toBeVisible();
    });

    await test.step('2. Escribir la solución y enviar el código', async () => {
        
        // INTERACCIÓN CON MONACO EDITOR 
        const monacoEditorContainer = page.locator('.monaco-editor').first();
        await expect(monacoEditorContainer).toBeVisible();

        // 1. Clic para enfocar el editor
        await monacoEditorContainer.click();
        
        // 2. Escribir la solución
        await page.waitForTimeout(1000); 
        await monacoEditorContainer.pressSequentially(SOLUCION_CORRECTA, { delay: 10 }); 
        
        // 3. Clic en el botón de envío (Nombre actualizado a 'Enviar Código')
        const enviarButton = page.getByRole('button', { name: 'Enviar Código' }); 
        await expect(enviarButton).toBeVisible();
        
        // Forzamos el click 
        await enviarButton.click({ force: true });
        
        // Espera un tiempo prudente para la respuesta del servidor
        await page.waitForTimeout(4000); 
    });
    
    await test.step('3. Verificar el feedback de éxito y el historial', async () => {
        
        // 🚨 CORRECCIÓN: Buscamos solo el mensaje principal '¡Prueba Superada!' para evitar el strict mode violation.
        const successMessage = page.getByText(/¡Prueba Superada!/i).first();
        await expect(successMessage).toBeVisible({ timeout: 10000 });
        
        // Verificamos que se actualizó el historial
        await expect(page.getByRole('heading', { name: /Historial de Entregas/ })).toBeVisible();
        
        // Verificamos que la última entrega sea un "PASÓ"
        const ultimaEntregaExitosa = page.getByText('PASÓ').first();
        await expect(ultimaEntregaExitosa).toBeVisible();
    });
});