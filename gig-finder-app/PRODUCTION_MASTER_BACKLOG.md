# GigFinder Production Master Backlog

**Context:** This is the master prioritized list of all actionable tasks identified during the Production Readiness Audits.
**Last Updated:** 2026-01-04
**Total Remaining Items:** 43

---

## 🏆 Master Priority List (All Audits)

| Rank | Task | Source Audit | C | BV | PS | Effort | Status |
|------|------|--------------|---|----|----|--------|--------|
| 1 | Implement Strategic Automated Testing Suite | 🤖 Automated Test | - | - | **1** | - | 🔴 |
| 2 | Add Labels to Quick Search Inputs | ♿ Accessibility | 1 | 2 | **2** | 30min | 🔴 |
| 3 | Consolidate to single auth system (Clerk only) | 🔒 Security | 3 | 1 | **3** | 2-3h | 🔴 |
| 2 | Fix broken Search Wizard (Step 3 Postcode) | ✅ Functional | 3 | 1 | **3** | 2h | 🔴 |
| 3 | Fix "Add Event" & Auth Environment on Preview | ✅ Functional | 5 | 1 | **5** | 3h | 🔴 |
| 4 | Implement DevOps Guardrails | 🔒 Security | 4 | 1 | **4** | 2h | 🔴 |
| 5 | Refactor Event Detail to SSR (SEO) | 🔍 SEO | 4 | 1 | **4** | 2-3h | 🔴 |
| 6 | Create generic custom 500 error page | 📊 Error/Monitor | 1 | 8 | **8** | 1h | 🔴 |
| 7 | Refine Guestlist Workflow (RSVP) | ✅ Functional | 4 | 2 | **8** | 4h | 🔴 |
| 6 | Add JSON-LD Structured Data to Events | 🔍 SEO | 4 | 2 | **8** | 2h | 🔴 |
| 7 | Add CSRF protection to custom forms | 🔒 Security | 3 | 3 | **9** | 2-4h | 🔴 |
| 6 | Review XSS prevention (manual audit) | 🔒 Security | 3 | 3 | **9** | 2-3h | 🔴 |
| 7 | Implement Server-Side Error Monitoring (Sentry) | 📊 Error/Monitor | 3 | 3 | **9** | 2h | 🔴 |
| 8 | Implement Filters UI on Results Page | ✅ Functional | 5 | 2 | **10** | 3-4h | 🔴 |
| 8.5 | Expand rate limiting coverage | 🔒 Security | 2 | 5 | **10** | 1-2h | 🔴 |
| 8.7 | Refactor Add/Edit Event Pages | 🧹 Code Quality | 2 | 5 | **10** | 3-4h | 🔴 |
| 8.9 | Enhance Event Detail & Sharing | ✅ Functional | 4 | 3 | **12** | 3h | 🔴 |
| 9 | Move DB credentials to Vercel only | 🔒 Security | 1 | 13 | **13** | 30min | 🔴 |
| 10 | Add refund audit trail | 🔒 Security | 1 | 13 | **13** | 30min | 🔴 |
| 11 | Create Branded 404 Page | 📊 Error/Monitor | 1 | 13 | **13** | 1h | 🔴 |
| 12 | Fix Skip Link Target on Event Detail | 🔗 Link Inspect | 1 | 13 | **13** | 15min | 🔴 |
| 13 | Refactor Add/Edit Event Pages (Split Components) | 🧹 Code Quality | 2 | 5 | **10** | 3-4h | 🔴 |
| 16 | Fix Stramash Scraper Timeout | 🧹 Code Quality | 2 | 7 | **14** | 2h | 🔴 |
| 17 | Implement Refund System | ✅ Functional | 3 | 5 | **15** | 4h | 🔴 |
| 18 | Evaluate Integration Strategy (Skiddle/McScraper) | 🧹 Code Quality | 3 | 5 | **15** | 1h | 🔴 |
| 19 | Add Skiddle Safeguards & Normalization | 🧹 Code Quality | 3 | 5 | **15** | 4h | 🔴 |
| 20 | WORM Protection for Bookings | 🔒 Security | 2 | 10 | **20** | 2h | 🔴 |
| 21 | Clean Legacy Ghost Events | 🧹 Code Quality | 1 | 21 | **21** | 1h | 🔴 |
| 16 | Remove Legacy `script.js` from `app/` | 🧹 Code Quality | 2 | 8 | **16** | 15min | 🔴 |
| 17 | Delete unused admin login system | 🔒 Security | 2 | 8 | **16** | 1h | 🔴 |
| 18 | Improve Wizard Focus Management | ♿ Accessibility | 2 | 8 | **16** | 1h | 🔴 |
| 16 | Configure password complexity in Clerk | 🔒 Security | 1 | 21 | **21** | 5min | 🔴 |
| 14 | Set admin session timeout | 🔒 Security | 1 | 21 | **21** | 5min | 🔴 |
| 15 | Document database credentials rotation policy | 🔒 Security | 1 | 21 | **21** | 30min | 🔴 |
| 22 | Performance Optimization (Images/LCP) | ⚡ Performance | 5 | 8 | **40** | 4h | 🔴 |
| 23 | Create Accessibility Statement | ⚖️ Legal | 5 | 13 | **65** | 1h | 🔴 |
| 24 | Add Cookie Consent Banner | ⚖️ Legal | 5 | 13 | **65** | 2h | 🔴 |
| 25 | Implement Data Export | ⚖️ Legal | 5 | 13 | **65** | 3h | 🔴 |

