import { expect, test } from '@playwright/test';
import { BugReportModalPage } from './pages/bug-report-modal.page';

test.describe('TC-REPORT-001: User can submit a website issue report from the navbar', () => {
  test(
    'TC-REPORT-001: User can submit a website issue report from the navbar',
    { tag: '@orchestrated' },
    async ({ page }) => {
      const report = new BugReportModalPage(page);
      const requestMethods: string[] = [];

      // Precondition: stub the API so no email, upload or DB write happens
      await page.route('**/api/bug-report', async (route) => {
        requestMethods.push(route.request().method());
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'ok', id: 'stub-id' }),
        });
      });

      // Step 1: Go to the homepage
      await report.goto();

      // Step 2: Click "Report" in the navbar
      await report.open();
      await expect(report.form).toBeVisible();
      await expect(report.titleInput).toHaveValue('');
      await expect(report.descriptionInput).toHaveValue('');

      // Steps 3-4: Click the title field and type the title
      await report.titleInput.click();
      await report.titleInput.fill(`Automation test ${Date.now()}`);

      // Steps 5-6: Click the description field and type
      await report.descriptionInput.click();
      await report.descriptionInput.fill('automation test');

      // Step 7: Click "Add more details (optional)"
      await expect(report.stepsInput).toHaveCount(0);
      await expect(report.toggleDetailsButton).toHaveText('Add more details (optional)');
      await report.toggleDetailsButton.click();
      await expect(report.toggleDetailsButton).toHaveText('Show less');
      await expect(report.stepsInput).toBeVisible();
      await expect(report.browserInput).toBeVisible();
      await expect(report.deviceInput).toBeVisible();
      await expect(report.emailInput).toBeVisible();

      // Step 8: Steps to reproduce
      await report.stepsInput.click();
      await report.stepsInput.fill('test steps to reproduce');

      // Step 9: Browser
      await report.browserInput.click();
      await report.browserInput.fill('browser');

      // Step 10: Device
      await report.deviceInput.click();
      await report.deviceInput.fill('device');

      // Step 11: Email
      await report.emailInput.click();
      await report.emailInput.fill('automation-test@email.com');

      // Step 12: Click "Submit Report"
      await report.submitButton.click();

      // Expected: dialog closes, success toast shown, request was a POST
      await expect(report.modal).toHaveCount(0);
      await expect(report.successToast).toBeVisible();
      await expect.poll(() => requestMethods).toEqual(['POST']);
    },
  );
});
