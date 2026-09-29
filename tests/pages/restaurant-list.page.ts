import { expect, type Locator, type Page } from '@playwright/test';

const INITIAL_LOAD_TIMEOUT_MS = 30_000;

/**
 * Homepage restaurant list (RestaurantList) with its search bar.
 * The search input exists in both desktop and mobile layouts, so it is scoped to the visible one.
 */
export class RestaurantListPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly resultCards: Locator;
  readonly clearSearchButton: Locator;
  readonly noResults: Locator;
  readonly loadingSection: Locator;
  readonly hasMoreSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('[data-testid="search-input"]:visible');
    this.resultCards = page.locator('[data-testid^="restaurant-list-item-"]');
    this.clearSearchButton = page.locator('[data-testid="search-clear-button"]:visible');
    this.noResults = page.locator('[data-testid="restaurant-list-no-results"]');
    this.loadingSection =page.locator('[data-testid="restaurant-list-loading-section"]');
    this.hasMoreSpinner = page.locator('[data-testid="restaurant-list-has-more-spinner"]');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Waits for the initial /api/restaurants fetch to finish and the first cards to render.
   * Uses a long timeout because a cold dev server can take well over the default 5s.
   */
  async waitForResults(): Promise<void> {
    await expect(this.resultCards.first()).toBeVisible({ timeout: INITIAL_LOAD_TIMEOUT_MS });
  }

  /**
   * Scrolls until every page of the current results is rendered (the list paginates and loads
   * the next page when the spinner scrolls into view), so assertions over resultCards cover the
   * whole result set, not just the first page.
   */
  async loadAllResults(): Promise<void> {
    while ((await this.hasMoreSpinner.count()) > 0) {
      const before = await this.resultCards.count();
      await this.hasMoreSpinner.scrollIntoViewIfNeeded();
      await expect.poll(() => this.resultCards.count()).toBeGreaterThan(before);
    }
  }

  /** Result cards whose text contains the given text (case-insensitive when a RegExp is passed). */
  cardsWithText(text: string | RegExp): Locator {
    return this.resultCards.filter({ hasText: text });
  }

  /** Result cards whose text does not contain the given text. */
  cardsWithoutText(text: string | RegExp): Locator {
    return this.resultCards.filter({ hasNotText: text });
  }
}
