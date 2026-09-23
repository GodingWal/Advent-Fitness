import { test, expect } from '@playwright/test';

test('landing renders hero and auth CTAs', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Move with intent/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Create account/i }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Log in/i }).first()).toBeVisible();
});

test('login page validates and shows actionable errors', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Email/i).fill('not-an-email');
  await page.getByLabel(/Password/i).fill('x');
  await page.getByRole('button', { name: /Log in/i }).click();
  await expect(page.getByText(/valid email/i).first()).toBeVisible();
});

test('protected app redirects to login when signed out', async ({ page }) => {
  await page.goto('/app');
  await expect(page).toHaveURL(/\/login/);
});

test('mobile-width navigation keeps primary links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Features', exact: true })).toBeVisible();
});

test('API-unavailable copy exists on login when backend is down', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Email/i).fill('user@volt.test');
  await page.getByLabel(/Password/i).fill('Volt12345!');
  await page.route('/api/auth/login', (r) => r.abort());
  await page.getByRole('button', { name: /^Log in$/i }).click();
  await expect(page.locator('#login-error')).toContainText(/cannot reach/i);
});
