import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Guest List page
 * URL: /gigfinder/my-gigs/guestlist/[id]
 */
export class GuestListPage {
    readonly page: Page;

    // Locators
    readonly pageTitle: Locator;
    readonly backToMyGigsButton: Locator;
    readonly emailGuestsButton: Locator;
    readonly scanTicketsButton: Locator;

    // Add Guest Form
    readonly addGuestSection: Locator;
    readonly guestNameInput: Locator;
    readonly guestEmailInput: Locator;
    readonly addGuestButton: Locator;

    // Guest List
    readonly totalNamesHeading: Locator;
    readonly emptyListMessage: Locator;
    readonly guestCards: Locator;

    // Email Modal
    readonly emailModal: Locator;
    readonly emailSubjectInput: Locator;
    readonly emailMessageTextarea: Locator;
    readonly sendBroadcastButton: Locator;
    readonly cancelEmailButton: Locator;

    constructor(page: Page) {
        this.page = page;

        // Header elements
        this.pageTitle = page.locator('h1.main-title');
        this.backToMyGigsButton = page.getByRole('link', { name: '← Back to My Gigs' });
        this.emailGuestsButton = page.getByRole('button', { name: '✉️ Email Guests' });
        this.scanTicketsButton = page.getByRole('link', { name: '📷 Scan Tickets' });

        // Add Guest Form
        this.addGuestSection = page.locator('h3', { hasText: '+ Add Guest Manually' }).locator('..');
        this.guestNameInput = page.getByPlaceholder('Guest Name');
        this.guestEmailInput = page.getByPlaceholder('Guest Email');
        this.addGuestButton = page.getByRole('button', { name: /Add/i });

        // Guest List Section
        this.totalNamesHeading = page.locator('h2', { hasText: /Total Names:/ });
        this.emptyListMessage = page.getByText('No names on the list yet.');
        this.guestCards = page.locator('div').filter({ hasText: /🎟️/ });

        // Email Modal
        this.emailModal = page.locator('div', { hasText: 'Email All Guests' }).first();
        this.emailSubjectInput = page.getByPlaceholder('Subject');
        this.emailMessageTextarea = page.getByPlaceholder('Message...');
        this.sendBroadcastButton = page.getByRole('button', { name: /Send Broadcast/i });
        this.cancelEmailButton = page.getByRole('button', { name: 'Cancel' });
    }

    /**
     * Navigate to Guest List page for a specific event
     */
    async goto(eventId: string | number) {
        await this.page.goto(`/gigfinder/my-gigs/guestlist/${eventId}`);
    }

    /**
     * Add a guest to the list
     */
    async addGuest(name: string, email: string) {
        await this.guestNameInput.fill(name);
        await this.guestEmailInput.fill(email);
        await this.addGuestButton.click();
    }

    /**
     * Get a specific guest card by name
     * Each guest card is a div with background '#111' containing the guest name and ticket emoji
     */
    getGuestCard(guestName: string) {
        // Find the div that contains both the guest name AND the ticket emoji
        // Use a more specific selector to avoid matching parent containers
        return this.page.locator('div').filter({
            has: this.page.locator('div', { hasText: guestName }),
        }).filter({
            has: this.page.locator('text=🎟️')
        }).first();
    }

    /**
     * Get the check-in status badge for a guest
     */
    getCheckInStatus(guestName: string) {
        const card = this.getGuestCard(guestName);
        // Use .first() to avoid strict mode violation (there might be multiple matching spans)
        return card.locator('span', { hasText: /CHECKED IN|NOT SCANNED/ }).first();
    }

    /**
     * Open the email modal
     */
    async openEmailModal() {
        await this.emailGuestsButton.click();
    }

    /**
     * Send broadcast email to all guests
     */
    async sendBroadcastEmail(subject: string, message: string) {
        await this.openEmailModal();
        await this.emailSubjectInput.fill(subject);
        await this.emailMessageTextarea.fill(message);
        await this.sendBroadcastButton.click();
    }

    /**
     * Verify the page has loaded correctly
     */
    async expectLoaded() {
        await expect(this.pageTitle).toHaveText('GUEST LIST');
        await expect(this.backToMyGigsButton).toBeVisible();
        await expect(this.addGuestSection).toBeVisible();
    }

    /**
     * Verify empty state is shown
     */
    async expectEmptyList() {
        await expect(this.emptyListMessage).toBeVisible();
        await expect(this.totalNamesHeading).toContainText('Total Names: 0');
    }

    /**
     * Verify a guest is visible in the list
     */
    async expectGuestVisible(guestName: string) {
        const guestCard = this.getGuestCard(guestName);
        await expect(guestCard).toBeVisible();
    }

    /**
     * Verify total guest count
     */
    async expectTotalGuests(count: number) {
        await expect(this.totalNamesHeading).toContainText(`Total Names: ${count}`);
    }

    /**
     * Verify guest check-in status
     */
    async expectGuestCheckedIn(guestName: string, checkedIn: boolean = true) {
        const status = this.getCheckInStatus(guestName);
        if (checkedIn) {
            await expect(status).toContainText('✓ CHECKED IN');
        } else {
            await expect(status).toContainText('NOT SCANNED');
        }
    }

    /**
     * Verify email modal is visible
     */
    async expectEmailModalVisible() {
        await expect(this.emailModal).toBeVisible();
    }

    /**
     * Verify email modal is hidden
     */
    async expectEmailModalHidden() {
        await expect(this.emailModal).not.toBeVisible();
    }

    /**
     * Get count of guests displayed
     * Counts the actual guest card containers (divs with background '#111')
     */
    async getGuestCount(): Promise<number> {
        // Count the customer name divs which appear once per guest
        // These are the divs with fontSize '1.1rem' and fontWeight 'bold' containing the name
        // More reliable: count divs that have both a name div AND ticket emoji
        const guestCards = this.page.locator('div').filter({
            has: this.page.locator('text=🎟️')
        }).filter({
            has: this.page.locator('div[style*="fontSize: \'1.1rem\'"]:has-text(" ")')
        });

        // If that's too complex, use a simpler approach: count the "Tickets" label
        // Each guest card has exactly one "Tickets" label
        const ticketLabels = this.page.locator('div:has-text("Tickets")').filter({
            hasText: /^Tickets$/
        });

        return await ticketLabels.count();
    }
}
