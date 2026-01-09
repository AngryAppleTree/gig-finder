import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Pledge Page
 * 
 * Represents the /pledge page with GigFinder's commitment to artists.
 * Provides reusable methods for interacting with and asserting page elements.
 * 
 * @example
 * const pledgePage = new PledgePage(page);
 * await pledgePage.goto();
 * await pledgePage.expectPageLoaded();
 */
export class PledgePage {
    readonly page: Page;

    // Main elements
    readonly container: Locator;
    readonly main: Locator;
    readonly heroTitle: Locator;
    readonly backButton: Locator;
    readonly card: Locator;

    // Content sections
    readonly mainHeading: Locator;
    readonly ethosSection: Locator;
    readonly vinylCommitmentSection: Locator;
    readonly joinUsSection: Locator;
    readonly pledgeBox: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main structure
        this.container = page.locator('div').first();
        this.main = page.locator('main');
        this.heroTitle = page.locator('h1');
        this.backButton = page.getByRole('link', { name: /Back to GigFinder/i });
        this.card = page.locator('div').filter({ hasText: /The Gig-Finder Pledge/i }).first();

        // Content sections
        this.mainHeading = page.getByRole('heading', { name: /The Gig-Finder Pledge: More Than Just a Ticket/i });
        this.ethosSection = page.getByRole('heading', { name: /Our Ethos: Putting Power Back/i });
        this.vinylCommitmentSection = page.getByRole('heading', { name: /Our Groundbreaking Commitment: The 50% Vinyl Reinvestment/i });
        this.joinUsSection = page.getByRole('heading', { name: /Join Us/i });
        this.pledgeBox = page.locator('p').filter({ hasText: /We pledge to re-invest 50%/i });
    }

    // ============================================
    // NAVIGATION
    // ============================================

    /**
     * Navigate to the pledge page
     */
    async goto() {
        await this.page.goto('/pledge');
    }

    /**
     * Click the back button to return to GigFinder
     */
    async clickBackButton() {
        await this.backButton.click();
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    /**
     * Assert that the page has loaded correctly
     */
    async expectPageLoaded() {
        await expect(this.heroTitle).toBeVisible();
        await expect(this.heroTitle).toHaveText('🎵 Our Pledge');
        await expect(this.mainHeading).toBeVisible();
    }

    /**
     * Assert that the hero title is correct
     */
    async expectHeroTitle() {
        await expect(this.heroTitle).toHaveText('🎵 Our Pledge');
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
        await expect(this.mainHeading).toContainText('The Gig-Finder Pledge');
        await expect(this.mainHeading).toContainText('More Than Just a Ticket');
    }

    /**
     * Assert that all main sections are present
     */
    async expectAllSectionsPresent() {
        await expect(this.ethosSection).toBeVisible();
        await expect(this.vinylCommitmentSection).toBeVisible();
        await expect(this.joinUsSection).toBeVisible();
    }

    /**
     * Assert that the 50% pledge box is visible and highlighted
     */
    async expectPledgeBoxVisible() {
        await expect(this.pledgeBox).toBeVisible();
        await expect(this.pledgeBox).toContainText('We pledge to re-invest 50%');
        await expect(this.pledgeBox).toContainText('independent music scene');
    }

    /**
     * Assert that key pledge topics are covered
     */
    async expectPledgeTopicsCovered() {
        const content = await this.card.textContent();

        expect(content).toContain('Fairer Commission');
        expect(content).toContain('Supporting Venues');
        expect(content).toContain('50% Vinyl Reinvestment');
        expect(content).toContain('vinyl');
    }

    /**
     * Assert that artist benefits are mentioned
     */
    async expectArtistBenefitsMentioned() {
        const content = await this.card.textContent();

        expect(content).toContain('artists deserve to be compensated fairly');
        expect(content).toContain('emerging talent');
        expect(content).toContain('small bands');
    }

    /**
     * Assert that vinyl commitment details are present
     */
    async expectVinylCommitmentDetails() {
        const content = await this.card.textContent();

        expect(content).toContain('production and release of new music on vinyl');
        expect(content).toContain('tangible, high-quality product');
        expect(content).toContain('revenue stream');
    }

    /**
     * Assert that call to action is present
     */
    async expectCallToAction() {
        const content = await this.card.textContent();

        expect(content).toContain('When you buy a ticket');
        expect(content).toContain('active patron of the arts');
        expect(content).toContain('helping them press their next record');
    }

    /**
     * Complete page validation
     */
    async expectCompletePage() {
        await this.expectPageLoaded();
        await this.expectHeroTitle();
        await this.expectBackButtonVisible();
        await this.expectMainHeading();
        await this.expectAllSectionsPresent();
        await this.expectPledgeBoxVisible();
    }
}
