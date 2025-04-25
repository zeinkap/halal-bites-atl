import { test, expect } from "@playwright/test";
import { TEST_RESTAURANTS } from "./utils/test-data";
import {
  fillRestaurantForm,
  submitFormAndWaitForResponse,
  waitForRestaurantInDB,
  verifyRestaurantDetails,
  deleteRestaurantsByNames,
  createRestaurantViaAPI,
} from "./utils/test-helpers";
import { Restaurant } from "@prisma/client";

test.describe("Restaurant Management", () => {
  // Global test cleanup
  test.afterEach(async ({ request }) => {
    await deleteRestaurantsByNames(request, [
      TEST_RESTAURANTS.BASIC.name,
      TEST_RESTAURANTS.DUPLICATE.name,
    ]);
  });

  // Setup for each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should allow adding a new restaurant with all details", async ({
    page,
    request,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    const form = page.locator("#restaurant-form");
    await expect(form).toBeVisible();

    // Fill and submit the form
    await fillRestaurantForm(page, TEST_RESTAURANTS.BASIC);

    // Check halal verification checkbox
    const verificationCheckbox = page.locator(
      '[data-testid="halal-verification-checkbox"]'
    );
    await verificationCheckbox.check();

    // Verify submit button is enabled
    const submitButton = page.locator(
      '[data-testid="submit-restaurant-button"]'
    );
    await expect(submitButton).toBeEnabled();

    // Submit form and wait for response
    const [response] = await submitFormAndWaitForResponse(page);

    // Verify successful submission
    expect(response.ok()).toBeTruthy();
    if (!response.ok()) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create restaurant: ${
          errorData.error || response.statusText()
        }`
      );
    }

    // Wait for any modals to close and UI to update
    await page.waitForLoadState('networkidle');
    
    // If there's a success modal, wait for it to disappear
    const successModal = page.locator('[data-testid="success-modal"]');
    if (await successModal.isVisible()) {
      await successModal.waitFor({ state: 'hidden' });
    }

    // Verify restaurant in database
    const savedRestaurant = await waitForRestaurantInDB(
      request,
      TEST_RESTAURANTS.BASIC.name
    );
    expect(savedRestaurant).toBeDefined();

    // Verify restaurant details in UI
    await verifyRestaurantDetails(page, savedRestaurant.id, {
      name: TEST_RESTAURANTS.BASIC.name,
      cuisine: TEST_RESTAURANTS.BASIC.cuisineType,
      priceRange: TEST_RESTAURANTS.BASIC.priceRange,
      address: TEST_RESTAURANTS.BASIC.address,
    });
  });

  test("should prevent duplicate restaurant names", async ({
    page,
    request,
  }) => {
    // Create first restaurant via API
    const firstRestaurant = await createRestaurantViaAPI(
      request,
      TEST_RESTAURANTS.DUPLICATE
    );
    expect(firstRestaurant).toBeDefined();

    // Verify first restaurant was created
    const savedRestaurant = await waitForRestaurantInDB(
      request,
      TEST_RESTAURANTS.DUPLICATE.name
    );
    expect(savedRestaurant).toBeDefined();

    // Try to add duplicate through UI
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    await fillRestaurantForm(page, TEST_RESTAURANTS.DUPLICATE);

    const verificationCheckbox = page.locator(
      '[data-testid="halal-verification-checkbox"]'
    );
    await verificationCheckbox.check();

    const [response] = await submitFormAndWaitForResponse(page);
    expect(response.ok()).toBeFalsy();

    // Verify error response
    const errorData = await response.json();
    expect(errorData.error).toBeDefined();
    expect(errorData.error).toContain("Failed to create restaurant");

    // Verify only one instance exists
    const getResponse = await request.get("/api/restaurants");
    const restaurants = (await getResponse.json()) as Restaurant[];
    const duplicates = restaurants.filter(
      (r) => r.name === TEST_RESTAURANTS.DUPLICATE.name
    );
    expect(duplicates).toHaveLength(1);
  });
});
