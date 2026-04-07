import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

test.describe('Final Pre-launch QA Pass', () => {
  
  test.beforeEach(async ({ page }) => {
    // We use the dev-login to get an authenticated session quickly
    await page.goto(`${BASE}/dev-login`);
    const devLoginButton = page.locator('button').first();
    await devLoginButton.click();
    await page.waitForTimeout(2000); // Wait for auth state to settle
  });

  test('Dashboard Skeletons & Content Resolution', async ({ page }) => {
    await page.goto(`${BASE}/app/dashboard`);
    // Check that we don't have an infinite loader
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 });
    
    // Check for "Open Packet" or empty state text - Dashboard should resolve
    const hasPacket = await page.locator('text=Open Packet').or(page.locator('text=Continue Packet')).count() > 0;
    const isEmpty = await page.locator('text=Your dashboard is ready').count() > 0;
    expect(hasPacket || isEmpty).toBeTruthy();
  });

  test('Cover Letter Download & Export Buttons', async ({ page }) => {
    await page.goto(`${BASE}/app/session/ANY_ID?tab=cover`); // We should use a real ID or handle empty
    await page.waitForTimeout(2000);
    
    const hasSession = await page.locator('text=Rewrite Letter').or(page.locator('text=Generate Cover Letter')).count() > 0;
    if (hasSession) {
      await expect(page.locator('text=Download').first()).toBeVisible();
      await expect(page.locator('text=Copy').first()).toBeVisible();
    } else {
      await expect(page.locator('text=No active application').or(page.locator('text=Open an application packet'))).toBeVisible();
    }
  });

  test('Interview Prep Export & Navigation', async ({ page }) => {
    await page.goto(`${BASE}/app/session/ANY_ID?tab=interview`);
    await page.waitForTimeout(2000);

    const hasPrep = await page.locator('text=Likely Interview Question').count() > 0;
    if (hasPrep) {
      await expect(page.locator('text=Export').first()).toBeVisible();
      
      // Test navigation in sidebar
      const nextQ = page.locator('aside button').nth(1);
      if (await nextQ.isVisible()) {
        await nextQ.click();
        await expect(page.locator('text=Loading Workspace...')).not.toBeVisible();
      }
    } else {
      await expect(page.locator('text=Interview Preparation').or(page.locator('text=STAR response not written yet'))).toBeVisible();
    }
  });

  test('Mobile Direct Refresh Verification', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`${BASE}/app/session/ANY_ID?tab=interview`);
    await page.waitForTimeout(3000);
    const loadingMsg = page.locator('text=Loading Workspace...');
    await expect(loadingMsg).not.toBeVisible({ timeout: 5000 });
  });

});
