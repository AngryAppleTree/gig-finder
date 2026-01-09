import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Privacy Policy Page
 * 
 * Represents the /privacy page with privacy policy content.
 * Provides reusable methods for interacting with and asserting page elements.
 * 
 * @example
 * const privacyPage = new PrivacyPage(page);
 * await privacyPage.goto();
 * await privacyPage.expectPageLoaded();
 */
export class PrivacyPage {
    readonly page: Page;

    // Main elements
    readonly container: Locator;
    readonly main: Locator;
    readonly heroTitle: Locator;
    readonly backButton: Locator;
    readonly card: Locator;

    // Content sections
    readonly mainHeading: Locator;
    readonly lastUpdated: Locator;
    readonly collectionSection: Locator;
    readonly usageSection: Locator;
    readonly sharingSection: Locator;
    readonly cookiesSection: Locator;
    readonly contactSection: Locator;

    // Links
    readonly contactEmail: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main structure
        this.container = page.locator('div').first();
        this.main = page.locator('main');
        this.heroTitle = page.locator('h1');
        this.backButton = page.getByRole('link', { name: /Back to GigFinder/i });
        this.card = page.locator('div').filter({ hasText: /Privacy Notice \/ Policy/i }).first();

        // Content sections
        this.mainHeading = page.getByRole('heading', { name: /Angry Apple Tree Ltd - Privacy Notice/i });
        this.lastUpdated = page.locator('p', { hasText: /Last Updated/i });
        this.collectionSection = page.getByRole('heading', { name: /Collection of Personal Information/i });
        this.usageSection = page.getByRole('heading', { name: /How We Use Your Personal Information/i });
        this.sharingSection = page.getByRole('heading', { name: /Sharing of Personal Information/i });
        this.cookiesSection = page.getByRole('heading', { name: /Cookies/i });
        this.contactSection = page.getByRole('heading', { name: /Contact Us/i });

        // Links
        this.contactEmail = page.getByRole('link', { name: /alex.bunch@angryappletree.com/i });
    }

    // ============================================
    // NAVIGATION
    // ============================================

    /**
     * Navigate to the privacy page
     */
    async goto() {
        await this.page.goto('/privacy');
    }

    /**
     * Click the back button to return to GigFinder
     */
    async clickBackButton() {
        await this.backButton.click();
    }

    /**
     * Click the contact email link
     */
    async clickContactEmail() {
        await this.contactEmail.click();
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    /**
     * Assert that the page has loaded correctly
     */
    async expectPageLoaded() {
        await expect(this.heroTitle).toBeVisible();
        await expect(this.heroTitle).toHaveText('Privacy Notice');
        await expect(this.mainHeading).toBeVisible();
    }

    /**
     * Assert that the hero title is correct
     */
    async expectHeroTitle() {
        await expect(this.heroTitle).toHaveText('Privacy Notice');
    }

    /**
     * Assert that the back button is visible and functional
     */
    async expectBackButtonVisible() {
        await expect(this.backButton).toBeVisible();
        await expect(this.backButton).toHaveAttribute('href', '/gigfinder');
    }

    /**
     * Assert that the main heading is correct
     */
    async expectMainHeading() {
        await expect(this.mainHeading).toContainText('Angry Apple Tree Ltd');
        await expect(this.mainHeading).toContainText('Privacy Notice / Policy');
    }

    /**
     * Assert that last updated date is present
     */
    async expectLastUpdatedPresent() {
        await expect(this.lastUpdated).toBeVisible();
        await expect(this.lastUpdated).toContainText('Last Updated:');
        await expect(this.lastUpdated).toContainText('December 2, 2025');
    }

    /**
     * Assert that all main sections are present
     */
    async expectAllSectionsPresent() {
        await expect(this.collectionSection).toBeVisible();
        await expect(this.usageSection).toBeVisible();
        await expect(this.sharingSection).toBeVisible();
        await expect(this.cookiesSection).toBeVisible();
        await expect(this.contactSection).toBeVisible();
    }

    /**
     * Assert that contact information is present
     */
    async expectContactInfoPresent() {
        await expect(this.contactSection).toBeVisible();
        await expect(this.contactEmail).toBeVisible();
        await expect(this.contactEmail).toHaveAttribute('href', 'mailto:alex.bunch@angryappletree.com');
    }

    /**
     * Assert that specific privacy topics are covered
     */
    async expectPrivacyTopicsCovered() {
        // Check for key privacy topics in the content
        const content = await this.card.textContent();

        expect(content).toContain('Personal Information');
        expect(content).toContain('Contact Information');
        expect(content).toContain('Account Information');
        expect(content).toContain('Payment Information');
        expect(content).toContain('cookies');
    }

    /**
     * Assert that the page has proper SEO metadata
     */
    async expectProperMetadata() {
        const title = await this.page.title();
        expect(title).toBeTruthy();
    }

    /**
     * Complete page validation
     */
    async expectCompletePage() {
        await this.expectPageLoaded();
        await this.expectHeroTitle();
        await this.expectBackButtonVisible();
        await this.expectMainHeading();
        await this.expectLastUpdatedPresent();
        await this.expectAllSectionsPresent();
        await this.expectContactInfoPresent();
    }
}
