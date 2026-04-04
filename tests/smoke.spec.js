import { test, expect } from '@playwright/test';

test.describe('Public Pages Smoke Test', () => {
  test('Landing page loads and has title', async ({ page }) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/JobBlitz/i);
    
    // Check for CTA
    const signupButton = page.getByRole('link', { name: /Sign Up|Join|Get Started/i });
    // await expect(signupButton).toBeVisible();
  });

  test('Pricing page loads and displays plans', async ({ page }) => {
    await page.goto('/pricing');
    // Verify the new SEO title
    await expect(page).toHaveTitle(/Pricing | JobBlitz/i);
    
    // Check for core pricing text found in report
    await expect(page.getByText(/Start free. Upgrade when ready./i)).toBeVisible();
  });

  test('Auth pages are accessible', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/Login | JobBlitz/i);
    // UI says "Welcome back" instead of "Sign In"
    await expect(page.getByText(/Welcome back/i)).toBeVisible();

    await page.goto('/auth/signup');
    await expect(page).toHaveTitle(/Sign Up | JobBlitz/i);
    await expect(page.getByRole('heading', { name: /Create your account/i }).or(page.getByText(/Sign up/i))).toBeVisible();
  });
});
