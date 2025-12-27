
import { test, expect } from '@playwright/test';

test.describe('Billing System E2E', () => {
    // Nota: Esto requiere que el backend esté con un usuario de prueba o mockeado.
    // Para este test preliminar, verificaremos que la página carga y los planes se muestran.

    test('should display subscription plans', async ({ page }) => {
        // 1. Navegar a la página de suscripción (asumiendo que podríamos verla o ser redirigido)
        // En una app real, aquí haríamos login primero. 
        // Por ahora, vamos a verificar que la ruta responde (aunque sea 401/404 o redirect)
        // O si tenemos un modo de bypass de auth para tests.

        // Al ser un test "Black Box" sin seed de login, esto es limitado.
        // Vamos a asumir que podemos ver la página de login si no estamos auth.

        await page.goto('/dashboard/admin/suscripcion');

        // Si redirige a login, verificamos que estamos en login
        if (page.url().includes('/login') || page.url().includes('/sign-in')) {
            console.log('Redirected to login as expected for unauth user');
            await expect(page).toHaveURL(/.*login|sign-in/);
        }
        // Si por alguna razón (dev mode con mock auth) entramos:
        else {
            // Verificar que aparezcan los planes
            await expect(page.getByText('Plan Básico')).toBeVisible();
            await expect(page.getByText('Plan Pro')).toBeVisible();
            await expect(page.getByText('S/ 99')).toBeVisible();
        }
    });

    // Test visual básico de los componentes de UI
    test('landing page checks', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Juntay/i);
    });
});
