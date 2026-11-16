import { type Locator, type Page } from '@playwright/test';

/**
 * The phone-only bottom bar on the home page (MobileBottomBar, below the `sm` breakpoint) and the
 * filters bottom sheet it opens. Only rendered visibly at a mobile viewport.
 */
export class MobileBottomBarPage {
  readonly page: Page;
  readonly root: Locator;
  readonly nearMeButton: Locator;
  readonly viewToggle: Locator;
  readonly filtersButton: Locator;
  readonly filterCount: Locator;
  readonly addButton: Locator;
  /** The filters bottom sheet (shares the "filters-panel" test id with the desktop inline panel). */
  readonly filtersSheet: Locator;
  readonly sheetApplyButton: Locator;
  readonly sheetCloseButton: Locator;
  /** The floating + button, which the bar replaces on the home page on phones. */
  readonly floatingAddButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.locator('[data-testid="mobile-bottom-bar"]');
    this.nearMeButton = page.locator('[data-testid="bottom-bar-near-me"]');
    this.viewToggle = page.locator('[data-testid="bottom-bar-view-toggle"]');
    this.filtersButton = page.locator('[data-testid="filters-button-mobile"]');
    this.filterCount = page.locator('[data-testid="bottom-bar-filter-count"]');
    this.addButton = page.locator('[data-testid="bottom-bar-add-restaurant"]');
    this.filtersSheet = page.locator('[data-testid="filters-panel"]');
    this.sheetApplyButton = page.locator('[data-testid="filters-sheet-apply"]');
    this.sheetCloseButton = page.locator('[data-testid="bottom-sheet-close"]');
    this.floatingAddButton = page.locator('[data-testid="add-restaurant-floating-button"]');
  }

  /** Switches between list and map with the bar's Map/List button. */
  async toggleView(): Promise<void> {
    await this.viewToggle.click();
  }
}
