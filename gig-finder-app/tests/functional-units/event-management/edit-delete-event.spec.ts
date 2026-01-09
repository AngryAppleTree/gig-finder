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

    test.beforeEach(async ({ page }) => {
        await page.goto('/gigfinder/my-gigs');
    });

    test('can edit and then delete an event', async ({ page }) => {
        // 1. Verify there is at least one gig to edit
        const gigItems = page.locator('h3'); // Gig names header
        await expect(gigItems.first()).toBeVisible({ timeout: 5000 });
        const initialCount = await gigItems.count();
        console.log(`Found ${initialCount} gigs to test with.`);

        // Capture name of first gig to verify later
        const gigName = await gigItems.first().innerText();
        console.log(`Testing with gig: ${gigName}`);

        // 2. Click EDIT on the first gig
        const editButton = page.locator('a', { hasText: 'EDIT' }).first();
        await editButton.click();

        // 3. Verify Edit Page
        await expect(page).toHaveURL(/\/gigfinder\/edit\/\d+/);
        await expect(page.locator('h1.main-title')).toHaveText('EDIT GIG');

        // 4. Modify Description
        const descInput = page.locator('textarea[name="description"]');
        await descInput.fill(`Edited by Playwright at ${new Date().toISOString()}`);

        // 5. Submit Update
        await page.click('body'); // Blur
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]', { force: true });

        // Check for visible errors if redirect fails
        const errorMsg = page.locator('div:has-text("Error:")');
        if (await errorMsg.isVisible()) {
            console.log('Update failed with error:', await errorMsg.innerText());
        }

        // 6. Verify Redirect back to My Gigs
        await expect(page).toHaveURL(/\/gigfinder\/my-gigs/);

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
