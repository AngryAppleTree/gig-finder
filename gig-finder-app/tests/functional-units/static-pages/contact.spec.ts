/**
 * Functional Unit: Static Pages
 * 
 * ⚠️ TEST POLICY: Do NOT add .skip() when tests fail
 * Failed tests indicate real issues that need to be addressed:
 * - Bugs in the code that need fixing
 * - Changes in behavior that need documenting  
 * - Test assertions that need updating
 * 
 * Only skip tests for documented architectural limitations or disabled features.
 */

import { test, expect } from '@playwright/test';
import { ContactPage } from '../../page-objects/ContactPage';
import { FooterComponent } from '../../page-objects/Footer';

test.describe('Contact Page', () => {

    test.beforeEach(async ({ page }) => {
        const contactPage = new ContactPage(page);
        await contactPage.goto();
    });

    test.describe('Page Structure', () => {

        test('page loads correctly', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectPageLoaded();
        });

        test('hero title is correct with emoji', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectHeroTitle();
        });

        test('complete page renders correctly', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectCompletePage();
        });
    });

    test.describe('Navigation', () => {

        test('back button is visible and links to GigFinder', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectBackButtonVisible();
        });

        test('back button navigates to GigFinder', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.clickBackButton();
            await expect(page).toHaveURL('/gigfinder');
        });

        test('can navigate to contact page from footer', async ({ page }) => {
            // Start at homepage
            await page.goto('/gigfinder');

            // Click contact link in footer
            const footer = new FooterComponent(page);
            await footer.clickContactLink();

            // Should be on contact page
            await expect(page).toHaveURL('/contact');
            const contactPage = new ContactPage(page);
            await contactPage.expectPageLoaded();
        });
    });

    test.describe('Form Elements', () => {

        test('all form fields are present', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectAllFormFieldsPresent();
        });

        test('form labels are correct', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectFormLabelsCorrect();
        });

        test('name field has correct attributes', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await expect(contactPage.nameInput).toHaveAttribute('type', 'text');
            await expect(contactPage.nameInput).toHaveAttribute('required', '');
            await expect(contactPage.nameInput).toHaveAttribute('placeholder', 'Enter your full name');
        });

        test('email field has correct attributes', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await expect(contactPage.emailInput).toHaveAttribute('type', 'email');
            await expect(contactPage.emailInput).toHaveAttribute('required', '');
            await expect(contactPage.emailInput).toHaveAttribute('placeholder', 'your.email@example.com');
        });

        test('subject dropdown has all options', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.expectSubjectOptionsPresent();
        });

        test('message field has correct attributes', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await expect(contactPage.messageTextarea).toHaveAttribute('required', '');
            await expect(contactPage.messageTextarea).toHaveAttribute('placeholder', "Tell us what's on your mind...");
        });

        test('submit button has correct text', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await expect(contactPage.submitButton).toContainText('Send Message');
            await expect(contactPage.submitButton).toContainText('🚀');
        });
    });

    test.describe('Form Interaction', () => {

        test('can fill in name field', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.nameInput.fill('John Doe');
            await expect(contactPage.nameInput).toHaveValue('John Doe');
        });

        test('can fill in email field', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.emailInput.fill('john@example.com');
            await expect(contactPage.emailInput).toHaveValue('john@example.com');
        });

        test('can select subject', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('general');
            await expect(contactPage.subjectSelect).toHaveValue('general');
        });

        test('can fill in message field', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.messageTextarea.fill('This is a test message');
            await expect(contactPage.messageTextarea).toHaveValue('This is a test message');
        });

        test('can fill entire form', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.fillForm('John Doe', 'john@example.com', 'support', 'Need help with booking');

            await expect(contactPage.nameInput).toHaveValue('John Doe');
            await expect(contactPage.emailInput).toHaveValue('john@example.com');
            await expect(contactPage.subjectSelect).toHaveValue('support');
            await expect(contactPage.messageTextarea).toHaveValue('Need help with booking');
        });
    });

    test.describe('Form Validation', () => {

        test('form has required fields', async ({ page }) => {
            const contactPage = new ContactPage(page);

            // All fields should be required
            await expect(contactPage.nameInput).toHaveAttribute('required', '');
            await expect(contactPage.emailInput).toHaveAttribute('required', '');
            await expect(contactPage.subjectSelect).toHaveAttribute('required', '');
            await expect(contactPage.messageTextarea).toHaveAttribute('required', '');
        });

        test('email field validates email format', async ({ page }) => {
            const contactPage = new ContactPage(page);

            // Email field should have type="email" for browser validation
            await expect(contactPage.emailInput).toHaveAttribute('type', 'email');
        });
    });

    test.describe('Subject Options', () => {

        test('can select General Inquiry', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('general');
            await expect(contactPage.subjectSelect).toHaveValue('general');
        });

        test('can select Technical Support', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('support');
            await expect(contactPage.subjectSelect).toHaveValue('support');
        });

        test('can select Feedback', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('feedback');
            await expect(contactPage.subjectSelect).toHaveValue('feedback');
        });

        test('can select Partnership Opportunity', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('partnership');
            await expect(contactPage.subjectSelect).toHaveValue('partnership');
        });

        test('can select Other', async ({ page }) => {
            const contactPage = new ContactPage(page);
            await contactPage.subjectSelect.selectOption('other');
            await expect(contactPage.subjectSelect).toHaveValue('other');
        });
    });

    test.describe('Footer Integration', () => {

        test('footer is present on contact page', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectVisible();
        });

        test('footer maintains consistency', async ({ page }) => {
            const footer = new FooterComponent(page);
            await footer.expectCompleteFooter();
        });
    });

    test.describe('Accessibility', () => {

        test('page has proper heading hierarchy', async ({ page }) => {
            // Check h1 exists
            const h1 = page.locator('h1');
            await expect(h1).toBeVisible();
            await expect(h1).toHaveCount(1);
        });

        test('form fields have labels', async ({ page }) => {
            const contactPage = new ContactPage(page);

            // Check that labels exist for each field
            await expect(page.locator('label[for="name"]')).toBeVisible();
            await expect(page.locator('label[for="email"]')).toBeVisible();
            await expect(page.locator('label[for="subject"]')).toBeVisible();
            await expect(page.locator('label[for="message"]')).toBeVisible();
        });

        test('form fields have proper IDs', async ({ page }) => {
            const contactPage = new ContactPage(page);

            await expect(contactPage.nameInput).toHaveAttribute('id', 'name');
            await expect(contactPage.emailInput).toHaveAttribute('id', 'email');
            await expect(contactPage.subjectSelect).toHaveAttribute('id', 'subject');
            await expect(contactPage.messageTextarea).toHaveAttribute('id', 'message');
        });

        test('submit button is keyboard accessible', async ({ page }) => {
            const contactPage = new ContactPage(page);

            // Should be able to focus submit button
            await contactPage.submitButton.focus();
            await expect(contactPage.submitButton).toBeFocused();
        });
    });

    test.describe('Responsive Design', () => {

        test('page displays correctly on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const contactPage = new ContactPage(page);
            await contactPage.goto();
            await contactPage.expectCompletePage();
        });

        test('page displays correctly on tablet', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            const contactPage = new ContactPage(page);
            await contactPage.goto();
            await contactPage.expectCompletePage();
        });

        test('page displays correctly on desktop', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const contactPage = new ContactPage(page);
            await contactPage.goto();
            await contactPage.expectCompletePage();
        });
    });

    test.describe('SEO & Metadata', () => {

        test('page has a title', async ({ page }) => {
            const title = await page.title();
            expect(title).toBeTruthy();
            expect(title.length).toBeGreaterThan(0);
        });

        test('page URL is correct', async ({ page }) => {
            await expect(page).toHaveURL('/contact');
        });
    });
});
