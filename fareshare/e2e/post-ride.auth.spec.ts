import { test, expect } from '@playwright/test';

test.describe('Post ride page', () => {
  test('renders with driver mode by default', async ({ page }) => {
    await page.goto('/post/ride');

    await expect(page.getByText('POST A RIDE')).toBeVisible();
    await expect(page.getByText('Share your ride with the community')).toBeVisible();
  });

  test('shows driver/passenger mode toggle', async ({ page }) => {
    await page.goto('/post/ride');

    await expect(page.getByRole('button', { name: /i'm driving/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /i need a ride/i })).toBeVisible();
  });

  test('driver form shows correct fields', async ({ page }) => {
    await page.goto('/post/ride');

    await expect(page.getByPlaceholder('Departure location')).toBeVisible();
    await expect(page.getByPlaceholder('Destination')).toBeVisible();
    await expect(page.getByPlaceholder('4')).toBeVisible(); // Seats Available
    await expect(page.getByPlaceholder('10')).toBeVisible(); // Suggested Donation
    await expect(page.getByRole('button', { name: /post ride/i })).toBeVisible();
  });

  test('switches to request form', async ({ page }) => {
    await page.goto('/post/ride');

    await page.getByRole('button', { name: /i need a ride/i }).click();

    await expect(page.getByText('POST A REQUEST')).toBeVisible();
    await expect(page.getByText('Let drivers know where you need to go')).toBeVisible();
    await expect(page.getByPlaceholder('Where are you?')).toBeVisible();
    await expect(page.getByPlaceholder('Where do you need to go?')).toBeVisible();
    await expect(page.getByRole('button', { name: /post request/i })).toBeVisible();
  });

  test('switches back to ride form', async ({ page }) => {
    await page.goto('/post/ride');

    await page.getByRole('button', { name: /i need a ride/i }).click();
    await expect(page.getByText('POST A REQUEST')).toBeVisible();

    await page.getByRole('button', { name: /i'm driving/i }).click();
    await expect(page.getByText('POST A RIDE')).toBeVisible();
  });

  test('has back header', async ({ page }) => {
    await page.goto('/post/ride');

    await expect(page.getByText('Back')).toBeVisible();
  });
});
