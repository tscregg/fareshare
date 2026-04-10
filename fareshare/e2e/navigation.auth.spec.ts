import { test, expect } from '@playwright/test';

test.describe('Bottom navigation', () => {
  test('shows three nav items', async ({ page }) => {
    await page.goto('/rides');

    const nav = page.locator('nav');
    await expect(nav.getByText('RIDES')).toBeVisible();
    await expect(nav.getByText('ADD RIDE')).toBeVisible();
    await expect(nav.getByText('YOU')).toBeVisible();
  });

  test('navigates to rides page', async ({ page }) => {
    await page.goto('/dashboard');
    await page.locator('nav').getByText('RIDES').click();
    await expect(page).toHaveURL(/\/rides/);
  });

  test('navigates to post ride page', async ({ page }) => {
    await page.goto('/rides');
    await page.locator('nav').getByText('ADD RIDE').click();
    await expect(page).toHaveURL(/\/post\/ride/);
  });

  test('navigates to dashboard', async ({ page }) => {
    await page.goto('/rides');
    await page.locator('nav').getByText('YOU').click();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});

test.describe('Tab bar', () => {
  test('shows ride and request tabs on rides page', async ({ page }) => {
    await page.goto('/rides');

    await expect(page.getByText('FIND A DRIVER')).toBeVisible();
    await expect(page.getByText('FIND A PASSENGER')).toBeVisible();
  });

  test('navigates between rides and requests', async ({ page }) => {
    await page.goto('/rides');

    await page.getByText('FIND A PASSENGER').click();
    await expect(page).toHaveURL(/\/requests/);

    await page.getByText('FIND A DRIVER').click();
    await expect(page).toHaveURL(/\/rides/);
  });
});
