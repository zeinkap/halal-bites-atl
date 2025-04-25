import { test, expect } from '@playwright/test';

test.describe('Bug Report Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="report-bug-button"]').click();
  });

  test('should open bug report modal when clicking report button', async ({ page }) => {
    await expect(page.locator('[data-testid="bug-report-modal"]')).toBeVisible();
    await expect(page.getByText('Report an Issue')).toBeVisible();
  });

  test('should require mandatory fields', async ({ page }) => {
    // Try submitting empty form
    await page.locator('[data-testid="bug-report-submit"]').click();

    // Check error messages
    await expect(page.locator('[data-testid="title-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="description-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="steps-error"]')).toBeVisible();
  });

  test('should validate email format if provided', async ({ page }) => {
    await page.locator('[data-testid="bug-report-email"]').fill('invalid-email');
    await page.locator('[data-testid="bug-report-title"]').click(); // Trigger validation
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-error"]')).toHaveText('Invalid email address');
  });

  test('should submit bug report successfully', async ({ page }) => {
    // Fill out form
    await page.locator('[data-testid="bug-report-title"]').fill('Test Bug Report');
    await page.locator('[data-testid="bug-report-description"]').fill('This is a test bug report');
    await page.locator('[data-testid="bug-report-steps"]').fill('1. Step one\n2. Step two');
    await page.locator('[data-testid="bug-report-expected"]').fill('Expected behavior');
    await page.locator('[data-testid="bug-report-actual"]').fill('Actual behavior');
    await page.locator('[data-testid="bug-report-browser"]').fill('Chrome 91');
    await page.locator('[data-testid="bug-report-device"]').fill('MacBook Pro');
    await page.locator('[data-testid="bug-report-email"]').fill('test@example.com');

    // Submit form
    await page.locator('[data-testid="bug-report-submit"]').click();

    // Check success message
    await expect(page.getByText('Bug report submitted successfully!')).toBeVisible();
    
    // Modal should close
    await expect(page.locator('[data-testid="bug-report-modal"]')).not.toBeVisible();
  });

  test.describe('Unsaved Changes Dialog', () => {
    test('should show confirmation when closing with unsaved changes', async ({ page }) => {
      // Make changes to form
      await page.locator('[data-testid="bug-report-title"]').fill('Test Bug');
      await page.locator('[data-testid="bug-report-description"]').fill('Test Description');
      
      // Try to close
      await page.locator('[data-testid="close-bug-report-modal"]').click();
      
      // Check confirmation dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
      await expect(page.locator('[data-testid="confirm-dialog-title"]')).toHaveText('Discard Changes?');
      await expect(page.locator('[data-testid="confirm-dialog-message"]')).toContainText('unsaved changes');
    });

    test('should keep modal open when choosing to continue editing', async ({ page }) => {
      // Make changes and try to close
      await page.locator('[data-testid="bug-report-title"]').fill('Test Bug');
      await page.locator('[data-testid="close-bug-report-modal"]').click();
      
      // Click keep editing
      await page.locator('[data-testid="confirm-dialog-keep-editing"]').click();
      
      // Check modal stays open with data intact
      await expect(page.locator('[data-testid="bug-report-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="bug-report-title"]')).toHaveValue('Test Bug');
      await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
    });

    test('should close modal and reset form when confirming discard', async ({ page }) => {
      // Make changes and try to close
      await page.locator('[data-testid="bug-report-title"]').fill('Test Bug');
      await page.locator('[data-testid="bug-report-description"]').fill('Test Description');
      await page.locator('[data-testid="close-bug-report-modal"]').click();
      
      // Confirm discard
      await page.locator('[data-testid="confirm-dialog-discard"]').click();
      
      // Check modal closed and form reset
      await expect(page.locator('[data-testid="bug-report-modal"]')).not.toBeVisible();
      
      // Reopen modal and verify form is reset
      await page.locator('[data-testid="report-bug-button"]').click();
      await expect(page.locator('[data-testid="bug-report-title"]')).toHaveValue('');
      await expect(page.locator('[data-testid="bug-report-description"]')).toHaveValue('');
    });

    test('should show confirmation when clicking outside with unsaved changes', async ({ page }) => {
      // Make changes
      await page.locator('[data-testid="bug-report-title"]').fill('Test Bug');
      
      // Click outside modal (backdrop)
      await page.click('div.fixed.inset-0.bg-black.bg-opacity-25');
      
      // Check confirmation dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    });

    test('should not show confirmation when closing without changes', async ({ page }) => {
      // Close without making changes
      await page.locator('[data-testid="close-bug-report-modal"]').click();
      
      // Check no confirmation dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="bug-report-modal"]')).not.toBeVisible();
    });

    test('should show confirmation when clicking cancel with unsaved changes', async ({ page }) => {
      // Make changes
      await page.locator('[data-testid="bug-report-title"]').fill('Test Bug');
      
      // Click cancel
      await page.locator('[data-testid="bug-report-cancel"]').click();
      
      // Check confirmation dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    });

    test('should not show confirmation when clicking cancel without changes', async ({ page }) => {
      // Click cancel without changes
      await page.locator('[data-testid="bug-report-cancel"]').click();
      
      // Check no confirmation dialog
      await expect(page.locator('[data-testid="confirm-dialog"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="bug-report-modal"]')).not.toBeVisible();
    });
  });
}); 