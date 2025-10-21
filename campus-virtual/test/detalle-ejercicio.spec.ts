// test/detalle-ejercicio.spec.ts

import { test, expect } from '@playwright/test';

// --- Datos de Prueba ---
const ALUMNO_EMAIL = 'lopez@etec.uba.ar'; 
const ALUMNO_PASSWORD = 'valeria123'; 
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const EJERCICIO_NOMBRE = 'suma part2'; 
const BASE_URL = 'http://localhost:3000';
const SOLUCION_CORRECTA = 'def sumar(a, b):\n    return a + b'; 

test.beforeEach(async ({ page }) => {
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
    
    await test.step('Acceder a la página de detalle del ejercicio', async () => {
        
        await page.getByRole('link', { name: `${CURSO_NOMBRE} curso de` }).first().click();
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

        const unidadClickLocator = page.getByText(UNIDAD_NOMBRE).first();
        
        //  Intentar el despliegue de forma robusta.
        await unidadClickLocator.click(); // Primer intento de click
        
        await page.waitForTimeout(500); 

        // Localizar el contenedor de la unidad usando el elemento padre 'listitem'.
        const unidadContenedor = page.getByRole('listitem').filter({ hasText: UNIDAD_NOMBRE }).first();
        
        // Localizar el enlace del ejercicio DENTRO DEL CONTENEDOR (Regex para ignorar el emoji)
        const ejercicioLink = unidadContenedor.getByRole('link', { name: new RegExp(EJERCICIO_NOMBRE) }); 

        // 5. Verificar si el enlace es visible. Si falla, el catch ejecuta un SEGUNDO click.
        try {
            await expect(ejercicioLink).toBeVisible({ timeout: 500 }); 
        } catch (error) {
            console.log("El ejercicio no apareció inmediatamente. Re-clickeando la unidad.");
            await unidadClickLocator.click(); // Segundo click de seguridad para forzar el despliegue
            // Después del re-click, la aserción de visibilidad se hará en el siguiente paso.
        }
        
        await expect(ejercicioLink).toBeVisible({ timeout: 10000 }); 
        
        await ejercicioLink.click();
        
        // Esperar la carga de la página de detalle
        const ejercicioTituloLocator = page.getByRole('heading', { name: EJERCICIO_NOMBRE });
        const editorCodigoLocator = page.getByRole('heading', { name: 'Editor de Código' });

        await expect(ejercicioTituloLocator).toBeVisible({ timeout: 10000 });
        await expect(editorCodigoLocator).toBeVisible({ timeout: 10000 });
    });

    //  Verificar la interfaz 
    await test.step('Verificar elementos obligatorios de la interfaz', async () => {
        
        await expect(page.getByRole('heading', { name: 'Enunciado' })).toBeVisible();
        
        const codeEditor = page.getByRole('textbox', { name: /escribe tu codigo/i });
        await expect(codeEditor).toBeVisible();

        const enviarButton = page.getByRole('button', { name: 'Enviar Respuesta y Obtener' });
        await expect(enviarButton).toBeVisible();
    });

    //  Resolver y Enviar 
    await test.step('Escribir la solución y enviar', async () => {
        
        const codeEditor = page.getByRole('textbox', { name: /escribe tu codigo/i });
        
        await codeEditor.fill(SOLUCION_CORRECTA);
        
        const enviarButton = page.getByRole('button', { name: 'Enviar Respuesta y Obtener' });
        await enviarButton.click();
        
        await page.waitForTimeout(3000); 
    });
    
    // Observar el Progreso y Feedback
    await test.step('Verificar el feedback de éxito y el historial', async () => {
        
        const feedbackMessage = page.getByText(/¡Prueba Superada!/i);
        await expect(feedbackMessage).toBeVisible({ timeout: 10000 });
        
        await expect(page.getByRole('heading', { name: 'Historial de Entregas' })).toBeVisible();
        
        const ultimaEntrega = page.getByText('PASÓ').first();
        await expect(ultimaEntrega).toBeVisible();
    });
});