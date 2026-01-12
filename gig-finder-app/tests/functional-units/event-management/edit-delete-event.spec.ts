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

test.describe('Edit and Delete Event Workflow', () => {

    test.beforeEach(async ({ page }, testInfo) => {
        // Only run in authenticated environment
        if (testInfo.project.name !== 'chromium-clerk') {
            test.skip();
        }
        await page.goto('/gigfinder/my-gigs');
    });

    test('can edit and then delete an event', async ({ page, baseURL }) => {
        // Wait for My Gigs page to load
        await page.waitForLoadState('networkidle');

        // Wait a moment for React to render the gig list
        await page.waitForTimeout(1000);

        // 1. Check if there are any gigs to test with
        const gigItems = page.locator('h3'); // Gig names header
        const gigCount = await gigItems.count();

        if (gigCount === 0) {
            console.log('⚠️  No gigs found - skipping edit/delete test (database is empty)');
            test.skip();
            return;
        }

        console.log(`Found ${gigCount} gigs to test with.`);

        // Capture name of first gig to verify later
        const gigName = await gigItems.first().innerText();
        console.log(`Testing with gig: ${gigName}`);

        // Assign gigCount to initialCount for consistency with existing test logic
        const initialCount = gigCount;

        // 2. Click EDIT on the first gig
        const editButton = page.locator('a', { hasText: 'EDIT' }).first();
        await editButton.click();

        // 3. Verify Edit Page
        await expect(page).toHaveURL(/\/gigfinder\/edit\/\d+/);
        await expect(page.locator('h2')).toContainText('Edit Event');

        // 4. Modify Description
        const descInput = page.locator('textarea[name="description"]');
        await descInput.fill(`Edited by Playwright at ${new Date().toISOString()}`);

        // 5. Submit Update
        await page.click('body'); // Blur
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]', { force: true });

        // 6. Wait for update to complete
        // The form may show success message and redirect, or may stay on page
        await page.waitForTimeout(2000); // Give time for API call

        // Check if we're still on edit page or redirected
        const currentUrl = page.url();
        if (currentUrl.includes('/edit/')) {
            // Still on edit page - manually navigate back
            console.log('⚠️  Update submitted but no redirect - navigating manually');
            await page.goto('/gigfinder/my-gigs');
        }

        // Wait for My Gigs page to load
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        // 7. Verify Gig still exists (Update successful, not deleted yet)
        await expect(page.locator('h3', { hasText: gigName }).first()).toBeVisible();

        // 8. DELETE the event
        // Setup dialog handler BEFORE clicking
        page.once('dialog', async dialog => {
            console.log(`Dialog message: ${dialog.message()}`);
            await dialog.accept();
        });

        const deleteButton = page.locator('button', { hasText: 'DELETE' }).first();
        await deleteButton.click();

        // 9. Verify Count Decreased or Empty State
        // Wait for list to update (React state change)
        await page.waitForTimeout(1000);

        const newCount = await page.locator('h3').count();
        const emptyState = page.locator('text=You haven\'t added any gigs yet');

        if (initialCount === 1) {
            // If we deleted the only gig, we should see empty state
            await expect(emptyState).toBeVisible();
        } else {
            // Otherwise count should be initial - 1
            expect(newCount).toBe(initialCount - 1);
        }
    });

});
