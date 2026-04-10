import { test, expect } from '@playwright/test';

test.describe('Requests page', () => {
  test('renders header and tab bar', async ({ page }) => {
    await page.goto('/requests');

    await expect(page.getByText('FARESHARE').first()).toBeVisible();
    await expect(page.getByText('FIND A DRIVER')).toBeVisible();
    await expect(page.getByText('FIND A PASSENGER')).toBeVisible();
  });

  test('FIND A PASSENGER tab is active', async ({ page }) => {
    await page.goto('/requests');

    const passengerTab = page.getByText('FIND A PASSENGER');
    await expect(passengerTab).toHaveClass(/bg-accent/);
  });

  test('shows requests or empty state', async ({ page }) => {
    await page.goto('/requests');

    const emptyMessage = page.getByText('No ride requests right now');
    const requestCards = page.locator('[class*="border"][class*="bg-bg-card"]');

    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasCards = (await requestCards.count()) > 0;

    expect(hasEmpty || hasCards).toBe(true);
  });
});
