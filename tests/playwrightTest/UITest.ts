
  import { test, expect } from '@playwright/test';
  
  async function goToLoginPage(page) {
    const loginLink = page.locator('a[href="/auth/login"]').first();
    if (await loginLink.count()) {
      await loginLink.click();
      await expect(page).toHaveURL(/\/auth\/login/);
    } else {
    await page.goto('http://localhost:3000/auth/login');
    }
  };

  test('navigates to the login page', async ({ page }) => {
    await goToLoginPage(page);
  });

  