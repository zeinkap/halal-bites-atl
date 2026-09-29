import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';

// Depends on the homepage listing at least one restaurant (prisma/seed.ts), like TC-SEARCH-001.
test.describe('Search', () => {
  test('TC-SEARCH-002: Searching for a non-existent restaurant shows the empty state, and clearing the search restores the list', async ({ page }) => {
    const list = new RestaurantListPage(page);
    const term = 'zzzxqqnomatch';

    // Step 1: Go to the homepage
    await list.goto();
    await list.waitForResults();

    // Step 2: Click the search bar
    await list.searchInput.click();

    // Step 3: Type "zzzxqqnomatch"
    await list.searchInput.fill(term);

    // Expected: no restaurant cards and the "No restaurants found" message
    await expect(list.searchInput).toHaveValue(term);
    await expect(list.noResults).toBeVisible();
    await expect(list.noResults).toContainText('No restaurants found');
    await expect(list.resultCards).toHaveCount(0);

    // Step 4: Click the "Clear search" (X) button
    await list.clearSearchButton.click();

    // Expected: search bar empty, message gone, restaurant cards shown again
    await expect(list.searchInput).toHaveValue('');
    await expect(list.noResults).toHaveCount(0);
    await expect(list.resultCards.first()).toBeVisible();
  });
});
