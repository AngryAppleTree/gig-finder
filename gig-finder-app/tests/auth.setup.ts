import { test as setup, expect } from '@playwright/test';

/**
 * Authentication Setup for Admin Tests
 * 
 * This file creates an authenticated admin session that can be reused
 * across tests. It logs in as the admin user and saves the authentication
 * state (cookies) to a file.
 * 
 * Usage in tests:
 * - Import this setup in playwright.config.ts as a dependency
 * - Tests will automatically use the saved auth state
 */

const ADMIN_AUTH_FILE = 'tests/.auth/admin.json';

setup('authenticate as admin', async ({ page }) => {
    // Navigate to admin login page
    await page.goto('/admin/login');

    // Fill in admin credentials
    await page.fill('input[type="email"]', 'alex.bunch@angryappletree.com');
    await page.fill('input[type="password"]', '123WeeWorkee123');

    // Click login button and wait for navigation
    await Promise.all([
        page.waitForURL('/admin', { timeout: 10000 }),
        page.click('button[type="submit"]'),
    ]);

    // Verify we're logged in by checking we're on the admin page
    await expect(page).toHaveURL('/admin');

    // Optionally verify admin content is visible
    // (The admin page might have different content, so we just check the URL)

    // Save authentication state to file
    await page.context().storageState({ path: ADMIN_AUTH_FILE });

    console.log('✅ Admin authentication setup complete');
});
