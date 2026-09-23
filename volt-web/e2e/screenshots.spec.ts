import { test } from '@playwright/test';

// Captures desktop + mobile screenshots for delivery review. Filenames carry
// the viewport suffix so the desktop and mobile projects don't overwrite
// each other. Run: npx playwright test screenshots.spec.ts
test('screenshots: landing, features, login', async ({ page }) => {
  const suffix = (page.viewportSize()?.width ?? 1280) < 768 ? '-mobile' : '-desktop';
  await page.goto('/');
  await page.screenshot({ path: `screenshots/landing${suffix}.png`, fullPage: true });
  await page.goto('/features');
  await page.screenshot({ path: `screenshots/features${suffix}.png` });
  await page.goto('/login');
  await page.screenshot({ path: `screenshots/login${suffix}.png` });
  await page.goto('/signup');
  await page.screenshot({ path: `screenshots/signup${suffix}.png` });
});
