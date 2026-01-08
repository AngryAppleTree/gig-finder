# GigFinder Production Readiness Backlog

**Context:** This backlog was created during PRODUCTION_BACKLOG session to audit production readiness.

**Scoring System:**
- **Complexity (C):** Fibonacci scale 0-21 (1 = simple, 21 = very complex/risky)
- **Business Value (BV):** Fibonacci scale 0-21 (1 = most valuable, 21 = least valuable)
- **Priority Score (PS):** C × BV (lower score = higher priority)

**Status Key:**
- 🔴 Not Started
- 🟡 In Progress
- 🟢 Complete
- ⚠️ Needs Review

---

## Priority Matrix

| Rank | Audit | Complexity | Business Value | Priority Score | Status |
|------|-------|------------|----------------|----------------|--------|
| 1 | Security Audit | 5 | 1 | 5 | 🔴 |
| 2 | Functional Testing | 3 | 2 | 6 | 🔴 |
| 3 | Error Handling & Monitoring | 3 | 3 | 9 | 🔴 |
| 4 | Accessibility Audit | 5 | 2 | 10 | 🔴 |
| 5 | Automated Testing | 8 | 2 | 16 | 🔴 |
| 6 | Link Inspection | 2 | 8 | 16 | 🔴 |
| 7 | Data Integrity | 5 | 5 | 25 | 🔴 |
| 8 | Performance Audit | 5 | 8 | 40 | 🔴 |
| 9 | SEO Audit | 3 | 13 | 39 | 🔴 |
| 10 | Legal & Compliance | 5 | 13 | 65 | 🔴 |

---

## 1. Security Audit 🔒
**Complexity:** 5 | **Business Value:** 1 | **Priority Score:** 5 | **Status:** 🔴

### Why This Score?
- **Complexity (5):** Moderate - requires checking multiple endpoints, auth flows, and Stripe integration
- **Business Value (1):** CRITICAL - Security breach would destroy trust and business

### Checklist

#### A. Authentication & Authorization
- [ ] Verify Clerk authentication on all protected routes
- [ ] Check admin route protection (email-based)
- [ ] Audit all API endpoints for proper auth checks
- [ ] Test user data isolation (users can't access others' events/bookings)
- [ ] Verify CSRF protection on forms
- [ ] Check rate limiting on public endpoints

#### B. Data Security
- [ ] Audit for SQL injection vulnerabilities (verify parameterized queries)
- [ ] Check XSS prevention (input sanitization)
- [ ] Scan logs for sensitive data (passwords, API keys, PII)
- [ ] Verify environment variables not exposed to client
- [ ] Document database credentials rotation policy
- [ ] Confirm HTTPS enforced everywhere

#### C. Payment Security (Stripe)
- [ ] Verify Stripe production keys configured
- [ ] Test webhook signature verification
- [ ] Validate payment intent validation logic
- [ ] Check refund authorization checks
- [ ] Confirm PCI compliance (no card data stored locally)

### Tools Needed
- OWASP ZAP or Burp Suite
- npm audit
- Snyk
- Manual penetration testing

### Estimated Effort
**8-13 hours** (1-2 days)

---

## 2. Functional Testing ✅
**Complexity:** 3 | **Business Value:** 2 | **Priority Score:** 6 | **Status:** 🔴

### Why This Score?
- **Complexity (3):** Low-moderate - manual testing, straightforward
- **Business Value (2):** HIGH - Ensures core features work correctly

### Checklist

#### A. User Journeys
- [ ] Search for events (test all filter combinations)
- [ ] Book free guestlist ticket (full flow)
- [ ] Purchase paid ticket (full flow + email)
- [ ] Add manual event (as authenticated user)
- [ ] Edit event (all fields including new presale/capacity)
- [ ] QR code check-in (valid + invalid codes)
- [ ] Refund process (admin + user perspective)

#### B. Edge Cases
- [ ] Empty search results display correctly
- [ ] Sold out events show appropriate message
- [ ] Past events filtered/displayed correctly
- [ ] Invalid QR codes rejected gracefully
- [ ] Duplicate booking prevention works
- [ ] Event with 0 capacity handled
- [ ] Event with no venue selected

#### C. Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Firefox
- [ ] Safari (desktop + iOS)
- [ ] Edge
- [ ] Chrome Android

### Tools Needed
- BrowserStack or LambdaTest
- Manual testing checklist

### Estimated Effort
**5-8 hours**

---

## 3. Error Handling & Monitoring 📊
**Complexity:** 3 | **Business Value:** 3 | **Priority Score:** 9 | **Status:** 🔴

