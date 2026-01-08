import { test, expect } from '@playwright/test';

test.describe('Add Event Feature', () => {

    test('Redirects unauthenticated users', async ({ page }) => {
        await page.goto('/gigfinder/add-event');
        // Since we are not logged in, we expect to be redirected to sign-in or stay on loading
        // Check if we left the page or see loading
        // Ideally check for URL change
        await expect(page).not.toHaveURL(/\/gigfinder\/add-event$/);
    });
});
