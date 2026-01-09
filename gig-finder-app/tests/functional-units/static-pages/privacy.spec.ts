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
import { PrivacyPage } from '../../page-objects/PrivacyPage';
import { FooterComponent } from '../../page-objects/Footer';

test.describe('Privacy Policy Page', () => {

    test.beforeEach(async ({ page }) => {
        const privacyPage = new PrivacyPage(page);
        await privacyPage.goto();
    });

    test.describe('Page Structure', () => {

        test('page loads correctly', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectPageLoaded();
        });

        test('hero title is correct', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectHeroTitle();
        });

        test('main heading is correct', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectMainHeading();
        });

        test('last updated date is present', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectLastUpdatedPresent();
        });

        test('complete page renders correctly', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectCompletePage();
        });
    });

    test.describe('Navigation', () => {

        test('back button is visible and links to GigFinder', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectBackButtonVisible();
        });

        test('back button navigates to GigFinder', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.clickBackButton();
            await expect(page).toHaveURL('/gigfinder');
        });

        test('can navigate to privacy page from footer', async ({ page }) => {
            // Start at homepage
            await page.goto('/gigfinder');

            // Click privacy link in footer
            const footer = new FooterComponent(page);
            await footer.clickPrivacyLink();

            // Should be on privacy page
            await expect(page).toHaveURL('/privacy');
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectPageLoaded();
        });
    });

    test.describe('Content Sections', () => {

        test('all main sections are present', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectAllSectionsPresent();
        });

        test('collection of personal information section exists', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await expect(privacyPage.collectionSection).toBeVisible();
            await expect(privacyPage.collectionSection).toContainText('Collection of Personal Information');
        });

        test('usage section exists', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await expect(privacyPage.usageSection).toBeVisible();
            await expect(privacyPage.usageSection).toContainText('How We Use Your Personal Information');
        });

        test('sharing section exists', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await expect(privacyPage.sharingSection).toBeVisible();
            await expect(privacyPage.sharingSection).toContainText('Sharing of Personal Information');
        });

        test('cookies section exists', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await expect(privacyPage.cookiesSection).toBeVisible();
            await expect(privacyPage.cookiesSection).toContainText('Cookies');
        });

        test('contact section exists', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await expect(privacyPage.contactSection).toBeVisible();
            await expect(privacyPage.contactSection).toContainText('Contact Us');
        });
    });

    test.describe('Privacy Content', () => {

        test('covers key privacy topics', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectPrivacyTopicsCovered();
        });

        test('mentions personal information types', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Contact Information');
            expect(content).toContain('Account Information');
            expect(content).toContain('Payment Information');
        });

        test('mentions data collection methods', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Information You Provide Directly');
            expect(content).toContain('Information Collected Automatically');
        });

        test('mentions third-party processors', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Stripe');
            expect(content).toContain('PayPal');
        });
    });

    test.describe('Contact Information', () => {

        test('contact email is present and correct', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            await privacyPage.expectContactInfoPresent();
        });

        test('contact email link is functional', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);
            const emailHref = await privacyPage.contactEmail.getAttribute('href');
            expect(emailHref).toBe('mailto:alex.bunch@angryappletree.com');
        });
    });

    test.describe('Footer Integration', () => {

        test('footer is present on privacy page', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectVisible();
        });

        test('footer maintains consistency', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });

        test('can navigate to other pages via footer', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Navigate to terms
            await footer.clickTermsLink();
            await expect(page).toHaveURL('/terms');

            // Navigate back to privacy
            await page.goto('/privacy');
            await expect(page).toHaveURL('/privacy');
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

        test('links have accessible names', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);

            await expect(privacyPage.backButton).toHaveAccessibleName(/Back to GigFinder/i);
            await expect(privacyPage.contactEmail).toHaveAccessibleName(/alex.bunch@angryappletree.com/i);
        });

        test('email link is keyboard accessible', async ({ page }) => {
            const privacyPage = new PrivacyPage(page);

            // Should be able to tab to email link
            await privacyPage.contactEmail.focus();
            await expect(privacyPage.contactEmail).toBeFocused();
        });
    });

    test.describe('Responsive Design', () => {

        test('page displays correctly on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const privacyPage = new PrivacyPage(page);
            await privacyPage.goto();
            await privacyPage.expectCompletePage();
        });

        test('page displays correctly on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            const privacyPage = new PrivacyPage(page);
            await privacyPage.goto();
            await privacyPage.expectCompletePage();
        });

        test('page displays correctly on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const privacyPage = new PrivacyPage(page);
            await privacyPage.goto();
            await privacyPage.expectCompletePage();
        });
    });

    test.describe('SEO & Metadata', () => {

        test('page has a title', async ({ page }) => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
        });

        test('page URL is correct', async ({ page }) => {
            await expect(page).toHaveURL('/privacy');
        });
    });
});
