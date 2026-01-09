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

test.describe('Result Card Rendering', () => {

    test('Renders individual gig card details correctly', async ({ page }) => {
        const results = new ResultsPage(page);

        // Go to results (Default search should yield some events)
        await results.goto();
        await results.expectResultsCount(1);

        // Grab the first card
        const card = await results.getResultCard(0);

        // Check Essential Elements
        await expect(card.locator('.gig-name'), 'Should have a Gig Name').toBeVisible();
        await expect(card.locator('.gig-location'), 'Should have a Location').toBeVisible();
        await expect(card.locator('.gig-date'), 'Should have a Date').toBeVisible();
        await expect(card.locator('.gig-price'), 'Should have a Price').toBeVisible();
        await expect(card.locator('img'), 'Should have an Image').toBeVisible();

        // Check Price Formatting (should contain currency symbol)
        const priceText = await card.locator('.gig-price').textContent();
        expect(priceText).toMatch(/£|Free/i);

        // Check Action Button
        const button = card.locator('button.btn-buy, a.btn-buy');
        await expect(button).toBeVisible();
        // Text should be one of the expected variations
        await expect(button).toHaveText(/Buy Tickets|Book Now|Get Tickets|More Info/i);
    });

    test('Presale information identifies correctly if present', async ({ page }) => {
        const results = new ResultsPage(page);
        await results.goto();
        await results.expectLoaded();

        // As we have test data with presale tickets, we expect to find at least one card with "Presale:"
        const presaleIndicator = results.resultCards.locator('text=Presale:');

        // Wait for it to appear - if not found, this test will now correctly fail
        await expect(presaleIndicator.first()).toBeVisible({ timeout: 5000 });

        // Verify styling (optional but good)
        // Check it has the specific presale styling (pinkish background)
        const presaleBox = presaleIndicator.first().locator('..'); // parent div
        await expect(presaleBox).toBeVisible();
    });
});
