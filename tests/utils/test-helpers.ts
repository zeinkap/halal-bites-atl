import { APIRequestContext, Page, expect } from '@playwright/test';
import { Restaurant, Comment } from '@prisma/client';
import { TEST_RESTAURANTS, TEST_COMMENTS, TestRestaurant } from './test-data';

/**
 * Formats a cuisine type string from the database format to display format
 * Example: "MIDDLE_EASTERN" becomes "Middle Eastern"
 * 
 * @param cuisine - The cuisine type string in database format
 * @returns The formatted cuisine string for display
 */
const formatCuisine = (cuisine: string) => {
  return cuisine.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
};

/**
 * Formats a price range enum value to a display string
 * Converts database price range values to user-friendly symbols
 * 
 * @param priceRange - The price range enum value
 * @returns The formatted price range symbol ($, $$, or $$$)
 */
const formatPriceRange = (priceRange: string) => {
  switch (priceRange) {
    case 'LOW': return '$';
    case 'MEDIUM': return '$$';
    case 'HIGH': return '$$$';
    default: return priceRange;
  }
};

/**
 * Waits for a restaurant to appear in the database by polling the API
 * Useful for ensuring restaurant data is persisted before proceeding with tests
 * 
 * @param request - Playwright's API request context
 * @param name - The name of the restaurant to wait for
 * @param maxAttempts - Maximum number of polling attempts (default: 5)
 * @returns The restaurant object if found
 * @throws Error if restaurant is not found after max attempts
 */
export async function waitForRestaurantInDB(
  request: APIRequestContext, 
  name: string, 
  maxAttempts = 5
): Promise<Restaurant> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await request.get('/api/restaurants');
    const restaurants = await response.json() as Restaurant[];
    const restaurant = restaurants.find((r) => r.name === name);
    if (restaurant) {
      return restaurant;
    }
    // Wait 1 second between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Restaurant "${name}" not found in database after ${maxAttempts} attempts`);
}

/**
 * Fills out the restaurant form in the UI with provided test data
 * Handles all form fields including:
 * - Basic info (name, cuisine type, price range, address)
 * - Description (if provided)
 * - Feature checkboxes (prayer space, Zabihah, outdoor seating, etc.)
 * 
 * Waits for each field to be properly set before proceeding
 * 
 * @param page - Playwright's page object
 * @param data - Restaurant test data from TEST_RESTAURANTS
 */
export async function fillRestaurantForm(
  page: Page, 
  data: typeof TEST_RESTAURANTS[keyof typeof TEST_RESTAURANTS]
) {
  // Fill name and wait for it to be set
  const nameInput = page.locator('[data-testid="restaurant-name-input"]');
  await nameInput.fill(data.name);
  await expect(nameInput).toHaveValue(data.name);
  
  // Select cuisine type and wait for it to be set
  const cuisineSelect = page.locator('[data-testid="cuisine-type-select"]');
  await cuisineSelect.selectOption(data.cuisineType);
  await expect(cuisineSelect).toHaveValue(data.cuisineType);
  
  // Select price range and wait for it to be set
  const priceSelect = page.locator('[data-testid="price-range-select"]');
  await priceSelect.selectOption(data.priceRange);
  await expect(priceSelect).toHaveValue(data.priceRange);
  
  // Fill address and wait for it to be set
  const addressInput = page.locator('[data-testid="restaurant-address-input"]');
  await addressInput.fill(data.address);
  await expect(addressInput).toHaveValue(data.address);

  // Fill description if provided
  if (data.description) {
    const descriptionInput = page.locator('[data-testid="restaurant-description-input"]');
    await descriptionInput.fill(data.description);
    await expect(descriptionInput).toHaveValue(data.description);
  }

  // Set features
  if (data.features.hasPrayerRoom) {
    await page.locator('[data-testid="restaurant-prayer-room-checkbox"]').check();
  }
  
  if (data.features.isZabiha) {
    await page.locator('[data-testid="restaurant-zabiha-checkbox"]').check();
  }
  
  if (data.features.hasOutdoorSeating) {
    await page.locator('[data-testid="restaurant-outdoor-seating-checkbox"]').check();
  }
  
  if (data.features.hasHighChair) {
    await page.locator('[data-testid="restaurant-high-chair-checkbox"]').check();
  }

  if (data.features.servesAlcohol) {
    await page.locator('[data-testid="restaurant-alcohol-checkbox"]').check();
  }

  if (!data.features.isFullyHalal) {
    await page.locator('[data-testid="restaurant-fully-halal-checkbox"]').check();
  }
}

