# DevOps Pipeline Strategy - Item 1

**Created:** 2026-01-05  
**Status:** Analysis Complete - Awaiting Implementation

## Objective

Establish a robust 3-tier deployment pipeline with proper guardrails and automated testing:
- **LOCAL (dev)** → Development on local machine
- **PRE-PROD (Vercel Preview)** → Testing environment with automated regression tests
- **PRODUCTION (Vercel Production)** → Live environment

## Proposed Pipeline Architecture

```
LOCAL (dev) → PRE-PROD (Vercel Preview) → PRODUCTION (Vercel Production)
     ↓                    ↓                           ↓
  develop branch      develop branch              main branch
  dev database        pre-prod database           prod database
```

## Current State Analysis

**Git Branches:**
- `main` → Production (live at gig-finder.co.uk)
- `develop` → Currently auto-deploying to Vercel Preview

**Databases (Neon):**
- `gig-finder-dev` → Development database
- `gig-finder-prod` → Production database
- **Missing:** Dedicated pre-prod database

**Environment Variables:**
- `.env.local` → Local development
- `.env.production.local` → Should NOT be in workspace (guardrail)
- Vercel Preview → Currently using dev database
- Vercel Production → Using prod database

## Recommended Implementation Plan

### Step 1: Database Architecture
**Create 3 separate Neon databases:**
1. `gig-finder-local` (or keep `gig-finder-dev`)
2. `gig-finder-preprod` (NEW)
3. `gig-finder-prod` (existing)

**Why?** Pre-prod should mirror production data structure but be safe to test against.

### Step 2: Git Branch Strategy
**Keep current structure:**
- `develop` → Pre-prod deployments (Vercel Preview)
- `main` → Production deployments (Vercel Production)

**Workflow:**
1. Work locally on `develop` branch
2. When satisfied locally → Push to `develop` → Auto-deploy to Vercel Preview (pre-prod)
3. Automated tests run on Vercel Preview deployment
4. If tests pass → Manual merge `develop` → `main` → Deploy to production

### Step 3: Environment Variable Mapping

**Local (`.env.local`):**
```
POSTGRES_URL=<gig-finder-local connection string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Vercel Preview (develop branch):**
```
POSTGRES_URL=<gig-finder-preprod connection string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

**Vercel Production (main branch):**
```
POSTGRES_URL=<gig-finder-prod connection string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
STRIPE_SECRET_KEY=sk_live_...
```

### Step 4: Automated Testing Integration

**On Vercel Preview deployments:**
1. Deployment completes
2. Vercel triggers deployment webhook
3. Run Playwright tests against preview URL
4. Report results (GitHub Actions or Vercel Checks)

**Implementation:**
- Add `playwright.config.ts` with base URL from env
- Add GitHub Actions workflow triggered on `develop` push
- Tests run against `https://gigfinder-git-develop-*.vercel.app`

### Step 5: Guardrails

**Prevent AI from pushing to production:**
- ✅ Already implemented (`.env.production.local` removed from workspace)

**Prevent AI from pushing to pre-prod without approval:**
- **Option A:** Manual `git push` only (AI proposes commits, you push)
- **Option B:** GitHub branch protection on `develop` (require PR approval)
- **Option C:** AI can push to `develop`, but you control merge to `main`

**Recommended:** Option C - Let AI push to `develop` for pre-prod testing, but you manually merge to `main` after reviewing test results.

## Action Items to Align Environments

### Immediate Steps:

1. **Create Pre-Prod Database:**
   - Go to Neon dashboard
   - Create `gig-finder-preprod` database
   - Copy schema from `gig-finder-prod` (or run migrations)

2. **Update Vercel Environment Variables:**
   - Go to Vercel → gigfinder project → Settings → Environment Variables
   - For "Preview" deployments:
     - Set `POSTGRES_URL` to pre-prod database
     - Verify all other vars use `_test_` keys

3. **Verify Local Environment:**
   - Ensure `.env.local` points to local/dev database
   - Ensure it's in `.gitignore`

4. **Sync Codebase:**
   - Ensure `develop` branch is up to date with latest changes
   - Push to `develop` → Triggers Vercel Preview deployment
   - Verify pre-prod deployment works

5. **Database Seeding (Optional):**
   - Populate pre-prod database with realistic test data
   - Can copy sanitized data from production

## Testing Strategy

**Regression Tests (Playwright):**
- Search wizard flow
- Event detail page rendering
- Booking flow (using Stripe test mode)
- Admin panel (if accessible with test credentials)

**Run on:**
- Every push to `develop` (pre-prod)
- Before merging to `main` (production)

## Open Questions

1. **Database Strategy:** Should pre-prod database be a copy of production data (sanitized), or fresh test data?
2. **Deployment Approval:** Do you want AI to auto-push to `develop`, or require your approval for every push?
3. **Test Coverage:** Which user flows are most critical for regression testing?

---

**Next Steps:** Await user decision to proceed with implementation.
