import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for My Gigs page
 * URL: /gigfinder/my-gigs
 */
export class MyGigsPage {
    readonly page: Page;

    // Locators
    readonly pageTitle: Locator;
    readonly newGigButton: Locator;
    readonly findGigsButton: Locator;
    readonly emptyStateMessage: Locator;
    readonly startPromotingButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Header elements
        this.pageTitle = page.locator('h1.main-title');
        this.newGigButton = page.getByRole('link', { name: '+ NEW GIG' });
        this.findGigsButton = page.getByRole('link', { name: '← FIND GIGS' });

        // Empty state
        this.emptyStateMessage = page.getByText("It's Quiet Here...");
        this.startPromotingButton = page.getByRole('link', { name: 'START PROMOTING' });
    }

    /**
     * Navigate to My Gigs page
     */
    async goto() {
        await this.page.goto('/gigfinder/my-gigs');
    }

    /**
     * Get a specific gig card container by name
     * The gig name is in an H3, and we need the outer container div
     * Uses case-insensitive matching to handle CSS text-transform
     */
    getGigCard(gigName: string) {
        // Find the H3 with the gig name (case-insensitive), then traverse up to the parent container
        // Structure: div (container) > div > div > h3
        return this.page.locator('div').filter({
            has: this.page.locator('h3', { hasText: new RegExp(gigName, 'i') })
        }).first();
    }

    /**
     * Get the Edit button for a specific gig
     */
    getEditButton(gigName: string) {
        const gigCard = this.getGigCard(gigName);
        return gigCard.getByRole('link', { name: 'EDIT' });
    }

    /**
     * Get the Guest List button for a specific gig
     */
    getGuestListButton(gigName: string) {
        const gigCard = this.getGigCard(gigName);
        return gigCard.getByRole('link', { name: 'GUEST LIST' });
    }

    /**
     * Get the Delete button for a specific gig
     */
    getDeleteButton(gigName: string) {
        const gigCard = this.getGigCard(gigName);
        return gigCard.getByRole('button', { name: 'DELETE' });
    }

    /**
     * Click the Guest List button for a specific gig
     */
    async clickGuestList(gigName: string) {
        const guestListButton = this.getGuestListButton(gigName);
        await guestListButton.click();
    }

    /**
     * Verify the page has loaded correctly
     */
    async expectLoaded() {
        await expect(this.pageTitle).toHaveText('MY GIGS');
        await expect(this.newGigButton).toBeVisible();
        await expect(this.findGigsButton).toBeVisible();
    }

    /**
     * Verify empty state is shown
     */
    async expectEmptyState() {
        await expect(this.emptyStateMessage).toBeVisible();
        await expect(this.startPromotingButton).toBeVisible();
    }

    /**
     * Verify a gig is visible in the list
     */
    async expectGigVisible(gigName: string) {
        const gigCard = this.getGigCard(gigName);
        await expect(gigCard).toBeVisible();
    }

    /**
     * Verify Guest List button is visible for a gig
     */
    async expectGuestListButtonVisible(gigName: string) {
        const guestListButton = this.getGuestListButton(gigName);
        await expect(guestListButton).toBeVisible();
    }

    /**
     * Verify Guest List button is NOT visible for a gig
     */
    async expectGuestListButtonHidden(gigName: string) {
        const guestListButton = this.getGuestListButton(gigName);
        await expect(guestListButton).not.toBeVisible();
    }

    /**
     * Get count of gigs displayed
     */
    async getGigCount(): Promise<number> {
        return await this.page.locator('h3').count();
    }
}
