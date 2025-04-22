import { test, expect, type Page } from '@playwright/test';
import { CuisineType, PriceRange } from '@prisma/client';
import crypto from 'crypto';

// Test data
const TEST_RESTAURANT = {
  name: `Test Restaurant for Comments ${Date.now()}-${crypto.randomUUID()}`,
  cuisine: CuisineType.MIDDLE_EASTERN,
  priceRange: PriceRange.MEDIUM,
  address: '123 Test Street, Atlanta, GA 30303',
  features: {
    hasPrayerRoom: true,
    hasOutdoorSeating: true,
    isZabiha: true,
    hasHighChair: true,
    servesAlcohol: false,
    isFullyHalal: true
  }
} as const;

const TEST_COMMENTS = {
  VALID: {
    content: 'Great halal food and excellent service!',
    authorName: 'Test User',
    rating: 5
  },
  LONG: {
    content: 'This is a very detailed review of the restaurant. The food was amazing, service was great, and the prayer room was clean and spacious. Would definitely recommend to others!',
    authorName: 'Detailed Reviewer',
    rating: 4
  },
  CRITICAL: {
    content: 'Food was okay but service was slow.',
    authorName: 'Honest Reviewer',
    rating: 3
  }
} as const;

test.describe('Comments Feature', () => {
  let restaurantId: string;

  // Helper function to wait for comment to appear in database
  async function waitForCommentInDB(request: any, content: string, maxAttempts = 5): Promise<any> {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await request.get(`/api/comments?restaurantId=${restaurantId}`);
      const comments = await response.json();
      const comment = comments.find((c: any) => c.content === content);
      if (comment) {
        return comment;
      }
      // Wait 1 second between attempts
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`Comment "${content}" not found in database after ${maxAttempts} attempts`);
  }

  // Helper function to fill comment form
  async function fillCommentForm(page: Page, data: typeof TEST_COMMENTS[keyof typeof TEST_COMMENTS]) {
    await page.fill('[data-testid="comment-author-input"]', data.authorName);
    await page.waitForTimeout(100);
    
    await page.fill('[data-testid="comment-content-input"]', data.content);
    await page.waitForTimeout(100);
    
    // Set rating by clicking the appropriate star
    await page.click(`[data-testid="rating-star-${data.rating}-button"]`);
    await page.waitForTimeout(100);
  }

  // Helper function to submit comment form and wait for response
  async function submitCommentAndWaitForResponse(page: Page) {
    return Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/comments') && 
        response.request().method() === 'POST'
      ),
      page.click('[data-testid="submit-comment-button"]')
    ]);
  }

  // Helper function to delete test restaurant and its comments
  async function cleanupTestData(request: any) {
    if (restaurantId) {
      console.log('Cleaning up test data...');
      try {
        const deleteResponse = await request.delete(`/api/restaurants?id=${restaurantId}`);
        if (deleteResponse.ok()) {
          console.log('✓ Successfully deleted test restaurant and associated comments');
        } else {
          console.error('Failed to delete test restaurant:', await deleteResponse.text());
        }
      } catch (error) {
        console.error('Error during cleanup:', error);
      }
    }
  }

  test.beforeAll(async ({ request }) => {
    console.log('\nSetting up test environment...');
    
    // First try to cleanup any existing test data
    try {
      const existingRestaurants = await request.get('/api/restaurants');
      const restaurants = await existingRestaurants.json();
      const testRestaurant = restaurants.find((r: any) => r.name.startsWith('Test Restaurant for Comments'));
      if (testRestaurant) {
        await request.delete(`/api/restaurants?id=${testRestaurant.id}`);
        console.log('✓ Cleaned up existing test restaurant');
      }
    } catch (error) {
      console.warn('Warning: Failed to cleanup existing test data:', error);
    }

    // Create a test restaurant for comments
    const response = await request.post('/api/restaurants', {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: TEST_RESTAURANT.name,
        cuisine: TEST_RESTAURANT.cuisine,
        priceRange: TEST_RESTAURANT.priceRange,
        address: TEST_RESTAURANT.address,
        hasPrayerRoom: TEST_RESTAURANT.features.hasPrayerRoom,
        hasOutdoorSeating: TEST_RESTAURANT.features.hasOutdoorSeating,
        isZabiha: TEST_RESTAURANT.features.isZabiha,
        hasHighChair: TEST_RESTAURANT.features.hasHighChair,
        servesAlcohol: TEST_RESTAURANT.features.servesAlcohol,
        isFullyHalal: TEST_RESTAURANT.features.isFullyHalal
      }
    });
    
    if (!response.ok()) {
      const errorText = await response.text();
      console.error('Failed to create test restaurant. Response:', errorText);
      throw new Error(`Failed to create test restaurant: ${errorText}`);
    }
    
    const restaurant = await response.json();
    restaurantId = restaurant.id;
    console.log(`✓ Created test restaurant with ID: ${restaurantId}`);
  });

  test.afterAll(async ({ request }) => {
    await cleanupTestData(request);
  });

  test.afterEach(async ({ request }) => {
    // Clean up any comments created during the test
    if (restaurantId) {
      console.log('Cleaning up test comments...');
      try {
        // Get all comments for the test restaurant
        const getResponse = await request.get(`/api/comments?restaurantId=${restaurantId}`);
        if (getResponse.ok()) {
          const comments = await getResponse.json();
          
          // Delete each comment
          for (const comment of comments) {
            const deleteResponse = await request.delete(`/api/comments?id=${comment.id}`);
            if (deleteResponse.ok()) {
              console.log(`✓ Deleted comment: ${comment.id}`);
            } else {
              console.warn(`Failed to delete comment ${comment.id}:`, await deleteResponse.text());
            }
          }
        }
      } catch (error) {
        console.warn('Warning: Failed to cleanup test comments:', error);
      }
    }
  });

  test('should open comments modal and add a new comment', async ({ page, request }) => {
    // Navigate to the home page and wait for it to be ready
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the comments button for our test restaurant
    const restaurantElement = page.locator(`text="${TEST_RESTAURANT.name}"`).first();
    await expect(restaurantElement).toBeVisible();
    
    // Get the restaurant ID from a nearby element
    const restaurantCard = restaurantElement.locator('..');
    const commentButton = restaurantCard.locator('button:has-text("Comments")');
    await commentButton.click();
    
    // Wait for the modal to be visible and ready
    await expect(page.locator('[data-testid="comment-author-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="comment-content-input"]')).toBeVisible();

    // Fill out the comment form
    await fillCommentForm(page, TEST_COMMENTS.VALID);

    // Submit comment and wait for request to complete
    await Promise.all([
      page.waitForResponse(response => 
        response.url().includes('/api/comments') && 
        response.request().method() === 'POST' &&
        response.ok()
      ),
      page.click('[data-testid="submit-comment-button"]')
    ]);

    // Wait for the comment to appear in the database
    const savedComment = await waitForCommentInDB(request, TEST_COMMENTS.VALID.content);
    expect(savedComment).toBeTruthy();

    // Wait for the comment to appear in the UI
    await expect(
      page.locator(`[data-testid="comment-content-${savedComment.id}"]`)
    ).toContainText(TEST_COMMENTS.VALID.content);
    
    await expect(
      page.locator(`[data-testid="comment-author-${savedComment.id}"]`)
    ).toContainText(TEST_COMMENTS.VALID.authorName);
  });

  test('should display multiple comments in chronological order', async ({ page, request }) => {
    // Add multiple comments via API
    for (const comment of [TEST_COMMENTS.LONG, TEST_COMMENTS.CRITICAL]) {
      const response = await request.post('/api/comments', {
        headers: { 'Content-Type': 'application/json' },
        data: {
          ...comment,
          restaurantId
        }
      });

      if (!response.ok()) {
        throw new Error(`Failed to create comment: ${await response.text()}`);
      }
    }

    // Navigate to the home page and open comments
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the comments button for our test restaurant
    const restaurantElement = page.locator(`text="${TEST_RESTAURANT.name}"`).first();
    await expect(restaurantElement).toBeVisible();
    
    const restaurantCard = restaurantElement.locator('..');
    const commentButton = restaurantCard.locator('button:has-text("Comments")');
    await commentButton.click();

    // Wait for comments to load
    await page.waitForSelector('[data-testid^="comment-container-"]');

    // Verify all comments are visible with their details
    for (const comment of Object.values(TEST_COMMENTS)) {
      const commentElement = await page.locator(`[data-testid^="comment-content-"]:has-text("${comment.content}")`);
      const commentId = await commentElement.getAttribute('data-testid').then(id => id?.split('-').pop());
      
      // Verify comment details
      await expect(page.locator(`[data-testid="comment-content-${commentId}"]`)).toContainText(comment.content);
      await expect(page.locator(`[data-testid="comment-author-${commentId}"]`)).toContainText(comment.authorName);
      
      // Verify rating stars
      for (let star = 1; star <= 5; star++) {
        const starElement = page.locator(`[data-testid="comment-star-${commentId}-${star}"]`);
        if (star <= comment.rating) {
          await expect(starElement).toHaveClass(/text-yellow-400/);
        } else {
          await expect(starElement).toHaveClass(/text-gray-300/);
        }
      }
    }

    // Verify comments are in reverse chronological order (newest first)
    const commentElements = await page.locator('[data-testid^="comment-content-"]').all();
    const commentTexts = await Promise.all(commentElements.map(el => el.textContent()));
    
    expect(commentTexts.map(text => text?.trim())).toEqual([
      TEST_COMMENTS.CRITICAL.content,
      TEST_COMMENTS.LONG.content,
      TEST_COMMENTS.VALID.content
    ]);
  });

  test('should validate comment form inputs', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the comments button for our test restaurant
    const restaurantElement = page.locator(`text="${TEST_RESTAURANT.name}"`).first();
    await expect(restaurantElement).toBeVisible();
    
    const restaurantCard = restaurantElement.locator('..');
    const commentButton = restaurantCard.locator('button:has-text("Comments")');
    await commentButton.click();

    // Try to submit empty form
    await page.click('[data-testid="submit-comment-button"]');
    
    // Verify form validation
    await expect(page.locator('[data-testid="comment-author-input"]:invalid')).toBeVisible();
    await expect(page.locator('[data-testid="comment-content-input"]:invalid')).toBeVisible();

    // Fill only author name
    await page.fill('[data-testid="comment-author-input"]', 'Test User');
    await page.click('[data-testid="submit-comment-button"]');
    
    // Verify content is still required
    await expect(page.locator('[data-testid="comment-content-input"]:invalid')).toBeVisible();
  });

  test('should close modal and preserve comments', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Find and click the comments button for our test restaurant
    const restaurantElement = page.locator(`text="${TEST_RESTAURANT.name}"`).first();
    await expect(restaurantElement).toBeVisible();
    
    const restaurantCard = restaurantElement.locator('..');
    const commentButton = restaurantCard.locator('button:has-text("Comments")');
    await commentButton.click();

    // Wait for comments to load
    await page.waitForSelector('[data-testid^="comment-container-"]');
    
    // Verify a comment exists
    const commentElement = await page.locator('[data-testid^="comment-content-"]').first();
    const commentText = await commentElement.textContent();
    
    // Close modal
    await page.click('[data-testid="close-modal-button"]');
    await expect(page.locator('[data-testid="comment-author-input"]')).not.toBeVisible();
    
    // Reopen modal and verify comments are still there
    await commentButton.click();
    await expect(page.locator(`[data-testid^="comment-content-"]:has-text("${commentText}")`)).toBeVisible();
  });

  test('should handle rating selection correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find and click the comments button for our test restaurant
    const restaurantElement = page.locator(`text="${TEST_RESTAURANT.name}"`).first();
    await expect(restaurantElement).toBeVisible();
    
    const restaurantCard = restaurantElement.locator('..');
    const commentButton = restaurantCard.locator('button:has-text("Comments")');
    await commentButton.click();

    // Test each rating value
    for (let rating = 1; rating <= 5; rating++) {
      await page.click(`[data-testid="rating-star-${rating}-button"]`);
      
      // Verify selected and unselected stars
      for (let star = 1; star <= 5; star++) {
        const starElement = page.locator(`[data-testid="rating-star-${star}-button"]`);
        if (star <= rating) {
          await expect(starElement).toHaveClass(/text-yellow-400/);
        } else {
          await expect(starElement).toHaveClass(/text-gray-300/);
        }
      }
    }
  });
}); 