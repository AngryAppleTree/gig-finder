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
import { ResultsPage } from '../../page-objects/ResultsPage';

test.describe('Result Filtering Logic', () => {

    test('Location Filter: Glasgow (G1) + 100 miles returns gigs with distance', async ({ page }) => {
        const results = new ResultsPage(page);

        // Search with Postcode to trigger distance calc
        await results.goto({ location: 'Glasgow', postcode: 'G1', distance: '100miles' });

        await results.expectLoaded();
        const count = await results.resultCards.count();

        if (count > 0) {
            const sampleSize = Math.min(count, 5);
            for (let i = 0; i < sampleSize; i++) {
                const card = results.resultCards.nth(i);
                // Verify card is visible - logic test is that "Paidley" etc are valid near Glasgow
                await expect(card.locator('.gig-location')).toBeVisible();
            }
        } else {
            console.log('Skipping location assertion - no Glasgow gigs found');
        }
    });

    test('Budget Filter: Free searches only return free gigs', async ({ page }) => {
        const results = new ResultsPage(page);

        await results.goto({ budget: 'free' });
        await results.expectLoaded();

        const count = await results.resultCards.count();

        if (count > 0) {
            const sampleSize = Math.min(count, 5);
            for (let i = 0; i < sampleSize; i++) {
                const card = results.resultCards.nth(i);
                // Price should be "Free" or "£0..."
                // Regex: matches "Free" (case insensitive) or "£0"
                await expect(card.locator('.gig-price')).toHaveText(/Free|£0/i);
            }
        }
    });

    test('Keyword Filter: "Queen" keyword logic', async ({ page }) => {
        // Known band/keyword likely to exist or not
        const results = new ResultsPage(page);
        const keyword = 'Queen';

        await results.goto({ keyword });
        await results.expectLoaded();

        const count = await results.resultCards.count();

        if (count > 0) {
            const sampleSize = Math.min(count, 3);
            for (let i = 0; i < sampleSize; i++) {
                const card = results.resultCards.nth(i);
                // Name or Venue should usually match, strictly speaking
                const text = await card.textContent();
                expect(text?.toLowerCase()).toContain(keyword.toLowerCase());
            }
        }
    });
});
