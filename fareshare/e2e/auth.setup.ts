import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const authFile = path.join(__dirname, '.auth/user.json');

const TEST_EMAIL = 'e2e-test@fareshare.local';
const TEST_PASSWORD = 'testpass123';
const TEST_DISPLAY_NAME = 'E2E Tester';

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL || TEST_EMAIL;
  const password = process.env.E2E_USER_PASSWORD || TEST_PASSWORD;

  // Try logging in first (user may already exist from a prior run)
  await page.goto('/login');
  await page.getByPlaceholder('your@email.com').fill(email);
  await page.getByPlaceholder('Your password').fill(password);
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait briefly to see if login succeeds or shows an error
  const loginResult = await Promise.race([
    page.waitForURL(/\/rides/, { timeout: 10000 }).then(() => 'success' as const),
    page.getByText(/invalid/i).waitFor({ timeout: 10000 }).then(() => 'error' as const),
  ]);

  if (loginResult === 'success') {
    await page.context().storageState({ path: authFile });
    return;
  }

  // Login failed — create the test user via signup
  await page.goto('/signup');
  await page.getByPlaceholder('How others will see you').fill(TEST_DISPLAY_NAME);
  await page.getByPlaceholder('your@email.com').fill(email);
  await page.getByPlaceholder('At least 6 characters').fill(password);
  await page.getByRole('button', { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/rides/, { timeout: 15000 });
  await page.context().storageState({ path: authFile });
});
