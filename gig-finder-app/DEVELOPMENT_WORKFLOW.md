# GigFinder Development Workflow

**Version:** 1.0  
**Created:** 2026-01-05  
**Purpose:** Define AI development commands and pipeline guardrails

---

## Development Pipeline Architecture

```
LOCAL (develop branch)
  ↓ (PUSHPREVIEW command)
VERCEL PREVIEW (develop branch) ← Pre-Production + Automated Tests
  ↓ (Manual merge by user)
PRODUCTION (main branch) ← Live Environment
```

---

## AI Command Reference

### 1. CONSULT
**Purpose:** Analysis and planning only, no code changes

**AI Behavior:**
- Discuss, analyze, and propose solutions
- No file edits
- No git operations
- Ask clarifying questions
- Present options for user decision
- Document findings in markdown files if requested

**Example Usage:**
```
CONSULT - How should we implement rate limiting for the Skiddle scraper?
```

**AI Response Pattern:**
- Analyze the problem
- Present 2-3 options with trade-offs
- Recommend best approach
- Wait for user decision

---

### 2. LOCALDEV
**Purpose:** Active feature development on local environment

**AI Behavior:**
- ✅ Edit code files freely
- ✅ Run local tests (`npm run dev`, `npm test`)
- ✅ Create/modify files in workspace
- ✅ Run terminal commands for testing
- ❌ NO git commits
- ❌ NO git pushes
- ❌ NO deployment operations

**Assumptions:**
- User is running `localhost:3000` and can test immediately
- Uses `.env.local` (dev database, test keys)
- Changes stay local until PUSHPREVIEW command

**Example Usage:**
```
LOCALDEV - Add confirmation dialog to Skiddle scraper button
```

**AI Response Pattern:**
1. Make code changes
2. Explain what was changed
3. Suggest how to test locally
4. Wait for user feedback

---

### 3. PULLDEV ⚠️
**Purpose:** Hard reset local to mirror Preview exactly (DELETES local changes)

**AI Behavior:**
- ⚠️ **WARN USER:** This will delete all local changes
- ✅ Ask for confirmation before proceeding
- ✅ Show uncommitted changes if any
- ✅ Fetch latest `develop` branch from GitHub
- ✅ Hard reset to `origin/develop` (`git reset --hard`)
- ✅ Clean untracked files (`git clean -fd`)
- ✅ Install dependencies
- ✅ Clear build cache (`.next` folder)
- ✅ Restart dev server
- ❌ NO modifications to code
- ❌ NO git commits
- ❌ NEVER proceed without user confirmation

**⚠️ WARNING - This DELETES:**
- ❌ All uncommitted changes
- ❌ All local-only files
- ❌ Any work in progress

**What Gets Synced:**
- **Code:** Exact copy from `develop` branch (deletes local changes)
- **Config:** `.env.local` unchanged (gitignored)
- **Data:** Already shared (`gig-finder-dev` database)

**Use When:**
- ✅ You want to start fresh from Preview
- ✅ You've already pushed your work
- ✅ You want to test Preview code locally

**DON'T Use When:**
- ❌ You have uncommitted work to keep
- ❌ You're in the middle of development

**Example Usage:**
```
PULLDEV - Reset local to match Preview
```

**AI Response Pattern:**
1. Check for uncommitted changes
2. **STOP and warn:** "⚠️ PULLDEV will DELETE all local changes. Continue? (Y/N)"
3. Show what will be deleted
4. Wait for user confirmation
5. If "Y": Hard reset to `origin/develop`
6. Clean untracked files
7. Install dependencies
8. Clear build cache
9. Restart dev server
10. Confirm local now mirrors Preview

**Workflow File:** `.agent/workflows/pulldev.md`

---

### 4. PUSHPREVIEW
**Purpose:** Commit local changes and push to `develop` branch for Vercel Preview deployment

**AI Behavior:**
- ✅ Review changed files with `git status`
- ✅ **ASK USER:** "Check with AI that sitemap and tests have been updated. Ok to proceed (Y/N)?"
- ✅ Wait for user confirmation before proceeding
- ✅ Create meaningful commit message
- ✅ Stage changes: `git add .`
- ✅ Commit: `git commit -m "descriptive message"`
- ✅ Push to develop: `git push origin develop`
- ✅ Confirm Vercel Preview deployment triggered
- ✅ Provide Preview URL for testing
- ❌ NEVER push to `main` branch
- ❌ NEVER proceed without user confirmation

**Prerequisites:**
- Local changes have been tested
- **Sitemap updated** (if new pages/routes added)
- **Tests updated** (if functionality changed)
- User has approved changes for pre-production testing

**Example Usage:**
```
PUSHPREVIEW - Skiddle scraper safeguards ready for testing
```

**AI Response Pattern:**
1. Show `git status` summary
2. **STOP and ask:** "Check with AI that sitemap and tests have been updated. Ok to proceed (Y/N)?"
3. **Wait for user response:**
   - If "Y" or "yes" → Continue
   - If "N" or "no" → Abort and explain what needs updating
   - If unclear → Ask for clarification
4. Create descriptive commit message
5. Execute git commands
6. Confirm push successful
7. Provide Vercel Preview URL (if available)
8. Remind user to run automated tests on Preview

---

### 5. LOCALTEST (Optional)
**Purpose:** Run local tests before pushing

**AI Behavior:**
- Run `npm run lint` (if configured)
- Run `npm run type-check` (if TypeScript)
- Run `npm run test` (if unit tests exist)
- Report results and any failures

**Example Usage:**
```
LOCALTEST - Verify changes before pushing to preview
```

---

### 6. STATUS (Optional)
**Purpose:** Check current git state and environment

