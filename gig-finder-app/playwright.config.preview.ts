import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

/**
 * Playwright configuration for testing Preview environment
 * 
 * This config is used to run tests against the deployed Preview environment
 * on Vercel, without starting a local dev server.
 * 
 * Usage:
 *   npx playwright test --config=playwright.config.preview.ts
 */
export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 2, // Retry failed tests on Preview (network issues)
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: process.env.BASE_URL || 'https://gigfinder-git-develop-contactangryappletree-4366s-projects.vercel.app',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'chromium-clerk',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'tests/.auth/user-preview.json', // PREVIEW-specific auth
            },
            dependencies: ['setup'], // Run setup to create auth state
        },
    ],
    // No webServer config - we're testing against deployed Preview
});
