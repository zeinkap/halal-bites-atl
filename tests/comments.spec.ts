import { test, expect } from '@playwright/test';
import { TEST_COMMENTS, TEST_RESTAURANTS } from './utils/test-data';
import {
  fillCommentForm,
  waitForCommentInDB,
  verifyCommentDetails,
  deleteCommentsForRestaurant,
  createCommentViaAPI,
  createRestaurantViaAPI,
  deleteRestaurantViaAPI,
  openCommentsModalAndWait
} from './utils/test-helpers';
import { cleanupTestImages, createTestImageBuffer, uploadTestImage } from './utils/cloudinary-helpers';

test.describe('Restaurant Comments', () => {
  let restaurantId: string;

  // Common setup for all tests
  test.beforeEach(async ({ request, page }) => {
    // Create a test restaurant
    const restaurant = await createRestaurantViaAPI(request, TEST_RESTAURANTS.BASIC);
    restaurantId = restaurant.id;

    // Navigate to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  // Common cleanup for all tests
  test.afterEach(async ({ request }) => {
    // Delete test data in reverse order of creation
    await deleteCommentsForRestaurant(request, restaurantId);
    await deleteRestaurantViaAPI(request, restaurantId);
    await cleanupTestImages();
  });

  test.describe('Basic Comment Operations', () => {
    test('should add and view a comment', async ({ page, request }) => {
      // Create a comment via API
      const comment = await createCommentViaAPI(request, restaurantId, {
        content: TEST_COMMENTS.VALID.content,
        authorName: TEST_COMMENTS.VALID.authorName,
        rating: TEST_COMMENTS.VALID.rating,
      });

      // Wait for comment to appear
      await waitForCommentInDB(request, restaurantId, TEST_COMMENTS.VALID.content);

      // Open modal and verify
      await openCommentsModalAndWait(page, restaurantId);
      await verifyCommentDetails(page, comment.id, TEST_COMMENTS.VALID);
    });

    test('should show no comments message when empty', async ({ page }) => {
      await openCommentsModalAndWait(page, restaurantId);
      await expect(page.locator('[data-testid="no-comments-message"]')).toBeVisible();
    });

    test('should preserve comments when reopening modal', async ({ page, request }) => {
      // Add a comment via API
      const comment = await createCommentViaAPI(request, restaurantId, TEST_COMMENTS.VALID);
      await waitForCommentInDB(request, restaurantId, TEST_COMMENTS.VALID.content);
      
      // Open modal and verify
      await openCommentsModalAndWait(page, restaurantId);
      await verifyCommentDetails(page, comment.id, TEST_COMMENTS.VALID);
      
      // Close and reopen modal
      await page.click('[data-testid="close-modal-button"]');
      await expect(page.locator('[data-testid="comment-form"]')).not.toBeVisible();
      
      await openCommentsModalAndWait(page, restaurantId);
      await verifyCommentDetails(page, comment.id, TEST_COMMENTS.VALID);
    });
  });

  test.describe('Comment Form Validation', () => {
    test('should validate comment form inputs', async ({ page }) => {
      await openCommentsModalAndWait(page, restaurantId);

      // Try to submit empty form
      await page.click('[data-testid="submit-comment-button"]');
      
      // Verify form validation
      await expect(page.locator('[data-testid="comment-author-input"]:invalid')).toBeVisible();
      await expect(page.locator('[data-testid="comment-content-input"]:invalid')).toBeVisible();
      await expect(page.locator('[data-testid="rating-error"]')).toBeVisible();

      // Fill only author name and verify remaining validation
      await page.fill('[data-testid="comment-author-input"]', 'Test User');
      await page.click('[data-testid="submit-comment-button"]');
      await expect(page.locator('[data-testid="comment-content-input"]:invalid')).toBeVisible();
      await expect(page.locator('[data-testid="rating-error"]')).toBeVisible();
    });

    test('should handle rating selection correctly', async ({ page }) => {
      await openCommentsModalAndWait(page, restaurantId);

      // Test each rating value
      for (let rating = 1; rating <= 5; rating++) {
        await page.click(`[data-testid="rating-star-${rating}-button"]`);
        
        // Verify selected and unselected stars
        for (let star = 1; star <= 5; star++) {
          const starElement = page.locator(`[data-testid="rating-star-${star}-button"]`);
          await expect(starElement).toHaveClass(star <= rating ? /text-yellow-400/ : /text-gray-300/);
        }
      }
    });
  });

  test.describe('Image Handling', () => {
    test('should handle image upload in comments', async ({ page, request }) => {
      // Create test image and upload to Cloudinary
      const imageBuffer = await createTestImageBuffer();
      const imageUrl = await uploadTestImage(imageBuffer);

      // Create comment with image via API
      const comment = await createCommentViaAPI(request, restaurantId, {
        content: TEST_COMMENTS.VALID.content,
        authorName: TEST_COMMENTS.VALID.authorName,
        rating: TEST_COMMENTS.VALID.rating,
        imageUrl,
      });

      // Wait for comment to appear and verify
      await waitForCommentInDB(request, restaurantId, TEST_COMMENTS.VALID.content);
      await openCommentsModalAndWait(page, restaurantId);
      await verifyCommentDetails(page, comment.id, { ...TEST_COMMENTS.VALID, imageUrl });
    });

    test('should handle multiple images in comments list', async ({ page, request }) => {
      // Create and upload test images
      const [buffer1, buffer2] = await Promise.all([
        createTestImageBuffer(),
        createTestImageBuffer()
      ]);
      const [imageUrl1, imageUrl2] = await Promise.all([
        uploadTestImage(buffer1),
        uploadTestImage(buffer2)
      ]);

      // Create comments with different images
      const [comment1, comment2] = await Promise.all([
        createCommentViaAPI(request, restaurantId, {
          ...TEST_COMMENTS.VALID,
          imageUrl: imageUrl1,
        }),
        createCommentViaAPI(request, restaurantId, {
          ...TEST_COMMENTS.CRITICAL,
          imageUrl: imageUrl2,
        })
      ]);

      // Wait for both comments to appear
      await Promise.all([
        waitForCommentInDB(request, restaurantId, TEST_COMMENTS.VALID.content),
        waitForCommentInDB(request, restaurantId, TEST_COMMENTS.CRITICAL.content)
      ]);

      // Open modal and verify comments
      await openCommentsModalAndWait(page, restaurantId);

      // Verify both comments and their images
      await verifyCommentDetails(page, comment1.id, { ...TEST_COMMENTS.VALID, imageUrl: imageUrl1 });
      await verifyCommentDetails(page, comment2.id, { ...TEST_COMMENTS.CRITICAL, imageUrl: imageUrl2 });

      // Verify both comment containers are present
      const commentContainers = page.locator('[data-testid^="comment-container-"]');
      await expect(commentContainers).toHaveCount(2);

      // Verify each comment has its image
      const image1 = page.locator(`[data-testid="comment-image-${comment1.id}"]`);
      const image2 = page.locator(`[data-testid="comment-image-${comment2.id}"]`);
      await expect(image1).toBeVisible();
      await expect(image2).toBeVisible();
    });

    test('should handle image upload validation', async ({ page }) => {
      await openCommentsModalAndWait(page, restaurantId);
      await fillCommentForm(page, TEST_COMMENTS.VALID);

      // Wait for file input to be ready
      const fileInput = page.locator('[data-testid="comment-image-input"]');
      await expect(fileInput).toBeAttached();

      // Test oversized image
      const oversizedImageBuffer = Buffer.alloc(5 * 1024 * 1024 + 1);
      await page.setInputFiles('[data-testid="comment-image-input"]', [{
        name: 'large-image.png',
        mimeType: 'image/png',
        buffer: oversizedImageBuffer,
      }]);

      const errorMessage = page.locator('[data-testid="image-error"]');
      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Image size must be less than 5MB');

      // Test invalid file type
      await page.setInputFiles('[data-testid="comment-image-input"]', [{
        name: 'invalid.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('test'),
      }]);

      await expect(errorMessage).toBeVisible();
      await expect(errorMessage).toContainText('Invalid file type');
    });
  });
}); 