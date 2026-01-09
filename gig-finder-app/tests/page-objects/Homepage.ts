import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Homepage
 * 
 * Focuses on high-level homepage elements:
 * - Title / Hero
 * - Auth Buttons (Sign In / User Profile)
 * - Main CTAs (Add Gig, My Gigs)
 * - Admin Console Button (Conditional)
 */
export class Homepage {
    readonly page: Page;

    // Core Elements
    readonly mainTitle: Locator;
    readonly signInButton: Locator;
    readonly userButton: Locator;

    // Promising a Good Night (CTAs)
    readonly addGigButton: Locator;
    readonly myGigsButton: Locator;

    // Admin Element (Inside Wizard Step 1)
    readonly adminConsoleButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Title: "GIG FINDER"
        this.mainTitle = page.locator('h1.main-title');

        // Auth Header (Top Right)
        this.signInButton = page.locator('.clerk-user-button-trigger, button:has-text("Sign In")');

        this.userButton = page.locator('.clerk-user-button-trigger'); // Generic class for Clerk trigger

        // Main CTAs
        this.addGigButton = page.getByRole('link', { name: /ADD YOUR GIG/i });
        this.myGigsButton = page.getByRole('link', { name: /MY GIGS/i });

        // Admin Console Button
        this.adminConsoleButton = page.getByRole('link', { name: /ADMIN CONSOLE/i });
    }

    async goto() {
        await this.page.goto('/gigfinder');
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    async expectLoaded() {
        await expect(this.mainTitle).toBeVisible();
    }

    /**
     * Assert that the user is NOT logged in
     */
    async expectSignedOut() {
        // Just checking visibility of sign-in related elements
        await expect(this.page.locator('button', { hasText: 'Sign In' })).toBeVisible();
    }

    /**
     * Assert that the Admin Console button is visible
     */
    async expectAdminButtonVisible() {
        await expect(this.adminConsoleButton).toBeVisible();
    }

    /**
     * Assert that the Admin Console button is HIDDEN
     */
    async expectAdminButtonHidden() {
        await expect(this.adminConsoleButton).toBeHidden();
    }
}
