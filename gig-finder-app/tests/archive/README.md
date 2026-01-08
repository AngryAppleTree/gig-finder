# Archived Tests

**Archived:** 2026-01-08  
**Reason:** Starting fresh with Page Object Model pattern and best practices

## Files Archived

### 1. `gigfinder.spec.ts.old`
- 3 tests for homepage, quick search, and wizard navigation
- **Issues:** No Page Object Models, brittle selectors, incomplete coverage
- **Status:** Archived, not run

### 2. `add-event.spec.ts.old`
- 1 test for authentication redirect
- **Issues:** Minimal coverage, no Page Object Model
- **Status:** Archived, not run

## Why Archived?

The old tests were:
- ❌ Not using Page Object Model pattern
- ❌ Using brittle CSS selectors (#id, .class)
- ❌ Not reusable
- ❌ Incomplete coverage
- ❌ No test organization

## New Approach

Starting fresh with:
- ✅ Page Object Model pattern
- ✅ Semantic selectors (getByRole, getByLabel)
- ✅ Reusable components
- ✅ Comprehensive coverage
- ✅ Best practices
- ✅ Clear organization

## Reference

These files are kept for reference but will not be run by Playwright.

**Location:** `tests/archive/`  
**Extension:** `.old` (Playwright ignores non-.spec.ts files)