### Why This Score?
- **Complexity (3):** Low-moderate - setup monitoring tools, add error boundaries
- **Business Value (3):** HIGH - Critical for debugging production issues

### Checklist

#### A. Error Handling
- [ ] Verify graceful error messages (user-friendly, not technical)
- [ ] Test 404 page exists and displays correctly
- [ ] Test 500 error page exists and displays correctly
- [ ] Confirm API errors are logged server-side
- [ ] Add React Error Boundaries for client-side errors
- [ ] Test network failure scenarios

#### B. Monitoring Setup
- [ ] Setup error tracking (Sentry or LogRocket)
- [ ] Configure uptime monitoring (UptimeRobot or Pingdom)
- [ ] Setup performance monitoring (Vercel Analytics)
- [ ] Configure database query monitoring (Neon metrics)
- [ ] Setup alert thresholds (error rate, response time)

#### C. Logging
- [ ] Audit logs for sensitive data exposure
- [ ] Ensure structured logging format
- [ ] Configure log retention policy
- [ ] Setup log aggregation (if needed)

### Tools Needed
- Sentry (free tier)
- Vercel Analytics (included)
- Neon database metrics (included)

### Estimated Effort
**3-5 hours**

---

## 4. Accessibility Audit ♿
**Complexity:** 5 | **Business Value:** 2 | **Priority Score:** 10 | **Status:** 🔴

### Why This Score?
- **Complexity (5):** Moderate - requires testing with assistive tech, fixing issues
- **Business Value (2):** HIGH - Legal requirement (UK Equality Act 2010) + UX

### Checklist

#### A. Keyboard Navigation
- [ ] All interactive elements keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible on all elements
- [ ] Tab order is logical
- [ ] Skip links for main navigation
- [ ] Modal dialogs trap focus correctly
- [ ] Escape key closes modals

#### B. Screen Reader Support
- [ ] Semantic HTML used (headings, landmarks, lists)
- [ ] Alt text for all images (or aria-hidden for decorative)
- [ ] ARIA labels for icon-only buttons
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Dynamic content changes announced (live regions)

#### C. Visual Accessibility
- [ ] Color contrast ratios meet WCAG AA (4.5:1 for text, 3:1 for UI)
- [ ] Text resizable to 200% without breaking layout
- [ ] No information conveyed by color alone
- [ ] Focus visible on all interactive elements
- [ ] Sufficient spacing between clickable elements (44×44px minimum)

#### D. Forms
- [ ] Required fields clearly marked
- [ ] Error messages descriptive and helpful
- [ ] Autocomplete attributes on relevant fields
- [ ] Fieldsets and legends for grouped inputs

### Tools Needed
- Lighthouse accessibility audit
- axe DevTools browser extension
- WAVE browser extension
- Screen reader testing (NVDA on Windows, VoiceOver on Mac)

### Estimated Effort
**8-13 hours** (1-2 days)

---

## 5. Automated Testing 🤖
**Complexity:** 8 | **Business Value:** 2 | **Priority Score:** 16 | **Status:** 🔴

### Why This Score?
- **Complexity (8):** Moderate-high - requires setting up test infrastructure, writing tests
- **Business Value (2):** HIGH - Prevents regressions, enables confident deployments

### Checklist

#### A. Unit Tests
- [ ] Test venue normalization logic (`normalizeVenueName`)
- [ ] Test price parsing functions
- [ ] Test date/time formatting utilities
- [ ] Test fingerprint generation
- [ ] Target: 70%+ coverage on utility functions

#### B. Integration Tests
- [ ] Test API endpoints (auth, CRUD operations)
- [ ] Test database operations (create, read, update, delete)
- [ ] Test Stripe webhook handling
- [ ] Test email sending (mock Resend API)
- [ ] Target: All critical API routes covered

#### C. E2E Tests (Playwright)
- [ ] Search and filter events
- [ ] Book free guestlist ticket (full flow)
- [ ] Purchase paid ticket (using Stripe test mode)
- [ ] Add manual event
- [ ] Edit event
- [ ] QR code check-in
- [ ] Target: All critical user journeys covered

### Tools Needed
- Jest (unit/integration tests)
- Playwright (E2E tests) - already configured
- Stripe test mode

### Estimated Effort
**13-21 hours** (2-3 days)

---

## 6. Link Inspection 🔗
**Complexity:** 2 | **Business Value:** 8 | **Priority Score:** 16 | **Status:** 🔴

### Why This Score?
- **Complexity (2):** Very low - mostly automated tools + manual spot checks
- **Business Value (8):** MEDIUM - Important for UX, not critical for core function

### Checklist

