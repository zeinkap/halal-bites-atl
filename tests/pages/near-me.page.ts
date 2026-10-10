import { expect, type Locator, type Page, type Response } from '@playwright/test';

const RESULTS_TIMEOUT_MS = 30_000;

/**
 * Near Me / Distance controls of the restaurant search bar and the results count.
 * radius-select, location-search-button, near-me-chip and clear-near-me-button exist in both the
 * desktop and mobile layouts, so each is scoped to the visible one.
 */
export class NearMePage {
  readonly page: Page;
  readonly radiusSelect: Locator;
  readonly nearMeButton: Locator;
  readonly confirmUseButton: Locator;
  readonly chip: Locator;
  readonly clearButton: Locator;
  readonly resultsCount: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.radiusSelect = page.locator('[data-testid="radius-select"]:visible');
    this.nearMeButton = page.locator('[data-testid="location-search-button"]:visible');
    this.confirmUseButton = page.locator('[data-testid="location-confirm-use"]');
    this.chip = page.locator('[data-testid="near-me-chip"]:visible');
    this.clearButton = page.locator('[data-testid="clear-near-me-button"]:visible');
    this.resultsCount = page.locator('[data-testid="restaurant-list-results-count"]');
    this.loadingSpinner = page.locator('[data-testid="restaurant-list-loading-spinner"]');
  }

  /** Waits until loading finishes and returns the number shown in the results count. */
  async readCount(): Promise<number> {
    await expect(this.loadingSpinner).toHaveCount(0, { timeout: RESULTS_TIMEOUT_MS });
    await expect(this.resultsCount).toHaveText(/^\s*\d+\s+restaurants?\s*$/, { timeout: RESULTS_TIMEOUT_MS });
    const text = (await this.resultsCount.textContent()) ?? '';
    return parseInt(text.trim(), 10);
  }

  /** Chooses a distance option by its value ("3", "5", "10", "all"). */
  async selectRadius(value: string): Promise<void> {
    await this.radiusSelect.selectOption(value);
  }

  /**
   * Clicks Near Me, confirms "Use my location" and returns the resulting /api/restaurants
   * response for that radius in miles.
   */
  async searchNearMe(radiusMiles: number): Promise<Response> {
    const radiusKm = radiusMiles * 1.60934;
    await this.nearMeButton.click();
    await expect(this.confirmUseButton).toBeVisible();
    const responsePromise = this.page.waitForResponse(
      (res) => {
        const url = new URL(res.url());
        const radius = parseFloat(url.searchParams.get('radius') ?? '');
        return (
          url.pathname === '/api/restaurants' &&
          url.searchParams.has('lat') &&
          Math.abs(radius - radiusKm) < 0.05
        );
      },
      { timeout: RESULTS_TIMEOUT_MS },
    );
    await this.confirmUseButton.click();
    return responsePromise;
  }

  /** Clicks the X on the chip and returns the unfiltered /api/restaurants response. */
  async clearNearMe(): Promise<Response> {
    const responsePromise = this.page.waitForResponse(
      (res) => new URL(res.url()).pathname === '/api/restaurants' && new URL(res.url()).search === '',
      { timeout: RESULTS_TIMEOUT_MS },
    );
    await this.clearButton.click();
    return responsePromise;
  }
}
