import { defineConfig, devices } from '@playwright/test';

/**
 * Phase 0 config — no webServer block, reuses already-running dev server.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  timeout: 120000,
  use: {
    baseURL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:3000',
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
