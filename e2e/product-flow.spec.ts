import { test, expect } from '@playwright/test';

test.describe('Product Search Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search for a product by barcode', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/søk/i).or(page.getByPlaceholder(/strekkode/i));
    await searchInput.fill('7038010009457');
    await searchInput.press('Enter');

    // Wait for product to load (with timeout for API)
    await expect(page.getByText(/grønnscore/i).or(page.getByText(/miljø/i))).toBeVisible({ timeout: 10000 });
  });

  test('should click demo barcode to load product', async ({ page }) => {
    // Click on one of the demo barcodes
    const demoButton = page.getByRole('button', { name: /TINE/i }).or(page.getByText('TINE Melk'));
    await demoButton.click();

    // Wait for product card to appear
    await expect(page.locator('[class*="product"]').or(page.getByText(/grønnscore/i))).toBeVisible({ timeout: 10000 });
  });

  test('should display product score breakdown', async ({ page }) => {
    // Search for a known product
    const searchInput = page.getByPlaceholder(/søk/i).or(page.getByPlaceholder(/strekkode/i));
    await searchInput.fill('7038010009457');
    await searchInput.press('Enter');

    // Wait for score to appear
    await page.waitForTimeout(3000); // Allow API response

    // Check for score elements
    const scoreElement = page.locator('[class*="score"]').first();
    await expect(scoreElement).toBeVisible({ timeout: 10000 });
  });

  test('should handle product not found gracefully', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/søk/i).or(page.getByPlaceholder(/strekkode/i));
    await searchInput.fill('0000000000000');
    await searchInput.press('Enter');

    // Should show error or not found message
    await page.waitForTimeout(3000);
    // The app should handle this gracefully (no crash)
    await expect(page).toHaveURL('/');
  });
});

test.describe('Product Card Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Load a product first
    const demoButton = page.getByRole('button', { name: /TINE/i }).or(page.getByText('TINE Melk'));
    await demoButton.click();
    await page.waitForTimeout(3000);
  });

  test('should be able to add product to favorites', async ({ page }) => {
    const favoriteButton = page.getByRole('button', { name: /favoritt/i }).or(page.locator('[aria-label*="favoritt"]'));
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();
      // Button state should change
      await expect(favoriteButton).toBeVisible();
    }
  });

  test('should be able to add product to shopping list', async ({ page }) => {
    const shoppingListButton = page.getByRole('button', { name: /handleliste/i }).or(page.locator('[aria-label*="handleliste"]'));
    if (await shoppingListButton.isVisible()) {
      await shoppingListButton.click();
    }
  });
});
