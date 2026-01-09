import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for Regular User (Clerk)
 * 
 * This file authenticates a regular user via Clerk and saves the session state.
 * 
 * PRE-REQUISITES:
 * 1. You must have a test user in Clerk.
 * 2. You might need to set up 'Testing Tokens' in your Clerk Dashboard
 *    if you want to bypass 2FA/email verification or purely purely programmatic login.
 * 
 * For now, this script attempts a standard UI login flow or uses the Clerk Testing API if configured.
 */

const USER_AUTH_FILE = 'tests/.auth/user.json';

setup('authenticate as regular clerk user', async ({ page }) => {
    // Navigate to the sign-in page
    // Note: Adjust the URL if your sign-in page is different (e.g. /sign-in, /login)
    // The main app usually redirects restricted pages to sign-in.
    await page.goto('/sign-in');

    // Wait for the Clerk sign-in form to appear
    // This selector targets the Clerk sign-in input. Clerk classes are dynamic,
    // so we target by name or placeholder or accessible role.
    const emailInput = page.locator('input[name="identifier"], input[type="email"]');

    // ⚠️ TODO: Replace these credentials with valid test user credentials
    // Ideally store these in .env.local as TEST_USER_EMAIL and TEST_USER_PASSWORD
    const email = process.env.TEST_USER_EMAIL || 'test-user@gigfinder.com';
    const password = process.env.TEST_USER_PASSWORD || 'password123';

    try {
        console.log(`Navigating to /sign-in...`);
        // Wait for input to be attached to DOM
        // The locator logic is a bit brittle with dynamic Clerk changes, but let's try strict visibility
        await expect(emailInput).toBeVisible({ timeout: 10000 });
        console.log('Email input found');

        await emailInput.fill(email);
        await page.keyboard.press('Enter');
        console.log('Email submitted');

        // Wait for password input (Clerk often has a multi-step form)
        const passwordInput = page.locator('input[name="password"], input[type="password"]');
        await expect(passwordInput).toBeVisible({ timeout: 10000 });
        console.log('Password input found');

        await passwordInput.fill(password);
        await page.keyboard.press('Enter');
        console.log('Password submitted');

        // Wait for successful redirection to dashboard or home
        // Clerk usually redirects to /gigfinder or / after login
        await page.waitForURL(/gigfinder|dashboard/, { timeout: 15000 });
        console.log('Redirect successful');

        // Save state
        await page.context().storageState({ path: USER_AUTH_FILE });
        console.log('✅ User authentication setup complete');

    } catch (error) {
        console.error('❌ Login failed:', error);
        await page.screenshot({ path: 'tests/auth-debug.png', fullPage: true });
        console.log('📸 Debug screenshot saved to tests/auth-debug.png');
        console.warn('Check tests/auth-debug.png to see what the browser saw.');
        // We throw error now so it marks as failed visibly
        throw error;
    }
});
