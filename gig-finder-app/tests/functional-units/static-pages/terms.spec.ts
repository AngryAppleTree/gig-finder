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
import { TermsPage } from '../../page-objects/TermsPage';
import { FooterComponent } from '../../page-objects/Footer';

test.describe('Terms of Service Page', () => {

    test.beforeEach(async ({ page }) => {
        const termsPage = new TermsPage(page);
        await termsPage.goto();
    });

    test.describe('Page Structure', () => {

        test('page loads correctly', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectPageLoaded();
        });

        test('hero title is correct', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectHeroTitle();
        });

        test('main heading is correct', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectMainHeading();
        });

        test('last updated date is present', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectLastUpdatedPresent();
        });

        test('complete page renders correctly', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectCompletePage();
        });
    });

    test.describe('Navigation', () => {

        test('back button is visible and links to GigFinder', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectBackButtonVisible();
        });

        test('back button navigates to GigFinder', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.clickBackButton();
            await expect(page).toHaveURL('/gigfinder');
        });

        test('can navigate to terms page from footer', async ({ page }) => {
            // Start at homepage
            await page.goto('/gigfinder');

            // Click terms link in footer
            const footer = new FooterComponent(page);
            await footer.clickTermsLink();

            // Should be on terms page
            await expect(page).toHaveURL('/terms');
            const termsPage = new TermsPage(page);
            await termsPage.expectPageLoaded();
        });
    });

    test.describe('Content Sections', () => {

        test('all main sections are present', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectAllSectionsPresent();
        });

        test('acceptance of terms section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.acceptanceSection).toBeVisible();
            await expect(termsPage.acceptanceSection).toContainText('Acceptance of Terms');
        });

        test('services section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.servicesSection).toBeVisible();
            await expect(termsPage.servicesSection).toContainText('Services');
        });

        test('user accounts section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.userAccountsSection).toBeVisible();
            await expect(termsPage.userAccountsSection).toContainText('User Accounts');
        });

        test('intellectual property section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.intellectualPropertySection).toBeVisible();
            await expect(termsPage.intellectualPropertySection).toContainText('Intellectual Property');
        });

        test('limitation of liability section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.limitationSection).toBeVisible();
            await expect(termsPage.limitationSection).toContainText('Limitation of Liability');
        });

        test('contact section exists', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await expect(termsPage.contactSection).toBeVisible();
            await expect(termsPage.contactSection).toContainText('Contact Us');
        });
    });

    test.describe('Terms Content', () => {

        test('covers key terms topics', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectTermsTopicsCovered();
        });

        test('mentions company services', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectServicesMentioned();
        });

        test('includes acceptance clause', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('By accessing this website');
            expect(content).toContain('accept these terms and conditions');
        });

        test('includes user responsibility clause', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('responsible for maintaining the security');
            expect(content).toContain('responsible for all activities');
        });

        test('includes intellectual property rights', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('intellectual property rights');
            expect(content).toContain('All intellectual property rights are reserved');
        });

        test('includes liability limitation', async ({ page }) => {
            const content = await page.textContent('main');

            expect(content).toContain('Limitation of Liability');
            expect(content).toContain('shall Angry Apple Tree Ltd');
        });
    });

    test.describe('Contact Information', () => {

        test('contact email is present and correct', async ({ page }) => {
            const termsPage = new TermsPage(page);
            await termsPage.expectContactInfoPresent();
        });

        test('contact email link is functional', async ({ page }) => {
            const termsPage = new TermsPage(page);
            const emailHref = await termsPage.contactEmail.getAttribute('href');
            expect(emailHref).toBe('mailto:alex.bunch@angryappletree.com');
        });
    });

    test.describe('Footer Integration', () => {

        test('footer is present on terms page', async ({ page }) => {
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

            // Navigate back to terms
            await page.goto('/terms');
            await expect(page).toHaveURL('/terms');
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
            const termsPage = new TermsPage(page);

            await expect(termsPage.backButton).toHaveAccessibleName(/Back to GigFinder/i);
            await expect(termsPage.contactEmail).toHaveAccessibleName(/alex.bunch@angryappletree.com/i);
        });

        test('email link is keyboard accessible', async ({ page }) => {
            const termsPage = new TermsPage(page);

            // Should be able to tab to email link
            await termsPage.contactEmail.focus();
            await expect(termsPage.contactEmail).toBeFocused();
        });
    });

    test.describe('Responsive Design', () => {

        test('page displays correctly on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const termsPage = new TermsPage(page);
            await termsPage.goto();
            await termsPage.expectCompletePage();
        });

        test('page displays correctly on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            const termsPage = new TermsPage(page);
            await termsPage.goto();
            await termsPage.expectCompletePage();
        });

        test('page displays correctly on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const termsPage = new TermsPage(page);
            await termsPage.goto();
            await termsPage.expectCompletePage();
        });
    });

    test.describe('SEO & Metadata', () => {

        test('page has a title', async ({ page }) => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
        });

        test('page URL is correct', async ({ page }) => {
            await expect(page).toHaveURL('/terms');
        });
    });
});
