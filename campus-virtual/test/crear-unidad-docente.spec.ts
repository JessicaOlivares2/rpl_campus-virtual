import { test, expect } from '@playwright/test';
const CURSO_NOMBRE = 'Bases de Datos';
const COURSE_SLUG = 'bases-de-datos';
const UNIDAD_TITULO = `unidad 3 - prueba ${new Date().getTime()}`; // Título único para evitar conflictos
const COMISION = '3B'; 

test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('docente@etec.uba.ar');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('docenteuba');
    
    await Promise.all([
        page.waitForURL("**/dashboard", { timeout: 15000 }),
        page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
    ]);

    await expect(page.getByRole("heading", { name: "Mis Cursos" })).toBeVisible();
});

test('El docente puede crear una unidad temática y verificar su existencia', async ({ page }) => {
    await test.step('Navegar al formulario de creación de unidad', async () => {
        const cursoLinkLocator = page.getByRole('link', { name: `${CURSO_NOMBRE} Comisión: ${COMISION}` }).first();
        
        await Promise.all([
            page.waitForURL(`**/${COURSE_SLUG}`),
            cursoLinkLocator.click(),
        ]);
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();
        await page.getByRole('link', { name: '+ Crear Unidad' }).click();
        await expect(page.getByRole('heading', { name: /Crear Unidad Temática para/i })).toBeVisible();
    });

    //Llenar el formulario y Crear la unidad
    await test.step('Llenar el campo obligatorio y crear la unidad', async () => {
        
        await page.getByRole('textbox', { name: 'Título' }).fill(UNIDAD_TITULO);
        await page.getByRole('button', { name: 'Crear Unidad' }).click();
        await page.waitForTimeout(2000); 
    });

    //Verificación de la nueva unidad 
    await test.step('Verificar que la unidad aparece en la lista', async () => {
        
        await page.goto(`http://localhost:3000/dashboard/3/${COURSE_SLUG}`);
        
        
    
        const expectedProgressText = 'Progreso: NaN%'; 

        const unidadLocator = page.getByRole('listitem').filter({ 
            hasText: new RegExp(`${UNIDAD_TITULO}Progreso: [0-9]%|${UNIDAD_TITULO}Progreso: NaN%`)
        });
        
        // Para simplificar, si el porcentaje es siempre NaN% al inicio, usaremos ese localizador base:
        const unidadLocatorNaN = page.getByRole('listitem').filter({ 
            hasText: `${UNIDAD_TITULO}${expectedProgressText}` 
        });

        const unidadTituloVisible = page.getByText(UNIDAD_TITULO).first();

        //La nueva unidad debe estar visible
        await expect(unidadLocatorNaN).toBeVisible({ timeout: 10000 });
        await expect(unidadTituloVisible).toBeVisible();
    });
});