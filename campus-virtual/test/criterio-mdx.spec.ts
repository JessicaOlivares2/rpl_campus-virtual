import { test, expect } from '@playwright/test';

// --- Constantes de Tu Entorno ---
const ALUMNO_EMAIL = 'lopez@etec.uba.ar'; 
const ALUMNO_PASSWORD = 'valeria123'; 
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const EJERCICIO_NOMBRE = 'suma part2'; 
const BASE_URL = 'http://localhost:3000';

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

test('Validar Criterio: Carga de Enunciado desde MDX estático', async ({ page }) => {
    
    // 1. NAVEGACIÓN: Ir al detalle del ejercicio
    await test.step('1. Navegar al ejercicio (Uso de Clic Defensivo)', async () => {
        
        // Clic en el curso
        await page.getByRole('link', { name: new RegExp(CURSO_NOMBRE) }).first().click({ timeout: 15000 });

        // Localizar la unidad y su contenedor
        const unidadClickLocator = page.getByText(UNIDAD_NOMBRE, { exact: false }).first();
        const unidadContenedor = page.getByRole('listitem').filter({ hasText: UNIDAD_NOMBRE }).first();
        
        // Localizamos el enlace del ejercicio (suma part2)
        const ejercicioLink = unidadContenedor
            .getByRole('link', { name: new RegExp(EJERCICIO_NOMBRE) })
            .first();

        // 🚨 ESTRATEGIA DE CLIC DEFENSIVO (para resolver el timeout en la lista desplegable) 🚨
        try {
            // Intento 1: Un clic y espera corta
            await unidadClickLocator.click(); 
            // Esperamos 3 segundos. Si aparece, salimos del try.
            await expect(ejercicioLink).toBeVisible({ timeout: 3000 }); 

        } catch (error) {
            // Si falla la espera (sugiere que se necesita doble clic o recarga)
            console.log("⚠️ El enlace no apareció. Re-clickeando la unidad...");
            await unidadClickLocator.click(); // Re-clic
            // Esperamos más tiempo para el enlace después del segundo clic
            await expect(ejercicioLink).toBeVisible({ timeout: 10000 }); 
        }
            
        // Hacemos clic en el ejercicio, ahora que sabemos que es visible
        await ejercicioLink.click();
        
        // Verificaciones finales de navegación
        await expect(page.getByRole('heading', { name: EJERCICIO_NOMBRE })).toBeVisible({ timeout: 10000 });
        await expect(page.getByRole('heading', { name: 'Editor de Código' })).toBeVisible();
    });

    // 2. VALIDACIÓN DEL CRITERIO: Almacenar enunciado en markdown en carpeta static
    await test.step('2. Verificar contenido cargado desde MDX', async () => {
        
        // 1. Localizar el contenedor principal del Enunciado.
        const enunciadoContainer = page.locator('div').filter({ hasText: /^Enunciado/i }).first();
        await expect(enunciadoContainer).toBeVisible();

        // 2. Verificar la línea de texto ÚNICO del enunciado (del archivo MDX).
        const textoEnunciadoMDX = enunciadoContainer.getByText('Debes implementar una función llamada sumar(a, b)');
        await expect(textoEnunciadoMDX).toBeVisible({ timeout: 5000 });
        
        // 3. Verificar el bloque de Código Base (CORRECCIÓN DEL STRICT MODE y SINTAXIS)
        // La ambigüedad se resuelve llamando a .first() antes de expect.
        const codeBaseBlock = enunciadoContainer.getByText('def sumar(a, b):'); 
        await expect(codeBaseBlock.first()).toBeVisible(); // 🚀 SINTAXIS CORREGIDA
    });
});