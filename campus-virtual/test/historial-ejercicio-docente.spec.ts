import { test, expect } from '@playwright/test';

// --- Constantes de Prueba ---
const DOCENTE_EMAIL = 'docente@etec.uba.ar';
const DOCENTE_PASSWORD = 'docenteuba';
const CURSO_NOMBRE_LINK = 'Bases de Datos Comisión: 3B'; 
const ALUMNO_NOMBRE = 'lopez, valeria';
const EJERCICIO_NOMBRE = 'suma part2';


test('verificar tareas enviadas por los alumnos', async ({ page }) => {
    
    await test.step('1. Iniciar sesión como Docente y verificar Dashboard', async () => {
        await page.goto('http://localhost:3000/login'); 

        await page.getByRole('textbox', { name: /Correo Electrónico/i }).fill(DOCENTE_EMAIL);
        await page.getByRole('textbox', { name: /Contraseña/i }).fill(DOCENTE_PASSWORD);
        
        await Promise.all([
            page.waitForURL("**/dashboard", { timeout: 20000 }), 
            page.getByRole('button', { name: 'Iniciar Sesión' }).click(),
        ]);

        // Verificación de estabilidad
        await expect(page.getByRole('heading', { name: 'Mis Cursos' })).toBeVisible({ timeout: 10000 });
    });


    // --- PASO 2: Navegar al Historial de Entregas ---
    await test.step('2. Navegar al Historial de Entregas del curso', async () => {
        await page.getByRole('link', { name: CURSO_NOMBRE_LINK }).click();
        await page.getByRole('link', { name: 'Historial de Entregas' }).click();
        
        // Verificación de la página de Historial
        await expect(page.getByRole('heading', { name: '📘 Historial de Entregas' })).toBeVisible();
    });
    

    // --- PASO 3: Verificar Datos de la Tabla ---
    const alumnoRow = await test.step('3. Verificar que los datos del alumno estén correctamente listados', async () => {
        await page.waitForSelector('table', { state: 'visible', timeout: 15000 });
        
        // Localizar la fila del alumno Valeria Lopez para el ejercicio "suma part2"
        const rowLocator = page.locator('tr')
            .filter({ hasText: ALUMNO_NOMBRE })
            .filter({ hasText: EJERCICIO_NOMBRE })
            .first();

        // Aserciones de contenido
        await expect(rowLocator).toHaveText(new RegExp(ALUMNO_NOMBRE)); 
        await expect(rowLocator).toHaveText(/\d{1,2}\/\d{1,2}\/\d{4}/);
        await expect(rowLocator).toHaveText(/Aprobado|Pendiente|Reprobado/i);

        return rowLocator; // Devuelve el localizador para usarlo en el siguiente paso
    });


    // --- PASO 4: Navegar a la Vista de Revisión  ---
    await test.step('4. Navegar a la vista de Revisión de Entrega', async () => {
        
        // 🟢 CORRECCIÓN: Busca el link 'Revisar' (o similar) dentro de la fila del alumno.
        const revisarLink = alumnoRow.getByRole('link', { name: /Revisar|Acciones/i }).or(alumnoRow.getByRole('button', { name: /Revisar|Acciones/i }));
        
        // Clic en el enlace y espera a que la URL cambie (navegación)
        await Promise.all([
            page.waitForURL("**/entregas/**", { timeout: 20000 }),
            revisarLink.click(),
        ]);
        

        // Verificación final del encabezado
        const revisionEntregaHeading = page.getByRole('heading', { name: /Revisión de Entrega/i });
        await expect(revisionEntregaHeading).toBeVisible({ timeout: 10000 });
    });
});