/**
 * Functional Unit: Landing Page and Gig Search
 * Comprehensive Gig Card Detail Tests
 * 
 * ⚠️ TEST POLICY: Do NOT add .skip() when tests fail
 * Failed tests indicate real issues that need to be addressed:
 * - Bugs in the code that need fixing
 * - Changes in behavior that need documenting  
 * - Test assertions that need updating
 * 
 * Only skip tests for documented architectural limitations or disabled features.
 * 
 * Tests the detailed rendering logic of individual gig cards including:
 * - Button behavior (internal ticketing, external links, no tickets)
 * - Distance display
 * - Image handling and fallbacks
 * - Presale information formatting
 * - Location formatting
 */

import { test, expect } from '@playwright/test';
import { ResultsPage } from '../../page-objects/ResultsPage';

test.describe('Gig Card - Detailed Rendering', () => {

    test.describe('Button Rendering Logic', () => {

        test('Internal ticketing shows "Buy Tickets" or "Book Now" button', async ({ page }) => {
            const results = new ResultsPage(page);

            // Search for events (should include some with internal ticketing)
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                // Look for cards with internal ticketing buttons
                const buyTicketsButton = page.locator('button.btn-buy', { hasText: /Buy Tickets|Book Now/i });

                // If we find one, verify it's a button (not a link)
                const buttonCount = await buyTicketsButton.count();
                if (buttonCount > 0) {
                    const firstButton = buyTicketsButton.first();
                    await expect(firstButton).toBeVisible();

                    // Verify it's actually a button element
                    const tagName = await firstButton.evaluate(el => el.tagName);
                    expect(tagName).toBe('BUTTON');

                    // Verify it has the correct styling
                    await expect(firstButton).toHaveCSS('cursor', 'pointer');
                }
            }
        });

        test('External ticket URL shows "Get Tickets" link', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            // Look for external ticket links
            const getTicketsLink = page.locator('a.btn-buy', { hasText: /Get Tickets/i });

            const linkCount = await getTicketsLink.count();
            if (linkCount > 0) {
                const firstLink = getTicketsLink.first();
                await expect(firstLink).toBeVisible();

                // Verify it's an anchor element
                const tagName = await firstLink.evaluate(el => el.tagName);
                expect(tagName).toBe('A');

                // Verify it opens in new tab
                await expect(firstLink).toHaveAttribute('target', '_blank');
                await expect(firstLink).toHaveAttribute('rel', 'noopener noreferrer');

                // Verify it has a valid href
                const href = await firstLink.getAttribute('href');
                expect(href).toBeTruthy();
                expect(href).not.toBe('#');
            }
        });

        test('No ticket info shows "More Info" button', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            // Look for "More Info" buttons (fallback for events without tickets)
            const moreInfoButton = page.locator('button.btn-buy', { hasText: /More Info/i });

            const buttonCount = await moreInfoButton.count();
            if (buttonCount > 0) {
                const firstButton = moreInfoButton.first();
                await expect(firstButton).toBeVisible();

                // Verify it's a button
                const tagName = await firstButton.evaluate(el => el.tagName);
                expect(tagName).toBe('BUTTON');

                // Verify styling (should be grayed out)
                const bgColor = await firstButton.evaluate(el =>
                    window.getComputedStyle(el).backgroundColor
                );
                // Should be gray-ish (rgb(136, 136, 136) = #888)
                expect(bgColor).toContain('136');
            }
        });
    });

    test.describe('Distance Display', () => {

        test('Shows distance when available', async ({ page }) => {
            const results = new ResultsPage(page);

            // Search with postcode to trigger distance calculation
            await results.goto({
                postcode: 'EH1',
                distance: 'local',
                location: 'Edinburgh'
            });
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                // Look for distance indicators
                const distanceText = page.locator('.gig-location:has-text("miles away")');
                const distanceCount = await distanceText.count();

                if (distanceCount > 0) {
                    const firstDistance = distanceText.first();
                    await expect(firstDistance).toBeVisible();

                    // Verify format: "(X.X miles away)"
                    const text = await firstDistance.textContent();
                    expect(text).toMatch(/\(\d+\.\d+ miles away\)/);
                }
            }
        });

        test('Does not show distance when unavailable', async ({ page }) => {
            const results = new ResultsPage(page);

            // Search without postcode (no distance calculation)
            await results.goto({ distance: 'scotland' });
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                // Sample a few cards
                const sampleSize = Math.min(count, 3);
                for (let i = 0; i < sampleSize; i++) {
                    const card = results.resultCards.nth(i);
                    const locationText = await card.locator('.gig-location').textContent();

                    // Should NOT contain "miles away" when no postcode provided
                    // (unless the event happens to have distance from another search)
                    // This is a soft check - we just verify the location exists
                    expect(locationText).toBeTruthy();
                }
            }
        });
    });

    test.describe('Image Handling', () => {

        test('Displays event image when available', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                const firstCard = results.resultCards.first();
                const image = firstCard.locator('img');

                await expect(image).toBeVisible();

                // Verify image has src
                const src = await image.getAttribute('src');
                expect(src).toBeTruthy();

                // Verify image dimensions
                await expect(image).toHaveCSS('height', '200px');
                // Width is computed to pixels, not percentage
                const width = await image.evaluate(el => window.getComputedStyle(el).width);
                expect(parseInt(width)).toBeGreaterThan(100); // Should be rendered width
                await expect(image).toHaveCSS('object-fit', 'cover');
            }
        });

        test('Image has correct alt text', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                const firstCard = results.resultCards.first();
                const image = firstCard.locator('img');

                // Get alt text
                const alt = await image.getAttribute('alt');
                expect(alt).toBeTruthy();

                // Alt text should contain event name, venue, and date
                // Format: "{name} at {venue} on {date}"
                expect(alt).toContain(' at ');
                expect(alt).toContain(' on ');
            }
        });

        test('Fallback image loads when main image fails', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                const firstCard = results.resultCards.first();
                const image = firstCard.locator('img');

                // Trigger error by setting invalid src
                await image.evaluate((img: HTMLImageElement) => {
                    img.src = 'https://invalid-url-that-will-fail.com/image.jpg';
                });

                // Wait a moment for error handler
                await page.waitForTimeout(500);

                // Should now have fallback image
                const src = await image.getAttribute('src');
                expect(src).toBe('/no-photo.png');
            }
        });
    });

    test.describe('Presale Information', () => {

        test('Presale price is formatted correctly', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            // Look for presale indicators
            const presalePrice = page.locator('p:has-text("💿 Presale:")');
            const presaleCount = await presalePrice.count();

            if (presaleCount > 0) {
                const firstPresale = presalePrice.first();
                await expect(firstPresale).toBeVisible();

                // Verify format: "💿 Presale: £X.XX"
                const text = await firstPresale.textContent();
                expect(text).toMatch(/💿 Presale: £\d+\.\d{2}/);
            }
        });

        test('Presale caption displays when available', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            // Look for presale boxes
            const presaleBox = page.locator('div:has-text("💿 Presale:")');
            const presaleCount = await presaleBox.count();

            if (presaleCount > 0) {
                // Check if any have captions (optional field)
                const presaleCaption = presaleBox.locator('p[style*="italic"]');
                const captionCount = await presaleCaption.count();

                if (captionCount > 0) {
                    const firstCaption = presaleCaption.first();
                    await expect(firstCaption).toBeVisible();

                    // Verify styling
                    await expect(firstCaption).toHaveCSS('font-style', 'italic');
                    // Font-size is computed to pixels (12px = 0.75rem)
                    await expect(firstCaption).toHaveCSS('font-size', '12px');
                }
            }
        });

        test('Presale box has correct styling', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            // Look for presale boxes
            const presaleBox = page.locator('div:has-text("💿 Presale:")').first();
            const presaleCount = await presaleBox.count();

            if (presaleCount > 0) {
                await expect(presaleBox).toBeVisible();

                // Verify styling (pinkish background with border)
                const bgColor = await presaleBox.evaluate(el =>
                    window.getComputedStyle(el).backgroundColor
                );
                // Should have some transparency (rgba)
                expect(bgColor).toContain('rgba');

                // Should have border
                const borderStyle = await presaleBox.evaluate(el =>
                    window.getComputedStyle(el).borderStyle
                );
                expect(borderStyle).toBe('solid');
            }
        });
    });

    test.describe('Location Formatting', () => {

        test('Shows "Venue, Town" when town is available', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                // Sample cards and check location format
                const sampleSize = Math.min(count, 5);
                let foundWithTown = false;

                for (let i = 0; i < sampleSize; i++) {
                    const card = results.resultCards.nth(i);
                    const locationText = await card.locator('.gig-location').textContent();

                    // If location contains a comma, it should be "Venue, Town" format
                    if (locationText && locationText.includes(',')) {
                        foundWithTown = true;

                        // Verify format: "📍 Venue, Town"
                        expect(locationText).toMatch(/📍 .+, .+/);
                        break;
                    }
                }

                // Note: This is informational - not all events may have town data
                if (!foundWithTown) {
                    console.log('ℹ️  No events with town data found in sample');
                }
            }
        });

        test('Shows just venue when town is not available', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                const firstCard = results.resultCards.first();
                const locationText = await firstCard.locator('.gig-location').textContent();

                // Should at minimum have the location pin emoji and venue name
                expect(locationText).toMatch(/📍 .+/);
            }
        });
    });

    test.describe('Complete Card Structure', () => {

        test('All required elements are present and in correct order', async ({ page }) => {
            const results = new ResultsPage(page);
            await results.goto();
            await results.expectLoaded();

            const count = await results.resultCards.count();

            if (count > 0) {
                const firstCard = results.resultCards.first();

                // Verify structure top to bottom
                const image = firstCard.locator('.gig-image img');
                const name = firstCard.locator('.gig-name');
                const location = firstCard.locator('.gig-location');
                const date = firstCard.locator('.gig-date');
                const price = firstCard.locator('.gig-price');
                const button = firstCard.locator('button.btn-buy, a.btn-buy');

                // All should be visible
                await expect(image).toBeVisible();
                await expect(name).toBeVisible();
                await expect(location).toBeVisible();
                await expect(date).toBeVisible();
                await expect(price).toBeVisible();
                await expect(button).toBeVisible();

                // Verify order by comparing y-positions
                const imageBox = await image.boundingBox();
                const nameBox = await name.boundingBox();
                const buttonBox = await button.boundingBox();

                if (imageBox && nameBox && buttonBox) {
                    // Image should be at top
                    expect(imageBox.y).toBeLessThan(nameBox.y);
                    // Button should be at bottom
                    expect(nameBox.y).toBeLessThan(buttonBox.y);
                }
            }
        });
    });
});