**Legend:**
- **C:** Complexity (1-21)
- **BV:** Business Value (1-21)
- **PS:** Priority Score (C × BV) - Lower is Higher Priority

---

## 📊 Status Overview

### By Source Audit
| Audit | Total Items | Completed | Remaining |
|-------|-------------|-----------|-----------|
| 🔒 Security | 22 | 12 | 10 |
| ✅ Functional | 4 | 0 | 4 |
| 📊 Error/Monitor | 3 | 0 | 3 |
| ♿ Accessibility | 2 | 0 | 2 |
| 🤖 Automated Test | 1 | 0 | 1 |
| 🔗 Link Inspect | 1 | 0 | 1 |
| 💾 Data Integrity | 0 | 0 | 0 |
| ⚡ Performance | 1 | 0 | 1 |
| 🔍 SEO | 3 | 0 | 3 |
| 🧹 Code Quality | 6 | 0 | 6 |
| ⚖️ Legal | 3 | 0 | 3 |

### By Priority Band
- **Critical (PS 1-5):** 3 items
- **High (PS 6-10):** 5 items
- **Medium (PS 11-20):** 4 items
- **Low (PS 21+):** 3 items

---

## 📝 Detailed Task Descriptions

### ✅ Functional Audit Tasks

#### 16. Fix Broken Search Wizard (Step 3) (PS: 3)
- **Problem:** Clicking "Next" after entering postcode does nothing.
- **Action:** Debug `SearchWizard.tsx` state machine logic for postcode validation.

#### 17. Fix Auth Environment on Preview (PS: 5)
- **Problem:** Clerk Production Keys used on Preview, blocking login/add event.
- **Action:** Configure Vercel `pk_test` vars for Preview environment correctly or fix middleware/Clerk config.

#### 18. Implement Filters UI (PS: 10)
- **Problem:** Results page lacks visible filter buttons/sidebar.
- **Action:** Add `FilterBar` component to `results/page.tsx`.

### 📊 Error Handling Audit Tasks

#### 19. Create Custom 500 Page (PS: 8)
- **Goal:** Prevent white screens on crash.
- **Action:** Create `app/global-error.tsx` and `app/error.tsx` with "Try Again" buttons.

#### 20. Implement Sentry Monitoring (PS: 9)
- **Goal:** Track production errors.
- **Action:** Install `@sentry/nextjs`, configure Vercel integration.

#### 21. Create Branded 404 Page (PS: 13)
- **Goal:** Keep users on site if link breaks.
- **Action:** Create `app/not-found.tsx` with links to Search/Home.

### ♿ Accessibility Audit Tasks

#### 22. Add Labels to Quick Search Inputs (PS: 2)
- **Problem:** Inputs rely on placeholders, failing accessibility checks.
- **Action:** Add `<label>` elements or `aria-label` to QuickSearch inputs.

#### 23. Improve Wizard Focus Management (PS: 16)
- **Problem:** Focus remains on "Next" button or is lost when step content changes.
- **Action:** Programmatically move focus to the specific Step Title (`h2`) when wizard step changes.

### 🤖 Automated Testing Tasks

