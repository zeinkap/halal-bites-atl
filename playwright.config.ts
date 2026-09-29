import { defineConfig, devices } from '@playwright/test';
import http from 'http';
import dotenv from 'dotenv';
import { assertAllowedTestDatabase } from './tests/utils/db-guard';

// TEST_ENV=1 (npm run test:agent) loads .env.test first, so its DATABASE_URL wins over .env
// (dotenv never overrides an already-set variable). The db-guard then refuses
// to run unless the database name matches ALLOWED_TEST_DB (see tests/utils/db-guard.ts).
const isTestEnv = process.env.TEST_ENV === '1';
if (isTestEnv) {
  dotenv.config({ path: '.env.test' });
}

// Load test environment variables
dotenv.config({ path: '.env' });

// Checked at config load, i.e. before the dev server is started or any test runs.
if (isTestEnv) {
  assertAllowedTestDatabase();
}

// Function to check if server is already running
const isServerRunning = async (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const [hostname, port] = url.replace('http://', '').split(':');
    const options = {
      hostname,
      port,
      timeout: 1000, // 1 second timeout
    };

    const req = http.get(options, (res) => {
      resolve(true);
      res.resume();
    });

    req.on('error', () => {
      resolve(false);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
};

// Check if server is running and set environment variable
const checkServer = async () => {
  const serverRunning = await isServerRunning('http://localhost:3000');
  if (serverRunning) {
    console.log('Server is already running on http://localhost:3000');
    process.env.SERVER_ALREADY_RUNNING = 'true';
  } else {
    console.log('Starting new server instance...');
    process.env.SERVER_ALREADY_RUNNING = 'false';
  }
};

// Run the check once, in the main process. Config is re-evaluated in every test worker, which
// would repeat the check and print misleading "already running" lines (the dev server started
// by webServer is, of course, running by then).
if (process.env.TEST_WORKER_INDEX === undefined) {
  checkServer();
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
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
    command: isTestEnv
      ? 'dotenv -e .env.test -e .env -- npm run dev'
      : process.env.SERVER_ALREADY_RUNNING === 'true'
        ? 'echo "Using existing server"'
        : 'dotenv -e .env -- npm run dev',
    url: 'http://localhost:3000',
    // In test-env mode never reuse a running server: it could be connected to a different DB
    // than the one the guard verified.
    reuseExistingServer: !process.env.CI && !isTestEnv,
    timeout: 120000, // 2 minutes timeout
  },
}); 