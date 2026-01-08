# Security Audit - Remaining Action Items

**Audit:** Security Audit 🔒  
**Status:** In Progress
**Items Remaining:** 9

---

## Prioritized Task List

| Rank | Task | Category | C | BV | PS | Effort | Status |
|------|------|----------|---|----|----|--------|--------|
| 1 | Consolidate to single auth system (Clerk only) | Auth | 3 | 1 | **3** | 2-3h | 🔴 |
| 2 | Add CSRF protection to custom forms | Auth | 3 | 3 | **9** | 2-4h | 🔴 |
| 3 | Review XSS prevention (manual audit) | Data | 3 | 3 | **9** | 2-3h | 🔴 |
| 4 | Expand rate limiting coverage (all endpoints) | Auth | 2 | 5 | **10** | 1-2h | 🔴 |
| 5 | Move DB credentials to Vercel only | Data | 1 | 13 | **13** | 30min | 🔴 |
| 6 | Add refund audit trail | Payment | 1 | 13 | **13** | 30min | 🔴 |
| 7 | Delete unused admin login system | Auth | 2 | 8 | **16** | 1h | 🔴 |
| 8 | Configure password complexity in Clerk | Auth | 1 | 21 | **21** | 5min | 🔴 |
| 9 | Set admin session timeout | Auth | 1 | 21 | **21** | 5min | 🔴 |
| 10 | Document database credentials rotation policy | Data | 1 | 21 | **21** | 30min | 🔴 |

**Legend:** C = Complexity, BV = Business Value, PS = Priority Score (lower = higher priority)

---

## Detailed Action Needed

### 1. Consolidate to Single Auth System (PS: 3)
- **Goal:** Remove confusion between cookie-based and Clerk-based auth.
- **Action:** Rely solely on Clerk `publicMetadata.role = 'admin'`.
- **Files:** `/app/api/admin/login`, `/app/admin/login/page.tsx`

### 2. Add CSRF Protection (PS: 9)
- **Goal:** Prevent cross-site request forgery on custom forms.
- **Action:** Verify Clerk middleware covers all mutation endpoints.
- **Target:** "Add Event", "Edit Event" forms.

### 3. Review XSS Prevention (PS: 9)
- **Goal:** Ensure user content (descriptions, venue names) is safe.
- **Action:** Manual audit of where user data is rendered.
- **Check:** Ensure no dangerous HTML rendering without sanitization.

### 4. Expand Rate Limiting (PS: 10)
- **Goal:** Protect all public APIs from abuse.
- **Action:** Add `checkRateLimit` to all API routes.
- **Endpoints:** `/api/bookings`, `/api/admin/*`, `/api/events/manual`

### 5. Move DB Credentials (PS: 13)
- **Goal:** Remove sensitive data from local workspace.
- **Action:** Delete `.env.production.local` and use Vercel env vars.

### 6. Add Refund Audit Trail (PS: 13)
- **Goal:** Track who issued refunds and why.
- **Action:** Add `logAudit()` call to refund endpoint.

### 7. Delete Unused Admin Login (PS: 16)
- **Goal:** Clean up dead code.
- **Action:** Delete the files associated with the unused cookie login.

### 8-10. Low Priority Items (PS: 21)
- Configure Clerk password rules
- Set session timeouts
- Document rotation policys

---

**Total Remaining Effort:** 9-14 hours
