import { type Locator, type Page } from '@playwright/test';

/**
 * The restaurant map (RestaurantMapView). On phones it is full-screen above the bottom bar, with a
 * strip of the restaurants in view instead of popups.
 */
export class MapViewPage {
  readonly page: Page;
  readonly map: Locator;
  readonly markers: Locator;
  /** "You are here" (data-source="device") or a searched city/ZIP (data-source="place"). */
  readonly searchCenter: Locator;
  readonly locateButton: Locator;
  readonly strip: Locator;
  readonly stripItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.map = page.locator('[data-testid="restaurant-map"]');
    this.markers = page.locator('[data-testid^="map-marker-"]');
    this.searchCenter = page.locator('[data-testid="map-search-center"]');
    this.locateButton = page.locator('[data-testid="map-locate-button"]');
    this.strip = page.locator('[data-testid="map-strip"]');
    this.stripItems = page.locator('[data-testid^="map-strip-item-"]');
  }

  /**
   * Skips OpenStreetMap tile downloads: markers and controls don't need them, and it keeps the
   * test independent of the tile servers. Call before the map opens.
   */
  async blockTiles(): Promise<void> {
    await this.page.route('**/*.tile.openstreetmap.org/**', (route) => route.abort());
  }

  marker(restaurantId: string): Locator {
    return this.page.locator(`[data-testid="map-marker-${restaurantId}"]`);
  }

  stripItem(restaurantId: string): Locator {
    return this.page.locator(`[data-testid="map-strip-item-${restaurantId}"]`);
  }

  stripDirections(restaurantId: string): Locator {
    return this.page.locator(`[data-testid="map-strip-directions-${restaurantId}"]`);
  }

  /** Restaurant id of a strip card, read from its test id. */
  async stripItemId(index: number): Promise<string> {
    const testId = (await this.stripItems.nth(index).getAttribute('data-testid')) ?? '';
    return testId.replace('map-strip-item-', '');
  }

  /**
   * Taps a restaurant's pin. Dispatched on the pin itself rather than clicked at its position,
   * because neighbouring pins can overlap it.
   */
  async tapMarker(restaurantId: string): Promise<void> {
    await this.marker(restaurantId).dispatchEvent('click');
  }
}
