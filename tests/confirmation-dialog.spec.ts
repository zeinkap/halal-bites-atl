import { test, expect } from "@playwright/test";
import { createTestImageBuffer } from "./utils/cloudinary-helpers";
import {
  verifyConfirmationDialog,
  openCommentModalDirect,
  fillCommentFormWithTestData,
} from "./utils/test-helpers";

test.describe("Restaurant Form Confirmation Dialog", () => {
  // Setup for each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should show confirmation dialog when closing with unsaved changes", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    const form = page.locator("#restaurant-form");
    await expect(form).toBeVisible();

    // Make changes to the form
    await page.fill('[data-testid="restaurant-name-input"]', "Test Restaurant");
    await page.fill(
      '[data-testid="restaurant-address-input"]',
      "123 Test St, Atlanta, GA 30303"
    );
    await page.selectOption(
      '[data-testid="cuisine-type-select"]',
      "MIDDLE_EASTERN"
    );
    await page.selectOption('[data-testid="price-range-select"]', "LOW");

    // Try to close the modal
    await page.click('[data-testid="close-modal-button"]');

    // Verify confirmation dialog appears
    const confirmDialog = page.locator('[data-testid="confirm-dialog"]');
    await expect(confirmDialog).toBeVisible();
    await expect(
      page.locator('[data-testid="confirm-dialog-title"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="confirm-dialog-message"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="confirm-dialog-keep-editing"]')
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="confirm-dialog-discard"]')
    ).toBeVisible();
  });

  test("should keep modal open when choosing to continue editing", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Make form changes
    await page.fill('[data-testid="restaurant-name-input"]', "Test Restaurant");
    await page.click('[data-testid="close-modal-button"]');

    // Click "No, Keep Editing"
    await page.click('[data-testid="confirm-dialog-keep-editing"]');

    // Verify modal stays open with unchanged form data
    await expect(page.locator("#restaurant-form")).toBeVisible();
    await expect(
      page.locator('[data-testid="restaurant-name-input"]')
    ).toHaveValue("Test Restaurant");
  });

  test("should close modal and reset form when confirming discard", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Make form changes
    await page.fill('[data-testid="restaurant-name-input"]', "Test Restaurant");
    await page.fill(
      '[data-testid="restaurant-address-input"]',
      "123 Test St, Atlanta, GA 30303"
    );
    await page.selectOption(
      '[data-testid="cuisine-type-select"]',
      "MIDDLE_EASTERN"
    );
    await page.selectOption('[data-testid="price-range-select"]', "LOW");
    await page.check('[data-testid="restaurant-prayer-room-checkbox"]');
    await page.check('[data-testid="restaurant-fully-halal-checkbox"]');
    await page.fill(
      '[data-testid="restaurant-description-input"]',
      "Test description"
    );

    // Try to close and confirm discard
    await page.click('[data-testid="close-modal-button"]');
    await page.click('[data-testid="confirm-dialog-discard"]');

    // Verify modal is closed
    await expect(page.locator("#restaurant-form")).not.toBeVisible();

    // Reopen modal and verify form is reset
    await addButton.click();
    await expect(
      page.locator('[data-testid="restaurant-name-input"]')
    ).toHaveValue("");
    await expect(
      page.locator('[data-testid="restaurant-address-input"]')
    ).toHaveValue("");
    await expect(
      page.locator('[data-testid="cuisine-type-select"]')
    ).toHaveValue("");
    await expect(
      page.locator('[data-testid="price-range-select"]')
    ).toHaveValue("");
    await expect(
      page.locator('[data-testid="restaurant-prayer-room-checkbox"]')
    ).not.toBeChecked();
    await expect(
      page.locator('[data-testid="restaurant-fully-halal-checkbox"]')
    ).not.toBeChecked();
    await expect(
      page.locator('[data-testid="restaurant-description-input"]')
    ).toHaveValue("");
  });

  test("should show confirmation when clicking outside with unsaved changes", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Make form changes
    await page.fill('[data-testid="restaurant-name-input"]', "Test Restaurant");

    // Click outside the modal (on the backdrop)
    await page.click('[data-testid="close-modal-button"]');

    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
  });

  test("should not show confirmation dialog when closing without changes", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Close modal without making changes
    await page.click('[data-testid="close-modal-button"]');

    // Verify confirmation dialog does not appear
    await expect(
      page.locator('[data-testid="confirm-dialog"]')
    ).not.toBeVisible();
    // Verify modal is closed
    await expect(page.locator("#restaurant-form")).not.toBeVisible();
  });

  test("should show confirmation when clicking cancel button with unsaved changes", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Make form changes
    await page.fill('[data-testid="restaurant-name-input"]', "Test Restaurant");

    // Click cancel button
    await page.click('[data-testid="cancel-restaurant-button"]');

    // Verify confirmation dialog appears
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
  });

  test("should not show confirmation when clicking cancel without changes", async ({
    page,
  }) => {
    // Open the add restaurant form
    const addButton = page.locator('[data-testid="add-restaurant-button"]');
    await addButton.click();

    // Click cancel button without making changes
    await page.click('[data-testid="cancel-restaurant-button"]');

    // Verify confirmation dialog does not appear
    await expect(
      page.locator('[data-testid="confirm-dialog"]')
    ).not.toBeVisible();
    // Verify modal is closed
    await expect(page.locator("#restaurant-form")).not.toBeVisible();
  });
});

