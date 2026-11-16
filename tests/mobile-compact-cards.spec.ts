import { test, expect } from '@playwright/test';
import { RestaurantListPage } from './pages/restaurant-list.page';

const VIEWPORT = { width: 390, height: 844 };
/** A collapsed single-restaurant card on a phone; the old full-width-image card was 400-490px. */
const MAX_COMPACT_CARD_HEIGHT = 260;

// Phone viewport for the compact card layout. Read-only: uses the seeded restaurants.
test.describe('Mobile compact restaurant cards', () => {
  test.use({ viewport: VIEWPORT });

  test('TC-MOBILE-CARD-001: Cards are compact with Directions in reach, and More reveals the details', { tag: '@orchestrated' }, async ({ page }) => {
    const list = new RestaurantListPage(page);

    // Step 1: Open the home page; the first result starts on the first screen
    await list.goto();
    await list.waitForResults();
    const firstBox = await list.resultCards.first().boundingBox();
    expect(firstBox).not.toBeNull();
    expect(firstBox!.y).toBeLessThan(VIEWPORT.height);

    // Step 2: Find a single-restaurant card (brand cards have no More button) and check it is compact
    const expand = page.locator('[data-testid^="restaurant-expand-"]').first();
    await expect(expand).toBeVisible();
    const id = ((await expand.getAttribute('data-testid')) ?? '').replace('restaurant-expand-', '');
    const card = page.locator(`[data-testid="restaurant-card-${id}"]`);
    const cardBox = await card.boundingBox();
    expect(cardBox!.height).toBeLessThan(MAX_COMPACT_CARD_HEIGHT);

    // Step 3: Directions is fully on screen; the address is tucked away until More is tapped
    const directions = page.locator(`[data-testid="restaurant-directions-${id}"]`);
    await expect(directions).toBeVisible();
    const dirBox = await directions.boundingBox();
    expect(dirBox!.x + dirBox!.width).toBeLessThanOrEqual(VIEWPORT.width);
    await expect(directions).toHaveAttribute('href', /google\.com\/maps\/dir/);
    const address = page.locator(`[data-testid="restaurant-address-${id}"]`);
    await expect(address).toBeHidden();
    await expect(expand).toHaveAttribute('aria-expanded', 'false');

    // Step 4: More -> the address and details show; Less hides them again
    await expand.click();
    await expect(expand).toHaveAttribute('aria-expanded', 'true');
    await expect(address).toBeVisible();
    await expand.click();
    await expect(address).toBeHidden();
  });
});
