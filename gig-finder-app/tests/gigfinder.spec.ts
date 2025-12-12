import { test, expect } from '@playwright/test';

test.describe('GigFinder E2E', () => {

    test('Home Page loads fundamentals', async ({ page }) => {
        await page.goto('/gigfinder');

        // Check title and Header
        await expect(page).toHaveTitle(/GigFinder/);
        await expect(page.locator('.main-title')).toBeVisible();
        await expect(page.getByText('When do you want to go?')).toBeVisible();
    });

    test('Quick Search functionality', async ({ page }) => {
        await page.goto('/gigfinder');

        // Ensure page is loaded (script-api.js initializes)
        const searchCity = page.locator('#searchCity');
        await expect(searchCity).toBeVisible();

        // Perform Search for Edinburgh (default data should be there)
        await searchCity.fill('Edinburgh');
        await page.getByText('SEARCH GIGS').click();

        // Verify Results Page Activated
        const resultsContainer = page.locator('#results');
        await expect(resultsContainer).toHaveClass(/active/);

        // Verify at least the result summary or "No results" message appears
        // The summary text logic ("Search Results" header)
        await expect(page.getByText('Search Results')).toBeVisible();
    });

    test('Wizard navigation works', async ({ page }) => {
        await page.goto('/gigfinder');

        // Step 1: Click "Tonight"
        await page.locator('button[data-value="tonight"]').click();

        // Step 2: Check for correct title
        await expect(page.getByText('How far will you travel?')).toBeVisible();
        // Click "Locally"
        await page.locator('button[data-value="local"]').click();

        // Wait for Postcode Container
        const pcContainer = page.locator('#postcodeInput');
        await expect(pcContainer).toBeVisible();
        const pcInput = page.locator('#postcode');
        await pcInput.fill('EH1');
        await pcInput.press('Enter');

        // Step 3: "What venue size?"
        await expect(page.getByText('What venue size?')).toBeVisible();
    });

});
