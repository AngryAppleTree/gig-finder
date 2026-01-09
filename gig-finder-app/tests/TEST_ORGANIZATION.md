# Test Organization - Functional Units

## Purpose
Tests are organized into functional units that represent complete user journeys or feature areas. This makes it easier to run related tests together and understand test coverage.

## Functional Units

### 1. Landing Page and Gig Search
**Location:** `tests/functional-units/landing-and-search/`  
**Purpose:** Tests the complete public user journey from landing on the site to finding and viewing gigs

**Test Files:**
- `homepage.spec.ts` - Homepage elements and navigation
- `quick-search.spec.ts` - Quick search component functionality
- `wizard-journeys.spec.ts` - Multi-step wizard user journeys
- `wizard-filtering-integration.spec.ts` - Wizard → Results filtering integration
- `results-layout.spec.ts` - Results page layout and structure
- `results-logic.spec.ts` - Results filtering logic
- `result-card.spec.ts` - Basic gig card rendering
- `gig-card-details.spec.ts` - Detailed gig card rendering and interactions

**Run all tests in this unit:**
```bash
npx playwright test tests/functional-units/landing-and-search/
```

---

### 2. Static Pages
**Location:** `tests/functional-units/static-pages/`  
**Purpose:** Tests static/marketing pages for content, navigation, and compliance

**Test Files:**
- `footer.spec.ts` - Footer component across all pages
- `contact.spec.ts` - Contact page and form
- `privacy.spec.ts` - Privacy policy page
- `terms.spec.ts` - Terms of service page
- `pledge.spec.ts` - Our pledge page

**Run all tests in this unit:**
```bash
npx playwright test tests/functional-units/static-pages/
```

---

### 3. Event Management
**Location:** `tests/functional-units/event-management/`
**Purpose:** Add event, edit event, my gigs (requires authentication)

**Test Files:**
- `add-event-page.spec.ts` - "Add Event" page rendering and access
- `add-event-submit.spec.ts` - "Add Event" form submission workflow
- `edit-delete-event.spec.ts` - Edit and Delete event workflow
- `my-gigs.spec.ts` - View list of created gigs and empty states

**Run all tests in this unit:**
```bash
npx playwright test tests/functional-units/event-management/ --project=chromium-clerk
```

### 4. Booking Flow (Future)
**Purpose:** Ticket booking, payment, confirmation (requires authentication)

### 5. Admin Console (Future)
**Purpose:** Admin-only features (requires admin authentication)

---

## Test Guidelines

### ⚠️ Important: Do NOT Skip Failed Tests
When tests fail, **surface the failure** instead of adding `.skip()`. Failed tests indicate:
- Real bugs that need fixing
- Changes in behavior that need documenting
- Test assertions that need updating

**Only skip tests when:**
- There's a documented architectural limitation (see `homepage.spec.ts` admin test)
- The feature is intentionally disabled
- There's a clear backlog item tracking the issue

### Running Tests

**Run all tests:**
```bash
npx playwright test
```

**Run a specific functional unit:**
```bash
npx playwright test tests/functional-units/landing-and-search/
```

**Run a specific test file:**
```bash
npx playwright test homepage.spec.ts
```

**Run with UI:**
```bash
npx playwright test --ui
```
