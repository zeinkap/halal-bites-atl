import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';

// Depends on prisma/seed.ts: "Jerusalem Bakery & Grill" (one brand, 3 locations, shown as one
// brand card) and "Bismillah Cafe" (Bangladeshi, 4022 Buford Hwy NE) which does not match.
// The app matches name, cuisine, address and zip, so the negative assertion uses a restaurant
// that matches none of these.
test.describe('Search', () => {
  test('TC-SEARCH-001: Searching by name shows only matching restaurants', async ({ page }) => {
    const list = new RestaurantListPage(page);
    const term = 'jerusalem';
    const termPattern = new RegExp(term, 'i');

    // Step 1: Go to the homepage
    await list.goto();
    await list.waitForResults();

    // Step 2: Click the search bar
    await list.searchInput.click();

    // Step 3: Type "jerusalem"
    await list.searchInput.pressSequentially(term);

    // Expected: at least one result containing "Jerusalem" is shown
    await expect(list.cardsWithText('Jerusalem').first()).toBeVisible();

    // Expected: every displayed result contains "jerusalem" (case-insensitive).
    // This is the primary proof that non-matching restaurants are filtered out.
    await expect(list.cardsWithoutText(termPattern)).toHaveCount(0);

    // Expected: non-matching restaurants are not shown.
    // Secondary check only: the list paginates, so a count of 0 alone would be weak evidence.
    await expect(list.cardsWithText('Bismillah Cafe')).toHaveCount(0);
  });
});
