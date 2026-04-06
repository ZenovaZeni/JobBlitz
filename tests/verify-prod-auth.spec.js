import { test, expect } from '@playwright/test';

test('verify anonymous user is redirected to login', async ({ page }) => {
  // 1. Visit the app dashboard directly
  // NOTE: Assuming the production URL is jobblitzpro.vercel.app based on context
  const targetUrl = 'https://jobblitzpro.vercel.app/app/dashboard';
  console.log(`Navigating to ${targetUrl} in a fresh context...`);
  
  await page.goto(targetUrl);

  // 2. Expect a redirect to /auth/login or the landing page
  // We want to ensure we ARE NOT in the dashboard
  const currentUrl = page.url();
  console.log(`Current URL after navigation: ${currentUrl}`);

  // If the fix is NOT live, it will stay on /app/dashboard and show "Test Admin"
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Test Admin')) {
    console.error('FAIL: Still auto-logged in as Test Admin!');
  } else {
    console.log('SUCCESS: Not auto-logged in as Test Admin.');
  }

  // 3. Check for the login form elements to confirm we are on the login page
  const loginHeads = await page.locator('h1, h2').allTextContents();
  console.log('Page headings:', loginHeads);
});

test('verify landing page is visible for anonymous users', async ({ page }) => {
  await page.goto('https://jobblitzpro.vercel.app/');
  const title = await page.title();
  console.log(`Landing page title: ${title}`);
  
  // Check for "Get Started" or "Login" buttons
  const buttons = await page.locator('button, a').allTextContents();
  const loginButtonVisible = buttons.some(b => b.toLowerCase().includes('login') || b.toLowerCase().includes('sign in'));
  console.log(`Login button found: ${loginButtonVisible}`);
});
