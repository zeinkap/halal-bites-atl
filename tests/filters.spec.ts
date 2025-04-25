import { test } from '@playwright/test';
import { 
  openFiltersPanel,
  verifyCuisineFilterOptions,
  verifyPriceFilterOptions,
  applyFiltersAndVerifyResults
} from './utils/test-helpers';

test.describe('Restaurant Filters', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('cuisine filter should display properly formatted names', async ({ page }) => {
    await openFiltersPanel(page);
    await verifyCuisineFilterOptions(page);
  });

  test('price range filter should display options in correct order', async ({ page }) => {
    await openFiltersPanel(page);
    await verifyPriceFilterOptions(page);
  });

  test('filters should work together correctly', async ({ page }) => {
    await openFiltersPanel(page);
    await applyFiltersAndVerifyResults(
      page,
      'MIDDLE_EASTERN',
      'LOW',
      'Al Madina Grocery & Restaurant'
    );
  });
}); 