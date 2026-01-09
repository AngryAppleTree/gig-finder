import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Quick Search Component
 * 
 * Represents the Quick Search component found on the homepage.
 * Provides reusable methods for interacting with inputs and triggering searches.
 * 
 * @example
 * const quickSearch = new QuickSearchComponent(page);
 * await quickSearch.search('The Beatles', 'Liverpool', '2025-01-01');
 */
export class QuickSearchComponent {
    readonly page: Page;

    // Main Container
    readonly container: Locator;
    readonly title: Locator;

    // Inputs
    readonly keywordInput: Locator;
    readonly cityInput: Locator;
    readonly dateInput: Locator;

    // Button
    readonly searchButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Structure
        this.container = page.locator('div').filter({ hasText: 'Quick Search' }).first();
        this.title = this.container.locator('h3', { hasText: 'Quick Search' });

        // Inputs - Using stable IDs where available, or placeholders/types
        this.keywordInput = page.locator('#searchInputReact');
        this.cityInput = page.locator('#searchCityReact');
        this.dateInput = page.locator('#searchDateReact');

        // Button
        this.searchButton = page.getByRole('button', { name: /SEARCH GIGS/i });
    }

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * Fill the keyword (Artist/Venue) input
     */
    async fillKeyword(keyword: string) {
        await this.keywordInput.fill(keyword);
    }

    /**
     * Fill the city input
     */
    async fillCity(city: string) {
        await this.cityInput.fill(city);
    }

    /**
     * Fill the date input (YYYY-MM-DD)
     */
    async fillDate(date: string) {
        await this.dateInput.fill(date);
    }

    /**
     * Click the search button
     */
    async clickSearch() {
        await this.searchButton.click();
    }

    /**
     * Press Enter on a specific input to trigger search
     */
    async pressEnterOn(input: 'keyword' | 'city' | 'date') {
        switch (input) {
            case 'keyword': await this.keywordInput.press('Enter'); break;
            case 'city': await this.cityInput.press('Enter'); break;
            case 'date': await this.dateInput.press('Enter'); break;
        }
    }

    /**
     * Perform a complete search
     */
    async search(keyword?: string, city?: string, date?: string) {
        if (keyword) await this.fillKeyword(keyword);
        if (city) await this.fillCity(city);
        if (date) await this.fillDate(date);
        await this.clickSearch();
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    /**
     * Assert component is visible
     */
    async expectVisible() {
        await expect(this.container).toBeVisible();
        await expect(this.title).toBeVisible();
        await expect(this.keywordInput).toBeVisible();
        await expect(this.cityInput).toBeVisible();
        await expect(this.dateInput).toBeVisible();
        await expect(this.searchButton).toBeVisible();
    }

    /**
     * Assert inputs have correct placeholders
     */
    async expectPlaceholders() {
        await expect(this.keywordInput).toHaveAttribute('placeholder', 'Artist or Venue');
        await expect(this.cityInput).toHaveAttribute('placeholder', 'City (e.g. Edinburgh)');
    }

    /**
     * Assert search button state
     */
    async expectSearchButtonEnabled() {
        await expect(this.searchButton).toBeEnabled();
        await expect(this.searchButton).toHaveText('SEARCH GIGS');
    }

    /**
     * Assert redirection with correct parameters
     */
    async expectRedirectToResults(params: { keyword?: string, location?: string, minDate?: string }) {
        // Wait for URL navigation
        await this.page.waitForURL(/\/gigfinder\/results.*/);

        const url = new URL(this.page.url());
        expect(url.pathname).toBe('/gigfinder/results');

        if (params.keyword) {
            expect(url.searchParams.get('keyword')).toBe(params.keyword);
        }
        if (params.location) {
            expect(url.searchParams.get('location')).toBe(params.location);
        }
        if (params.minDate) {
            expect(url.searchParams.get('minDate')).toBe(params.minDate);
        }
    }
}
