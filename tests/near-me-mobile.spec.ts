import { test, expect } from '@playwright/test';
import { NearMePage } from './pages/near-me.page';
import { RestaurantListPage } from './pages/restaurant-list.page';

const MIDTOWN_ATLANTA = { latitude: 33.749, longitude: -84.388 };
const MI_TO_KM = 1.60934;
const distanceBadge = '[data-testid^="restaurant-distance-"]';

// Mobile viewport so the Near-Me-first layout (sm:hidden) renders. Read-only: relies on the
// seeded restaurants with lat/lng around Midtown Atlanta, so there is no data setup or cleanup.
test.describe('Near Me mobile home page', () => {
  test.use({ viewport: { width: 390, height: 844 }, geolocation: MIDTOWN_ATLANTA });

  test('TC-NEARME-MOBILE-001: Near-Me hero defaults to 5 mi, filters by distance, and shows distance badges', { tag: '@orchestrated' }, async ({ page, context }) => {
    const list = new RestaurantListPage(page);
    const nearMe = new NearMePage(page);

    // Step 1: Open the home page; the primary CTA is the Near Me button, distance defaults to 5 mi
    await list.goto();
    await list.waitForResults();
    await expect(nearMe.nearMeButton).toHaveText(/near me/i);
    await expect(nearMe.radiusOption('5')).toHaveAttribute('aria-pressed', 'true');
    await expect(nearMe.chip).toHaveCount(0);

    // Permission is granted only now so the on-load auto Near Me does not run before this point.
    await context.grantPermissions(['geolocation']);

    // Step 2: Tap Near Me and confirm -> results are filtered to within 5 miles
    const response5 = await nearMe.searchNearMe(5);
    expect(response5.ok()).toBeTruthy();
    await expect(nearMe.chip).toHaveText(/Within 5 mi/);

    // Step 3: Nearby result cards show a distance badge ("X mi away")
    await expect(page.locator(distanceBadge).first()).toBeVisible();
    await expect(page.locator(distanceBadge).first()).toHaveText(/mi away/);

    // Step 4: Changing the distance pill to 10 mi re-filters around the same location
    const response10Promise = page.waitForResponse((res) => {
      const url = new URL(res.url());
      const radius = parseFloat(url.searchParams.get('radius') ?? '');
      return (
        url.pathname === '/api/restaurants' &&
        url.searchParams.has('lat') &&
        Math.abs(radius - 10 * MI_TO_KM) < 0.05
      );
    });
    await nearMe.radiusOption('10').click();
    await response10Promise;
    await expect(nearMe.chip).toHaveText(/Within 10 mi/);
  });

  test('TC-NEARME-MOBILE-002: City/ZIP fallback shows restaurants near a typed ZIP without device location', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);
    const nearMe = new NearMePage(page);

    // Deterministic geocode so the test does not depend on the external geocoding service.
    await page.route('**/api/geocode**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ lat: MIDTOWN_ATLANTA.latitude, lng: MIDTOWN_ATLANTA.longitude, label: 'Atlanta, GA 30303' }),
      });
    });

    // Step 1: Open the home page (no geolocation permission granted)
    await list.goto();
    await list.waitForResults();

    // Step 2: Reveal and use the city/ZIP fallback
    await nearMe.cityZipToggle.click();
    await expect(nearMe.cityZipInput).toBeVisible();
    await nearMe.cityZipInput.fill('30303');

    const proximityResponsePromise = page.waitForResponse((res) => {
      const url = new URL(res.url());
      return url.pathname === '/api/restaurants' && url.searchParams.has('lat');
    });
    await nearMe.cityZipSearchButton.click();
    const proximityResponse = await proximityResponsePromise;
    expect(proximityResponse.ok()).toBeTruthy();

    // Step 3: Results are shown as Near Me (within 5 mi of the geocoded ZIP) with distance badges
    await expect(nearMe.chip).toHaveText(/Within 5 mi/);
    await expect(page.locator(distanceBadge).first()).toBeVisible();
  });
});
