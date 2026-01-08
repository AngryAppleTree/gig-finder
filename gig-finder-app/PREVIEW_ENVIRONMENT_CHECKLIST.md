# Preview Environment Checklist - GigFinder

**Created:** 2026-01-07  
**Purpose:** Ensure Preview environment mirrors Production (with test credentials)  
**Goal:** Create a stable, testable pre-production environment

---

## Overview

**Current State:**
- ✅ **Production:** Stable, consistent data (113 venues, 352 events, 5 bookings)
- ⚠️ **Preview:** Has issues, needs to mirror Production

**Target State:**
- Preview should be identical to Production except:
  - Uses **test** credentials (Clerk, Stripe)
  - Uses **anonymized** data
  - Safe to test destructive operations

---

## 1. Code Synchronization ✅

### Checklist:

- [ ] **Verify Git Branch Alignment**
  - Ensure `develop` branch is up-to-date with `main`
  - Check for any uncommitted changes in Production
  
  ```bash
  # Check current branch
  git branch
  
  # Ensure develop is up to date with main
  git checkout develop
  git merge main
  git push origin develop
  ```

- [ ] **Verify Vercel Deployment Settings**
  - Production deploys from: `main` branch
  - Preview deploys from: `develop` branch
  - Check Vercel dashboard → gigfinder → Settings → Git

- [ ] **Confirm Build Settings Match**
  - Build Command: Same for both environments
  - Output Directory: Same for both environments
  - Install Command: Same for both environments
  - Node.js Version: Same for both environments

- [ ] **Check for Environment-Specific Code**
  - Search codebase for `process.env.NODE_ENV === 'production'`
  - Ensure no hardcoded production URLs
  - Verify all feature flags are environment-variable driven

---

## 2. Database Synchronization (Anonymized) 🗄️

### Current Database State:

**Production Database:**
- Name: `gig-finder-prod` ✅ CONFIRMED
- Data: 113 venues, 352 events, 5 bookings
- Status: ✅ Stable

**Preview Database:**
- Name: `gig-finder-dev` ✅ CONFIRMED (shared with Local)
- Data: ⚠️ Inconsistent
- Status: ❌ Needs sync

### Checklist:

- [ ] **Confirm Database Names**
  - [ ] Check Neon dashboard for actual database names
  - [ ] Document connection strings (store securely)
  - [ ] Verify which database Preview is currently using

