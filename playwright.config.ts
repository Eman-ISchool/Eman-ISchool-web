import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Read from default ".env" file.
dotenv.config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || process.env.BASE_URL || 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        
        /* Screenshot settings for visual regression testing */
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    
    /* Configure expect for visual regression */
    expect: {
        /* Maximum time expect() should wait for the condition to be met. */
        timeout: 5000,
        
        /* Visual regression comparison options */
        toHaveScreenshot: {
            /* Maximum acceptable pixel difference */
            maxDiffPixels: 100,
            
            /* Threshold for pixel difference ratio (0-1) */
            threshold: 0.2,
            
            /* Animation handling */
            animations: 'disabled',
        },
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Auto-start dev server before tests */
    webServer: {
        command: 'npm run dev',
        url: process.env.NEXTAUTH_URL || 'http://127.0.0.1:3000',
        reuseExistingServer: true,
        timeout: 60000,
    },
});
