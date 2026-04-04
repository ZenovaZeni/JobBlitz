import { test, expect } from '@playwright/test';

test.describe('Dashboard Protected Routes', () => {
  test('Redirects unauthenticated user to login', async ({ page }) => {
    // Go to dashboard without auth
    await page.goto('/app/dashboard');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });

  test('Redirects unauthenticated user to signup from /app', async ({ page }) => {
    await page.goto('/app');
    // /app redirects to /app/dashboard which redirects to /auth/login
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
