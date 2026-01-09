import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Contact Page
 * 
 * Represents the /contact page with contact form.
 * Provides reusable methods for interacting with and asserting page elements.
 * 
 * @example
 * const contactPage = new ContactPage(page);
 * await contactPage.goto();
 * await contactPage.fillForm('John Doe', 'john@example.com', 'general', 'Test message');
 */
export class ContactPage {
    readonly page: Page;

    // Main elements
    readonly container: Locator;
    readonly main: Locator;
    readonly heroTitle: Locator;
    readonly backButton: Locator;
    readonly card: Locator;

    // Form elements
    readonly form: Locator;
    readonly nameInput: Locator;
    readonly emailInput: Locator;
    readonly subjectSelect: Locator;
    readonly messageTextarea: Locator;
    readonly submitButton: Locator;

    // Messages
    readonly successMessage: Locator;
    readonly errorMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Main structure
        this.container = page.locator('div').first();
        this.main = page.locator('main');
        this.heroTitle = page.locator('h1');
        this.backButton = page.getByRole('link', { name: /Back to GigFinder/i });
        this.card = page.locator(`.${this.getCardClass()}`).first();

        // Form elements
        this.form = page.locator('form');
        this.nameInput = page.locator('#name');
        this.emailInput = page.locator('#email');
        this.subjectSelect = page.locator('#subject');
        this.messageTextarea = page.locator('#message');
        this.submitButton = page.getByRole('button', { name: /Send Message/i });

        // Messages
        this.successMessage = page.locator('div').filter({ hasText: /Thank you! Your message has been sent/i });
        this.errorMessage = page.locator('div').filter({ hasText: /Please fill in all fields/i });
    }

    private getCardClass(): string {
        // This is a helper to get the card class name
        // In a real scenario, you might need to adjust this based on your CSS modules
        return 'card';
    }

    // ============================================
    // NAVIGATION
    // ============================================

    /**
     * Navigate to the contact page
     */
    async goto() {
        await this.page.goto('/contact');
    }

    /**
     * Click the back button to return to GigFinder
     */
    async clickBackButton() {
        await this.backButton.click();
    }

    // ============================================
    // FORM ACTIONS
    // ============================================

    /**
     * Fill in the contact form
     */
    async fillForm(name: string, email: string, subject: string, message: string) {
        await this.nameInput.fill(name);
        await this.emailInput.fill(email);
        await this.subjectSelect.selectOption(subject);
        await this.messageTextarea.fill(message);
    }

    /**
     * Submit the contact form
     */
    async submitForm() {
        await this.submitButton.click();
    }

    /**
     * Fill and submit the form in one action
     */
    async fillAndSubmitForm(name: string, email: string, subject: string, message: string) {
        await this.fillForm(name, email, subject, message);
        await this.submitForm();
    }

    /**
     * Clear all form fields
     */
    async clearForm() {
        await this.nameInput.clear();
        await this.emailInput.clear();
        await this.subjectSelect.selectOption('');
        await this.messageTextarea.clear();
    }

    // ============================================
    // ASSERTIONS
    // ============================================

    /**
     * Assert that the page has loaded correctly
     */
    async expectPageLoaded() {
        await expect(this.heroTitle).toBeVisible();
        await expect(this.heroTitle).toHaveText('📧 Contact Us');
        await expect(this.form).toBeVisible();
    }

    /**
     * Assert that the hero title is correct
     */
    async expectHeroTitle() {
        await expect(this.heroTitle).toHaveText('📧 Contact Us');
    }

    /**
     * Assert that the back button is visible and functional
     */
    async expectBackButtonVisible() {
        await expect(this.backButton).toBeVisible();
        await expect(this.backButton).toHaveAttribute('href', '/gigfinder');
    }

    /**
     * Assert that all form fields are present
     */
    async expectAllFormFieldsPresent() {
        await expect(this.nameInput).toBeVisible();
        await expect(this.emailInput).toBeVisible();
        await expect(this.subjectSelect).toBeVisible();
        await expect(this.messageTextarea).toBeVisible();
        await expect(this.submitButton).toBeVisible();
    }

    /**
     * Assert that form fields have correct labels
     */
    async expectFormLabelsCorrect() {
        await expect(this.page.getByText('Your Name *')).toBeVisible();
        await expect(this.page.getByText('Email Address *')).toBeVisible();
        await expect(this.page.getByText('Subject *')).toBeVisible();
        await expect(this.page.getByText('Message *')).toBeVisible();
    }

    /**
     * Assert that subject dropdown has all options
     */
    async expectSubjectOptionsPresent() {
        const options = await this.subjectSelect.locator('option').allTextContents();

        expect(options).toContain('Select a subject...');
        expect(options).toContain('General Inquiry');
        expect(options).toContain('Technical Support');
        expect(options).toContain('Feedback');
        expect(options).toContain('Partnership Opportunity');
        expect(options).toContain('Other');
    }

    /**
     * Assert that success message is displayed
     */
    async expectSuccessMessage() {
        await expect(this.successMessage).toBeVisible();
        await expect(this.successMessage).toContainText('Thank you! Your message has been sent successfully');
    }

    /**
     * Assert that error message is displayed
     */
    async expectErrorMessage() {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText('Please fill in all fields');
    }

    /**
     * Assert that submit button shows loading state
     */
    async expectSubmitButtonLoading() {
        await expect(this.submitButton).toContainText('Sending...');
        await expect(this.submitButton).toBeDisabled();
    }

    /**
     * Complete page validation
     */
    async expectCompletePage() {
        await this.expectPageLoaded();
        await this.expectHeroTitle();
        await this.expectBackButtonVisible();
        await this.expectAllFormFieldsPresent();
        await this.expectFormLabelsCorrect();
    }
}
