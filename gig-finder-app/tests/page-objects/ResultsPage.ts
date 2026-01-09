import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Search Results Page
 * Handles layout verification, results grid, and individual card interactions.
 */
export class ResultsPage {
    readonly page: Page;

    // Header & Nav
    readonly mainTitle: Locator;
    readonly backButton: Locator;
    readonly startOverButton: Locator;

    // Content Areas
    readonly heading: Locator;
    readonly loadingState: Locator;
    readonly errorState: Locator;
    readonly noResultsMessage: Locator;
    readonly resultsSummary: Locator;

    // Results
    readonly resultsGrid: Locator;
    readonly resultCards: Locator;

    constructor(page: Page) {
        this.page = page;

        // Header
        // Header
        this.mainTitle = page.locator('h1.main-title');
        this.backButton = page.getByRole('button', { name: /Back/ }).first(); // multiple back buttons (top/bottom)
        this.startOverButton = page.getByRole('button', { name: /Start Over/ }).first();

        // States
        this.heading = page.locator('h2.step-title');
        this.loadingState = page.locator('h2', { hasText: 'Searching...' });
        this.errorState = page.locator('h2', { hasText: 'Error' });

        // Content
        this.noResultsMessage = page.getByText('No gigs found matching your criteria');
        this.resultsSummary = page.locator('.results-summary');

        // Grid
        this.resultsGrid = page.locator('.gigs-list');
        this.resultCards = page.locator('.gig-card');
    }

    async goto(queryParams?: Record<string, string>) {
        if (queryParams) {
            const params = new URLSearchParams(queryParams);
            await this.page.goto(`/gigfinder/results?${params.toString()}`);
        } else {
            await this.page.goto('/gigfinder/results');
        }
    }

    // ===================================
    // ASSERTIONS
    // ===================================

    async expectLoaded() {
        // Wait for Loading to disappear
        await expect(this.loadingState).toBeHidden({ timeout: 10000 });
        await expect(this.heading).toBeVisible();
    }

    async expectResultsCount(min: number) {
        await this.expectLoaded();
        const count = await this.resultCards.count();
        expect(count).toBeGreaterThanOrEqual(min);
    }

    async expectNoResults() {
        await this.expectLoaded();
        await expect(this.noResultsMessage).toBeVisible();
        await expect(this.resultCards).toHaveCount(0);
    }

    async getResultCard(index: number = 0) {
        await this.expectLoaded();
        return this.resultCards.nth(index);
    }
}
