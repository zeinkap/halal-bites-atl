import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';

// Depends on prisma/seed.ts: "Jerusalem Bakery & Grill" (one brand, 3 locations, shown as one
// brand card) and "Bismillah Cafe" (Bangladeshi, 4022 Buford Hwy NE) which does not match.
// The app matches name, cuisine, address and zip, so the negative assertion uses a restaurant
// that matches none of these.
test.describe('Search', () => {
  test('TC-SEARCH-001: Searching by name shows only matching restaurants', { tag: '@orchestrated' }, async ({ page }) => {
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

    // The input holds the term, so the filter below is applied to the full query.
    await expect(list.searchInput).toHaveValue(term);

    // Expected: every displayed result contains "jerusalem" (case-insensitive).
    // Asserted before the positive check: it keeps retrying while non-matching cards from the
    // unfiltered list are still on screen, so it cannot pass until the filter has applied.
    // Load every page of results first so the check covers the whole result set.
    await list.loadAllResults();
    await expect(list.cardsWithoutText(termPattern)).toHaveCount(0);

    // Expected: at least one result containing "Jerusalem" is shown. Run after the check above,
    // so it can no longer be satisfied by the unfiltered list.
    await expect(list.cardsWithText('Jerusalem').first()).toBeVisible();

    // Expected: non-matching restaurants are not shown. Meaningful now that all pages are loaded.
    await expect(list.cardsWithText('Bismillah Cafe')).toHaveCount(0);
  });
});
