import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: 'e2e',
    fullyParallel: true,
    reporter: 'dot',
    // Configure projects for major browsers.
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});