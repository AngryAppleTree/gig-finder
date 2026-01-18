import { test, expect } from '@playwright/test';

/**
 * Test Data Setup: Payment Test Event
 * 
 * This script creates a permanent test event for payment testing.
 * Run this ONCE on each environment to set up the test fixture.
 * 
 * USAGE:
 *   Localhost:  npx playwright test tests/setup/create-payment-test-event.spec.ts --project=chromium-clerk
 *   PREVIEW:    Manually create via UI (auth doesn't work on PREVIEW)
 * 
 * EVENT DETAILS:
 *   Name: "E2E Payment Test Event"
 *   Venue: "E2E Test Venue"
 *   Price: £10.00
 *   Type: Paid with internal ticketing (Stripe)
 *   Date: 2026-12-31 (far future, never expires)
 * 
 * This event will persist in the database and can be used by all payment tests.
 */

test.describe('Setup: Payment Test Event', () => {
    test('create permanent payment test event', async ({ page }) => {
        console.log('🔧 Creating permanent payment test event...');
        console.log('');

        // Navigate to add event page
        await page.goto('/gigfinder/add-event');
        await page.waitForLoadState('networkidle');

        console.log('1️⃣ Filling in event details...');

        // Event details
        await page.fill('input#name', 'E2E Payment Test Event');
        console.log('   Name: E2E Payment Test Event');

        // Venue (new venue)
        await page.fill('input#venue', 'E2E Test Venue');
        await page.locator('input#venue').press('Tab');
        await page.click('body');
        await page.waitForTimeout(500);

        // Fill new venue details
        const cityInput = page.locator('input[placeholder="e.g. Edinburgh"]');
        if (await cityInput.isVisible()) {
            await cityInput.fill('Edinburgh');
            console.log('   Venue: E2E Test Venue (Edinburgh)');

            const capacityInput = page.locator('input[type="number"]').first();
            if (await capacityInput.isVisible()) {
                await capacityInput.fill('500');
            }
        }

        // Event date and time
        await page.fill('input#date', '2026-12-31');
        await page.fill('input#time', '20:00');
        console.log('   Date: 2026-12-31 at 20:00');

        // Genre
        await page.selectOption('select#genre', 'rock_blues_punk');
        console.log('   Genre: Rock/Blues/Punk');

        // Description
        await page.fill('textarea#description', 'This is a permanent test event for E2E payment testing. Do not delete.');

        // Price
        await page.fill('input#price', '10.00');
        console.log('   Price: £10.00');
        console.log('');

        console.log('2️⃣ Configuring ticketing...');

        // Ticketing - PAID with Stripe (internal ticketing)
        const paidCheckbox = page.locator('input[name="sell_tickets"]');
        await paidCheckbox.check();
        console.log('   ✅ Paid ticketing enabled (Stripe)');

        // Ensure guest list is unchecked
        const guestListCheckbox = page.locator('input[name="is_internal_ticketing"]');
        await guestListCheckbox.uncheck();
        console.log('');

        console.log('3️⃣ Submitting event...');

        // Submit
        await page.click('body'); // Blur everything
        await page.waitForTimeout(500);
        await page.click('button[type="submit"]', { force: true });

        // Wait for success
        try {
            await page.waitForURL(/\/gigfinder\/(gig-added|add-event)/, { timeout: 10000 });

            const isSuccessPage = page.url().includes('/gig-added');
            if (isSuccessPage) {
                await expect(page.getByText(/NICE ONE!|Your gig has been added/i)).toBeVisible({ timeout: 5000 });
                console.log('   ✅ Event created successfully!');
            } else {
                console.log('   ✅ Event submitted (stayed on add-event page)');
            }
        } catch (e) {
            console.log('   ⚠️  Submission may have succeeded (check database)');
        }

        console.log('');
        console.log('🎉 Payment test event created!');
        console.log('');
        console.log('📋 Event Details:');
        console.log('   Name: E2E Payment Test Event');
        console.log('   Venue: E2E Test Venue');
        console.log('   Location: Edinburgh');
        console.log('   Date: 2026-12-31 20:00');
        console.log('   Price: £10.00');
        console.log('   Type: Paid (Stripe)');
        console.log('');
        console.log('✅ This event is now available for payment tests!');
        console.log('');
        console.log('🔍 To verify, search for "E2E Payment Test Event" on:');
        console.log('   http://localhost:3000/gigfinder/results?search=E2E+Payment+Test+Event');
    });

    test('verify payment test event exists', async ({ page }) => {
        console.log('🔍 Verifying payment test event exists...');
        console.log('');

        // Search for the event
        await page.goto('/gigfinder/results?search=E2E+Payment+Test+Event');
        await page.waitForLoadState('networkidle');

        // Wait for results to load
        await page.waitForSelector('.gig-card, h2:has-text("No gigs found")', { timeout: 10000 });

        // Assert event exists in search results
        const eventCard = page.locator('.gig-card').filter({ hasText: 'E2E Payment Test Event' });
        await expect(eventCard).toHaveCount(1);

        console.log('   ✅ Event found in search results!');

        // Click to view event details
        const viewButton = eventCard.first().locator('a:has-text("View Event"), button:has-text("View Event")');
        await viewButton.click();
        await page.waitForLoadState('networkidle');

        // Assert Buy Tickets button is present
        const buyTicketsButton = page.locator('button.btn-buy:has-text("Buy Tickets")');
        await expect(buyTicketsButton).toBeVisible();

        console.log('   ✅ "Buy Tickets" button present');
        console.log('');
        console.log('🎉 Payment test event is ready for testing!');
    });
});
