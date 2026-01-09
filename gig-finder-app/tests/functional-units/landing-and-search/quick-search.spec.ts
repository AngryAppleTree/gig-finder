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
import { QuickSearchComponent } from '../../page-objects/QuickSearch';

test.describe('Quick Search Component', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to homepage where QuickSearch resides
        await page.goto('/gigfinder');
    });

    test.describe('Structure & Visibility', () => {

        test('component is visible on homepage', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.expectVisible();
        });

        test('inputs have correct placeholders', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.expectPlaceholders();
        });

        test('search button is enabled by default', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.expectSearchButtonEnabled();
        });
    });

    test.describe('Search Functionality', () => {

        test('searches by keyword only', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.search('Beatles', '', '');

            await search.expectRedirectToResults({ keyword: 'Beatles' });
        });

        test('searches by city only', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.search('', 'Liverpool', '');

            await search.expectRedirectToResults({ location: 'Liverpool' });
        });

        test('searches by date only', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            const testDate = '2025-12-31';
            await search.search('', '', testDate);

            await search.expectRedirectToResults({ minDate: testDate });
        });

        test('searches with combined criteria', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.search('Oasis', 'Manchester', '2025-06-01');

            await search.expectRedirectToResults({
                keyword: 'Oasis',
                location: 'Manchester',
                minDate: '2025-06-01'
            });
        });
    });

    test.describe('Keyboard Interaction', () => {

        test('pressing Enter on keyword input triggers search', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.fillKeyword('EnterKeyTest');
            await search.pressEnterOn('keyword');

            await search.expectRedirectToResults({ keyword: 'EnterKeyTest' });
        });

        test('pressing Enter on city input triggers search', async ({ page }) => {
            const search = new QuickSearchComponent(page);
            await search.fillCity('EnterCityTest');
            await search.pressEnterOn('city');

            await search.expectRedirectToResults({ location: 'EnterCityTest' });
        });
    });

    test.describe('Input State Persistence', () => {

        test('inputs retain values while typing', async ({ page }) => {
            const search = new QuickSearchComponent(page);

            await search.fillKeyword('Typing Test');
            await expect(search.keywordInput).toHaveValue('Typing Test');

            await search.fillCity('City Test');
            await expect(search.cityInput).toHaveValue('City Test');
        });
    });

    test.describe('Responsive Design', () => {

        test('displays correctly on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const search = new QuickSearchComponent(page);

            await search.expectVisible();

            // Check vertical stacking if necessary (visual check primarily)
            const keywordBox = await search.keywordInput.boundingBox();
            const cityBox = await search.cityInput.boundingBox();

            // In mobile, city might be below keyword
            if (keywordBox && cityBox) {
                expect(cityBox.y).toBeGreaterThan(keywordBox.y);
            }
        });

        test('displays correctly on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const search = new QuickSearchComponent(page);
            await search.expectVisible();
        });
    });
});