/**
 * Submits a form and waits for the API response
 * Ensures the form submission is complete before proceeding
 * 
 * @param page - Playwright's page object
 * @returns Promise that resolves when the form is submitted and response is received
 */
export async function submitFormAndWaitForResponse(page: Page) {
  return Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/restaurants') && 
      response.request().method() === 'POST'
    ),
    page.click('[data-testid="submit-restaurant-button"]')
  ]);
}

/**
 * Verifies restaurant details displayed in the UI match the expected data
 * Checks:
 * - Restaurant name
 * - Cuisine type (with proper formatting)
 * - Address
 * - Price range (if provided)
 * 
 * @param page - Playwright's page object
 * @param restaurantId - ID of the restaurant to verify
 * @param details - Expected restaurant details
 */
export async function verifyRestaurantDetails(
  page: Page, 
  restaurantId: string, 
  details: { [key: string]: string }
) {
  // Wait for any loading states to complete
  await page.waitForLoadState('networkidle');
  
  // First verify the restaurant exists in the list
  const restaurantsList = page.locator('[data-testid="restaurants-list"]');
  await expect(restaurantsList).toBeVisible();

  // Look for the restaurant by name instead of ID since it's more reliable
  const restaurantCard = page.locator(`[data-testid^="restaurant-name-"]`, {
    hasText: details.name
  });
  await expect(restaurantCard).toBeVisible();

  // Get the parent restaurant item
  const restaurantItem = restaurantCard.locator('xpath=ancestor::*[@data-testid^="restaurant-item-"]');
  await expect(restaurantItem).toBeVisible();

  // Now verify all the details
  const cuisineElement = restaurantItem.locator(`[data-testid^="restaurant-cuisine-"]`);
  const addressElement = restaurantItem.locator(`[data-testid^="restaurant-address-"]`);
  
  await expect(cuisineElement).toContainText(formatCuisine(details.cuisine));
  await expect(addressElement).toContainText(details.address);
  
  // Verify price range if provided
  if (details.priceRange) {
    const priceElement = restaurantItem.locator(`[data-testid^="restaurant-price-"]`);
    await expect(priceElement).toContainText(formatPriceRange(details.priceRange));
  }
}

/**
 * Deletes all restaurants whose names match a given pattern
 * Useful for cleaning up test data that matches certain criteria
 * 
 * @param request - Playwright's API request context
 * @param pattern - String pattern to match restaurant names against
 * @throws Error if fetching restaurants fails
 */
