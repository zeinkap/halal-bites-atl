import { defineConfig, devices } from '@playwright/test';
import http from 'http';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

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

// Run the check before tests start
checkServer();

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
    command: process.env.SERVER_ALREADY_RUNNING === 'true' 
      ? 'echo "Using existing server"' 
      : 'dotenv -e .env.test -- npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes timeout
  },
}); 