#### A. Internal Links
- [ ] All navigation links work (header, footer, buttons)
- [ ] No broken internal links (404s)
- [ ] Deep links to events work (`/gigfinder/event/[id]`)
- [ ] Edit event links work (`/gigfinder/edit/[id]`)
- [ ] My Gigs page links work
- [ ] Admin panel links work

#### B. External Links
- [ ] Ticket URLs valid (sample check)
- [ ] Venue websites accessible (sample check)
- [ ] Social media links work (if any)
- [ ] Stripe dashboard links work

#### C. Redirects
- [ ] Sign-in redirects back to intended page
- [ ] Post-payment redirects work
- [ ] Post-booking redirects work

### Tools Needed
- Broken Link Checker CLI
- Google Search Console
- Manual testing

### Estimated Effort
**2-3 hours**

---

## 7. Data Integrity 💾
**Complexity:** 5 | **Business Value:** 5 | **Priority Score:** 25 | **Status:** 🔴

### Why This Score?
- **Complexity (5):** Moderate - requires database analysis, backup testing
- **Business Value (5):** MEDIUM-HIGH - Important but existing Neon backups provide safety net

### Checklist

#### A. Database Integrity
- [ ] Verify backup strategy in place (Neon automatic backups)
- [ ] Test backup restoration process
- [ ] Check data validation on insert/update (constraints)
- [ ] Verify foreign key constraints exist and enforced
- [ ] Scan for orphaned records (events without venues, bookings without events)
- [ ] Check for duplicate venues (known issue - CONSULT_SKIDDLE_1)

#### B. Migrations
- [ ] Document migration rollback plan
- [ ] Test migrations on development database
- [ ] Verify no data loss in recent migrations

#### C. Data Consistency
- [ ] Verify `tickets_sold` count matches actual bookings
- [ ] Check event dates are in future (or archived appropriately)
- [ ] Verify price formats consistent (£X.XX)

### Tools Needed
- SQL queries
- Neon database console
- Manual data inspection

### Estimated Effort
**5-8 hours**

---

## 8. Performance Audit ⚡
**Complexity:** 5 | **Business Value:** 8 | **Priority Score:** 40 | **Status:** 🔴

### Why This Score?
- **Complexity (5):** Moderate - requires profiling, optimization
- **Business Value (8):** MEDIUM - Important for UX, but site already reasonably fast

### Checklist

#### A. Core Web Vitals
- [ ] Measure LCP (Largest Contentful Paint) - target < 2.5s
- [ ] Measure FID (First Input Delay) - target < 100ms
- [ ] Measure CLS (Cumulative Layout Shift) - target < 0.1
- [ ] Measure TTFB (Time to First Byte) - target < 600ms

#### B. Optimization
- [ ] Optimize images (WebP format, lazy loading)
- [ ] Check code splitting (Next.js automatic)
- [ ] Verify minification (CSS, JS)
- [ ] Check caching headers
- [ ] Audit database queries for N+1 problems
- [ ] Check bundle size (analyze with `next build`)

#### C. Mobile Performance
- [ ] Test on 3G network simulation
- [ ] Test on low-end mobile devices

### Tools Needed
- Lighthouse performance audit
- WebPageTest
- Chrome DevTools Performance tab
- Next.js bundle analyzer

### Estimated Effort
**5-8 hours**

---

## 9. SEO Audit 🔍
**Complexity:** 3 | **Business Value:** 13 | **Priority Score:** 39 | **Status:** 🔴

### Why This Score?
- **Complexity (3):** Low-moderate - mostly adding meta tags, structured data
- **Business Value (13):** LOW-MEDIUM - Nice to have, but not critical for Beta launch

### Checklist

#### A. Technical SEO
- [ ] Add meta titles and descriptions to all pages
- [ ] Implement structured data (JSON-LD for events)
- [ ] Create sitemap.xml
- [ ] Create/verify robots.txt
- [ ] Add canonical URLs
- [ ] Add Open Graph tags (social sharing)
- [ ] Verify mobile-friendly (responsive design)

#### B. Content
- [ ] Ensure unique page titles
- [ ] Add H1 tags to all pages
- [ ] Improve internal linking structure
- [ ] Add alt text to images (overlaps with accessibility)

#### C. Indexing
- [ ] Submit sitemap to Google Search Console
- [ ] Verify no pages blocked by robots.txt unintentionally

### Tools Needed
- Google Search Console
- Lighthouse SEO audit
- Screaming Frog (free tier)

### Estimated Effort
**3-5 hours**

---

## 10. Legal & Compliance ⚖️
**Complexity:** 5 | **Business Value:** 13 | **Priority Score:** 65 | **Status:** 🔴