export async function deleteRestaurantsByPattern(request: APIRequestContext, pattern: string) {
  try {
    // Get all restaurants
    const response = await request.get('/api/restaurants');
    if (!response.ok()) {
      throw new Error(`Failed to fetch restaurants: ${response.statusText()}`);
    }
    const restaurants = await response.json() as Restaurant[];
    
    // Find and delete restaurants matching the pattern
    const matchingRestaurants = restaurants.filter((r) => r.name.includes(pattern));
    console.log(`Found ${matchingRestaurants.length} restaurants matching pattern "${pattern}"`);
    
    for (const restaurant of matchingRestaurants) {
      try {
        await deleteRestaurantViaAPI(request, restaurant.id);
        console.log(`Successfully deleted restaurant "${restaurant.name}"`);
      } catch (error) {
        console.error(`Failed to delete restaurant "${restaurant.name}":`, error);
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Deletes restaurants by their exact names
 * More precise than pattern matching, used when exact restaurant names are known
 * 
 * @param request - Playwright's API request context
 * @param names - Array of exact restaurant names to delete
 * @throws Error if fetching restaurants fails
 */
export async function deleteRestaurantsByNames(request: APIRequestContext, names: string[]) {
  try {
    // Get all restaurants
    const response = await request.get('/api/restaurants');
    if (!response.ok()) {
      throw new Error(`Failed to fetch restaurants: ${response.statusText()}`);
    }
    const restaurants = await response.json() as Restaurant[];
    
    // Find and delete test restaurants by name
    for (const name of names) {
      try {
        const restaurant = restaurants.find((r) => r.name === name);
        if (restaurant) {
          await deleteRestaurantViaAPI(request, restaurant.id);
          console.log(`Successfully deleted restaurant "${name}"`);
        }
      } catch (error) {
        console.error(`Failed to delete restaurant "${name}":`, error);
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Waits for a comment to appear in the database by polling the API
 * Useful for ensuring comment data is persisted before proceeding with tests
 * 
 * @param request - Playwright's API request context
 * @param restaurantId - ID of the restaurant the comment belongs to
 * @param content - Content of the comment to wait for
 * @param maxAttempts - Maximum number of polling attempts (default: 5)
 * @returns The comment object if found
 * @throws Error if comment is not found after max attempts
 */
export async function waitForCommentInDB(
  request: APIRequestContext,
  restaurantId: string,
  content: string,
  maxAttempts = 5
): Promise<Comment> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await request.get(`/api/comments?restaurantId=${restaurantId}`);
    const comments = await response.json() as Comment[];
    const comment = comments.find((c) => c.content === content);
    if (comment) {
      return comment;
    }
    // Wait 1 second between attempts
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Comment "${content}" not found in database after ${maxAttempts} attempts`);
}

/**
 * Fills out the comment form in the UI with provided test data
 * Handles:
 * - Author name
 * - Comment content
 * - Rating (star selection)
 * 
 * Waits for each field to be properly set before proceeding
 * 
 * @param page - Playwright's page object
 * @param data - Comment test data from TEST_COMMENTS
 */
export async function fillCommentForm(
  page: Page,
  data: typeof TEST_COMMENTS[keyof typeof TEST_COMMENTS]
) {
  // Fill author name and wait for it to be set
  const authorInput = page.locator('[data-testid="comment-author-input"]');
  await authorInput.fill(data.authorName);
  await expect(authorInput).toHaveValue(data.authorName);
  
  // Fill content and wait for it to be set
  const contentInput = page.locator('[data-testid="comment-content-input"]');
  await contentInput.fill(data.content);
  await expect(contentInput).toHaveValue(data.content);
  
  // Set rating by clicking the appropriate star and wait for it to be selected
  const ratingButton = page.locator(`[data-testid="rating-star-${data.rating}-button"]`);
  await ratingButton.click();
  await expect(ratingButton).toHaveClass(/text-yellow-400/);
}

/**
 * Submits a comment form and waits for the API response
 * Ensures the form submission is complete before proceeding
 * 
 * @param page - Playwright's page object
 * @returns Promise that resolves when the form is submitted and response is received
 */
export async function submitCommentAndWaitForResponse(page: Page) {
  return Promise.all([
    page.waitForResponse(response => 
      response.url().includes('/api/comments') && 
      response.request().method() === 'POST'
    ),
    page.click('[data-testid="submit-comment-button"]')
  ]);
}

/**
 * Deletes all comments associated with a specific restaurant
 * Used for cleaning up test data after tests
 * 
 * @param request - Playwright's API request context
 * @param restaurantId - ID of the restaurant whose comments should be deleted
 * @throws Error if fetching or deleting comments fails
 */
export async function deleteCommentsForRestaurant(
  request: APIRequestContext,
  restaurantId: string
) {
  try {
    const getResponse = await request.get(`/api/comments?restaurantId=${restaurantId}`);
    if (!getResponse.ok()) {
      throw new Error(`Failed to fetch comments: ${getResponse.statusText()}`);
    }
    
    const comments = await getResponse.json() as Comment[];
    for (const comment of comments) {
      const deleteResponse = await request.delete(`/api/comments?id=${comment.id}`);
      if (!deleteResponse.ok()) {
        throw new Error(`Failed to delete comment ${comment.id}: ${deleteResponse.statusText()}`);
      }
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a new comment via the API
 * Bypasses the UI for faster test setup
 * 
 * @param request - Playwright's API request context
 * @param restaurantId - ID of the restaurant to add the comment to
 * @param data - Comment data including content, author name, rating, and optional image URL
 * @returns The created comment object
 * @throws Error if comment creation fails
 */
export async function createCommentViaAPI(
  request: APIRequestContext,
  restaurantId: string,
  data: {
    content: string;
    authorName: string;
    rating: number;
    imageUrl?: string;
  }
) {
  const response = await request.post('/api/comments', {
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      restaurantId,
      ...data,
    },
  });

  if (!response.ok()) {
    throw new Error(`Failed to create comment: ${response.statusText()}`);
  }

  return response.json();
}

/**
 * Verifies comment details displayed in the UI match the expected data
 * Checks:
 * - Comment content
 * - Author name
 * - Rating stars (selected and unselected)
 * - Image (if provided)
 * 
 * @param page - Playwright's page object
 * @param commentId - ID of the comment to verify
 * @param data - Expected comment data from TEST_COMMENTS
 */
export async function verifyCommentDetails(
  page: Page,
  commentId: string,
  data: typeof TEST_COMMENTS[keyof typeof TEST_COMMENTS]
) {
  const commentContainer = page.locator(`[data-testid="comment-container-${commentId}"]`);
  await expect(commentContainer).toBeVisible();

  // Verify content and author
  await expect(page.locator(`[data-testid="comment-content-${commentId}"]`)).toContainText(data.content);
  await expect(page.locator(`[data-testid="comment-author-${commentId}"]`)).toContainText(data.authorName);

  // Verify rating stars
  for (let i = 1; i <= 5; i++) {
    const starElement = page.locator(`[data-testid="comment-star-${commentId}-${i}"]`);
    if (i <= data.rating) {
      await expect(starElement).toHaveClass(/text-yellow-400/);
    } else {
      await expect(starElement).toHaveClass(/text-gray-300/);
    }
  }

  // Verify image if present
  if (data.imageUrl) {
    const imageElement = page.locator(`[data-testid="comment-image-${commentId}"]`);
    await expect(imageElement).toBeVisible();
    
    // Get the src attribute and verify it contains the Cloudinary URL
    const src = await imageElement.getAttribute('src');
    expect(src).toContain(encodeURIComponent(data.imageUrl));
  }
}

/**
 * Creates a new restaurant via the API
 * Bypasses the UI for faster test setup
 * Includes logging for better test debugging
 * 
 * @param request - Playwright's API request context
 * @param data - Restaurant data from TEST_RESTAURANTS
 * @returns The created restaurant object
 * @throws Error if restaurant creation fails
 */
export async function createRestaurantViaAPI(request: APIRequestContext, data: TestRestaurant) {
  console.log('Creating restaurant via API:', data.name);
  
  const response = await request.post('/api/restaurants', {
    data: {
      name: data.name,
      cuisineType: data.cuisineType,
      priceRange: data.priceRange,
      address: data.address,
      description: data.description,
      features: data.features,
    },
  });

  if (!response.ok()) {
    const errorData = await response.json();
    console.error('Failed to create restaurant:', data.name, errorData.error);
    throw new Error(`Failed to create restaurant: ${errorData.error}`);
  }

  console.log('Successfully created restaurant:', data.name);
  return await response.json();
}

/**
 * Deletes a restaurant via the API
 * Used for cleaning up test data
 * 
 * @param request - Playwright's API request context
 * @param id - ID of the restaurant to delete
 * @throws Error if deletion fails
 */
export async function deleteRestaurantViaAPI(request: APIRequestContext, id: string): Promise<void> {
  const response = await request.delete(`/api/restaurants?id=${id}`);
  expect(response.ok()).toBeTruthy();
}

/**
 * Opens the comments modal for a restaurant and waits for it to be ready
 * Ensures all necessary elements are visible and loading is complete
 * 
 * @param page - Playwright's page object
 * @param restaurantId - ID of the restaurant whose comments to view
 * @throws Error if modal elements are not visible after timeout
 */
export async function openCommentsModalAndWait(page: Page, restaurantId: string) {
  await page.click(`[data-testid="restaurant-comment-icon-${restaurantId}"]`);
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
  await expect(page.locator('[data-testid="comments-list"]')).toBeVisible();
  await expect(page.locator('[data-testid="comments-loading"]')).not.toBeVisible();
}

/**
 * Verifies that the confirmation dialog is visible with all its elements
 * Used for testing unsaved changes warnings
 * 
 * @param page - Playwright's page object
 */
export async function verifyConfirmationDialog(page: Page) {
  const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
  await expect(confirmDialog).toBeVisible();
  await expect(page.locator('[data-testid="confirm-dialog-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="confirm-dialog-message"]')).toBeVisible();
  await expect(page.locator('[data-testid="confirm-dialog-keep-editing"]')).toBeVisible();
  await expect(page.locator('[data-testid="confirm-dialog-discard"]')).toBeVisible();
}

/**
 * Opens the comment modal using the comment icon and verifies it's visible
 * Used for testing comment-related functionality
 * 
 * @param page - Playwright's page object
 */
export async function openCommentModalDirect(page: Page) {
  await page.click('[data-testid="restaurant-comment-icon-lkv202qcqz4b34wxnfy245sx"]');
  await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
}

/**
 * Fills the comment form with standard test data
 * Used for testing unsaved changes in the comment form
 * 
 * @param page - Playwright's page object
 */
export async function fillCommentFormWithTestData(page: Page) {
  await page.fill('[data-testid="comment-author-input"]', "Test Author");
  await page.fill('[data-testid="comment-content-input"]', "Test Comment");
  await page.click('[data-testid="rating-star-4-button"]');
}

/**
 * Opens the filters panel and verifies it's visible
 * @param page - Playwright's page object
 */
export async function openFiltersPanel(page: Page) {
  await page.click('[data-testid="filters-button"]');
  await expect(page.locator('[data-testid="filters-panel"]')).toBeVisible();
  await expect(page.locator('[data-testid="cuisine-select"]')).toBeVisible();
  await expect(page.locator('[data-testid="price-select"]')).toBeVisible();
}

/**
 * Verifies cuisine filter options are properly formatted
 * @param page - Playwright's page object
 */
export async function verifyCuisineFilterOptions(page: Page) {
  const expectedFormats = {
    'MIDDLE_EASTERN': 'Middle Eastern',
    'INDIAN_PAKISTANI': 'Indian Pakistani',
    'TURKISH': 'Turkish',
    'PERSIAN': 'Persian',
    'MEDITERRANEAN': 'Mediterranean',
    'AFGHAN': 'Afghan',
    'CAFE': 'Cafe',
    'OTHER': 'Other'
  };

  const cuisineSelect = page.locator('[data-testid="cuisine-select"]');
  const options = await cuisineSelect.locator('option:not(:first-child)').all();
  
  for (const option of options) {
    const value = await option.getAttribute('value');
    const text = await option.textContent();
    if (value && value in expectedFormats) {
      expect(text?.trim()).toBe(expectedFormats[value as keyof typeof expectedFormats]);
    }
  }
}

/**
 * Verifies price range filter options are in correct order
 * @param page - Playwright's page object
 */
export async function verifyPriceFilterOptions(page: Page) {
  const priceSelect = page.locator('[data-testid="price-select"]');
  const options = await priceSelect.locator('option').all();
  
  const expectedOptions = ['Any Price', '$', '$$', '$$$'];
  
  for (let i = 0; i < options.length; i++) {
    const text = await options[i].textContent();
    expect(text?.trim()).toBe(expectedOptions[i]);
  }
}

/**
 * Applies filters and verifies filtered results
 * @param page - Playwright's page object
 * @param cuisineType - Cuisine type to filter by
 * @param priceRange - Price range to filter by
 * @param expectedRestaurantName - Name of a restaurant that should be included in results
 */
export async function applyFiltersAndVerifyResults(
  page: Page,
  cuisineType: string,
  priceRange: string,
  expectedRestaurantName: string
) {
  await page.selectOption('[data-testid="cuisine-select"]', cuisineType);
  await page.selectOption('[data-testid="price-select"]', priceRange);
  
  // Wait for the filtering to complete
  await page.waitForTimeout(500);

  // Get all restaurant cards
  const restaurantCards = page.locator('[data-testid^="restaurant-item-"]');
  
  // Verify we have exactly 5 results
  await expect(restaurantCards).toHaveCount(5);

  // Get all restaurant names and verify the expected one is present
  const restaurantNames = await page.locator('[data-testid^="restaurant-name-"]').allTextContents();
  expect(restaurantNames).toContain(expectedRestaurantName);

  // Verify all displayed restaurants match the filter criteria
  const restaurants = await restaurantCards.all();
  for (const restaurant of restaurants) {
    const cuisineElement = restaurant.locator('[data-testid^="restaurant-cuisine-"]');
    const priceElement = restaurant.locator('[data-testid^="restaurant-price-"]');
    
    if (cuisineType !== 'all') {
      await expect(cuisineElement).toContainText('Middle Eastern');
    }
    if (priceRange !== 'all') {
      await expect(priceElement).toContainText('$');
    }
  }
} 