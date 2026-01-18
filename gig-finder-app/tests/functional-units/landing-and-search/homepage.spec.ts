/**
 * Functional Unit: Landing Page and Gig Search
 * 
 * ⚠️ TEST POLICY: Do NOT add .skip() when tests fail
 * Failed tests indicate real issues that need to be addressed:
 * - Bugs in the code that need fixing
 * - Changes in behavior that need documenting  
 * - Test assertions that need updating
 * 
 * Only skip tests for documented architectural limitations or disabled features.
 */

import { test, expect } from '@playwright/test';
import { Homepage } from '../../page-objects/Homepage';

test.describe('Homepage Elements', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/gigfinder');
    });

    test('Loads main elements correctly', async ({ page }) => {
        const home = new Homepage(page);
        await home.expectLoaded();
        // Check main CTAs are visible
        await expect(home.addGigButton).toBeVisible();
        await expect(home.myGigsButton).toBeVisible();
    });

    test.describe('Navigation & Auth', () => {

        test('Sign In button is visible and clickable', async ({ page, context }) => {
            // Clear auth state to ensure we're signed out
            await context.clearCookies();
            await page.goto('/gigfinder');

            const home = new Homepage(page);
            await home.expectSignedOut();

            // Note: Since this opens a 3rd party modal (Clerk), we mainly test the trigger exists
            // Clicking it might lead to a cross-origin iframe or modal which is complex to test without setup
            await expect(home.signInButton).toBeEnabled();
        });

        test('Add Gig button navigates correctly', async ({ page }) => {
            const home = new Homepage(page);
            await home.addGigButton.click();

            // Should navigate to add-event page
            // Note: Middleware might redirect to sign-in if unauthenticated, 
            // checking that we left the homepage is a good start, or checking the URL contains 'add-event' or 'sign-in'
            await expect(page).toHaveURL(/\/gigfinder\/add-event|sign-in/);
        });

        test('My Gigs button navigates correctly', async ({ page }) => {
            const home = new Homepage(page);
            await home.myGigsButton.click();

            // Should navigate to my-gigs page
            // Similarly, might redirect to sign-in
            await expect(page).toHaveURL(/\/gigfinder\/my-gigs|sign-in/);
        });
    });

    test.describe('User Roles & Visibility', () => {

        test('Public User (Unauthenticated) DOES NOT see Admin Console button', async ({ page }) => {
            const home = new Homepage(page);
            await home.expectSignedOut();
            await home.expectAdminButtonHidden();
        });

        // Admin test - SKIPPED: Requires Clerk user with admin role in publicMetadata
        test.skip('Admin User DOES see Admin Console button @admin', async ({ page }) => {
            // LIMITATION: The admin button visibility is controlled by Clerk's publicMetadata.role === 'admin'
            // Our cookie-based admin auth (/admin/login) is separate from Clerk authentication
            // 
            // To enable this test, we would need to:
            // 1. Set up a Clerk test user with admin role in publicMetadata, OR
            // 2. Modify the Wizard component to check for admin cookie instead of Clerk role
            //
            // See: /app/gigfinder/page.tsx line 21: `const isAdmin = user?.publicMetadata?.role === 'admin';`
            //
            // TODO: Decide on unified admin authentication strategy

            const home = new Homepage(page);
            await page.goto('/gigfinder');
            await home.expectAdminButtonVisible();
        });
    });
});
