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

test.describe('Add Event Page', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/gigfinder/add-event');
    });

    test('renders form correctly', async ({ page }) => {
        // Verify page title/header
        await expect(page.locator('h1')).toHaveText(/GIG\s*FINDER/i);
        await expect(page.locator('h2')).toContainText('Add Your Event');

        // Verify key inputs are present
        await expect(page.locator('input#name')).toBeVisible();
        await expect(page.locator('input#venue')).toBeVisible();
        await expect(page.locator('input#date')).toBeVisible();
        await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

});