**AI Behavior:**
- Run `git status`
- Run `git branch` (confirm on `develop`)
- Show uncommitted changes
- Confirm which `.env` file is loaded
- Show recent commits

**Example Usage:**
```
STATUS - What's the current state of the codebase?
```

---

### 7. WRITETEST
**Purpose:** Write Playwright tests ONLY (no production code changes)

**AI Behavior:**
- ✅ Create/modify test files in `/tests` directory
- ✅ Create Page Object Models (POMs) for reusability
- ✅ Write comprehensive test cases
- ✅ Use Playwright best practices
- ✅ Add accessibility checks
- ❌ **NEVER modify production code** (app/, components/, lib/)
- ❌ **NEVER fix bugs in production code**
- ❌ **NEVER add features**

**Test File Structure:**
```
tests/
  ├── page-objects/     # Reusable components
  ├── helpers/          # Test utilities
  └── *.spec.ts         # Test files
```

**Example Usage:**
```
WRITETEST - Create tests for Footer component
WRITETEST - Add booking flow tests with Stripe
```

**AI Response Pattern:**
1. Analyze component/page to understand structure
2. Create Page Object Model (if reusable)
3. Write test file with comprehensive cases
4. Explain what was tested and coverage
5. Suggest how to run the tests

**Workflow File:** `.agent/workflows/writetest.md`

---

## Production Deployment (User-Controlled)

**AI NEVER:**
- Pushes to `main` branch
- Merges `develop` → `main`
- Deploys to production

**User Process:**
1. Test changes on Vercel Preview
2. Run automated tests (when implemented)
3. Manually merge `develop` → `main` via GitHub
4. Vercel auto-deploys to production

---

## Workflow Example

### Scenario: Add Rate Limiting to Skiddle Scraper

**Step 1: Planning**
```
User: "CONSULT - How should we add rate limiting to the Skiddle scraper?"

AI: [Analyzes problem, proposes 3 options]
    Option 1: Database timestamp tracking
    Option 2: Redis cache (requires new service)
    Option 3: Simple session-based (temporary)
    
    Recommendation: Option 1 for production-ready solution
    
User: "Sounds good, let's do Option 1"
```

**Step 2: Local Development**
```
User: "LOCALDEV - Implement database timestamp rate limiting for Skiddle scraper"

AI: [Edits files]
    - Modified: app/api/admin/scrape-skiddle/route.ts
    - Modified: app/admin/(protected)/page.tsx
    - Added rate limit check before scraper runs
    - Shows "Last run: X hours ago" message
    
    Test locally:
    1. Run `npm run dev`
    2. Navigate to localhost:3000/admin
    3. Try running scraper twice in a row
    4. Should see rate limit message on second attempt

User: [Tests locally, confirms it works]
```

**Step 3: Push to Pre-Production**
```
User: "PUSHPREVIEW - Rate limiting for Skiddle scraper"

AI: [Executes git commands]
    git status
    git add .
    git commit -m "feat(admin): Add 24-hour rate limiting to Skiddle scraper
    
    - Prevent accidental multiple runs
    - Store last_run timestamp in database
    - Display time until next run available
    - Addresses mobile UI sensitivity issue"
    
    git push origin develop
    
    ✅ Pushed to develop
    🚀 Vercel Preview deploying...
    🔗 Preview URL: https://gigfinder-git-develop-*.vercel.app
    
    Next steps:
    1. Test on Preview environment
    2. Run automated tests (when implemented)
    3. Manually merge to main when satisfied

User: [Tests on Preview, merges to main manually]
```

---

## Environment Configuration

### Local Development (`.env.local`)
```bash
POSTGRES_URL=<gig-finder-dev connection string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel Preview (develop branch)
```bash
POSTGRES_URL=<gig-finder-dev or gig-finder-preview>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_APP_URL=https://gigfinder-git-develop-*.vercel.app
```

### Vercel Production (main branch)
```bash
POSTGRES_URL=<gig-finder-prod connection string>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://gig-finder.co.uk
```

---

## Guardrails

### AI Restrictions
- ❌ NEVER push to `main` branch
- ❌ NEVER merge branches
- ❌ NEVER modify `.env.production.local` (should not exist in workspace)
- ❌ NEVER auto-push without PUSHPREVIEW command
- ❌ NEVER deploy to production

### User Controls
- ✅ User approves all pushes to `develop` (via PUSHPREVIEW command)
- ✅ User controls all merges to `main`
- ✅ User manages production environment variables in Vercel dashboard
- ✅ User decides when to test on Preview vs Production

---

## Future Enhancements

### Automated Testing (Planned)
- Playwright tests run automatically on Vercel Preview deployments
- GitHub Actions workflow triggers on `develop` push
- Tests must pass before allowing merge to `main`
- Test results reported in GitHub PR checks

### Database Strategy (To Be Decided)
- Option A: Share `gig-finder-dev` between Local and Preview
- Option B: Create dedicated `gig-finder-preview` database
- Decision pending based on data conflicts and testing needs

---

## Quick Reference

| Command | Purpose | Git Operations | File Changes |
|---------|---------|----------------|--------------|
| CONSULT | Planning only | ❌ No | ❌ No |
| LOCALDEV | Feature development | ❌ No | ✅ Yes |
| PUSHPREVIEW | Deploy to pre-prod | ✅ Commit + Push | ❌ No new changes |
| LOCALTEST | Run tests | ❌ No | ❌ No |
| STATUS | Check state | ❌ No | ❌ No |

---

**Last Updated:** 2026-01-05  
**Maintained By:** User + AI collaboration  
**For Questions:** Refer to `DEVOPS_PIPELINE_STRATEGY.md`
