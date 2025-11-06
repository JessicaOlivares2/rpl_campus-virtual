import { test, expect } from '@playwright/test';

// --- Constantes de Tu Entorno ---
const ALUMNO_EMAIL = 'lopez@etec.uba.ar'; 
const ALUMNO_PASSWORD = 'valeria123'; 
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const EJERCICIO_NOMBRE = 'suma part2'; 
const BASE_URL = 'http://localhost:3000';

// Código Python Simple que produce un Output conocido
const PYTHON_CODE_SOLUTION = `def sumar(a, b):
    # Solución correcta
    return a + b
print(sumar(5, 3)) # Imprime 8 para verificar el output en la consola de ejecución
`;
// El output que esperamos ver en el contenedor de resultados.
// NOTA: Para el texto "¡Prueba Superada!", el output no es "8" directamente,
// sino el mensaje de éxito de la plataforma.
const EXPECTED_SUCCESS_MESSAGE = '¡Prueba Superada!'; 


// Función auxiliar para normalizar espacios
const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();


test.beforeEach(async ({ page }) => {
    // ... (Login estándar)
    await page.goto(`${BASE_URL}/login`);
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(ALUMNO_EMAIL);
    await page.getByRole('textbox', { name: 'Contraseña' }).fill(ALUMNO_PASSWORD);
    
    await Promise.all([
        page.waitForURL("**/dashboard", { timeout: 15000 }),
        page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
    ]);

    await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible();
});

test('Validar Criterio: Ejecución de Código del Alumno y Muestra de Output', async ({ page }) => {
    
    // 1. NAVEGACIÓN: Ir al detalle del ejercicio
    await test.step('1. Navegar al ejercicio', async () => {
        // ... (Lógica de navegación)
        await page.getByRole('link', { name: new RegExp(CURSO_NOMBRE) }).first().click({ timeout: 15000 });
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
    
    // 2. INGRESAR Y EJECUTAR EL CÓDIGO
    await test.step('2. Ingresar la solución y hacer clic en Enviar Código', async () => {
        
        // Localización del Editor (Monaco)
        const editorContainer = page.locator('.monaco-editor').first();
        const sendButton = page.getByRole('button', { name: 'Enviar Código' }); 
        
        // Ingresar la Solución
        await expect(editorContainer).toBeVisible({ timeout: 10000 });
        await editorContainer.click();
        await editorContainer.press('End');
        await editorContainer.press('Control+A'); 
        await editorContainer.press('Delete');
        await editorContainer.pressSequentially(PYTHON_CODE_SOLUTION, { delay: 10 });
        
        // Clic en Enviar Código y esperar la aparición del mensaje de éxito.
        await expect(sendButton).toBeEnabled();
        await sendButton.click(); 
        
        // 🚨 CAMBIO CRÍTICO AQUÍ 🚨
        // Localizamos el contenedor del mensaje de éxito por su texto.
        // Asumimos que el "¡Prueba Superada!" es el indicador de éxito.
        const successMessageContainer = page.getByText(EXPECTED_SUCCESS_MESSAGE).first(); 
        await expect(successMessageContainer).toBeVisible({ timeout: 30000 }); // Más tiempo para la ejecución
    });
    
    // 3. VALIDAR EL OUTPUT DE LA EJECUCIÓN (ahora validando el mensaje de éxito)
    await test.step('3. Verificar que el mensaje de éxito es correcto', async () => {
        
        // Re-localizamos el contenedor del mensaje de éxito
        const successMessageContainer = page.getByText(EXPECTED_SUCCESS_MESSAGE).first();
        
        // Validamos que el mensaje esperado esté contenido.
        await expect(successMessageContainer).toContainText(EXPECTED_SUCCESS_MESSAGE);
        
        // Opcional: También podrías verificar el tiempo de ejecución si fuera necesario.
        // await expect(successMessageContainer).toContainText(/Tiempo: \d+ms/); 
    });
});