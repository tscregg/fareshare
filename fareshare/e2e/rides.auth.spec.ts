import { test, expect } from '@playwright/test';

test.describe('Rides page', () => {
  test('renders header and tab bar', async ({ page }) => {
    await page.goto('/rides');

    await expect(page.getByText('FARESHARE').first()).toBeVisible();
    await expect(page.getByText('FIND A DRIVER')).toBeVisible();
    await expect(page.getByText('FIND A PASSENGER')).toBeVisible();
  });

  test('shows rides or empty state', async ({ page }) => {
    await page.goto('/rides');

    // Either ride cards exist or the empty state message is shown
    const emptyMessage = page.getByText('No rides available right now');
    const rideCards = page.locator('[class*="border"][class*="bg-bg-card"]');

    const hasEmpty = await emptyMessage.isVisible().catch(() => false);
    const hasCards = (await rideCards.count()) > 0;

    expect(hasEmpty || hasCards).toBe(true);
  });

  test('ride card links to detail page', async ({ page }) => {
    await page.goto('/rides');

    const firstCard = page.locator('a[href^="/rides/"]').first();
    const hasCards = (await firstCard.count()) > 0;

    if (hasCards) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/rides\/.+/);
    }
  });
});

test.describe('Ride detail page', () => {
  test('shows back header', async ({ page }) => {
    await page.goto('/rides');

    const firstCard = page.locator('a[href^="/rides/"]').first();
    const hasCards = (await firstCard.count()) > 0;

    if (hasCards) {
      await firstCard.click();
      await expect(page).toHaveURL(/\/rides\/.+/);

      // Back header shows "Ride Details" or "Your Ride"
      const backHeader = page.getByText(/ride details|your ride/i);
      await expect(backHeader).toBeVisible();
    }
  });
});
