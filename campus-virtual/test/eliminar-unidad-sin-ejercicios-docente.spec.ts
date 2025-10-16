import { test, expect } from '@playwright/test';

// --- Datos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const COURSE_SLUG = 'bases-de-datos';
// Usamos un timestamp para generar un título único y evitar colisiones
const TIMESTAMP = new Date().getTime(); 
const UNIDAD_TITULO_TO_DELETE = `Unidad-DELETE-TEST-${TIMESTAMP}`; 
const COMISION = '3B'; 
const BASE_URL = 'http://localhost:3000';

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

test('El docente puede eliminar una unidad temática vacía y verificar su desaparición', async ({ page }) => {
    
    // Crear una unidad vacía para eliminar 
    await test.step('PREREQUISITO: Crear la unidad a eliminar', async () => {
        
        const cursoLinkLocator = page.getByRole('link', { name: `${CURSO_NOMBRE} Comisión: ${COMISION}` }).first();
        await Promise.all([
            page.waitForURL(`**/${COURSE_SLUG}`),
            cursoLinkLocator.click(),
        ]);
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();

        await page.getByRole('link', { name: '+ Crear Unidad' }).click();

        await expect(page.getByRole('heading', { name: /Crear Unidad Temática para/i })).toBeVisible();
        await page.getByRole('textbox', { name: 'Título' }).fill(UNIDAD_TITULO_TO_DELETE);

        await page.getByRole('button', { name: 'Crear Unidad' }).click();
        await page.waitForTimeout(2000); 
        await page.goto(`${BASE_URL}/dashboard/3/${COURSE_SLUG}`);
        
        //Verificar que la unidad fue creada y es visible
        const expectedProgressText = 'Progreso: NaN%'; 
        const unidadLocator = page.getByRole('listitem').filter({ 
            hasText: `${UNIDAD_TITULO_TO_DELETE}${expectedProgressText}` 
        });
        await expect(unidadLocator).toBeVisible({ timeout: 10000 });
    });

    // Eliminar la unidad y confirmar 
    await test.step('Eliminar la unidad y confirmar mediante el modal', async () => {
        
        await page.getByText(UNIDAD_TITULO_TO_DELETE).first().click();
        const eliminarButtonName = `Eliminar Unidad: ${UNIDAD_TITULO_TO_DELETE}`;
        const eliminarButton = page.getByRole('button', { name: eliminarButtonName });

        await expect(eliminarButton).toBeVisible(); 
        await eliminarButton.click();
        
        // Verificar el Modal de Confirmación
        const modalHeading = page.getByRole('heading', { name: 'Confirmar Eliminación de Unidad' });
        await expect(modalHeading).toBeVisible({ timeout: 5000 });
        
        //Confirmar la eliminación
        const confirmarButton = page.getByRole('button', { name: 'Sí, Eliminar Unidad' });
        await confirmarButton.click();
    });

    // Verificar la eliminacion
    await test.step('Verificar que la unidad ha desaparecido de la lista', async () => {
        
        await page.waitForTimeout(2000); 
        await page.goto(`${BASE_URL}/dashboard/3/${COURSE_SLUG}`);
        
        //La unidad NO debe estar visible ni en el DOM
        const unidadLink = page.getByText(UNIDAD_TITULO_TO_DELETE).first();
        
        // La aserción: No debe estar en el DOM
        await expect(unidadLink).not.toBeAttached({ timeout: 10000 }); 
        await expect(unidadLink).not.toBeVisible();
    });
});