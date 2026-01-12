import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

// Determine which auth file to use based on BASE_URL
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isPreview = baseURL.includes('vercel.app');
const userAuthFile = isPreview ? 'tests/.auth/user-preview.json' : 'tests/.auth/user.json';

export default defineConfig({
    testDir: './tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: 'list',
    use: {
        baseURL: baseURL,
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: [],
        },
        {
            name: 'chromium-clerk',
            use: {
                ...devices['Desktop Chrome'],
                storageState: userAuthFile,
            },
            // Note: Setup dependency is commented out because Clerk auth requires manual 2FA
            // To refresh auth session, run manually:
            //   Localhost: npx playwright test clerk-auth.setup.ts --project=setup --headed
            //   PREVIEW: BASE_URL=https://your-preview-url npx playwright test clerk-auth.setup.ts --project=setup --headed
            // Then enter 2FA code when prompted. Session will be saved to the appropriate auth file.
            // dependencies: ['setup'],
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120 * 1000,
    },
});
