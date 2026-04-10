import { test, expect } from '@playwright/test';

// The Input component doesn't use htmlFor/id, so getByLabel won't work.
// Use getByPlaceholder to locate inputs reliably.

test.describe('Login page', () => {
  test('renders login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByText('FARESHARE')).toBeVisible();
    await expect(page.getByText('Community rides, Ericeira to Lisbon')).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Your password')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('has link to signup', async ({ page }) => {
    await page.goto('/login');

    const signupLink = page.getByRole('link', { name: /sign up/i });
    await expect(signupLink).toBeVisible();
    await expect(signupLink).toHaveAttribute('href', '/signup');
  });

  test('requires email and password fields', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.getByPlaceholder('your@email.com');
    const passwordInput = page.getByPlaceholder('Your password');

    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/rides');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Signup page', () => {
  test('renders signup form', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByText('FARESHARE')).toBeVisible();
    await expect(page.getByText('Join the community')).toBeVisible();
    await expect(page.getByPlaceholder('How others will see you')).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('At least 6 characters')).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('has link to login', async ({ page }) => {
    await page.goto('/signup');

    const loginLink = page.getByRole('link', { name: /log in/i });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', '/login');
  });

  test('requires all fields', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByPlaceholder('How others will see you')).toHaveAttribute('required', '');
    await expect(page.getByPlaceholder('your@email.com')).toHaveAttribute('required', '');
    await expect(page.getByPlaceholder('At least 6 characters')).toHaveAttribute('required', '');
  });

  test('enforces minimum password length', async ({ page }) => {
    await page.goto('/signup');

    const passwordInput = page.getByPlaceholder('At least 6 characters');
    await expect(passwordInput).toHaveAttribute('minlength', '6');
  });
});
