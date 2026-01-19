---
description: Run tests in observe-only mode without modifications
---

# RUNTEST Workflow

This workflow runs Playwright tests with strict observe-only behavior.

## Rules

1. **Never skip tests** - Run all tests even if they produce false positives
2. **Never modify test code** - This is observe-only mode. Test modifications only happen in WRITETEST mode
3. **Never modify application code** - Only report what you observe
4. **Report all results** - Pass, fail, skip - report everything as-is
5. **Ask for help** - If stuck or encountering planned manual workarounds, ask the user

## Usage

```
/runtest [test-path]
```

Examples:
- `/runtest tests/functional-units/static-pages/`
- `/runtest tests/functional-units/landing-and-search/homepage.spec.ts`
- `/runtest` (runs all tests)

## Steps

1. Run the specified test path using:
   ```bash
   npx playwright test [test-path]
   ```

2. Wait for tests to complete

3. Report the results in a clear summary format:
   - Total tests run
   - Passed count
   - Failed count (with failure details)
   - Skipped count
   - Duration
   
4. For any failures, provide:
   - Test name
   - Error message
   - File location
   - DO NOT suggest fixes
   - DO NOT modify any code

5. **If tests were skipped**, generate a manual test checklist:
   - List each skipped test
   - Provide manual test steps for each
   - Include prerequisites (test data, auth, etc.)
   - Estimate time required
   - Format as a checklist with [ ] checkboxes

6. If you encounter issues running tests (e.g., setup problems, manual workarounds needed):
   - Stop and ask the user for guidance
   - Explain what you're stuck on
   - Wait for user input before proceeding

## Output Format

```
📊 Test Results: [test-path]

✅ Passed: X
❌ Failed: Y
⏭️  Skipped: Z
⏱️  Duration: Xm Ys

[If failures exist:]
---
Failed Tests:

1. [Test Name]
   Location: [file:line]
   Error: [error message]
   
2. [Test Name]
   Location: [file:line]
   Error: [error message]
---

[If tests were skipped:]
---
📋 Manual Test Checklist Required

The following tests were skipped and require manual verification:

## [Category Name]

### Test: [Test Name]
**Prerequisites:** [Any setup needed]
**Steps:**
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

**Expected Result:** [What should happen]

---

📊 Summary:
- Total Manual Tests: X
- Estimated Time: Y minutes
---
```

## Notes

- This workflow is for **observation only**
- Use `/writetest` if you need to create or modify tests
- Test failures may indicate real bugs, outdated assertions, or expected failures in certain environments
- The user will decide what action to take based on the results
