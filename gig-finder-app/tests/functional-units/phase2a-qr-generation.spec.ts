/**
 * Phase 2A Automated Tests: QR Code Generation (Simplified)
 * 
 * Tests the QR code generation utility refactoring:
 * - Manual guest bookings generate QR codes
 * - QR codes are saved to database
 * - QR codes have correct format
 * 
 * ⚠️ TEST POLICY: Do NOT add .skip() when tests fail
 */

import { test, expect } from '@playwright/test';
import { Pool } from 'pg';

test.describe('Phase 2A: QR Code Generation Tests', () => {

    let dbPool: Pool;

    test.beforeAll(async () => {
        // Initialize database connection for verification
        dbPool = new Pool({
            connectionString: process.env.POSTGRES_URL,
        });
    });

    test.afterAll(async () => {
        await dbPool.end();
    });

    test.beforeEach(async ({ page }, testInfo) => {
        // Only run in authenticated environment
        if (testInfo.project.name !== 'chromium-clerk') {
            test.skip();
        }
    });

    test('Phase 2A.1: Manual guest booking generates QR code in database', async ({ page }) => {
        // Navigate to My Gigs
        await page.goto('/gigfinder/my-gigs');
        await page.waitForLoadState('networkidle');

        // Find and click Guest List for sdwfgh event
        const guestListButton = page.locator('a[href*="/guestlist/"]').first();
        await guestListButton.click();
        await page.waitForLoadState('networkidle');

        // Add a test guest
        const timestamp = Date.now();
        const testName = `Phase2A Test ${timestamp}`;
        const testEmail = `phase2a-${timestamp}@test.com`;

        await page.fill('input[placeholder="Guest Name"]', testName);
        await page.fill('input[placeholder="Guest Email"]', testEmail);
        await page.click('button:has-text("Add")');
        await page.waitForTimeout(3000); // Wait for database write

        // Query database to verify QR code was saved
        const result = await dbPool.query(`
            SELECT id, customer_name, qr_code, event_id
            FROM bookings
            WHERE customer_name = $1
            ORDER BY created_at DESC
            LIMIT 1
        `, [testName]);

        // Assertions
        expect(result.rows.length).toBe(1);
        const booking = result.rows[0];

        // Critical: QR code should NOT be NULL (this is the bug fix!)
        expect(booking.qr_code).not.toBeNull();
        expect(booking.qr_code).toBeTruthy();

        console.log(`✅ Phase 2A.1 PASSED: QR Code saved to database: ${booking.qr_code}`);
    });

    test('Phase 2A.2: QR code has correct format GF-TICKET:{bookingId}-{eventId}', async ({ page }) => {
        // Navigate and add guest
        await page.goto('/gigfinder/my-gigs');
        await page.waitForLoadState('networkidle');

        const guestListButton = page.locator('a[href*="/guestlist/"]').first();
        await guestListButton.click();
        await page.waitForLoadState('networkidle');

        const timestamp = Date.now();
        const testName = `Format Test ${timestamp}`;
        const testEmail = `format-${timestamp}@test.com`;

        await page.fill('input[placeholder="Guest Name"]', testName);
        await page.fill('input[placeholder="Guest Email"]', testEmail);
        await page.click('button:has-text("Add")');
        await page.waitForTimeout(3000);

        // Query database
        const result = await dbPool.query(`
            SELECT id, qr_code, event_id
            FROM bookings
            WHERE customer_name = $1
            ORDER BY created_at DESC
            LIMIT 1
        `, [testName]);

        const booking = result.rows[0];

        // Verify format: GF-TICKET:{bookingId}-{eventId}
        const qrRegex = /^GF-TICKET:\d+-\d+$/;
        expect(booking.qr_code).toMatch(qrRegex);

        // Extract and verify IDs
        const match = booking.qr_code.match(/GF-TICKET:(\d+)-(\d+)/);
        expect(match).not.toBeNull();

        const bookingIdFromQR = match![1];
        const eventIdFromQR = match![2];

        // Verify booking ID matches
        expect(bookingIdFromQR).toBe(booking.id.toString());

        // Verify event ID matches
        expect(eventIdFromQR).toBe(booking.event_id.toString());

        console.log(`✅ Phase 2A.2 PASSED: QR format correct: ${booking.qr_code}`);
        console.log(`   Booking ID: ${bookingIdFromQR} (matches DB: ${booking.id})`);
        console.log(`   Event ID: ${eventIdFromQR} (matches DB: ${booking.event_id})`);
    });

    test('Phase 2A.3: QR code consistency - all bookings use same format', async () => {
        // This test verifies that manual bookings now use the same QR format as Stripe bookings

        const result = await dbPool.query(`
            SELECT 
                id,
                customer_name,
                qr_code,
                payment_intent_id,
                event_id
            FROM bookings
            WHERE qr_code IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 10
        `);

        expect(result.rows.length).toBeGreaterThan(0);

        let manualBookings = 0;
        let stripeBookings = 0;
        const qrRegex = /^GF-TICKET:\d+-\d+$/;

        for (const booking of result.rows) {
            // Verify format
            expect(booking.qr_code).toMatch(qrRegex);

            // Categorize
            if (booking.payment_intent_id) {
                stripeBookings++;
            } else {
                manualBookings++;
            }

            // Verify IDs match
            const match = booking.qr_code.match(/GF-TICKET:(\d+)-(\d+)/);
            expect(match).not.toBeNull();
            expect(match![1]).toBe(booking.id.toString());
            expect(match![2]).toBe(booking.event_id.toString());
        }

        console.log(`✅ Phase 2A.3 PASSED: QR Code Consistency Check:`);
        console.log(`   Manual bookings with QR: ${manualBookings}`);
        console.log(`   Stripe bookings with QR: ${stripeBookings}`);
        console.log(`   All use same format: GF-TICKET:{bookingId}-{eventId}`);

        // Phase 2A success: manual bookings should have QR codes
        expect(manualBookings).toBeGreaterThan(0);
    });

    test('Phase 2A.4: Database statistics - verify bug fix impact', async () => {
        // Query to show before/after Phase 2A statistics

        const stats = await dbPool.query(`
            SELECT 
                COUNT(*) FILTER (WHERE payment_intent_id IS NULL AND qr_code IS NOT NULL) as manual_with_qr,
                COUNT(*) FILTER (WHERE payment_intent_id IS NULL AND qr_code IS NULL) as manual_without_qr,
                COUNT(*) FILTER (WHERE payment_intent_id IS NOT NULL AND qr_code IS NOT NULL) as stripe_with_qr,
                COUNT(*) FILTER (WHERE payment_intent_id IS NOT NULL AND qr_code IS NULL) as stripe_without_qr
            FROM bookings
        `);

        const result = stats.rows[0];

        console.log(`📊 Phase 2A.4 PASSED: Impact Statistics:`);
        console.log(`   Manual bookings WITH QR:    ${result.manual_with_qr} ✅`);
        console.log(`   Manual bookings WITHOUT QR: ${result.manual_without_qr} ⚠️ (old bookings)`);
        console.log(`   Stripe bookings WITH QR:    ${result.stripe_with_qr} ✅`);
        console.log(`   Stripe bookings WITHOUT QR: ${result.stripe_without_qr}`);

        // Phase 2A success criteria
        expect(parseInt(result.manual_with_qr)).toBeGreaterThan(0);

        console.log(`✅ Phase 2A bug fix verified - manual bookings now have QR codes!`);
    });

    test('Phase 2A.5: Guest appears in UI after adding', async ({ page }) => {
        await page.goto('/gigfinder/my-gigs');
        await page.waitForLoadState('networkidle');

        const guestListButton = page.locator('a[href*="/guestlist/"]').first();
        await guestListButton.click();
        await page.waitForLoadState('networkidle');

        // Get initial count
        const totalText = await page.locator('h2:has-text("Total Names:")').textContent();
        const initialCount = parseInt(totalText?.match(/\d+/)?.[0] || '0');

        // Add guest
        const timestamp = Date.now();
        const testName = `UI Test ${timestamp}`;
        const testEmail = `ui-${timestamp}@test.com`;

        await page.fill('input[placeholder="Guest Name"]', testName);
        await page.fill('input[placeholder="Guest Email"]', testEmail);
        await page.click('button:has-text("Add")');
        await page.waitForTimeout(2000);

        // Verify guest appears
        await expect(page.locator(`text=${testName}`)).toBeVisible();

        // Verify count increased
        const newTotalText = await page.locator('h2:has-text("Total Names:")').textContent();
        const newCount = parseInt(newTotalText?.match(/\d+/)?.[0] || '0');
        expect(newCount).toBe(initialCount + 1);

        console.log(`✅ Phase 2A.5 PASSED: Guest visible in UI (count: ${initialCount} → ${newCount})`);
    });
});
