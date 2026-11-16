import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';
import { NearMePage } from './pages/near-me.page';
import { MobileBottomBarPage } from './pages/mobile-bottom-bar.page';
import { MapViewPage } from './pages/map-view.page';

const MIDTOWN_ATLANTA = { latitude: 33.749, longitude: -84.388 };

// Phone viewport for the full-screen map. Read-only: relies on the seeded restaurants with lat/lng
// around Midtown Atlanta, so there is no data setup or cleanup.
test.describe('Mobile map', () => {
  test.use({ viewport: { width: 390, height: 844 }, geolocation: MIDTOWN_ATLANTA });

  test('TC-MOBILE-MAP-001: After Near Me the map shows your location, and tapping a pin selects its card in the strip', { tag: '@orchestrated' }, async ({ page, context }) => {
    const list = new RestaurantListPage(page);
    const nearMe = new NearMePage(page);
    const bar = new MobileBottomBarPage(page);
    const map = new MapViewPage(page);
    await map.blockTiles();

    // Step 1: Open the home page and run Near Me with "Any" distance
    await list.goto();
    await list.waitForResults();
    await nearMe.radiusOption('all').click();
    await context.grantPermissions(['geolocation']);
    const response = await nearMe.searchNearMe('all');
    expect(response.ok()).toBeTruthy();
    await expect(nearMe.chip).toHaveText(/Within all/);

    // Step 2: Open the map from the bottom bar -> full-screen with a "you are here" marker
    await bar.toggleView();
    await expect(map.map).toHaveAttribute('data-fullscreen', 'true', { timeout: 15_000 });
    await expect(map.searchCenter).toHaveAttribute('data-source', 'device');
    expect(await map.markers.count()).toBeGreaterThan(0);

    // Step 3: The strip lists the restaurants in view, nearest first, each with Directions
    await expect(map.stripItems.first()).toBeVisible();
    const firstId = await map.stripItemId(0);
    await expect(map.stripDirections(firstId)).toHaveAttribute('href', /google\.com\/maps\/dir/);

    // Step 4: Tapping another restaurant's pin selects its card and scrolls it into view
    expect(await map.stripItems.count()).toBeGreaterThan(1);
    const secondId = await map.stripItemId(1);
    await expect(map.stripItem(secondId)).toHaveAttribute('aria-pressed', 'false');
    await map.tapMarker(secondId);
    await expect(map.stripItem(secondId)).toHaveAttribute('aria-pressed', 'true');
    await expect(map.stripItem(secondId)).toBeInViewport();

    // Step 5: Back to the list
    await bar.toggleView();
    await expect(map.map).toHaveCount(0);
    await list.waitForResults();
  });

  test('TC-MOBILE-MAP-002: Without Near Me, the map locate button starts the location flow', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);
    const nearMe = new NearMePage(page);
    const bar = new MobileBottomBarPage(page);
    const map = new MapViewPage(page);
    await map.blockTiles();

    // Step 1: Open the home page and the map, with no location yet
    await list.goto();
    await list.waitForResults();
    await bar.toggleView();
    await expect(map.map).toHaveAttribute('data-fullscreen', 'true', { timeout: 15_000 });
    await expect(map.searchCenter).toHaveCount(0);

    // Step 2: The locate button asks to use the device location
    await map.locateButton.click();
    await expect(nearMe.confirmUseButton).toBeVisible();
    await page.locator('[data-testid="location-confirm-cancel"]').click();
    await expect(nearMe.confirmDialog).toHaveCount(0);
  });
});
