import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    fullyParallel: false,
    retries: 0,
    workers: 1,
    reporter: [['list'], ['json', { outputFile: '/private/tmp/claude-501/meet-test-results.json' }]],
    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on',
        screenshot: 'on',
        video: 'on',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // No webServer — reuse the already-running dev server
});
