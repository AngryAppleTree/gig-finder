/**
 * Functional Unit: Landing Page and Gig Search
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
import { WizardComponent } from '../../page-objects/Wizard';
import { WIZARD_JOURNEYS } from '../../fixtures/wizard-journeys';

test.describe('Wizard User Journeys', () => {

    WIZARD_JOURNEYS.forEach((journey) => {
        test(`Journey: ${journey.name}`, async ({ page }) => {
            const wizard = new WizardComponent(page);
            await page.goto('/gigfinder');

            // --- STEP 1: WHEN ---
            await test.step(`Select When: ${journey.when}`, async () => {
                await wizard.selectWhen(journey.when);

                if (journey.when === 'Pick a Date' && journey.customDate) {
                    await wizard.enterCustomDate(journey.customDate);
                }
            });

            // --- STEP 2: WHERE ---
            await test.step(`Select Where: ${journey.where}`, async () => {
                await wizard.selectWhere(journey.where);

                if ((journey.where === 'Locally' || journey.where === 'Within 100 Miles') && journey.postcode) {
                    await wizard.enterPostcode(journey.postcode);
                }
            });

            // --- STEP 3: SIZE ---
            await test.step(`Select Size: ${journey.size}`, async () => {
                await wizard.selectSize(journey.size);
            });

            // --- STEP 4 or REJECTION ---
            if (journey.expectRejection) {
                await test.step('Verify Rejection Screen', async () => {
                    await wizard.expectRejection();
                });
            } else if (journey.budget) {
                const budget = journey.budget;
                // Must be Budget step
                await test.step(`Select Budget: ${budget}`, async () => {
                    await wizard.selectBudget(budget);
                });

                // Verify Success Redirect with Params
                await test.step('Verify Redirect to Results', async () => {
                    await wizard.expectResultsPage(journey.expectedParams);
                });
            }
        });
    });
});
