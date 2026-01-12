/**
 * Functional Unit: Event Management
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

test.describe('My Gigs Page', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        // Only run in authenticated environment
        if (testInfo.project.name !== 'chromium-clerk') {
            test.skip();
        }
        await page.goto('/gigfinder/my-gigs');
    });

    test('renders correctly', async ({ page }) => {
        // Verify Header
        await expect(page.locator('h1.main-title')).toHaveText('MY GIGS');

        // Verify Navigation Buttons
        await expect(page.locator('a', { hasText: '+ NEW GIG' })).toBeVisible();
        await expect(page.locator('a', { hasText: '← FIND GIGS' })).toBeVisible();
    });

    test('shows list of gigs or empty state', async ({ page }) => {
        // Check for either the Empty State OR the Gig List
        // We use a race condition check or an `or` locator

        const emptyStateHeader = page.locator('h2', { hasText: "It's Quiet Here..." });
        const gigListItems = page.locator('h3'); // Gig names are likely H3s based on code

        await expect(emptyStateHeader.or(gigListItems.first())).toBeVisible();

        // If empty state is visible, check for "START PROMOTING" button
        if (await emptyStateHeader.isVisible()) {
            await expect(page.locator('a', { hasText: 'START PROMOTING' })).toBeVisible();
        }

        // If gigs are visible, check for Edit/Delete buttons on the first item
        if (await gigListItems.count() > 0) {
            await expect(page.locator('a', { hasText: 'EDIT' }).first()).toBeVisible();
            await expect(page.locator('button', { hasText: 'DELETE' }).first()).toBeVisible();
        }
    });

});
