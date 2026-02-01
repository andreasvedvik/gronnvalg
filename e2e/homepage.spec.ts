import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Grønnest/);
  });

  test('should display header with logo', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.getByText('Grønnest')).toBeVisible();
  });

  test('should display welcome card', async ({ page }) => {
    const welcomeCard = page.getByRole('heading', { level: 1 });
    await expect(welcomeCard).toBeVisible();
  });

  test('should have scan button visible', async ({ page }) => {
    const scanButton = page.getByRole('button', { name: /skann/i });
    await expect(scanButton).toBeVisible();
  });

  test('should have search bar functional', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/søk/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('melk');
    await expect(searchInput).toHaveValue('melk');
  });

  test('should display demo product barcodes', async ({ page }) => {
    // Demo barcodes should be visible
    await expect(page.getByText('TINE Melk').or(page.getByText('Kvikk Lunsj'))).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to privacy page', async ({ page }) => {
    await page.goto('/');
    const privacyLink = page.getByRole('link', { name: /personvern/i });
    await privacyLink.click();
    await expect(page).toHaveURL(/personvern/);
  });

  test('should navigate to about page', async ({ page }) => {
    await page.goto('/');
    const aboutLink = page.getByRole('link', { name: /om/i });
    await aboutLink.click();
    await expect(page).toHaveURL(/om/);
  });

  test('should be able to return to homepage', async ({ page }) => {
    await page.goto('/personvern');
    const homeLink = page.getByRole('link', { name: /grønnest/i }).first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });
});
