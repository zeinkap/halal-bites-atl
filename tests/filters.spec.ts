import { test, expect } from '@playwright/test';
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

  test('Donate button in navbar exists and opens widget', async ({ page }) => {
    const donateButton = page.locator('[data-testid="donate-navbar-button"]');
    await expect(donateButton).toBeVisible();
    await donateButton.click();
    // Check for the donation modal
    const donationModal = page.locator('[data-testid="donation-modal"]');
    await expect(donationModal).toBeVisible();
    // Check for the Buy Me a Coffee widget (iframe)
    const widget = page.locator('[data-testid="donation-widget-iframe"]');
    await expect(widget).toBeVisible();
    // Check that the modal contains the correct text
    await expect(donationModal).toContainText('Support Halal Bites ATL');
  });
}); 