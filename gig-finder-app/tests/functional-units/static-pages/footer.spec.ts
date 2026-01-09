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
import { FooterComponent } from '../../page-objects/Footer';

test.describe('Footer Component', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to homepage before each test
        await page.goto('/gigfinder');
    });

    test.describe('Visual Elements', () => {

        test('footer is visible on page', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectVisible();
        });

        test('logo displays with correct alt text', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectLogoVisible();
        });

        test('branding text is correct', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectBrandingCorrect();
        });

        test('copyright text is present and correct', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectCopyrightCorrect();
        });

        test('all footer links are visible', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectAllLinksVisible();
        });

        test('complete footer renders correctly', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });
    });

    test.describe('Link Navigation', () => {

        test('Privacy Policy link navigates correctly', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Verify link href
            await footer.expectLinkHref('privacy', '/privacy');

            // Click and verify navigation
            await footer.clickPrivacyLink();
            await expect(page).toHaveURL('/privacy');
        });

        test('Terms of Service link navigates correctly', async ({ page }) => {
            const footer = new FooterComponent(page);

            await footer.expectLinkHref('terms', '/terms');
            await footer.clickTermsLink();
            await expect(page).toHaveURL('/terms');
        });

        test('Our Pledge link navigates correctly', async ({ page }) => {
            const footer = new FooterComponent(page);

            await footer.expectLinkHref('pledge', '/pledge');
            await footer.clickPledgeLink();
            await expect(page).toHaveURL('/pledge');
        });

        test('Contact link navigates correctly', async ({ page }) => {
            const footer = new FooterComponent(page);

            await footer.expectLinkHref('contact', '/contact');
            await footer.clickContactLink();
            await expect(page).toHaveURL('/contact');
        });

        test('Admin link navigates to admin or redirects to homepage', async ({ page }) => {
            const footer = new FooterComponent(page);

            await footer.expectLinkHref('admin', '/admin');
            await footer.clickAdminLink();

            // Admin redirects unauthenticated users to homepage
            await expect(page).toHaveURL(/\/(admin|gigfinder|sign-in)/);
        });
    });

    test.describe('Accessibility', () => {

        test('footer has semantic HTML', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Footer should use <footer> tag
            const footerTag = await footer.footer.evaluate(el => el.tagName.toLowerCase());
            expect(footerTag).toBe('footer');
        });

        test('logo has alt text for screen readers', async ({ page }) => {
            const footer = new FooterComponent(page);
            const altText = await footer.logo.getAttribute('alt');

            expect(altText).toBeTruthy();
            expect(altText).toBe('GigFinder Logo');
        });

        test('all links have accessible names', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Links should be accessible via role
            await expect(footer.privacyLink).toHaveAccessibleName('Privacy Policy');
            await expect(footer.termsLink).toHaveAccessibleName('Terms of Service');
            await expect(footer.pledgeLink).toHaveAccessibleName('Our Pledge');
            await expect(footer.contactLink).toHaveAccessibleName('Contact');
            await expect(footer.adminLink).toHaveAccessibleName('Admin');
        });
    });

    test.describe('Reusability', () => {

        test('footer appears on multiple pages', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Check on homepage
            await page.goto('/gigfinder');
            await footer.expectVisible();

            // Check on privacy page
            await page.goto('/privacy');
            await footer.expectVisible();

            // Check on terms page
            await page.goto('/terms');
            await footer.expectVisible();
        });

        test('footer maintains consistency across pages', async ({ page }) => {
            const footer = new FooterComponent(page);

            // Verify on homepage
            await page.goto('/gigfinder');
            await footer.expectCompleteFooter();

            // Verify on contact page
            await page.goto('/contact');
            await footer.expectCompleteFooter();
        });
    });

    test.describe('Layout', () => {

        test('footer is positioned at bottom of page', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectAtBottom();
        });

        test('footer is full width', async ({ page }) => {
            const footer = new FooterComponent(page);
            const footerBox = await footer.footer.boundingBox();
            const viewportWidth = page.viewportSize()?.width || 0;

            if (footerBox) {
                // Footer should span full width (allowing for small margins)
                expect(footerBox.width).toBeGreaterThan(viewportWidth * 0.95);
            }
        });
    });

    test.describe('Responsive Design', () => {

        test('footer displays correctly on mobile', async ({ page }) => {
            // Set mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await page.goto('/gigfinder');

            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });

        test('footer displays correctly on tablet', async ({ page }) => {
            // Set tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.goto('/gigfinder');

            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });

        test('footer displays correctly on desktop', async ({ page }) => {
            // Set desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            await page.goto('/gigfinder');

            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });
    });
});
