import { test, expect } from '@playwright/test';

// Guards client hydration (regression test: an over-strict CSP once blocked
// Next.js inline bootstrap scripts, leaving JS pages blank while SSR HTML
// looked fine via curl).
test('hydration: static content paints and login form hydrates', async ({ page }) => {
  const cspErrors: string[] = [];
  page.on('pageerror', (e) => cspErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error' && /Content Security Policy/i.test(m.text())) {
      cspErrors.push(m.text());
    }
  });

  await page.goto('/features');
  await expect(page.getByRole('heading', { name: 'Features', exact: true })).toBeVisible();

  await page.goto('/login');
  await expect(page.getByLabel(/Email/i)).toBeVisible({ timeout: 15000 });
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  expect(cspErrors).toEqual([]);
});
