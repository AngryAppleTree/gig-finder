import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the GigFinder Wizard
 * Handles complex multi-step journeys including conditional inputs and rejection screens.
 */
export class WizardComponent {
    readonly page: Page;

    // Steps
    readonly step1: Locator;
    readonly step2: Locator;
    readonly step3: Locator;
    readonly step4: Locator; // Budget

    // Extras
    readonly progressBar: Locator;
    readonly rejectionScreen: Locator;
    readonly tryAgainButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.progressBar = page.locator('.progress-bar');

        // Step Containers
        this.step1 = page.locator('#r-step1');
        this.step2 = page.locator('#r-step2');
        this.step3 = page.locator('#r-step3');
        this.step4 = page.locator('#r-step4');

        // Rejection
        this.rejectionScreen = page.locator('h1', { hasText: 'GET TAE FUCK' });
        this.tryAgainButton = page.getByRole('button', { name: 'Try Again' });
    }

    // ===================================
    // STEP 1: WHEN
    // ===================================

    async selectWhen(option: 'Tonight' | 'This Weekend' | 'This Week' | 'I Don\'t Know' | 'Pick a Date') {
        const step = this.step1;
        await expect(step).toBeVisible();

        // Use regex to strictly match end of string to avoid "This Week" matching "This Weekend"
        let namePattern: RegExp;

        switch (option) {
            case 'Tonight': namePattern = /Tonight$/i; break;
            case 'This Weekend': namePattern = /This Weekend$/i; break;
            case 'This Week': namePattern = /This Week$/i; break;
            case 'I Don\'t Know': namePattern = /I Don't Know$/i; break;
            case 'Pick a Date': namePattern = /Pick a Date$/i; break;
            default: throw new Error(`Unknown 'When' option: ${option}`);
        }

        await step.getByRole('button', { name: namePattern }).click();
    }

    async enterCustomDate(date: string, flexible: boolean = false) {
        // Assume 'Pick a Date' was already clicked or is active
        const container = this.step1.locator('.date-picker');
        await expect(container).toBeVisible();
        await container.locator('input[type="date"]').fill(date);

        if (flexible) {
            await container.getByLabel('I am flexible').check();
        }

        // In the app, filling the date triggers auto-advance after 500ms
        // We wait for Step 2 to appear to confirm transition
        await expect(this.step2).toBeVisible({ timeout: 5000 });
    }

    // ===================================
    // STEP 2: WHERE
    // ===================================

    async selectWhere(option: 'Locally' | 'Within 100 Miles' | 'Anywhere in Scotland') {
        const step = this.step2;
        await expect(step).toBeVisible();

        let namePattern: RegExp;
        switch (option) {
            case 'Locally': namePattern = /Locally$/i; break;
            case 'Within 100 Miles': namePattern = /Within 100 Miles$/i; break;
            case 'Anywhere in Scotland': namePattern = /Anywhere in Scotland$/i; break;
            default: throw new Error(`Unknown 'Where' option: ${option}`);
        }

        await step.getByRole('button', { name: namePattern }).click();
    }

    async enterPostcode(postcode: string) {
        // Only for 'Locally' or 'Within 100 Miles'
        const input = this.step2.locator('#postcode');
        await expect(input).toBeVisible();
        await input.fill(postcode);
        await this.step2.getByRole('button', { name: 'Next' }).click();
    }

    // ===================================
    // STEP 3: SIZE
    // ===================================

    async selectSize(option: 'Small & Cosy' | 'Quite Big' | 'Proper Huge' | 'Any Size') {
        const step = this.step3;
        await expect(step).toBeVisible();

        // These buttons have complex HTML (titles + subtitles)
        // We match by the main text part
        let namePattern: RegExp;
        switch (option) {
            case 'Small & Cosy': namePattern = /Small & Cosy/i; break;
            case 'Quite Big': namePattern = /Quite Big/i; break;
            case 'Proper Huge': namePattern = /Proper Huge/i; break;
            case 'Any Size': namePattern = /Any Size/i; break;
            default: throw new Error(`Unknown 'Size' option: ${option}`);
        }

        await step.getByRole('button', { name: namePattern }).click();
    }

    // ===================================
    // STEP 4: BUDGET
    // ===================================

    async selectBudget(option: 'Free - £10' | '£10 - £20' | '£20 - £50' | '£50+' | 'Any Price') {
        const step = this.step4;
        await expect(step).toBeVisible();

        // Just simplistic matching usually works here as they are distinct
        await step.getByRole('button', { name: option, exact: false }).click();
    }

    // ===================================
    // ASSERTIONS & HELPERS
    // ===================================

    async expectRejection() {
        await expect(this.rejectionScreen).toBeVisible();
    }

    async expectResultsPage(expectedParams?: Record<string, string>) {
        // Wait for results page
        await this.page.waitForURL(/\/gigfinder\/results.*/);

        // Check params if provided
        if (expectedParams) {
            const url = new URL(this.page.url());
            for (const [key, value] of Object.entries(expectedParams)) {
                expect(url.searchParams.get(key), `Expected param '${key}' to be '${value}'`).toBe(value);
            }
        }
    }
}
