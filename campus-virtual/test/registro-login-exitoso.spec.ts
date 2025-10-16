// tests/registro-login-exitoso.spec.ts

import { test, expect } from '@playwright/test';

// Datos de prueba únicos para asegurar que el registro no falla
const userData = {
    name: 'Juan',
    lastName: 'Sanchez',
    // IMPORTANTE: Cambia el email en cada ejecución para evitar duplicados en la DB
    email: `juan-${Date.now()}@etec.uba.ar`, 
    dni: `47345987`,
    birthDate: '10/04/2009',
    commissionCode: '3A-2025',
    password: 'juan1234',
};

test.describe('Flujo Completo: Registro y Login Exitoso', () => {

    test('Debe registrar un nuevo usuario e iniciar sesión correctamente', async ({ page }) => {
        
        // INICIO: Navegar y llegar al formulario de Registro
        await page.goto('http://localhost:3000/');
        await page.getByRole('link', { name: 'Iniciar Sesión' }).click();
        await page.getByRole('link', { name: 'Registrarse' }).click();

        // REGISTRO: Rellenar el formulario
        await test.step('Rellenar el formulario de registro', async () => {
            await page.getByRole('textbox', { name: 'Nombre' }).fill(userData.name);
            await page.getByRole('textbox', { name: 'Apellido' }).fill(userData.lastName);
            await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(userData.email);
            await page.getByRole('textbox', { name: 'DNI' }).fill(userData.dni);
            await page.getByRole('textbox', { name: 'Fecha de Nacimiento' }).fill(userData.birthDate);
            await page.getByRole('textbox', { name: 'Código de Comisión' }).fill(userData.commissionCode);
            await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill(userData.password);
            await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill(userData.password);
        });

        // REGISTRO: Enviar y verificar redirección
        await test.step('Crear cuenta y verificar redirección a Login', async () => {
            await page.getByRole('button', { name: 'Crear Cuenta' }).click();
            
            await expect(page.getByRole('heading', { name: 'Iniciar Sesión' })).toBeVisible();
        });

        // LOGIN: Iniciar sesión con la cuenta recién creada
        await test.step('Iniciar sesión con el nuevo usuario', async () => {
            await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(userData.email);
            await page.getByRole('textbox', { name: 'Contraseña' }).fill(userData.password);
            await page.getByRole('button', { name: 'Iniciar Sesión' }).click();
        });

        // VERIFICACIÓN FINAL: Verificar la navegación al Dashboard
        await test.step('Verificar que el usuario llega al dashboard (Mis Cursos)', async () => {
            // ⭐ ASERCIÓN CLAVE 2: Verificar un elemento visible en el dashboard post-login
            await expect(page.getByRole('heading', { name: 'Mis Cursos' })).toBeVisible();
            await expect(page.getByText(`Bienvenido, aquí tienes tu progreso.`)).toBeVisible();
          
        });

    });
});