test.describe("Comment Modal Confirmation Dialog", () => {
  // Setup for each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should show confirmation dialog when closing with unsaved changes", async ({ page }) => {
    await openCommentModalDirect(page);
    await fillCommentFormWithTestData(page);

    // Try to close the modal
    await page.click('[data-testid="close-modal-button"]');
    await verifyConfirmationDialog(page);
  });

  test("should keep modal open when choosing to continue editing", async ({ page }) => {
    await openCommentModalDirect(page);
    
    // Make minimal form changes
    await page.fill('[data-testid="comment-author-input"]', "Test Author");
    await page.click('[data-testid="close-modal-button"]');
    
    // Verify keep editing flow
    await page.click('[data-testid="confirm-dialog-keep-editing"]');
    await expect(page.locator('[data-testid="comment-form"]')).toBeVisible();
    await expect(page.locator('[data-testid="comment-author-input"]')).toHaveValue("Test Author");
  });

  test("should close modal and reset form when confirming discard", async ({ page }) => {
    await openCommentModalDirect(page);
    await fillCommentFormWithTestData(page);

    // Add test image
    const imageBuffer = await createTestImageBuffer();
    await page.setInputFiles('[data-testid="comment-image-input"]', [{
      name: "test-image.png",
      mimeType: "image/png",
      buffer: imageBuffer,
    }]);
    await expect(page.locator('[data-testid="image-preview"]')).toBeVisible();

    // Confirm discard and verify modal closes
    await page.click('[data-testid="close-modal-button"]');
    await page.click('[data-testid="confirm-dialog-discard"]');
    await expect(page.locator('[data-testid="comment-form"]')).not.toBeVisible();

    // Verify form reset on reopen
    await openCommentModalDirect(page);
    await expect(page.locator('[data-testid="comment-author-input"]')).toHaveValue("");
    await expect(page.locator('[data-testid="comment-content-input"]')).toHaveValue("");
    await expect(page.locator('[data-testid="rating-star-4-button"]')).toHaveClass(/text-gray-300/);
    await expect(page.locator('[data-testid="image-preview"]')).not.toBeVisible();
  });

  test("should show confirmation when clicking outside with unsaved changes", async ({ page }) => {
    await openCommentModalDirect(page);
    await page.fill('[data-testid="comment-author-input"]', "Test Author");
    
    // Click outside and verify dialog
    await page.click('[data-testid="close-modal-button"]');
    await verifyConfirmationDialog(page);
  });

  test("should not show confirmation dialog when closing without changes", async ({ page }) => {
    await openCommentModalDirect(page);
    
    // Close modal without changes
    await page.click('[data-testid="close-modal-button"]');
    
    // Verify no confirmation and modal closed
    await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="comment-form"]')).not.toBeVisible();
  });
}); 