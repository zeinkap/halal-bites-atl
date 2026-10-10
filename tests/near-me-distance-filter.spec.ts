import { test, expect, type Response } from '@playwright/test';
import { NearMePage } from './pages/near-me.page';
import { RestaurantListPage } from './pages/restaurant-list.page';

const MIDTOWN_ATLANTA = { latitude: 33.749, longitude: -84.388 };

/** Ids of the restaurants in an /api/restaurants response body (a JSON array of restaurants). */
async function idsFrom(response: Response): Promise<Set<string>> {
  const body = (await response.json()) as Array<{ id: string }>;
  const ids = new Set(body.map((r) => r.id));
  expect(ids.size).toBeGreaterThan(0);
  return ids;
}

// Read-only: depends on the seeded restaurants with lat/lng around Midtown Atlanta. No cleanup.
test.describe('Search', () => {
  test.use({ geolocation: MIDTOWN_ATLANTA });

  test('TC-SEARCH-003: Near Me search shows only restaurants within the selected distance (3, 5, 10 mi)', { tag: '@orchestrated' }, async ({ page, context }) => {
    const list = new RestaurantListPage(page);
    const nearMe = new NearMePage(page);

    // Step 1: Open the home page and note the unfiltered restaurant count
    await list.goto();
    await list.waitForResults();
    const baseline = await nearMe.readCount();
    expect(baseline).toBeGreaterThan(0);
    await expect(nearMe.radiusSelect).toHaveValue('5');
    await expect(nearMe.chip).toHaveCount(0);

    // Permission is granted only now so the on-load auto Near Me does not run before the baseline.
    await context.grantPermissions(['geolocation']);

    // Step 2: Click "Near Me"; Step 3: click "Use my location" in the dialog
    const response5 = await nearMe.searchNearMe(5);

    // Step 4: Chip shows "Within 5 mi" and the count is smaller than the unfiltered count
    await expect(nearMe.chip).toHaveText(/Within 5 mi/);
    const count5 = await nearMe.readCount();
    expect(count5).toBeGreaterThan(0);
    expect(count5).toBeLessThan(baseline);
    const ids5 = await idsFrom(response5);

    // Step 5: Choose "3 mi" in the Distance selector
    await nearMe.selectRadius('3');
    await expect(nearMe.radiusSelect).toHaveValue('3');

    // Step 6: Click "Near Me"; Step 7: click "Use my location"
    const response3 = await nearMe.searchNearMe(3);

    // Step 8: Chip shows "Within 3 mi" and the count is smaller than the unfiltered count
    await expect(nearMe.chip).toHaveText(/Within 3 mi/);
    const count3 = await nearMe.readCount();
    expect(count3).toBeGreaterThan(0);
    expect(count3).toBeLessThan(baseline);
    const ids3 = await idsFrom(response3);

    // Step 9: Choose "10 mi" in the Distance selector
    await nearMe.selectRadius('10');
    await expect(nearMe.radiusSelect).toHaveValue('10');

    // Step 10: Click "Near Me"; Step 11: click "Use my location"
    const response10 = await nearMe.searchNearMe(10);

    // Step 12: Chip shows "Within 10 mi" and the count is smaller than the unfiltered count
    await expect(nearMe.chip).toHaveText(/Within 10 mi/);
    const count10 = await nearMe.readCount();
    expect(count10).toBeLessThan(baseline);
    const ids10 = await idsFrom(response10);

    // Expected: 3 mi < 5 mi < 10 mi, and each result set is a subset of the next larger one
    expect(count3).toBeLessThan(count5);
    expect(count5).toBeLessThan(count10);
    for (const id of ids3) {
      expect(ids5.has(id)).toBe(true);
    }
    for (const id of ids5) {
      expect(ids10.has(id)).toBe(true);
    }

    // Step 13: Click the X on the distance chip ("Clear Near Me")
    await nearMe.clearNearMe();

    // Expected: the chip disappears and all restaurants are shown again, regardless of distance
    await expect(nearMe.chip).toHaveCount(0);
    expect(await nearMe.readCount()).toBe(baseline);
  });
});
