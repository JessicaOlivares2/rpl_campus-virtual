import { test, expect } from '@playwright/test';
import * as path from 'path'; 

// --- Datos de Prueba ---
const CURSO_NOMBRE = 'Bases de Datos';
const UNIDAD_NOMBRE = 'unidad 2 prueba';
const COURSE_SLUG = 'bases-de-datos'; 
const TIMESTAMP = new Date().getTime();
const EJERCICIO_TITULO_TO_DELETE = `Delete-Test-${TIMESTAMP}`; 
const EJERCICIO_CONSIGNA = 'Consigna de prueba para eliminar';
const TIPO_EJERCICIO = 'Lección';

// ⭐ RUTA  DEL ARCHIVO .py (Debe existir) (CAMBIARLO SIEMPRE O hasta q lo ponga en una carpeta...)
const TEST_FILE_PATH = '/home/etec/Descargas/test_suma_simple.py'; 

//const TEST_FILE_PATH = 'C:\\Users\\User\\Downloads\\test_suma_simple.py'; 



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

test('El docente puede eliminar un ejercicio y verificar su desaparición', async ({ page }) => {
    
    // Crear el ejercicio como prerrequisito ---
    await test.step('PREREQUISITO: Crear el ejercicio a eliminar', async () => {
        
        // Navegar al curso y unidad
        await page.getByRole('link', { name: CURSO_NOMBRE }).first().click();
        await expect(page.getByRole('heading', { name: CURSO_NOMBRE })).toBeVisible();
        
        // Desplegar la unidad para ver el botón 'Crear Ejercicio'
const unidadContainer = page.locator('li', { hasText: UNIDAD_NOMBRE }).first();
await unidadContainer.getByText(UNIDAD_NOMBRE).first().click();        
        // Localizador de creación corregido
const crearEjercicioLink = unidadContainer.getByRole('link', { name: '+ Crear Ejercicio' });
        await expect(crearEjercicioLink).toBeVisible({ timeout: 10000 });
        await crearEjercicioLink.click();

        // Llenar formulario
        await expect(page.getByRole('heading', { name: /Crear Ejercicio para/i })).toBeVisible();
        await page.getByRole('textbox', { name: 'Título' }).fill(EJERCICIO_TITULO_TO_DELETE);
        await page.getByRole('textbox', { name: 'Descripción (Opcional)' }).fill(EJERCICIO_CONSIGNA);
        
        // Cargar archivo
        await page.locator('input[type="file"]').setInputFiles(TEST_FILE_PATH);
        await page.getByLabel('Tipo de Ejercicio').selectOption(TIPO_EJERCICIO);

        // Crear ejercicio y Workaround
        await page.getByRole('button', { name: 'Crear Ejercicio' }).click();
        await page.waitForTimeout(2000); 
        await page.goto(`http://localhost:3000/dashboard/3/${COURSE_SLUG}`); 

        // Re-desplegar unidad para verificar el ejercicio
        await page.getByText(UNIDAD_NOMBRE).click();
        await expect(page.getByRole('link', { name: EJERCICIO_TITULO_TO_DELETE })).toBeVisible({ timeout: 10000 });
    });

    //  Eliminar el ejercicio
    await test.step('Eliminar el ejercicio y confirmar', async () => {
        
        //  Localizar y hacer clic en el botón de eliminar 
        const eliminarButtonName = `Eliminar ejercicio: ${EJERCICIO_TITULO_TO_DELETE}`;
        const eliminarButton = page.getByRole('button', { name: eliminarButtonName });

        await expect(eliminarButton).toBeVisible(); 
        await eliminarButton.click();
        
        //  Esperar que el encabezado del modal aparezca
        const modalHeading = page.getByRole('heading', { name: 'Confirmar Eliminación' });
        await expect(modalHeading).toBeVisible({ timeout: 5000 });
        
        // Confirmar la eliminación (El botón se localiza globalmente una vez que el modal está visible)
        const confirmarButton = page.getByRole('button', { name: 'Sí, Eliminar' });
        await confirmarButton.click();
    });

    // Verificar la eliminaciom
    await test.step('Verificar que el ejercicio ha desaparecido', async () => {
        
        await page.waitForTimeout(2000); 

        // Forzar la recarga de la unidad 
        await page.goto(`http://localhost:3000/dashboard/3/${COURSE_SLUG}`);
        await page.getByText(UNIDAD_NOMBRE).first().click(); 
        
        // Al confirmar la eliminación, el ejercicio desaparece.
        const ejercicioLink = page.getByRole('link', { name: EJERCICIO_TITULO_TO_DELETE });
        
        //  No debe estar en el DOM (o ser visible)
        await expect(ejercicioLink).not.toBeAttached({ timeout: 10000 }); 
        await expect(ejercicioLink).not.toBeVisible();
    });
});