### Why This Score?
- **Complexity (5):** Moderate - requires legal review, policy writing
- **Business Value (13):** LOW-MEDIUM - Important for full launch, but can be added post-Beta

### Checklist

#### A. Privacy
- [ ] Create Privacy Policy
- [ ] Add Cookie Consent banner (if using analytics)
- [ ] Implement GDPR compliance (data deletion, export)
- [ ] Add Terms of Service
- [ ] Document data retention policy

#### B. Accessibility
- [ ] Create Accessibility Statement
- [ ] Confirm WCAG 2.1 AA compliance (overlaps with Accessibility Audit)

#### C. Payment
- [ ] Review Stripe Terms of Service compliance
- [ ] Add refund policy
- [ ] Add cancellation policy

### Tools Needed
- Legal template services (Termly, TermsFeed)
- Legal review (optional but recommended)

### Estimated Effort
**5-8 hours** (excluding legal review)

---

## Summary

**Total Estimated Effort:** 62-103 hours (8-13 days)

**Critical Path (Must Do Before Launch):**
1. Security Audit (5 points)
2. Functional Testing (6 points)
3. Error Handling & Monitoring (9 points)
4. Accessibility Audit (10 points)

**Recommended for Beta:**
5. Automated Testing (16 points)
6. Link Inspection (16 points)

**Nice to Have:**
7. Data Integrity (25 points)
8. Performance Audit (40 points)
9. SEO Audit (39 points)
10. Legal & Compliance (65 points)

---

## Next Steps

1. Review and adjust Business Value scores if needed
2. Start with Security Audit (highest priority)
3. Create detailed task breakdown for each audit
4. Assign ownership/timeline
5. Track progress in this document

---

**Last Updated:** 2026-01-04  
**Created By:** PRODUCTION_BACKLOG session  
**For Handoff To:** Gemini 3 or other models

## 11. Code Quality Audit 🧹
**Complexity:** 5 | **Business Value:** 8 | **Priority Score:** 40 | **Status:** ��

### Why This Score?
- **Complexity (5):** Moderate - requires codebase analysis, refactoring
- **Business Value (8):** MEDIUM - Important for maintainability, not critical for launch

### Checklist

#### A. Dead Code Detection
- [ ] Identify unused files (imports, components, routes)
- [ ] Find unused functions and variables
- [ ] Locate commented-out code blocks
- [ ] Check for unreachable code paths
- [ ] Remove unused dependencies from package.json

#### B. Code Duplication (DRY Violations)
- [ ] Find duplicate logic across components
- [ ] Identify repeated API patterns
- [ ] Locate copy-pasted utility functions
- [ ] Check for similar database queries
- [ ] Extract common patterns into shared utilities

#### C. Spaghetti Code / Code Smells
- [ ] Identify overly complex functions (>50 lines)
- [ ] Find deeply nested conditionals (>3 levels)
- [ ] Locate god objects/components (too many responsibilities)
- [ ] Check for magic numbers/strings
- [ ] Find inconsistent naming conventions

#### D. Technical Debt
- [ ] Document known workarounds and TODOs
- [ ] Identify deprecated dependencies
- [ ] Check for outdated patterns (old Next.js patterns)
- [ ] Find hardcoded values that should be configurable
- [ ] Locate missing error handling

#### E. Code Organization
- [ ] Verify consistent file structure
- [ ] Check import organization (absolute vs relative)
- [ ] Ensure proper separation of concerns
- [ ] Verify API routes follow consistent patterns
- [ ] Check component organization (atoms, molecules, organisms)

#### F. Documentation
- [ ] Add JSDoc comments to complex functions
- [ ] Document API endpoints (OpenAPI/Swagger)
- [ ] Create architecture decision records (ADRs)
- [ ] Update README with current setup instructions
- [ ] Document environment variables

### Tools Needed
- ESLint with stricter rules
- SonarQube or Code Climate
- `npx depcheck` (unused dependencies)
- `npx jscpd` (copy-paste detector)
- Manual code review

### Estimated Effort
**8-13 hours** (1-2 days)

### Known Issues to Address
1. **Dead admin login system** (from Security Audit)
   - `/app/api/admin/login/route.ts`
   - `/app/api/admin/logout/route.ts`
   - `/app/admin/login/page.tsx`

2. **Duplicate venue normalization** (from CONSULT_SKIDDLE_1)
   - Improve `normalizeVenueName()` function
   - Add fuzzy matching

3. **Inconsistent error handling**
   - Some endpoints return detailed errors
   - Others return generic messages

4. **Magic strings**
   - Event statuses ('confirmed', 'pending')
   - User roles ('admin')
   - Should be constants/enums

---

