import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';
import { MobileBottomBarPage } from './pages/mobile-bottom-bar.page';

// Phone viewport so the bottom bar (sm:hidden) renders. Read-only: uses the seeded restaurants and
// never submits a form, so there is no data setup or cleanup.
test.describe('Mobile bottom bar', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('TC-MOBILE-BAR-001: Filters opens a bottom sheet and applying a cuisine filters the list', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);
    const bar = new MobileBottomBarPage(page);

    // Step 1: Open the home page; the bar shows its four actions and replaces the floating + button
    await list.goto();
    await list.waitForResults();
    await expect(bar.root).toBeVisible();
    await expect(bar.nearMeButton).toBeVisible();
    await expect(bar.viewToggle).toHaveText(/Map/);
    await expect(bar.filtersButton).toBeVisible();
    await expect(bar.addButton).toBeVisible();
    await expect(bar.floatingAddButton).toBeHidden();
    await expect(bar.filterCount).toHaveCount(0);

    // Step 2: Tap Filters -> the bottom sheet opens with the filter controls
    await list.openFilters();
    await expect(bar.filtersSheet).toBeVisible();
    await expect(list.cuisineSelect).toBeVisible();

    // Step 3: Pick the first real cuisine (the option after "All cuisines")
    const cuisineLabel = (await list.cuisineSelect.locator('option').nth(1).textContent())?.trim() ?? '';
    expect(cuisineLabel).not.toBe('');
    await list.selectCuisine(cuisineLabel);

    // Step 4: Apply -> the sheet closes, the bar shows 1 active filter, and every card has that cuisine
    await expect(bar.sheetApplyButton).toHaveText(/^Show \d+ results?$/);
    await bar.sheetApplyButton.click();
    await expect(bar.filtersSheet).toHaveCount(0);
    await expect(bar.filterCount).toHaveText('1');
    await list.waitForResults();
    const badges = await list.cuisineBadges.allTextContents();
    expect(badges.length).toBeGreaterThan(0);
    expect(badges.every((b) => b.trim() === cuisineLabel)).toBe(true);
  });

  test('TC-MOBILE-BAR-002: The bar switches to the map and back, and Add opens the add-restaurant form', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);
    const bar = new MobileBottomBarPage(page);
    await page.route('**/*.tile.openstreetmap.org/**', (route) => route.abort());

    // Step 1: Open the home page
    await list.goto();
    await list.waitForResults();

    // Step 2: Map -> a full-screen map replaces the list; the button now offers List
    await bar.toggleView();
    const map = page.locator('[data-testid="restaurant-map"]');
    await expect(map).toBeVisible({ timeout: 15_000 });
    await expect(map).toHaveAttribute('data-fullscreen', 'true');
    await expect(bar.viewToggle).toHaveText(/List/);
    await expect(list.resultCards).toHaveCount(0);

    // Step 3: List -> back to the cards
    await bar.toggleView();
    await expect(map).toHaveCount(0);
    await list.waitForResults();

    // Step 4: Add -> the add-restaurant form opens (closed again without submitting)
    await bar.addButton.click();
    const panel = page.locator('[data-testid="add-restaurant-modal-panel"]');
    await expect(panel).toBeVisible({ timeout: 15_000 });
    await page.locator('[data-testid="cancel-restaurant-button"]').click();
    await expect(panel).toHaveCount(0);
  });
});
