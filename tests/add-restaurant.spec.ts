import { test, expect } from '@playwright/test';
import { TEST_RESTAURANTS } from './utils/test-data';

test('user can add a restaurant and find it in the UI', async ({ page }) => {
  const data = TEST_RESTAURANTS.BASIC;

  // Go to home page
  await page.goto('http://localhost:3000/');

  // Open the add restaurant form
  await page.click('[data-testid="add-restaurant-button"]');

  // Fill out the form
  await page.fill('[data-testid="restaurant-name-input"]', data.name);
  await page.selectOption('[data-testid="cuisine-type-select"]', data.cuisineType);
  await page.selectOption('[data-testid="price-range-select"]', data.priceRange);
  await page.fill('[data-testid="restaurant-address-input"]', data.address);
  if (data.description) {
    await page.fill('[data-testid="description-input"]', data.description);
  }
  if (data.hasPrayerRoom) await page.check('[data-testid="prayer-room-checkbox"]');
  if (data.isZabiha) await page.check('[data-testid="zabiha-checkbox"]');
  if (data.hasOutdoorSeating) await page.check('[data-testid="outdoor-seating-checkbox"]');
  if (data.hasHighChair) await page.check('[data-testid="high-chair-checkbox"]');
  if (data.servesAlcohol) await page.check('[data-testid="alcohol-checkbox"]');
  if (!data.isFullyHalal) await page.check('[data-testid="fully-halal-checkbox"]');

  await page.check('[data-testid="halal-verification-checkbox"]');

  // Submit the form and wait for the POST request
//   await Promise.all([
//     page.waitForResponse(resp =>
//       resp.url().includes('/api/restaurants') && resp.request().method() === 'POST'
//     ),
//     page.click('[data-testid="submit-restaurant-button"]')
//   ]);
  page.click('[data-testid="submit-restaurant-button"]')
  // Search for the restaurant by name
  await page.fill('[data-testid="search-input"]', data.name);
  await page.waitForTimeout(500); // Wait for search/filter debounce if needed

  // Verify the restaurant appears in the list
  const restaurantCard = page.locator('[data-testid^="restaurant-name-"]', { hasText: data.name });
  await expect(restaurantCard).toBeVisible();
});
