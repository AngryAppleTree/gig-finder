import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Footer Component
 * 
 * Represents the footer that appears on GigFinder pages.
 * Provides reusable methods for interacting with and asserting footer elements.
 * 
 * @example
 * const footer = new FooterComponent(page);
 * await footer.expectVisible();
 * await footer.clickPrivacyLink();
 */
export class FooterComponent {
    readonly page: Page;

    // Main container
    readonly footer: Locator;
    readonly footerContent: Locator;
    readonly footerBottom: Locator;

    // Branding elements
    readonly logo: Locator;
    readonly poweredByText: Locator;
    readonly angryAppleText: Locator;

    // Footer links
    readonly privacyLink: Locator;
    readonly termsLink: Locator;
    readonly pledgeLink: Locator;
    readonly contactLink: Locator;
    readonly adminLink: Locator;

    // Copyright text
    readonly copyrightText: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main containers
        this.footer = page.locator('footer.footer');
        this.footerContent = this.footer.locator('.footer-content');
        this.footerBottom = this.footer.locator('.footer-bottom');

        // Branding
        this.logo = this.footer.locator('img.main-logo');
        this.poweredByText = this.footer.locator('.powered-text');
        this.angryAppleText = this.footer.locator('.angry-apple-text');

        // Links - using getByRole for semantic selection
        this.privacyLink = this.footer.getByRole('link', { name: 'Privacy Policy' });
        this.termsLink = this.footer.getByRole('link', { name: 'Terms of Service' });
        this.pledgeLink = this.footer.getByRole('link', { name: 'Our Pledge' });
        this.contactLink = this.footer.getByRole('link', { name: 'Contact' });
        this.adminLink = this.footer.getByRole('link', { name: 'Admin' });

        // Copyright
        this.copyrightText = this.footerBottom.locator('p');
    }

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * Click the Privacy Policy link
     */
    async clickPrivacyLink() {
        await this.privacyLink.click();
    }

    /**
     * Click the Terms of Service link
     */
    async clickTermsLink() {
        await this.termsLink.click();
    }

    /**
     * Click the Our Pledge link
     */
    async clickPledgeLink() {
        await this.pledgeLink.click();
    }

    /**
     * Click the Contact link
     */
    async clickContactLink() {
        await this.contactLink.click();
    }

    /**
     * Click the Admin link
     */
    async clickAdminLink() {
        await this.adminLink.click();
    }

    /**
     * Click the logo image
     */
    async clickLogo() {
        await this.logo.click();
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    /**
     * Assert that the footer is visible
     */
    async expectVisible() {
        await expect(this.footer).toBeVisible();
    }

    /**
     * Assert that the logo is visible and has correct alt text
     */
    async expectLogoVisible() {
        await expect(this.logo).toBeVisible();
        await expect(this.logo).toHaveAttribute('alt', 'GigFinder Logo');
    }

    /**
     * Assert that branding text is correct
     */
    async expectBrandingCorrect() {
        await expect(this.poweredByText).toHaveText('Powered by');
        await expect(this.angryAppleText).toHaveText('Angry Apple Tree');
    }

    /**
     * Assert that all footer links are visible
     */
    async expectAllLinksVisible() {
        await expect(this.privacyLink).toBeVisible();
        await expect(this.termsLink).toBeVisible();
        await expect(this.pledgeLink).toBeVisible();
        await expect(this.contactLink).toBeVisible();
        await expect(this.adminLink).toBeVisible();
    }

    /**
     * Assert that copyright text is present and correct
     */
    async expectCopyrightCorrect() {
        await expect(this.copyrightText).toContainText('© 2025 Angry Apple Tree Ltd');
        await expect(this.copyrightText).toContainText('All rights reserved');
    }

    /**
     * Assert that a specific link has the correct href
     */
    async expectLinkHref(linkName: 'privacy' | 'terms' | 'pledge' | 'contact' | 'admin', expectedHref: string) {
        const linkMap = {
            privacy: this.privacyLink,
            terms: this.termsLink,
            pledge: this.pledgeLink,
            contact: this.contactLink,
            admin: this.adminLink,
        };

        await expect(linkMap[linkName]).toHaveAttribute('href', expectedHref);
    }

    /**
     * Assert that the footer is at the bottom of the page
     */
    async expectAtBottom() {
        const footerBox = await this.footer.boundingBox();
        const pageHeight = await this.page.evaluate(() => document.documentElement.scrollHeight);

        if (footerBox) {
            // Footer should be near the bottom (within 100px)
            expect(footerBox.y + footerBox.height).toBeGreaterThan(pageHeight - 100);
        }
    }

    /**
     * Complete assertion - checks all footer elements
     */
    async expectCompleteFooter() {
        await this.expectVisible();
        await this.expectLogoVisible();
        await this.expectBrandingCorrect();
        await this.expectAllLinksVisible();
        await this.expectCopyrightCorrect();
    }
}
