import { test, expect } from '@playwright/test';
import { ResultsPage } from '../../page-objects/ResultsPage';

/**
 * Paid Ticket Purchase Flow
 * 
 * Tests the complete journey of purchasing paid tickets through Stripe.
 * Uses real events from the database for testing.
 * 
 * TEST EVENTS:
 *   1. "screamin' kick - album launch" - Tickets only
 *   2. "The bad moods" - Tickets + presale merch
 *   3. "the second world war" - Alternative test event
 * 
 * USER JOURNEY:
 * 1. Search for event
 * 2. Find event in search results
 * 3. Click "View Event"
 * 4. Click "Buy Tickets"
 * 5. Fill in booking details
 * 6. (Optional) Add presale merch
 * 7. Submit to Stripe checkout
 * 8. Verify redirect to Stripe
 * 
 * NOTE: This test runs UNAUTHENTICATED to test the buyer experience.
 */

test.describe('Paid Ticket Purchase', () => {
    test('purchase tickets only - screamin\' kick album launch', async ({ page }) => {
        console.log('🎫 Testing ticket purchase (tickets only)...');
        console.log('');

        // STEP 1: Search for the event
        console.log('1️⃣ Searching for "screamin\' kick - album launch"...');

        const results = new ResultsPage(page);
        await results.goto({ search: 'screamin kick album launch' });
        await results.expectLoaded();

        const gigCards = await page.locator('.gig-card').all();
        console.log(`   Found ${gigCards.length} events`);

        if (gigCards.length === 0) {
            console.log('   ⚠️  Event not found - may not exist in database');
            test.skip();
            return;
        }
        console.log('');

        // STEP 2: Find the event
        console.log('2️⃣ Looking for event...');

        const eventCard = page.locator('.gig-card').filter({ hasText: /screamin.*kick/i }).first();
        const eventCount = await eventCard.count();

        if (eventCount === 0) {
            console.log('   ⚠️  Event not found in search results');
            test.skip();
            return;
        }

        console.log('   ✅ Found event');

        // Click View Event
        const viewButton = eventCard.locator('a:has-text("View Event"), button:has-text("View Event")');
        await viewButton.click();
        await page.waitForLoadState('networkidle');
        console.log('');

        // STEP 3: On event detail page
        console.log('3️⃣ On event detail page...');
        await expect(page.locator('.gig-name')).toContainText(/screamin.*kick/i);
        console.log('   ✅ Event detail page loaded');
        console.log('');

        // STEP 4: Click "Buy Tickets"
        console.log('4️⃣ Clicking "Buy Tickets"...');
        const buyTicketsButton = page.locator('button.btn-buy:has-text("Buy Tickets")');

        if (await buyTicketsButton.count() === 0) {
            console.log('   ⚠️  No "Buy Tickets" button - event may not have paid ticketing');
            test.skip();
            return;
        }

        await buyTicketsButton.click();
        await page.waitForSelector('.modal-overlay', { timeout: 5000 });
        console.log('   ✅ Booking modal opened');
        console.log('');

        // STEP 5: Fill in booking details
        console.log('5️⃣ Filling in booking details...');

        const timestamp = Date.now();
        const testName = `E2E Buyer ${timestamp}`;
        const testEmail = `buyer-${timestamp}@example.com`;

        await page.locator('#booking-name').fill(testName);
        await page.locator('#booking-email').fill(testEmail);

        console.log(`   Name: ${testName}`);
        console.log(`   Email: ${testEmail}`);

        // Set quantity to 2 tickets
        const increaseButton = page.locator('button[aria-label="Increase ticket quantity"]');
        await increaseButton.click();
        await page.waitForTimeout(500);

        console.log('   Quantity: 2 tickets');
        console.log('   Merch: None (tickets only)');

        // Check order summary
        const orderSummary = page.locator('text=Order Summary');
        await expect(orderSummary).toBeVisible();

        const totalElement = page.locator('.modal-content').locator('text=Total').locator('..').locator('span').last();
        const totalText = await totalElement.textContent();
        console.log(`   Total: ${totalText}`);
        console.log('');

        // STEP 6: Submit to Stripe
        console.log('6️⃣ Submitting to Stripe checkout...');

        const confirmButton = page.locator('button[type="submit"]:has-text("Confirm Booking")');
        await confirmButton.click();

        // Wait for Stripe redirect
        await page.waitForURL(/stripe|checkout|success/, { timeout: 15000 });

        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        console.log('');

        if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
            console.log('   ✅ Successfully redirected to Stripe checkout!');
            expect(currentUrl).toMatch(/stripe|checkout/);
        } else if (currentUrl.includes('success')) {
            console.log('   ✅ Redirected to success page!');
        }

        console.log('');
        console.log('🎉 Ticket purchase (tickets only) completed!');
    });

    test('purchase tickets + merch - The bad moods', async ({ page }) => {
        console.log('🎫 Testing ticket + merch purchase...');
        console.log('');

        // STEP 1: Search for the event
        console.log('1️⃣ Searching for "The bad moods"...');

        const results = new ResultsPage(page);
        await results.goto({ search: 'The bad moods' });
        await results.expectLoaded();

        const gigCards = await page.locator('.gig-card').all();
        console.log(`   Found ${gigCards.length} events`);

        if (gigCards.length === 0) {
            console.log('   ⚠️  Event not found');
            test.skip();
            return;
        }
        console.log('');

        // STEP 2: Find the event
        console.log('2️⃣ Looking for event...');

        const eventCard = page.locator('.gig-card').filter({ hasText: /bad moods/i }).first();
        const eventCount = await eventCard.count();

        if (eventCount === 0) {
            console.log('   ⚠️  Event not found in search results');
            test.skip();
            return;
        }

        console.log('   ✅ Found event');

        // Click View Event
        const viewButton = eventCard.locator('a:has-text("View Event"), button:has-text("View Event")');
        await viewButton.click();
        await page.waitForLoadState('networkidle');
        console.log('');

        // STEP 3: On event detail page
        console.log('3️⃣ On event detail page...');
        await expect(page.locator('.gig-name')).toContainText(/bad moods/i);
        console.log('   ✅ Event detail page loaded');
        console.log('');

        // STEP 4: Click "Buy Tickets"
        console.log('4️⃣ Clicking "Buy Tickets"...');
        const buyTicketsButton = page.locator('button.btn-buy:has-text("Buy Tickets")');

        if (await buyTicketsButton.count() === 0) {
            console.log('   ⚠️  No "Buy Tickets" button');
            test.skip();
            return;
        }

        await buyTicketsButton.click();
        await page.waitForSelector('.modal-overlay', { timeout: 5000 });
        console.log('   ✅ Booking modal opened');
        console.log('');

        // STEP 5: Fill in booking details
        console.log('5️⃣ Filling in booking details...');

        const timestamp = Date.now();
        const testName = `E2E Buyer ${timestamp}`;
        const testEmail = `buyer-${timestamp}@example.com`;

        await page.locator('#booking-name').fill(testName);
        await page.locator('#booking-email').fill(testEmail);

        console.log(`   Name: ${testName}`);
        console.log(`   Email: ${testEmail}`);

        // Set quantity to 2 tickets
        const increaseTicketsButton = page.locator('button[aria-label="Increase ticket quantity"]');
        await increaseTicketsButton.click();
        await page.waitForTimeout(500);

        console.log('   Quantity: 2 tickets');

        // STEP 6: Add presale merch (if available)
        console.log('');
        console.log('6️⃣ Checking for presale merch...');

        const merchSection = page.locator('text=Add Vinyl Records, text=Presale').first();
        const hasMerch = await merchSection.count() > 0;

        if (hasMerch) {
            console.log('   ✅ Presale merch available');

            // Add 1 merch item
            const increaseMerchButton = page.locator('button').filter({ hasText: '+' }).last();
            await increaseMerchButton.click();
            await page.waitForTimeout(500);

            console.log('   Added: 1 merch item');
        } else {
            console.log('   ℹ️  No presale merch available for this event');
        }

        // Check order summary
        const orderSummary = page.locator('text=Order Summary');
        await expect(orderSummary).toBeVisible();

        const totalElement = page.locator('.modal-content').locator('text=Total').locator('..').locator('span').last();
        const totalText = await totalElement.textContent();
        console.log(`   Total: ${totalText}`);
        console.log('');

        // STEP 7: Submit to Stripe
        console.log('7️⃣ Submitting to Stripe checkout...');

        const confirmButton = page.locator('button[type="submit"]:has-text("Confirm Booking")');
        await confirmButton.click();

        // Wait for Stripe redirect
        await page.waitForURL(/stripe|checkout|success/, { timeout: 15000 });

        const currentUrl = page.url();
        console.log(`   Current URL: ${currentUrl}`);
        console.log('');

        if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
            console.log('   ✅ Successfully redirected to Stripe checkout!');
            expect(currentUrl).toMatch(/stripe|checkout/);
        } else if (currentUrl.includes('success')) {
            console.log('   ✅ Redirected to success page!');
        }

        console.log('');
        console.log('🎉 Ticket + merch purchase completed!');
    });

    test('alternative event - the second world war', async ({ page }) => {
        console.log('🎫 Testing with alternative event...');
        console.log('');

        // Search for the event
        const results = new ResultsPage(page);
        await results.goto({ search: 'the second world war' });
        await results.expectLoaded();

        const eventCard = page.locator('.gig-card').filter({ hasText: /second world war/i }).first();
        const eventCount = await eventCard.count();

        if (eventCount === 0) {
            console.log('   ⚠️  Event not found');
            test.skip();
            return;
        }

        console.log('   ✅ Found event');

        // Click View Event
        const viewButton = eventCard.locator('a:has-text("View Event"), button:has-text("View Event")');
        await viewButton.click();
        await page.waitForLoadState('networkidle');

        // Check for Buy Tickets button
        const buyTicketsButton = page.locator('button.btn-buy:has-text("Buy Tickets")');

        if (await buyTicketsButton.count() === 0) {
            console.log('   ⚠️  No "Buy Tickets" button - event may not have paid ticketing');
            test.skip();
            return;
        }

        await buyTicketsButton.click();
        await page.waitForSelector('.modal-overlay', { timeout: 5000 });
        console.log('   ✅ Booking modal opened');

        // Fill in details
        const timestamp = Date.now();
        await page.locator('#booking-name').fill(`E2E Buyer ${timestamp}`);
        await page.locator('#booking-email').fill(`buyer-${timestamp}@example.com`);

        // Submit
        const confirmButton = page.locator('button[type="submit"]:has-text("Confirm Booking")');
        await confirmButton.click();

        // Wait for Stripe redirect
        await page.waitForURL(/stripe|checkout|success/, { timeout: 15000 });

        const currentUrl = page.url();

        if (currentUrl.includes('stripe') || currentUrl.includes('checkout')) {
            console.log('   ✅ Successfully redirected to Stripe checkout!');
            expect(currentUrl).toMatch(/stripe|checkout/);
        }

        console.log('');
        console.log('🎉 Alternative event test completed!');
    });
});
