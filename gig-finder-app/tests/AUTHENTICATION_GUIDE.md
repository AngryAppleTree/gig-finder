# GigFinder Test Authentication Guide

## Overview

GigFinder has **two separate authentication systems** for testing:

1. **Clerk Authentication** (Regular Users) - Requires manual 2FA
2. **Admin Cookie Authentication** (Admin Console) - Automated

---

## 1. Clerk Authentication (Regular Users)

### Used For:
- Event management tests (`tests/functional-units/event-management/`)
- My Gigs page
- Add Event page
- Guest List features
- Any feature requiring a logged-in user

### Setup Process:

#### Step 1: Run the auth setup script
```bash
npx playwright test clerk-auth.setup.ts --project=setup --headed
```

#### Step 2: Manual 2FA Entry
1. Browser window will open automatically
2. Script fills email and password from `.env.local`
3. **YOU MUST MANUALLY ENTER THE 2FA CODE** when Clerk prompts you
4. Wait for successful login (redirects to /gigfinder)
5. Session is automatically saved to `tests/.auth/user.json`

#### Step 3: Run your tests
```bash
# All event management tests will now use the saved session
npx playwright test tests/functional-units/event-management/
```

### When to Re-run Setup:
- ⏰ Session expires (Clerk sessions last ~7 days)
- ❌ Tests fail with "not authenticated" errors
- 🗑️ After clearing `tests/.auth/` directory
- 🔄 After changing TEST_USER_EMAIL or TEST_USER_PASSWORD

### Credentials:
Set these in `.env.local`:
```env
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

**2FA Code:** Must be entered manually from your authenticator app

---

## 2. Admin Authentication (Admin Console)

### Used For:
- Admin console tests
- Admin-only features
- Event approval workflows

### Setup Process:

#### Automated - No Manual Steps Required
```bash
npx playwright test auth.setup.ts --project=setup
```

This automatically:
1. Logs into `/admin/login`
2. Uses hardcoded admin credentials
3. Saves session to `tests/.auth/admin.json`

### Credentials:
Hardcoded in `tests/auth.setup.ts`:
- Email: `alex.bunch@angryappletree.com`
- Password: `123WeeWorkee123`

---

## Test Projects

### `chromium` (Unauthenticated)
- Fresh browser, no login
- Used for public pages (homepage, search, static pages)

### `chromium-clerk` (Authenticated User)
- Uses `tests/.auth/user.json`
- Requires manual 2FA setup (see above)
- Used for event management, my gigs, etc.

### `chromium-admin` (Admin)
- Uses `tests/.auth/admin.json`
- Automated setup, no manual steps
- Used for admin console tests

---

## Troubleshooting

### "Session expired" or "Not authenticated" errors

**Solution:** Re-run the auth setup
```bash
npx playwright test clerk-auth.setup.ts --project=setup --headed
```

### "Missing credentials" error

**Solution:** Check `.env.local` has TEST_USER_EMAIL and TEST_USER_PASSWORD

### 2FA timeout

**Solution:** Run setup again and enter 2FA code faster (60 second timeout)

### Tests still failing after auth setup

**Check:**
1. Is `tests/.auth/user.json` file present and recent?
2. Did the auth setup script complete successfully?
3. Are you running tests with `--project=chromium-clerk`?

---

## File Structure

```
tests/
├── .auth/
│   ├── user.json           # Clerk user session (manual 2FA)
│   ├── admin.json          # Admin session (automated)
│   └── user-preview.json   # Preview environment session
├── clerk-auth.setup.ts     # Clerk auth setup (MANUAL 2FA)
├── auth.setup.ts           # Admin auth setup (automated)
└── functional-units/
    ├── event-management/   # Requires chromium-clerk
    ├── landing-and-search/ # Uses chromium (public)
    └── static-pages/       # Uses chromium (public)
```

---

## Quick Reference

| What | Command |
|------|---------|
| Setup Clerk auth | `npx playwright test clerk-auth.setup.ts --project=setup --headed` |
| Setup Admin auth | `npx playwright test auth.setup.ts --project=setup` |
| Run event tests | `npx playwright test tests/functional-units/event-management/` |
| Run all tests | `npx playwright test` |
| Check auth file | `ls -la tests/.auth/user.json` |

---

**Last Updated:** 2026-01-10
