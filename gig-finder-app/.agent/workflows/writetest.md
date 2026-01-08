---
description: Write Playwright tests for GigFinder (test files ONLY)
---

# WRITETEST - Test Writing Mode

This command puts AI in test-writing-only mode. **NO production code changes allowed.**

## What This Does

**ONLY writes/modifies test files:**
- ✅ Create new test files in `/tests` directory
- ✅ Update existing test files
- ✅ Create Page Object Models (POMs) for reusability
- ✅ Add test utilities and helpers

**NEVER modifies:**
- ❌ Production code (app/, components/, lib/)
- ❌ API routes
- ❌ Configuration files (except playwright.config.ts)
- ❌ Database schemas
- ❌ Styles

---

## AI Behavior

**When in WRITETEST mode:**
1. ✅ Analyze existing component/page to understand what to test
2. ✅ Create Page Object Models (POMs) for reusability
3. ✅ Write comprehensive test cases
4. ✅ Use Playwright best practices
5. ✅ Add clear test descriptions
6. ✅ Include accessibility checks where relevant
7. ❌ **NEVER modify production code**
8. ❌ **NEVER fix bugs in production code**
9. ❌ **NEVER add features to production code**

**If production code has issues:**
- Document the issue in test comments
- Suggest fixes but don't implement them
- Mark tests as `.skip()` if they would fail due to bugs

---

## File Structure

**Test files go in:**
```
tests/
  ├── page-objects/          # Reusable page components
  │   ├── Footer.ts          # Footer component POM
  │   ├── Header.ts          # Header component POM
  │   └── ...
  ├── helpers/               # Test utilities
  │   ├── auth.ts            # Authentication helpers
  │   ├── stripe.ts          # Stripe test helpers
  │   └── ...
  ├── homepage.spec.ts       # Homepage tests
  ├── booking.spec.ts        # Booking flow tests
  └── ...
```

---

## Example Usage

```
WRITETEST - Create tests for Footer component
```

```
WRITETEST - Add booking flow tests with Stripe test card
```

```
WRITETEST - Create Page Object Model for event search
```

---

## Test Naming Convention

**Test files:** `[feature].spec.ts`
- `homepage.spec.ts`
- `booking.spec.ts`
- `admin-events.spec.ts`

**Page Objects:** `[Component].ts`
- `Footer.ts`
- `EventCard.ts`
- `SearchWizard.ts`

**Test descriptions:**
```typescript
test.describe('Footer Component', () => {
  test('displays logo and branding', async ({ page }) => {
    // Test implementation
  });
});
```

---

## Page Object Model Pattern

**Create reusable components:**

```typescript
// tests/page-objects/Footer.ts
export class FooterComponent {
  constructor(private page: Page) {}

  // Locators
  get logo() { return this.page.locator('.main-logo'); }
  get privacyLink() { return this.page.getByRole('link', { name: 'Privacy Policy' }); }

  // Actions
  async clickPrivacyLink() {
    await this.privacyLink.click();
  }

  // Assertions
  async expectVisible() {
    await expect(this.page.locator('footer')).toBeVisible();
  }
}
```

**Use in tests:**

```typescript
import { FooterComponent } from './page-objects/Footer';

test('footer privacy link works', async ({ page }) => {
  await page.goto('/gigfinder');
  const footer = new FooterComponent(page);
  await footer.clickPrivacyLink();
  await expect(page).toHaveURL('/privacy');
});
```

---

## Test Coverage Checklist

For each component/page, test:

**Visual:**
- [ ] Component renders
- [ ] All elements visible
- [ ] Correct text content
- [ ] Images load
- [ ] Styling applied

**Functional:**
- [ ] Links navigate correctly
- [ ] Buttons trigger actions
- [ ] Forms validate input
- [ ] Error states display

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Focus management correct
- [ ] ARIA attributes valid

**Integration:**
- [ ] API calls succeed
- [ ] Database queries work
- [ ] External services respond
- [ ] State updates correctly

---

## Best Practices

1. **Use Page Object Models** for reusability
2. **Test user behavior**, not implementation
3. **Use semantic selectors** (getByRole, getByLabel)
4. **Avoid brittle selectors** (CSS classes can change)
5. **Test one thing per test** (single responsibility)
6. **Use descriptive test names** (what and why)
7. **Add comments** for complex test logic
8. **Group related tests** with describe blocks

---

## Running Tests

**All tests:**
```bash
npx playwright test
```

**Specific file:**
```bash
npx playwright test tests/homepage.spec.ts
```

**With UI:**
```bash
npx playwright test --ui
```

**Debug mode:**
```bash
npx playwright test --debug
```

---

## Workflow

1. User requests: `WRITETEST - Create tests for Footer`
2. AI analyzes Footer component
3. AI creates Page Object Model (`tests/page-objects/Footer.ts`)
4. AI creates test file (`tests/footer.spec.ts`)
5. AI explains what was tested
6. User reviews and approves
7. User runs tests to verify

---

**Status:** Ready to use
**Restriction:** Test files ONLY, NO production code changes
