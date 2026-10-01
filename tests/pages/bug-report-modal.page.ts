import type { Locator, Page } from '@playwright/test';

/** Navbar "Report" button and the "Report Issue with Website" modal (BugReportModal). */
export class BugReportModalPage {
  readonly page: Page;
  readonly reportButton: Locator;
  readonly modal: Locator;
  readonly form: Locator;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly toggleDetailsButton: Locator;
  readonly stepsInput: Locator;
  readonly browserInput: Locator;
  readonly deviceInput: Locator;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly successToast: Locator;

  constructor(page: Page) {
    this.page = page;
    this.reportButton = page.locator('[data-testid="report-issue-button"]:visible');
    this.modal = page.locator('[data-testid="bug-report-modal"]');
    this.form = page.locator('[data-testid="bug-report-form"]');
    this.titleInput = page.locator('[data-testid="bug-report-title"]');
    this.descriptionInput = page.locator('[data-testid="bug-report-description"]');
    this.toggleDetailsButton = page.locator('[data-testid="bug-report-toggle-details"]');
    this.stepsInput = page.locator('[data-testid="bug-report-steps"]');
    this.browserInput = page.locator('[data-testid="bug-report-browser"]');
    this.deviceInput = page.locator('[data-testid="bug-report-device"]');
    this.emailInput = page.locator('[data-testid="bug-report-email"]');
    this.submitButton = page.locator('[data-testid="bug-report-submit"]');
    this.successToast = page
      .getByRole('status')
      .filter({ hasText: 'Thank you! Your bug report has been submitted successfully' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Clicks the navbar "Report" button. */
  async open(): Promise<void> {
    await this.reportButton.click();
  }
}
