import { test, expect } from '@playwright/test';

/**
 * DEBUG TEST: My Gigs Authentication Investigation
 * 
 * This test investigates why My Gigs page fails on PREVIEW.
 * It will capture what Clerk sees and what the page actually shows.
 * 
 * RUN WITH:
 * BASE_URL=https://gigfinder-git-develop-contactangryappletree-4366s-projects.vercel.app npx playwright test tests/debug-my-gigs-auth.spec.ts --project=chromium-clerk --headed
 */

test.describe('My Gigs Auth Debug', () => {
    test('investigate My Gigs page state', async ({ page }) => {
        console.log('🔍 Starting My Gigs authentication investigation...');
        console.log('');

        // Navigate to My Gigs
        console.log('1️⃣ Navigating to /gigfinder/my-gigs...');
        await page.goto('/gigfinder/my-gigs');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000); // Give Clerk time to initialize

        // Capture current URL
        const currentUrl = page.url();
        console.log('📍 Current URL:', currentUrl);
        console.log('');

        // Check if we got redirected
        if (!currentUrl.includes('/my-gigs')) {
            console.log('⚠️  REDIRECTED! Not on My Gigs page');
            console.log('   Redirected to:', currentUrl);
        } else {
            console.log('✅ Still on My Gigs page');
        }
        console.log('');

        // Take screenshot
        console.log('📸 Taking screenshot...');
        await page.screenshot({ path: 'test-results/debug-my-gigs-page.png', fullPage: true });
        console.log('   Screenshot saved to: test-results/debug-my-gigs-page.png');
        console.log('');

        // Check for page title
        console.log('2️⃣ Looking for page title...');
        const h1Elements = await page.locator('h1').all();
        console.log(`   Found ${h1Elements.length} h1 elements`);

        for (let i = 0; i < h1Elements.length; i++) {
            const text = await h1Elements[i].textContent();
            const className = await h1Elements[i].getAttribute('class');
            console.log(`   h1[${i}]: "${text}" (class: ${className})`);
        }
        console.log('');

        // Check for main-title specifically
        const mainTitle = page.locator('h1.main-title');
        const mainTitleExists = await mainTitle.count() > 0;
        console.log('3️⃣ Checking for h1.main-title...');
        console.log(`   Exists: ${mainTitleExists}`);

        if (mainTitleExists) {
            const titleText = await mainTitle.textContent();
            console.log(`   Text: "${titleText}"`);
        }
        console.log('');

        // Evaluate Clerk state in the browser
        console.log('4️⃣ Checking Clerk state...');
        const clerkState = await page.evaluate(() => {
            // @ts-ignore - Clerk is loaded globally
            const clerk = window.Clerk;

            if (!clerk) {
                return { error: 'Clerk not found on window object' };
            }

            return {
                loaded: clerk.loaded,
                user: clerk.user ? {
                    id: clerk.user.id,
                    email: clerk.user.primaryEmailAddress?.emailAddress,
                    firstName: clerk.user.firstName,
                } : null,
                session: clerk.session ? {
                    id: clerk.session.id,
                    status: clerk.session.status,
                } : null,
            };
        });

        console.log('   Clerk State:', JSON.stringify(clerkState, null, 2));
        console.log('');

        // Check for loading state
        console.log('5️⃣ Checking for loading indicators...');
        const loadingText = await page.locator('text=Loading').count();
        console.log(`   "Loading" text found: ${loadingText > 0}`);
        console.log('');

        // Check for sign-in elements
        console.log('6️⃣ Checking for sign-in page elements...');
        const signInButton = await page.locator('button:has-text("Sign in")').count();
        const signInForm = await page.locator('form').count();
        console.log(`   Sign-in buttons: ${signInButton}`);
        console.log(`   Forms on page: ${signInForm}`);
        console.log('');

        // Get page HTML for inspection
        console.log('7️⃣ Capturing page HTML...');
        const bodyHTML = await page.locator('body').innerHTML();
        const htmlPreview = bodyHTML.substring(0, 500);
        console.log('   First 500 chars of body HTML:');
        console.log('   ' + htmlPreview.replace(/\n/g, '\n   '));
        console.log('');

        // Summary
        console.log('📊 SUMMARY:');
        console.log('─'.repeat(50));
        console.log(`URL: ${currentUrl}`);
        console.log(`Redirected: ${!currentUrl.includes('/my-gigs')}`);
        console.log(`h1.main-title exists: ${mainTitleExists}`);
        console.log(`Clerk loaded: ${clerkState.loaded !== undefined ? clerkState.loaded : 'unknown'}`);
        console.log(`Clerk user: ${clerkState.user ? clerkState.user.email : 'null'}`);
        console.log(`Clerk session: ${clerkState.session ? clerkState.session.status : 'null'}`);
        console.log('─'.repeat(50));

        // This test always passes - it's just for investigation
        expect(true).toBe(true);
    });
});
