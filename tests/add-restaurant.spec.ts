import { test, expect, type Page } from '@playwright/test';

test.describe('Add Restaurant Feature', () => {
  test('should add a new restaurant successfully', async ({ page, request }: { page: Page, request: any }) => {
    // Navigate to the home page
    await page.goto('/');

    // Click the "Add Restaurant" button
    await page.click('text=Add Restaurant');

    const testRestaurantName = 'Test Restaurant';

    // Fill out the restaurant form
    await page.fill('[data-testid="restaurant-name-input"]', testRestaurantName);
    await page.selectOption('[data-testid="restaurant-cuisine-select"]', 'MIDDLE_EASTERN');
    await page.selectOption('[data-testid="restaurant-price-select"]', '$$');
    await page.fill('[data-testid="restaurant-address-input"]', '123 Test Street, Atlanta, GA 30303');
    
    // Set additional features
    await page.click('[data-testid="restaurant-prayer-room-checkbox"]');
    await page.click('[data-testid="restaurant-zabiha-checkbox"]');
    await page.click('[data-testid="restaurant-outdoor-seating-checkbox"]');
    await page.click('[data-testid="restaurant-high-chair-checkbox"]');

    // Submit the form
    await page.click('[data-testid="submit-restaurant-button"]');

    // Wait for the success message with retry for up to 10 seconds
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 10000 });

    // Verify the new restaurant appears in the list
    await expect(page.locator(`text=${testRestaurantName}`)).toBeVisible();
    await expect(page.locator('text=123 Test Street')).toBeVisible();
    await expect(page.locator('text=Middle Eastern')).toBeVisible();
    await expect(page.locator('text=Prayer Room ✓')).toBeVisible();
    await expect(page.locator('text=Outdoor Seating ✓')).toBeVisible();
    await expect(page.locator('text=High Chairs ✓')).toBeVisible();
    await expect(page.locator('text=Zabiha ✓')).toBeVisible();

    // Get the restaurant ID from the card's data attribute
    const restaurantId = await page.locator(`h3[data-restaurant-id]:has-text("${testRestaurantName}")`).getAttribute('data-restaurant-id');

    // Cleanup: Delete the test restaurant via API
    const deleteResponse = await request.delete(`/api/restaurants?id=${restaurantId}`);
    expect(deleteResponse.ok()).toBeTruthy();
    
    // Verify restaurant is removed by searching for it
    await page.fill('[data-testid="search-input"]', testRestaurantName);
    await expect(page.locator('text=No restaurants found matching your criteria')).toBeVisible();
  });

  test('should handle duplicate restaurant names', async ({ page, request }: { page: Page, request: any }) => {
    // Navigate to the home page
    await page.goto('/');

    const duplicateRestaurantName = 'Duplicate Restaurant';

    // Add first restaurant
    await page.click('text=Add Restaurant');
    await page.fill('[data-testid="restaurant-name-input"]', duplicateRestaurantName);
    await page.selectOption('[data-testid="restaurant-cuisine-select"]', 'MIDDLE_EASTERN');
    await page.selectOption('[data-testid="restaurant-price-select"]', '$$');
    await page.fill('[data-testid="restaurant-address-input"]', '123 Test Street, Atlanta, GA 30303');

    // Submit the form
    await page.click('[data-testid="submit-restaurant-button"]');
    
    // Wait for success and try to add duplicate
    await expect(page.locator('.Toastify__toast--success')).toBeVisible({ timeout: 10000 });
    
    // Try to add second restaurant with same name
    await page.click('text=Add Restaurant');
    await page.fill('[data-testid="restaurant-name-input"]', duplicateRestaurantName);
    await page.selectOption('[data-testid="restaurant-cuisine-select"]', 'MIDDLE_EASTERN');
    await page.selectOption('[data-testid="restaurant-price-select"]', '$$');
    await page.fill('[data-testid="restaurant-address-input"]', '123 Test Street, Atlanta, GA 30303');

    // Submit the form
    await page.click('[data-testid="submit-restaurant-button"]');
    
    // Verify error message with retry
    await expect(page.locator('.Toastify__toast--error')).toBeVisible({ timeout: 10000 });

    // Cleanup: Delete the test restaurant via API
    const restaurantId = await page.locator(`h3[data-restaurant-id]:has-text("${duplicateRestaurantName}")`).getAttribute('data-restaurant-id');
    const deleteResponse = await request.delete(`/api/restaurants?id=${restaurantId}`);
    expect(deleteResponse.ok()).toBeTruthy();

    // Verify restaurant is removed by searching for it
    await page.fill('[data-testid="search-input"]', duplicateRestaurantName);
    await expect(page.locator('text=No restaurants found matching your criteria')).toBeVisible();
  });
}); 