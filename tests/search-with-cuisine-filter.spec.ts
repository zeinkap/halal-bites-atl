import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';

// Depends on prisma/seed.ts: "Jerusalem Bakery & Grill" (Mediterranean, 3 locations shown as one
// brand card) and "Bismillah Cafe" (Bangladeshi). Read-only, so no data setup or cleanup.
test.describe('Filters', () => {
  test('TC-FILTER-001: Cuisine filter shows only restaurants of the selected cuisine', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);

    // Step 1: Go to the homepage
    await list.goto();
    await list.waitForResults();

    // Step 2: Open the filters panel
    await list.openFilters();

    // Step 3: Select "Mediterranean" in the cuisine filter
    await list.selectCuisine('Mediterranean');
    await expect(list.cuisineSelect).toHaveValue('MEDITERRANEAN');

    // Expected: restaurants of other cuisines are not shown. Retries until the filter applies.
    await expect(list.cardsWithText('Bismillah Cafe')).toHaveCount(0);

    // Expected: every card, including those loaded on scroll, displays the cuisine "Mediterranean".
    await list.loadAllResults();
    await expect(list.cuisineBadges.first()).toBeVisible();
    await expect(list.cuisineBadges.filter({ hasNotText: 'Mediterranean' })).toHaveCount(0);
    await expect(list.cuisineBadges).toHaveCount(await list.resultCards.count());

    // Expected: at least one card is shown, and Jerusalem Bakery & Grill is a single brand card.
    await expect(list.resultCards.first()).toBeVisible();
    await expect(list.cardsWithText('Jerusalem Bakery & Grill')).toHaveCount(1);
  });
});
