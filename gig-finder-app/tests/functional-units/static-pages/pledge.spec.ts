/**
 * Functional Unit: Static Pages
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
import { PledgePage } from '../../page-objects/PledgePage';
import { FooterComponent } from '../../page-objects/Footer';

test.describe('Pledge Page', () => {

    test.beforeEach(async ({ page }) => {
        const pledgePage = new PledgePage(page);
        await pledgePage.goto();
    });

    test.describe('Page Structure', () => {

        test('page loads correctly', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectPageLoaded();
        });

        test('hero title is correct with emoji', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectHeroTitle();
        });

        test('main heading is correct', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectMainHeading();
        });

        test('complete page renders correctly', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectCompletePage();
        });
    });

    test.describe('Navigation', () => {

        test('back button is visible and links to GigFinder', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectBackButtonVisible();
        });

        test('back button navigates to GigFinder', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.clickBackButton();
            await expect(page).toHaveURL('/gigfinder');
        });

        test('can navigate to pledge page from footer', async ({ page }) => {
            // Start at homepage
            await page.goto('/gigfinder');

            // Click pledge link in footer
            const footer = new FooterComponent(page);
            await footer.clickPledgeLink();

            // Should be on pledge page
            await expect(page).toHaveURL('/pledge');
            const pledgePage = new PledgePage(page);
            await pledgePage.expectPageLoaded();
        });
    });

    test.describe('Content Sections', () => {

        test('all main sections are present', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectAllSectionsPresent();
        });

        test('ethos section exists', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await expect(pledgePage.ethosSection).toBeVisible();
            await expect(pledgePage.ethosSection).toContainText('Our Ethos');
            await expect(pledgePage.ethosSection).toContainText('Putting Power Back');
        });

        test('vinyl commitment section exists', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await expect(pledgePage.vinylCommitmentSection).toBeVisible();
            await expect(pledgePage.vinylCommitmentSection).toContainText('50% Vinyl Reinvestment');
        });

        test('join us section exists', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await expect(pledgePage.joinUsSection).toBeVisible();
            await expect(pledgePage.joinUsSection).toContainText('Join Us');
        });

        test('50% pledge box is highlighted', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectPledgeBoxVisible();
        });
    });

    test.describe('Pledge Content', () => {

        test('covers key pledge topics', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectPledgeTopicsCovered();
        });

        test('mentions fairer commission', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Fairer Commission');
            expect(content).toContain('less commission from bands and artists');
            expect(content).toContain('industry-standard platforms');
        });

        test('mentions supporting venues', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Supporting Venues');
            expect(content).toContain('independent venues');
            expect(content).toContain('training grounds');
        });

        test('explains 50% reinvestment pledge', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('50%');
            expect(content).toContain('re-invest');
            expect(content).toContain('platform margin');
            expect(content).toContain('independent music scene');
        });

        test('mentions vinyl production', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectVinylCommitmentDetails();
        });

        test('includes artist benefits', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectArtistBenefitsMentioned();
        });

        test('includes call to action for ticket buyers', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await pledgePage.expectCallToAction();
        });

        test('addresses artists directly', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('As an artist');
            expect(content).toContain('when you sell tickets');
            expect(content).toContain('could even end up being you on vinyl');
        });
    });

    test.describe('Unique Value Propositions', () => {

        test('emphasizes community support', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('heart of the music scene');
            expect(content).toContain('small venues');
            expect(content).toContain('emerging artists');
        });

        test('explains business model transparency', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('know where we spend the money');
            expect(content).toContain('commission earned minus the running costs');
        });

        test('highlights vinyl as investment', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('ultimate investment');
            expect(content).toContain('tangible, high-quality product');
            expect(content).toContain('lasting value');
        });

        test('positions buyers as patrons', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('active patron of the arts');
            expect(content).toContain('directly enabling');
        });
    });

    test.describe('Footer Integration', () => {

        test('footer is present on pledge page', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectVisible();
        });

        test('footer maintains consistency', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });

        test('can navigate to other pages via footer', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Navigate to privacy
            await footer.clickPrivacyLink();
            await expect(page).toHaveURL('/privacy');

            // Navigate back to pledge
            await page.goto('/pledge');
            await expect(page).toHaveURL('/pledge');
        });
    });

    test.describe('Accessibility', () => {

        test('page has proper heading hierarchy', async ({ page }) => {
            // Check h1 exists
            const h1 = page.locator('h1');
            await expect(h1).toBeVisible();
            await expect(h1).toHaveCount(1);

            // Check h2 exists
            const h2 = page.locator('h2');
            await expect(h2.first()).toBeVisible();

            // Check h3 exists
            const h3 = page.locator('h3');
            await expect(h3.first()).toBeVisible();
        });

        test('back button has accessible name', async ({ page }) => {
            const pledgePage = new PledgePage(page);
            await expect(pledgePage.backButton).toHaveAccessibleName(/Back to GigFinder/i);
        });

        test('important pledge box is visually distinct', async ({ page }) => {
            const pledgePage = new PledgePage(page);

            // Pledge box should have border styling
            const pledgeBox = pledgePage.pledgeBox;
            await expect(pledgeBox).toBeVisible();

            // Should contain the key commitment
            await expect(pledgeBox).toContainText('50%');
        });
    });

    test.describe('Responsive Design', () => {

        test('page displays correctly on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const pledgePage = new PledgePage(page);
            await pledgePage.goto();
            await pledgePage.expectCompletePage();
        });

        test('page displays correctly on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            const pledgePage = new PledgePage(page);
            await pledgePage.goto();
            await pledgePage.expectCompletePage();
        });

        test('page displays correctly on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const pledgePage = new PledgePage(page);
            await pledgePage.goto();
            await pledgePage.expectCompletePage();
        });
    });

    test.describe('SEO & Metadata', () => {

        test('page has a title', async ({ page }) => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
        });

        test('page URL is correct', async ({ page }) => {
            await expect(page).toHaveURL('/pledge');
        });
    });
});
