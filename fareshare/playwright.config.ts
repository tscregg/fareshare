import { defineConfig } from '@playwright/test';

// Mobile-first viewport matching the app's 390×844 design target
const mobileViewport = { width: 390, height: 844 };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: mobileViewport,
    isMobile: true,
  },
  projects: [
    // Auth setup — runs first, saves storageState for authenticated tests
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    // Tests that don't require authentication (login, signup pages)
    {
      name: 'no-auth',
      testMatch: /.*\.noauth\.spec\.ts/,
    },
    // Tests that require an authenticated session
    {
      name: 'authenticated',
      testMatch: /.*\.auth\.spec\.ts/,
      dependencies: ['setup'],
      use: {
        storageState: './e2e/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