#### 24. Implement Strategic Automated Testing Suite (PS: 1)
- **Goal:** Comprehensive E2E and Unit testing coverage.
- **Action:** Review current suite, add test scripts, fix broken selectors, and expand coverage to Admin/Auth flows.

---

### 🔗 Link Inspection Tasks

#### 25. Fix Skip Link Target on Event Detail (PS: 13)
- **Problem:** "Skip to main content" link fails on Event Detail pages because `id="main-content"` is missing.
- **Action:** Add `id="main-content"` to the main container in `app/gigfinder/event/[id]/page.tsx`.

---

### 🔍 SEO Audit Tasks

#### 26. Refactor Event Detail to SSR (PS: 4)
- **Problem:** `event/[id]` uses client-side fetching (`useEffect`), causing poor SEO and missing metadata for crawlers.
- **Action:** Refactor page to Server Component with `generateMetadata` and `fetch` logic.

#### 27. Add JSON-LD Structured Data (PS: 8)
- **Problem:** Events lack Schema.org markup for Rich Results.
- **Action:** Inject `<script type="application/ld+json">` with Event schema into the SSR page.

#### 28. Create Sitemap & Robots (PS: 15)
- **Goal:** Guide search engines.
- **Action:** Add `app/robots.ts` and `app/sitemap.ts` (generating URLs from DB).

---

### 🧹 Code Quality Tasks

#### 29. Refactor Add/Edit Event Pages (PS: 10)
- **Problem:** Files are >600 lines, mixing UI, logic, and data fetching (Spaghetti/Monolith).
- **Action:** Split into smaller components (e.g., `EventForm`, `ImageUploader`).

#### 30. Evaluate Integration Strategy (PS: 15)
- **Goal:** Strategic review of data sources.
- **Action:** Decide future of Skiddle integration and "McScraper" vs native user content.

#### 31. Remove Legacy Scripts (PS: 16)
- **Problem:** `app/gigfinder/script.js` exists but should be React logic.
- **Action:** Delete if unused or migrate valid logic to components.

---

### ✅ Functional & Feature Tasks

#### 32. Refine Guestlist Workflow (PS: 8)
- **Goal:** Distinguish free RSVP from paid tickets.
- **Action:** Change "Book Now" to "RSVP", separate modal flow.

#### 33. Enhance Event Detail & Sharing (PS: 12)
- **Goal:** Deep linking and social cards.
- **Action:** Fix results page to handle `?eventId` and ensure `event/[id]` meta tags work (overlaps with SEO).

#### 34. Implement Refund System (PS: 15)
- **Goal:** Allow admins/users to cancel bookings.
- **Action:** Integrate Stripe Refund API and update booking status logic.

### 🧹 Code Quality & Ops Tasks

#### 35. Implement DevOps Guardrails (PS: 4)
- **Goal:** Prevent production accidents.
- **Action:** Move prod env vars, safe command checklist, read-only DB roles.

#### 36. Fix Stramash Scraper Timeout (PS: 14)
- **Problem:** Scraper times out on Vercel.
- **Action:** Move to background job or optmize batch size.

#### 37. Add Skiddle Scraper Safeguards & Normalization (PS: 15)
- **Problem:** Scraper triggered accidentally via sensitive mobile UI; Duplicate venues created.
- **Note:** User reported accidental trigger at 22:29 via mobile. Admin button is too sensitive.
- **Action:** Add Confirmation Dialog ("Are you sure?"), Rate Limiting, Normalization logic, and Dry Run mode.

#### 38. Clean Legacy Ghost Events (PS: 21)
- **Problem:** Old unapproved data cluttering DB.
- **Action:** Script to delete/archive these records.

### ⚖️ Legal & Performance Tasks

#### 39. Performance Optimization (PS: 40)
- **Goal:** Improve Core Web Vitals.
- **Action:** Optimize images (Next/Image), lazy loading.

#### 40. Legal Compliance Bundle (PS: 65)
- **Goal:** GDPR/Cookie compliance.
- **Action:** Add Cookie Banner, Accessibility Statement, and Data Export API.

#### 41. WORM Protection (PS: 20)
- **Goal:** Immutable financial records.
- **Action:** DB triggers to prevent delete on `bookings`.

---

**Next Steps:**
1.  **EXECUTION PHASE**
2.  Select top priority item (#1 Automated Testing)
3.  Begin work.