- [ ] **Create Dedicated Preview Database (if needed)**
  - [ ] Create `gig-finder-preview` in Neon (if doesn't exist)
  - [ ] Copy schema from Production
  - [ ] Update Vercel Preview environment variables

- [ ] **Export Production Data**
  - [ ] Export `venues` table to CSV
  - [ ] Export `events` table to CSV
  - [ ] Export `bookings` table to CSV
  - [ ] Export any other tables (users, admin_logs, etc.)

- [ ] **Anonymize Sensitive Data**
  - [ ] Bookings: Replace real emails with test emails
  - [ ] Bookings: Replace real names with test names
  - [ ] Bookings: Replace Stripe payment IDs with test IDs
  - [ ] Bookings: Replace phone numbers with fake numbers
  - [ ] Users: Anonymize any PII (if user table exists)
  - [ ] Admin logs: Remove sensitive information

- [ ] **Import to Preview Database**
  - [ ] Truncate all tables in Preview database
  - [ ] Import anonymized `venues` data
  - [ ] Import anonymized `events` data
  - [ ] Import anonymized `bookings` data
  - [ ] Reset database sequences
  - [ ] Verify foreign key integrity

- [ ] **Verify Data Integrity**
  - [ ] Count venues (should be 113)
  - [ ] Count events (should be 352)
  - [ ] Count bookings (should be 5, anonymized)
  - [ ] Test queries for orphaned records
  - [ ] Verify all relationships intact

---

## 3. Configuration Synchronization ⚙️

### Checklist:

- [ ] **Scraper Configuration**
  - [ ] Check Production setting: `DISABLE_SKIDDLE` environment variable
  - [ ] Set Preview to match: `DISABLE_SKIDDLE=true` (or same as Production)
  - [ ] Document scraper state in both environments

- [ ] **Feature Flags**
  - [ ] List all feature flags in Production
  - [ ] Set identical values in Preview
  - [ ] Document any intentional differences

- [ ] **Admin Settings**
  - [ ] `ADMIN_EMAIL`: Should work in both environments
  - [ ] Admin access controls: Same logic, different test users

- [ ] **Email Configuration**
  - [ ] `RESEND_API_KEY`: Can be same or separate test key
  - [ ] `EMAIL_FROM`: Same or test email address
  - [ ] Verify emails work in Preview (test mode)

- [ ] **Application URLs**
  - [ ] `NEXT_PUBLIC_APP_URL` in Production: `https://gig-finder.co.uk`
  - [ ] `NEXT_PUBLIC_APP_URL` in Preview: `https://gigfinder-git-develop-*.vercel.app`

- [ ] **Other Environment Variables**
  - [ ] Compare all Production env vars with Preview
  - [ ] Document any differences
  - [ ] Ensure differences are intentional (test vs live keys)

---

## 4. Clerk Authentication (Test Mode) 🔐

### Checklist:

- [ ] **Verify Clerk Application Setup**
  - [ ] Production uses: Live Clerk application
  - [ ] Preview should use: Test/Development Clerk application (or same with test users)

- [ ] **Environment Variables**
  - [ ] Production:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
    - `CLERK_SECRET_KEY=sk_live_...`
  - [ ] Preview:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
    - `CLERK_SECRET_KEY=sk_test_...`

- [ ] **Clerk Dashboard Configuration**
  - [ ] Verify Preview URLs are whitelisted in Clerk test app
  - [ ] Add: `https://gigfinder-git-develop-*.vercel.app` to allowed origins
  - [ ] Configure redirect URLs for Preview environment

- [ ] **Test User Setup**
  - [ ] Create test users in Clerk test application
  - [ ] Create test admin user (matching `ADMIN_EMAIL`)
  - [ ] Document test credentials securely

- [ ] **Authentication Flow Testing**
  - [ ] Test sign-up flow in Preview
  - [ ] Test sign-in flow in Preview
  - [ ] Test admin access in Preview
  - [ ] Test sign-out flow in Preview
  - [ ] Verify session persistence

---

## 5. Stripe (Test Mode) 💳

### Checklist:

- [ ] **Verify Stripe Mode**
  - [ ] Production uses: Live Stripe keys
  - [ ] Preview uses: Test Stripe keys

- [ ] **Environment Variables**
  - [ ] Production:
    - `STRIPE_SECRET_KEY=sk_live_...`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
    - `STRIPE_WEBHOOK_SECRET=whsec_...` (live)
  - [ ] Preview:
    - `STRIPE_SECRET_KEY=sk_test_...`
    - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
    - `STRIPE_WEBHOOK_SECRET=whsec_...` (test)

- [ ] **Webhook Configuration**
  - [ ] Create separate webhook endpoint for Preview in Stripe dashboard
  - [ ] Endpoint URL: `https://gigfinder-git-develop-*.vercel.app/api/webhooks/stripe`
  - [ ] Enable same events as Production webhook
  - [ ] Copy webhook secret to Preview environment variables

- [ ] **Test Payment Flow**
  - [ ] Use Stripe test card: `4242 4242 4242 4242`
  - [ ] Test successful payment
  - [ ] Test failed payment (use `4000 0000 0000 0002`)
  - [ ] Verify webhook receives events
  - [ ] Verify booking creation in database
  - [ ] Verify email confirmation sent

- [ ] **Stripe Dashboard Verification**
  - [ ] Check test mode payments appear in Stripe dashboard
  - [ ] Verify webhook delivery logs
  - [ ] Test refund flow (if applicable)

---

## 6. Automated Sync Script 🤖

### Purpose:
Create a script to sync Production data to Preview on-demand

### Checklist:

- [ ] **Create Sync Script**
  - [ ] Script location: `/scripts/sync-prod-to-preview.js`
  - [ ] Functions:
    - Export data from Production database
    - Anonymize sensitive fields
    - Import to Preview database
    - Reset sequences
    - Verify data integrity

- [ ] **Script Features**
  - [ ] Accept command-line arguments (dry-run mode)
  - [ ] Show progress indicators
  - [ ] Validate database connections before starting
  - [ ] Create backup before wiping Preview data
  - [ ] Log all operations
  - [ ] Rollback capability on error

- [ ] **Anonymization Rules**
  - [ ] Define anonymization strategy for each table
  - [ ] Bookings: Email pattern `test-{id}@example.com`
  - [ ] Bookings: Name pattern `Test User {id}`
  - [ ] Bookings: Stripe ID pattern `pi_test_{random}`
  - [ ] Preserve all non-PII data (dates, prices, quantities)

- [ ] **Safety Checks**
  - [ ] Confirm target database is NOT production
  - [ ] Require explicit confirmation before wiping data
  - [ ] Verify environment variables point to correct databases
  - [ ] Check database names match expected values

- [ ] **Documentation**
  - [ ] Create README for sync script
  - [ ] Document required environment variables
  - [ ] Provide usage examples
  - [ ] Document troubleshooting steps

- [ ] **Testing**
  - [ ] Test script in dry-run mode
  - [ ] Test full sync operation
  - [ ] Verify anonymization works correctly
  - [ ] Test error handling
  - [ ] Test rollback functionality

---

## 7. Verification & Testing 🧪

### Post-Sync Checklist:

- [ ] **Database Verification**
  - [ ] Run SQL queries to verify data counts
  - [ ] Check for orphaned records
  - [ ] Verify all foreign keys intact
  - [ ] Test complex queries (joins, aggregations)

- [ ] **Application Functionality**
  - [ ] Homepage loads correctly
  - [ ] Search wizard works
  - [ ] Event listings display
  - [ ] Event detail pages load
  - [ ] Venue pages load
  - [ ] Admin panel accessible (with test admin user)

- [ ] **Authentication Testing**
  - [ ] Sign up new user
  - [ ] Sign in existing user
  - [ ] Admin access works
  - [ ] Sign out works
  - [ ] Session persistence works

- [ ] **Payment Flow Testing**
  - [ ] Add event to cart (if applicable)
  - [ ] Proceed to checkout
  - [ ] Complete payment with test card
  - [ ] Verify booking created
  - [ ] Verify email sent
  - [ ] Check Stripe webhook logs

- [ ] **Admin Functions Testing**
  - [ ] View events in admin panel
  - [ ] Edit event
  - [ ] Delete event (test only!)
  - [ ] View bookings
  - [ ] Test scraper controls (if enabled)

- [ ] **Performance Testing**
  - [ ] Page load times similar to Production
  - [ ] Database queries perform well
  - [ ] No console errors
  - [ ] No network errors

---

## 8. Documentation & Maintenance 📚

### Checklist:

- [ ] **Document Environment Differences**
  - [ ] Create comparison table (Production vs Preview)
  - [ ] Document all environment variables
  - [ ] Note any intentional differences
  - [ ] Document test credentials (securely)

- [ ] **Create Runbook**
  - [ ] How to sync Preview with Production
  - [ ] How to troubleshoot common issues
  - [ ] How to verify environment health
  - [ ] Emergency rollback procedures

- [ ] **Schedule Regular Syncs**
  - [ ] Decide sync frequency (weekly? monthly? on-demand?)
  - [ ] Set calendar reminders
  - [ ] Document sync history

- [ ] **Monitor Preview Environment**
  - [ ] Set up Vercel deployment notifications
  - [ ] Monitor error logs
  - [ ] Track performance metrics
  - [ ] Review regularly for drift from Production

---

## Quick Start Guide

### Step-by-Step Process:

1. **Verify Current State**
   ```bash
   # Check git status
   git status
   git branch
   
   # Check Vercel deployments
   vercel env ls
   ```

2. **Sync Code**
   ```bash
   git checkout develop
   git merge main
   git push origin develop
   ```

3. **Sync Database** (Manual CSV method first, then automate)
   - Export from Production
   - Anonymize data
   - Import to Preview
   - Verify integrity

4. **Verify Environment Variables**
   - Check Vercel dashboard
   - Ensure all test keys are set
   - Verify URLs are correct

5. **Test Preview Environment**
   - Run through critical user flows
   - Verify authentication works
   - Test payment flow
   - Check admin functions

6. **Document Results**
   - Note any issues found
   - Update this checklist
   - Plan fixes for next iteration

---

## Open Questions

- [x] ~~What is the actual name of your Preview database?~~ **CONFIRMED: gig-finder-dev**
- [x] ~~Do you want a separate `gig-finder-preview` database or share with local?~~ **CONFIRMED: Sharing gig-finder-dev**
- [ ] How often should Preview be synced with Production?
- [ ] Should the sync script run automatically or manually?
- [ ] Are there any other integrations beyond Clerk and Stripe?
- [ ] Do you have additional tables beyond venues, events, bookings, audit_logs?

---

## Next Steps

1. **Immediate:** Confirm database names and structure
2. **Phase 1:** Manual sync using CSV export/import (one-time)
3. **Phase 2:** Create automated sync script
4. **Phase 3:** Set up regular sync schedule
5. **Phase 4:** Implement automated testing on Preview

---

**Status:** 🟡 In Progress  
**Last Updated:** 2026-01-07  
**Owner:** User + AI collaboration
