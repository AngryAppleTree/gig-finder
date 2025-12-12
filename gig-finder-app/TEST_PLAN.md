# GigFinder Test Plan

This document outlines the Automated Testing Strategy for GigFinder, ensuring critical user journeys functionality and security before deployment.

## stack
- **Framework**: [Playwright](https://playwright.dev/)
- **Type**: End-to-End (E2E) Testing
- **Execution**: Local (`npx playwright test`) and CI (Future)

## Current Test Scenarios

These tests are implemented in the `tests/` directory.

### 1. Public Search & Discovery (`tests/gigfinder.spec.ts`)
**Goal**: Verify the main user entry points and search functionality.

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| **Home Page Load** | Open `/gigfinder` | Page Title contains "GigFinder", Main Header is visible. |
| **Quick Search** | 1. Open `/gigfinder`<br>2. Enter "Edinburgh" in city input<br>3. Click "Search" | The "Results" section becomes active and visible. |
| **Wizard Navigation** | 1. Click "Tonight" (Step 1)<br>2. Click "Locally" (Step 2)<br>3. Enter Postcode (Step 2b) | User is navigated to Step 3 ("What venue size?"). |

### 2. Security & Access Control (`tests/add-event.spec.ts`)
**Goal**: Ensure protected routes are not accessible to public users.

| Scenario | Steps | Expected Result |
|----------|-------|-----------------|
| **Guest Access Control** | Unauthenticated user visits `/gigfinder/add-event` | User is **Redirected** (likely to Sign In), staying off the protected page. |

---

## Future Test Backlog

These scenarios require advanced setup (Database Mocking, Auth Session Tokens) and are currently manual.

### 3. Event Management (Admin)
- **Admin Login**: Admin logs in via Clerk.
- **Scraper Trigger**: Admin triggers a scraper job and verifies success message.
- **Delete Event**: Admin deletes an event; verifying it disappears from results.

### 4. Booking Flow
- **Submit Booking**: User fills booking form. Network Request is intercepted (Mocked).
- **Email Trigger**: Verify API attempts to send email (Mocked).

## How to Run Tests
Run the following command in the `gig-finder-app` directory:
```bash
npx playwright test
```
To run a specific test file:
```bash
npx playwright test tests/gigfinder.spec.ts
```
To view the report:
```bash
npx playwright show-report
```
