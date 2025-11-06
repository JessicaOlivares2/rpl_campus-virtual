import { test, expect } from '@playwright/test';

test('Debe mostrar mensajes de error al intentar registrarse sin llenar ningún campo', async ({ page }) => {
    
    const registerUrl = 'http://localhost:3000/register';
    
    await test.step('Navegar al formulario de registro', async () => {
        
    await page.goto('http://localhost:3000/login'); 

    
        await Promise.all([
            page.waitForURL('**/register', { timeout: 10000 }), 
            page.getByRole('link', { name: 'Registrarse' }).click(),
        ]);
    
      
        await expect(page.getByRole('heading', { name: 'Crear una Cuenta' })).toBeVisible({ timeout: 5000 });
    });

    //  Simular el intento de envío vacío y verificar NO redirección ---
    await test.step('Simular intento de envío de formulario vacío', async () => {
        
        await page.getByRole('button', { name: 'Crear Cuenta' }).click();

        //  Verificar que la URL PERMANECE en la página de registro.
        await expect(page).toHaveURL(registerUrl);
    });

    //  Errores de Validación ---
    await test.step('Verificar mensajes de error de validación', async () => {
        
        await expect(page.getByText('El nombre debe tener al menos 2 caracteres')).toBeVisible();
        await expect(page.getByText('El apellido debe tener al menos 2 caracteres')).toBeVisible();
        
        
        await expect(page.getByText('Ingrese un email válido')).toBeVisible();
        await expect(page.getByText('El DNI debe tener 7 u 8 dígitos sin puntos ni espacios')).toBeVisible();
        await expect(page.getByText('Formato de fecha inválido (dd/mm/aaaa)')).toBeVisible();
        
        
        await expect(page.getByText('El código de comisión es requerido')).toBeVisible();
        await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible();
    });
});