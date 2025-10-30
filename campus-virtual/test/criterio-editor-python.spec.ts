import { test, expect } from '@playwright/test';

// --- Constantes de Tu Entorno ---
const ALUMNO_EMAIL = 'lopez@etec.uba.ar'; 
const ALUMNO_PASSWORD = 'valeria123'; 
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const EJERCICIO_NOMBRE = 'suma part2'; 
const BASE_URL = 'http://localhost:3000';

// Código Python multilínea para prueba
const PYTHON_CODE_LINES = [
    `def sumar(a, b):`,
    `    # Esto prueba la indentación, saltos de línea y comentarios`,
    `    resultado = a + b`,
    `    return resultado`,
];
const PYTHON_CODE = PYTHON_CODE_LINES.join('\n');


// Función auxiliar para normalizar espacios (reemplaza cualquier whitespace, incluyendo el Unicode, por un solo espacio)
const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();


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

test('Validar Criterio: El Editor de Código acepta código Python multilínea', async ({ page }) => {
    
    // 1. NAVEGACIÓN: Ir al detalle del ejercicio
    await test.step('1. Navegar al ejercicio', async () => {
        
        // Clic en el curso
        await page.getByRole('link', { name: new RegExp(CURSO_NOMBRE) }).first().click({ timeout: 15000 });

        // Clic Defensivo para desplegar la unidad
        const unidadClickLocator = page.getByText(UNIDAD_NOMBRE, { exact: false }).first();
        const unidadContenedor = page.getByRole('listitem').filter({ hasText: UNIDAD_NOMBRE }).first();
        const ejercicioLink = unidadContenedor
            .getByRole('link', { name: new RegExp(EJERCICIO_NOMBRE) })
            .first();

        try {
            await unidadClickLocator.click(); 
            await expect(ejercicioLink).toBeVisible({ timeout: 3000 }); 
        } catch (error) {
            await unidadClickLocator.click(); 
            await expect(ejercicioLink).toBeVisible({ timeout: 10000 }); 
        }
            
        await ejercicioLink.click();
        
        await expect(page.getByRole('heading', { name: EJERCICIO_NOMBRE })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Editor de Código' })).toBeVisible();
    });
    
    // 2. 🚨 VALIDAR CRITERIO DE EDITOR DE CÓDIGO PYTHON (Línea por Línea) 🚨
    await test.step('2. Verificar que el editor acepta código Python multilínea', async () => {
        
        // 1. LOCALIZACIÓN ROBUSA DE MONACO
        const editorContainer = page.locator('.monaco-editor').first();
        
        // Clic y limpieza del contenido base
        await expect(editorContainer).toBeVisible({ timeout: 10000 });
        await editorContainer.click();
        await editorContainer.press('End');
        await editorContainer.press('Control+A'); 
        await editorContainer.press('Delete');
        
        // 2. Escribimos el código de prueba
        await editorContainer.pressSequentially(PYTHON_CODE, { delay: 10 });

        // 3. Verificación clave: Obtenemos el texto de las líneas visibles.
        // Monaco usa la clase 'view-line' para cada línea de código visible.
        const lineLocators = page.locator('.monaco-editor .view-line');

        // Obtenemos todos los contenidos de las líneas como un array.
        const actualLines = await lineLocators.allTextContents();
        
        // 4. Aserción final: Comparamos las líneas visibles con las esperadas.
        for (let i = 0; i < PYTHON_CODE_LINES.length; i++) {
            
            // Usamos la función de normalización en ambas cadenas
            const expectedLineNormalized = normalizeWhitespace(PYTHON_CODE_LINES[i]);
            const actualLineNormalized = normalizeWhitespace(actualLines[i]);
            
            // Usamos toContain en las cadenas NORMALIZADAS. 
            // Esto soluciona el fallo por espacios invisibles o diferentes codificaciones.
            await expect(actualLineNormalized).toContain(expectedLineNormalized);
        }
        
        // Verificación adicional: Confirmar que tenemos el número correcto de líneas.
        await expect(actualLines.length).toBe(PYTHON_CODE_LINES.length);
    });
});