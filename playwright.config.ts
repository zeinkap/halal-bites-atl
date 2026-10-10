import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { assertAllowedTestDatabase } from './tests/utils/db-guard';

// Playwright always runs against the test environment: .env.test is loaded first, so its
// DATABASE_URL wins over .env (dotenv never overrides an already-set variable), and the db-guard
// refuses to run unless the database name matches ALLOWED_TEST_DB (see tests/utils/db-guard.ts).
// In CI there is no .env.test; DATABASE_URL and ALLOWED_TEST_DB come from the workflow env.
dotenv.config({ path: '.env.test' });

// Checked at config load, i.e. before the dev server is started or any test runs.
assertAllowedTestDatabase();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // Half the cores (Playwright's own default): 2 on a public-repo runner (4 vCPU), 1 on a 2-vCPU
  // private one. Safe in parallel because tests are read-only or use unique names (CLAUDE.md).
  workers: '50%',
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'dotenv -e .env.test -e .env -- npm run dev',
    url: 'http://localhost:3000',
    // Never reuse a running server: it could be connected to a different DB than the one the
    // guard verified.
    reuseExistingServer: false,
    timeout: 120000, // 2 minutes timeout
  },
}); 