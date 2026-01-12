import { test as setup } from '@playwright/test';
import * as fs from 'fs';

// Helper for file logging
function logToFile(msg: string) {
    fs.appendFileSync('tests/seed-log.txt', msg + '\n');
    console.log(msg);
}

/**
 * PREVIEW Test Data Seeding Script
 * 
 * This script creates the test data needed for event-management tests on PREVIEW.
 * 
 * Creates:
 * 1. "sdwfgh" gig with internal ticketing (guestlist)
 * 2. Test bookings for guest list tests
 * 
 * Run with:
 *   npx playwright test tests/setup-preview-data.setup.ts --config=playwright.config.preview.ts --project=chromium-clerk
 * 
 * Note: This uses the authenticated session from clerk-auth.setup.ts
 */

setup('seed PREVIEW with test data', async ({ page, baseURL }) => {
    // Reset log file
    if (fs.existsSync('tests/seed-log.txt')) fs.unlinkSync('tests/seed-log.txt');
    logToFile(`Starting seed script on ${baseURL}`);

    // Only run on PREVIEW environment
    const isPreview = baseURL?.includes('vercel.app') || baseURL?.includes('gigfinder-git-develop');
    if (!isPreview) {
        logToFile('⏭️  Skipping - not PREVIEW environment');
        setup.skip();
        return;
    }

    // 1. Ensure Authentication via UI (Manual 2FA if needed)
    logToFile('🔐 Ensuring authentication for seeding...');
    await page.goto('/sign-in');

    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        throw new Error('TEST_USER_EMAIL or TEST_USER_PASSWORD not set in .env.local');
    }

    if (page.url().includes('sign-in')) {
        logToFile('Logging in...');

        // Enter Email
        await page.locator('input[name="identifier"], input[type="email"]').fill(email);
        await page.keyboard.press('Enter');

        // Wait for password field
        const passwordInput = page.locator('input[name="password"], input[type="password"]');
        await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
        await passwordInput.fill(password);
        await page.keyboard.press('Enter');

        // 🛑 MANUAL INTERVENTION POINT
        // Wait longer (60s) for manual 2FA entry if triggered
        logToFile('⏳ Waiting for manual 2FA or Redirect (60s)...');
        await page.waitForURL(/gigfinder|dashboard/, { timeout: 60000 });

        logToFile('✅ Logged in successfully');
    } else {
        logToFile('✅ Already logged in');
    }

    // 2. Seed data via UI (since API context is flaky with auth)
    logToFile('📝 Seeding "sdwfgh" gig via UI...');

    // Navigate to Add Event page
    await page.goto('/gigfinder/add-event');
    await page.waitForTimeout(1000);

    // Fill form
    await page.fill('input[name="name"]', 'sdwfgh');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[name="date"]', dateString);
    await page.fill('input[name="time"]', '20:00');

    // Venue - New Venue
    await page.fill('input[id="venue"]', 'Test Venue for Playwright');
    // Wait for the dynamic 'New Venue' fields to appear
    await page.waitForSelector('input[placeholder="e.g. Edinburgh"]', { timeout: 5000 }).catch(() => logToFile('⚠️ Town input not found'));

    if (await page.locator('input[placeholder="e.g. Edinburgh"]').isVisible()) {
        await page.fill('input[placeholder="e.g. Edinburgh"]', 'Edinburgh');
        await page.fill('input[placeholder*="Capacity"]', '100');
    }

    // Ticketing
    await page.check('input[name="is_internal_ticketing"]');

    // Description
    await page.fill('textarea[name="description"]', 'Test gig for automated testing - created by Playwright setup script');

    logToFile('✅ Form filled - submitting...');
    await page.click('button[type="submit"]');

    // Handle known Preview redirection issue
    // Wait for either success message OR redirect to sign-in (which implies success but session loss)
    try {
        await Promise.race([
            page.waitForSelector('text=Event Added Successfully', { timeout: 10000 }),
            page.waitForURL(/sign-in/, { timeout: 10000 })
        ]);

        if (page.url().includes('sign-in')) {
            logToFile('⚠️  Redirected to sign-in after submit (known Preview issue) - assuming success');
            // We might need to re-login if we want to add guests?
            // But let's check my-gigs first (which might trigger re-login flow if we handle it right, or we just fail guest addition this run)
        } else {
            logToFile('✅ Success message appeared');
        }
    } catch (e) {
        logToFile('⚠️  Timed out waiting for submission result - checking My Gigs anyway');
    }
    // We don't throw here immediately, we let the verification step decide if it worked
    // (sometimes API returns error but might have partially worked, or we want to verify UI state)

    // 3. Navigate to My Gigs to verify
    await page.goto('/gigfinder/my-gigs');
    await page.waitForTimeout(2000);
    logToFile(`Current URL: ${page.url()}`);

    // Check if "sdwfgh" gig is visible
    const gigVisible = await page.locator('h3', { hasText: 'sdwfgh' }).isVisible().catch(() => false);

    if (gigVisible) {
        logToFile('✅ "sdwfgh" gig confirmed visible on My Gigs page');
        // ... proceed to add guests via UI (since that tests Guest List UI) ...
        // Or could also seed guests via API, but UI test for guests is fine if gig exists.

        logToFile('📝 Adding test bookings via UI...');
        // Click Guest List button
        const gigCard = page.locator('div').filter({
            has: page.locator('h3', { hasText: 'sdwfgh' })
        }).first();

        // Wait for connection to appear
        await gigCard.getByRole('link', { name: 'GUEST LIST' }).first().click();
        await page.waitForTimeout(2000);

        // Add 3 test guests
        const testGuests = [
            { name: 'Test Guest 1', tickets: '2' },
            { name: 'Test Guest 2', tickets: '1' },
            { name: 'Test Guest 3', tickets: '3' }
        ];

        for (const guest of testGuests) {
            // Check if guest already exists to avoid duplicates if re-running
            const exists = await page.locator(`div:has-text("${guest.name}")`).first().isVisible().catch(() => false);
            if (!exists) {
                await page.fill('input[placeholder*="Guest Name" i]', guest.name);
                await page.fill('input[placeholder*="tickets" i]', guest.tickets);
                await page.click('button:has-text("ADD TO LIST")');
                await page.waitForTimeout(1000);
                logToFile(`  ✅ Added ${guest.name} (${guest.tickets} tickets)`);
            } else {
                logToFile(`  ⏭️  Skipping ${guest.name} (already exists)`);
            }
        }
    } else {
        const pageContent = await page.content();
        logToFile('❌ "sdwfgh" gig NOT found on My Gigs page - seeding may have failed');
        logToFile('Page Content Snippet: ' + pageContent.substring(0, 1000));
        throw new Error('Test gig not created - check PREVIEW environment');
    }

    logToFile('🎉 PREVIEW data seeding complete!');
});
