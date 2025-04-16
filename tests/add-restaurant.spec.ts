import { test, expect, type Page } from '@playwright/test';
import { RESTAURANT_ERRORS } from '@/constants/errors';
import { CuisineType, PriceRange } from '@prisma/client';

// Test data
const TEST_RESTAURANTS = {
  BASIC: {
    name: 'Test Restaurant',
    cuisine: CuisineType.MIDDLE_EASTERN,
    priceRange: '$$' as const,
    address: '123 Test Street, Atlanta, GA 30303',
    description: 'A test restaurant description',
    features: {
      hasPrayerRoom: true,
      hasOutdoorSeating: true,
      isZabiha: true,
      hasHighChair: true
    }
  },
  DUPLICATE: {
    name: 'Duplicate Restaurant',
    cuisine: CuisineType.MIDDLE_EASTERN,
    priceRange: '$$' as const,
    address: '123 Test Street, Atlanta, GA 30303',
    description: '',
    features: {
      hasPrayerRoom: false,
      hasOutdoorSeating: false,
      isZabiha: false,
      hasHighChair: false
    }
  }
} as const;

test.describe('Add Restaurant Feature', () => {
  // Helper function to wait for restaurant to appear in database
  async function waitForRestaurantInDB(request: any, name: string, maxAttempts = 5): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await request.get('/api/restaurants');
      const restaurants = await response.json();
      const restaurant = restaurants.find((r: any) => r.name === name);
      if (restaurant) {
        return restaurant;
      }
      // Wait 1 second between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`Restaurant "${name}" not found in database after ${maxAttempts} attempts`);
  }

  // Helper function to fill restaurant form
  async function fillRestaurantForm(page: Page, data: typeof TEST_RESTAURANTS[keyof typeof TEST_RESTAURANTS]) {
    await page.fill('[data-testid="restaurant-name-input"]', data.name);
    await page.waitForTimeout(100);
    
    await page.selectOption('[data-testid="restaurant-cuisine-select"]', data.cuisine);
    await page.waitForTimeout(100);
    
    await page.selectOption('[data-testid="restaurant-price-select"]', data.priceRange);
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="restaurant-address-input"]', data.address);
    await page.waitForTimeout(100);

    // Fill description if provided
    if (data.description) {
      await page.fill('[data-testid="restaurant-description-input"]', data.description);
      await page.waitForTimeout(100);
    }

    // Set features
    if (data.features.hasPrayerRoom) {
      await page.click('[data-testid="restaurant-prayer-room-checkbox"]');
      await page.waitForTimeout(100);
    }
    
    if (data.features.isZabiha) {
      await page.click('[data-testid="restaurant-zabiha-checkbox"]');
      await page.waitForTimeout(100);
    }
    
    if (data.features.hasOutdoorSeating) {
      await page.click('[data-testid="restaurant-outdoor-seating-checkbox"]');
      await page.waitForTimeout(100);
    }
    
    if (data.features.hasHighChair) {
      await page.click('[data-testid="restaurant-high-chair-checkbox"]');
      await page.waitForTimeout(100);
    }
  }

  // Helper function to submit form and wait for response
  async function submitFormAndWaitForResponse(page: Page) {
    return Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/restaurants') && 
        response.request().method() === 'POST'
      ),
      page.click('[data-testid="submit-restaurant-button"]')
    ]);
  }

  // Helper function to verify restaurant details in UI
  async function verifyRestaurantDetails(page: Page, restaurantId: string, details: { [key: string]: string }) {
    for (const [key, expectedText] of Object.entries(details)) {
      const selector = `[data-testid="restaurant-${key}-${restaurantId}"]`;
      try {
        await expect(page.locator(selector)).toContainText(expectedText, { timeout: 5000 });
        console.log(`✓ Verified ${key}: ${expectedText}`);
      } catch (error) {
        console.error(`Failed to verify ${key}. Expected: ${expectedText}`);
        throw error;
      }
    }
  }

  // Helper function to delete restaurants by name
  async function deleteRestaurantsByNames(request: any, names: string[]) {
    console.log('Deleting restaurants:', names.join(', '));
    
    try {
      // Get all restaurants
      const response = await request.get('/api/restaurants');
      if (!response.ok()) {
        throw new Error(`Failed to fetch restaurants: ${response.statusText()}`);
      }
      const restaurants = await response.json();
      
      // Find and delete test restaurants by name
      for (const name of names) {
        try {
          const restaurant = restaurants.find((r: any) => r.name === name);
          if (restaurant) {
            console.log(`Found restaurant "${name}" with ID ${restaurant.id}`);
            const deleteResponse = await request.delete(`/api/restaurants?id=${restaurant.id}`);
            
            if (deleteResponse.ok()) {
              console.log(`✓ Successfully deleted restaurant "${name}"`);
            } else {
              const errorData = await deleteResponse.json();
              console.error(
                `Failed to delete restaurant "${name}":`,
                `Status: ${deleteResponse.status()}`,
                `Error: ${errorData.error || deleteResponse.statusText()}`
              );
            }
          } else {
            console.log(`No restaurant found with name "${name}" - skipping deletion`);
          }
        } catch (error) {
          // Log error but continue with other restaurants
          console.error(`Error while processing restaurant "${name}":`, error);
        }
      }
    } catch (error) {
      console.error('Failed to fetch restaurants for cleanup:', error);
    }
  }

  // Track restaurants added during tests for cleanup
  let testRestaurantIds: string[] = [];

  test.beforeEach(async ({ request }) => {
    console.log('\nPreparing test environment...');
    // Clean up any existing test restaurants before running tests
    await deleteRestaurantsByNames(request, Object.values(TEST_RESTAURANTS).map(r => r.name));
    console.log('Test environment ready.\n');
  });

  test.afterEach(async ({ page, request }) => {
    console.log('\nStarting cleanup...');
    // Clean up test restaurants after tests
    await deleteRestaurantsByNames(request, Object.values(TEST_RESTAURANTS).map(r => r.name));
    // Reset the array for the next test
    testRestaurantIds = [];
    console.log('Cleanup completed.\n');
  });

  test('should add a new restaurant successfully', async ({ page, request }) => {
    // Navigate to the home page and wait for it to be ready
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click the "Add Restaurant" button and wait for form to be fully visible
    await page.click('[data-testid="add-restaurant-button"]');
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeEnabled();

    // Fill out the restaurant form
    await fillRestaurantForm(page, TEST_RESTAURANTS.BASIC);

    // Submit form and wait for request to complete
    await submitFormAndWaitForResponse(page);

    // Wait for and verify the restaurant in the database
    const addedRestaurant = await waitForRestaurantInDB(request, TEST_RESTAURANTS.BASIC.name);
    expect(addedRestaurant.name, 'Restaurant name should match').toBe(TEST_RESTAURANTS.BASIC.name);
    expect(addedRestaurant.cuisine, 'Cuisine should match').toBe(TEST_RESTAURANTS.BASIC.cuisine);
    expect(addedRestaurant.priceRange, 'Price range should match').toBe(PriceRange.MEDIUM);
    expect(addedRestaurant.hasPrayerRoom, 'Prayer room should be enabled').toBe(TEST_RESTAURANTS.BASIC.features.hasPrayerRoom);
    expect(addedRestaurant.hasOutdoorSeating, 'Outdoor seating should be enabled').toBe(TEST_RESTAURANTS.BASIC.features.hasOutdoorSeating);
    expect(addedRestaurant.isZabiha, 'Zabiha should be enabled').toBe(TEST_RESTAURANTS.BASIC.features.isZabiha);
    expect(addedRestaurant.hasHighChair, 'High chair should be enabled').toBe(TEST_RESTAURANTS.BASIC.features.hasHighChair);

    // Store ID for cleanup
    testRestaurantIds.push(addedRestaurant.id);
    console.log(`✓ Added restaurant "${TEST_RESTAURANTS.BASIC.name}" with ID ${addedRestaurant.id} to cleanup list`);

    // Verify UI updates
    await page.waitForLoadState('networkidle');
    await page.fill('[data-testid="search-input"]', TEST_RESTAURANTS.BASIC.name);
    
    // Wait for and verify restaurant card
    const restaurantCard = page.locator(`[data-testid="restaurant-name-${TEST_RESTAURANTS.BASIC.name}"]`).first();
    await expect(restaurantCard).toBeVisible({ timeout: 10000 });
    
    // Verify all restaurant details in UI with increased timeout
    await verifyRestaurantDetails(page, addedRestaurant.id, {
      'address': '123 Test Street',
      'cuisine': 'Middle Eastern',
      'prayer-room': 'Prayer Room ✓',
      'outdoor-seating': 'Outdoor Seating ✓',
      'high-chair': 'High Chairs ✓',
      'zabiha': 'Zabiha ✓'
    });

    console.log('✓ All UI checks passed');
  });

  test('should handle duplicate restaurant names', async ({ page, request }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Add first restaurant
    await page.click('[data-testid="add-restaurant-button"]');
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeEnabled();
    
    await fillRestaurantForm(page, TEST_RESTAURANTS.DUPLICATE);
    await submitFormAndWaitForResponse(page);

    // Wait for and verify first restaurant in database
    const firstRestaurant = await waitForRestaurantInDB(request, TEST_RESTAURANTS.DUPLICATE.name);
    testRestaurantIds.push(firstRestaurant.id);
    console.log(`✓ Added first restaurant "${TEST_RESTAURANTS.DUPLICATE.name}" with ID ${firstRestaurant.id} to cleanup list`);

    // Try to add second restaurant with same name
    await page.click('[data-testid="add-restaurant-button"]');
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="restaurant-name-input"]')).toBeEnabled();
    
    await fillRestaurantForm(page, TEST_RESTAURANTS.DUPLICATE);
    await submitFormAndWaitForResponse(page);

    // Verify error message in form
    await expect(page.locator('[data-testid="form-error-message"]'))
      .toContainText(RESTAURANT_ERRORS.DUPLICATE_NAME, { timeout: 5000 });
    console.log('✓ Error message displayed for duplicate restaurant');

    // Verify only one instance exists in database
    const response = await request.get('/api/restaurants');
    const restaurants = await response.json();
    const duplicateRestaurants = restaurants.filter((r: any) => r.name === TEST_RESTAURANTS.DUPLICATE.name);
    expect(duplicateRestaurants.length, 'Should only have one instance of the restaurant').toBe(1);
    console.log('✓ Verified only one instance exists in database');
  });
});