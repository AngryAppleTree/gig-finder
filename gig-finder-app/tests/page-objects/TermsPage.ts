import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Terms of Service Page
 * 
 * Represents the /terms page with terms and conditions content.
 * Provides reusable methods for interacting with and asserting page elements.
 * 
 * @example
 * const termsPage = new TermsPage(page);
 * await termsPage.goto();
 * await termsPage.expectPageLoaded();
 */
export class TermsPage {
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
    readonly acceptanceSection: Locator;
    readonly servicesSection: Locator;
    readonly userAccountsSection: Locator;
    readonly intellectualPropertySection: Locator;
    readonly limitationSection: Locator;
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
        this.card = page.locator('div').filter({ hasText: /Terms of Service/i }).first();

        // Content sections
        this.mainHeading = page.getByRole('heading', { name: /Angry Apple Tree Ltd - Terms of Service/i });
        this.lastUpdated = page.locator('p', { hasText: /Last Updated/i });
        this.acceptanceSection = page.getByRole('heading', { name: /Acceptance of Terms/i });
        this.servicesSection = page.getByRole('heading', { name: /2\. Services/i });
        this.userAccountsSection = page.getByRole('heading', { name: /User Accounts/i });
        this.intellectualPropertySection = page.getByRole('heading', { name: /Intellectual Property/i });
        this.limitationSection = page.getByRole('heading', { name: /Limitation of Liability/i });
        this.contactSection = page.getByRole('heading', { name: /Contact Us/i });

        // Links
        this.contactEmail = page.getByRole('link', { name: /alex.bunch@angryappletree.com/i });
    }

    // ============================================
    // NAVIGATION
    // ============================================

    /**
     * Navigate to the terms page
     */
    async goto() {
        await this.page.goto('/terms');
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
        await expect(this.heroTitle).toHaveText('Terms & Conditions');
        await expect(this.mainHeading).toBeVisible();
    }

    /**
     * Assert that the hero title is correct
     */
    async expectHeroTitle() {
        await expect(this.heroTitle).toHaveText('Terms & Conditions');
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
        await expect(this.mainHeading).toContainText('Terms of Service');
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
        await expect(this.acceptanceSection).toBeVisible();
        await expect(this.servicesSection).toBeVisible();
        await expect(this.userAccountsSection).toBeVisible();
        await expect(this.intellectualPropertySection).toBeVisible();
        await expect(this.limitationSection).toBeVisible();
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
     * Assert that specific terms topics are covered
     */
    async expectTermsTopicsCovered() {
        const content = await this.card.textContent();

        expect(content).toContain('Acceptance of Terms');
        expect(content).toContain('Services');
        expect(content).toContain('User Accounts');
        expect(content).toContain('Intellectual Property');
        expect(content).toContain('Limitation of Liability');
    }

    /**
     * Assert that services are mentioned
     */
    async expectServicesMentioned() {
        const content = await this.card.textContent();

        expect(content).toContain('IT services');
        expect(content).toContain('Music Production');
        expect(content).toContain('Game Development');
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
