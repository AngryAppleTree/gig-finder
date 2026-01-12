import { test as setup, expect } from '@playwright/test';

/**
 * Clerk Authentication Setup - MANUAL 2FA WORKAROUND
 * 
 * This script handles Clerk login with 2FA using a MANUAL workaround.
 * 
 * HOW TO RUN:
 * -----------
 * Localhost: npx playwright test clerk-auth.setup.ts --project=setup --headed
 * PREVIEW: BASE_URL=https://your-preview-url npx playwright test clerk-auth.setup.ts --project=setup --headed
 * 
 * WHAT HAPPENS:
 * -------------
 * 1. Browser opens to sign-in page (--headed mode)
 * 2. Script fills email and password automatically
 * 3. **YOU MUST MANUALLY ENTER THE 2FA CODE** when prompted
 * 4. Script waits for successful login
 * 5. Session is saved to tests/.auth/user.json (localhost) or user-preview.json (PREVIEW)
 * 6. All tests using 'chromium-clerk' project will reuse this session
 * 
 * WHEN TO RE-RUN:
 * ---------------
 * - Session expires (Clerk sessions last ~7 days)
 * - Tests fail with authentication errors
 * - After clearing tests/.auth/ directory
 * 
 * CREDENTIALS:
 * ------------
 * Email: TEST_USER_EMAIL from .env.local
 * Password: TEST_USER_PASSWORD from .env.local
 * 2FA: Manual entry required (from your authenticator app)
 */

// Determine which auth file to use based on BASE_URL
const baseURL = process.env.BASE_URL || 'http://localhost:3000';
const isPreview = baseURL.includes('vercel.app');
const USER_AUTH_FILE = isPreview ? 'tests/.auth/user-preview.json' : 'tests/.auth/user.json';

setup('authenticate with Clerk (manual 2FA)', async ({ page }) => {
    console.log('🔐 Starting Clerk authentication...');
    console.log('🌐 Target URL:', baseURL);
    console.log('📁 Will save session to:', USER_AUTH_FILE);
    console.log('');
    console.log('⚠️  MANUAL STEP REQUIRED:');
    console.log('   When prompted, you must manually enter your 2FA code');
    console.log('');

    // Get credentials from environment
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        throw new Error(
            '❌ Missing credentials! Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local'
        );
    }

    try {
        // Navigate to sign-in page
        console.log('1️⃣  Navigating to /sign-in...');
        await page.goto('/sign-in');

        // Fill email
        console.log('2️⃣  Filling email...');
        const emailInput = page.locator('input[name="identifier"], input[type="email"]');
        await expect(emailInput).toBeVisible({ timeout: 10000 });
        await emailInput.fill(email);
        await page.keyboard.press('Enter');

        // Fill password
        console.log('3️⃣  Filling password...');
        const passwordInput = page.locator('input[name="password"], input[type="password"]');
        await expect(passwordInput).toBeVisible({ timeout: 10000 });
        await passwordInput.fill(password);
        await page.keyboard.press('Enter');

        // Wait for 2FA or successful login
        console.log('');
        console.log('⏳ WAITING FOR 2FA...');
        console.log('   👉 Please enter your 2FA code in the browser window');
        console.log('   👉 The script will wait up to 60 seconds');
        console.log('');

        // Wait for successful redirect (gives user time to enter 2FA)
        await page.waitForURL(/gigfinder|dashboard/, { timeout: 60000 });

        console.log('✅ Login successful!');

        // Save authentication state
        await page.context().storageState({ path: USER_AUTH_FILE });
        console.log(`✅ Session saved to ${USER_AUTH_FILE}`);
        console.log('');
        console.log('🎉 Authentication setup complete!');
        console.log('   All tests using "chromium-clerk" project will now use this session');

    } catch (error) {
        console.error('');
        console.error('❌ Authentication failed!');
        console.error('');

        // Save debug screenshot
        await page.screenshot({ path: 'tests/auth-debug.png', fullPage: true });
        console.error('📸 Debug screenshot saved to: tests/auth-debug.png');
        console.error('');

        if (error instanceof Error) {
            if (error.message.includes('Timeout')) {
                console.error('⏱️  Timeout Error:');
                console.error('   - Did you enter the 2FA code?');
                console.error('   - Check if you were redirected to /gigfinder or /dashboard');
                console.error('   - Try running again with more time');
            } else {
                console.error('Error details:', error.message);
            }
        }

        throw error;
    }
});
