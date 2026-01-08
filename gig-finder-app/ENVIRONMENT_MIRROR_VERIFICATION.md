# Environment Mirror Verification Checklist

**Created:** 2026-01-07  
**Purpose:** Verify Production, Preview, and Local environments are properly mirrored  
**Status:** Ready for verification

---

## 🎯 Goal

Confirm all three environments have:
- ✅ Same codebase
- ✅ Same data (anonymized in Preview/Local)
- ✅ Same integrations (test credentials in Preview/Local)
- ✅ Same configuration

---

## 📊 Environment Overview

| Environment | Branch | Database | URL | Purpose |
|-------------|--------|----------|-----|---------|
| **Production** | `main` | `gig-finder-prod` | https://gig-finder.co.uk | Live site |
| **Preview** | `develop` | `gig-finder-dev` | https://gigfinder-git-develop-*.vercel.app | Pre-production testing |
| **Local** | `develop` | `gig-finder-dev` | http://localhost:3000 | Development |

---

## ✅ Verification Tests

### **Test 1: Code Synchronization**

#### Check Git Status
```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"

# Verify current branch
git branch --show-current
# Expected: develop

# Verify develop matches main
git log develop..main --oneline
# Expected: (no output - branches are identical)

git log main..develop --oneline
# Expected: cef060d Trigger redeploy for webhook update
#           d4efc49 Trigger Preview redeploy
# (These are just deployment triggers, no code changes)
```

**Result:**
- [ ] Local is on `develop` branch
- [ ] `develop` and `main` have same code (ignoring deployment triggers)
- [ ] Latest commit: `a9262a5` (venue normalization)

---

### **Test 2: Database Verification**

#### Production Database
```bash
# Connect to production (read-only check)
export PROD_POSTGRES_URL="<your-prod-connection-string>"
psql "$PROD_POSTGRES_URL" -c "SELECT COUNT(*) FROM venues;"
psql "$PROD_POSTGRES_URL" -c "SELECT COUNT(*) FROM events;"
psql "$PROD_POSTGRES_URL" -c "SELECT COUNT(*) FROM bookings;"
```

**Expected Results:**
- [ ] Venues: 113
- [ ] Events: 352
- [ ] Bookings: 5 (real customer data)

#### Dev Database (Preview + Local)
```bash
# Connect to dev database
export DEV_POSTGRES_URL="<your-dev-connection-string>"
psql "$DEV_POSTGRES_URL" -c "SELECT COUNT(*) FROM venues;"
psql "$DEV_POSTGRES_URL" -c "SELECT COUNT(*) FROM events;"
psql "$DEV_POSTGRES_URL" -c "SELECT COUNT(*) FROM bookings;"

# Verify anonymization
psql "$DEV_POSTGRES_URL" -c "SELECT customer_name, customer_email FROM bookings LIMIT 3;"
```

**Expected Results:**
- [ ] Venues: 113 (same as production)
- [ ] Events: 352 (same as production)
- [ ] Bookings: 5 (anonymized)
- [ ] Customer names: "Test User 1", "Test User 2", etc.
- [ ] Customer emails: "test-booking-1@example.com", etc.

---

### **Test 3: Local Environment**

#### Start Local Server
```bash
cd "/Users/alexanderbunch/App dummy/gig-finder/gig-finder-app"
npm run dev
```

#### Verify Local App
Open http://localhost:3000

**Checklist:**
- [ ] Homepage loads without errors
- [ ] Events page shows events
- [ ] Count events displayed (should be ~352)
- [ ] Click on an event → Detail page loads
- [ ] Venue information displays correctly
- [ ] No console errors in browser DevTools

#### Test Database Connection
- [ ] Events are loading from database (not hardcoded)
- [ ] Venue names match production venues
- [ ] Event dates are preserved correctly

---

### **Test 4: Preview Environment**

#### Get Preview URL
```bash
vercel ls
# Or check: https://vercel.com/contactangryappletree-4366s-projects/gigfinder
```

**Preview URL:** `https://gigfinder-git-develop-*.vercel.app`

#### Verify Preview App
Open Preview URL in browser

**Checklist:**
- [ ] Homepage loads without errors
- [ ] Events page shows events
- [ ] Count events displayed (should be ~352)
- [ ] Click on an event → Detail page loads
- [ ] Venue information displays correctly
- [ ] No console errors in browser DevTools

---

### **Test 5: Production Environment**

#### Verify Production App
Open https://gig-finder.co.uk

**Checklist:**
- [ ] Homepage loads without errors
- [ ] Events page shows events
- [ ] Count events displayed (should be ~352)
- [ ] Click on an event → Detail page loads
- [ ] Venue information displays correctly
- [ ] No console errors in browser DevTools

---

### **Test 6: Integration Verification**

#### Local Environment
```bash
# Check .env.local
cat .env.local | grep -E "(CLERK|STRIPE|RESEND|POSTGRES)" | head -10
```

**Expected:**
- [ ] `POSTGRES_URL` points to dev database
- [ ] `CLERK_SECRET_KEY` starts with `sk_test_`
- [ ] `STRIPE_SECRET_KEY` starts with `sk_test_`
- [ ] `RESEND_API_KEY` is set

#### Preview Environment
```bash
vercel env ls | grep -E "(CLERK|STRIPE|RESEND|POSTGRES|DISABLE)"
```

**Expected:**
- [ ] `POSTGRES_URL` set for Preview
- [ ] `CLERK_SECRET_KEY` set for Preview
- [ ] `STRIPE_SECRET_KEY` set for Preview
- [ ] `STRIPE_WEBHOOK_SECRET` set for Preview
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set for Preview
- [ ] `RESEND_API_KEY` set for Preview
- [ ] `DISABLE_SKIDDLE` set for Preview

#### Production Environment
```bash
vercel env ls | grep Production | grep -E "(CLERK|STRIPE)"
```

**Expected:**
- [ ] `CLERK_SECRET_KEY` set for Production (different from Preview)
- [ ] `STRIPE_SECRET_KEY` set for Production (different from Preview)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set for Production

---

### **Test 7: Data Consistency Check**

#### Compare Sample Data Across Environments

**Pick a specific venue (e.g., "The Banshee Labyrinth"):**

**Production:**
```sql
SELECT name, city, capacity FROM venues WHERE name LIKE '%Banshee%';
```

**Dev (Preview/Local):**
```sql
SELECT name, city, capacity FROM venues WHERE name LIKE '%Banshee%';
```

**Expected:**
- [ ] Same venue name
- [ ] Same city
- [ ] Same capacity
- [ ] All venue details match

**Pick a specific event:**

**Production:**
```sql
SELECT name, date, venue_id FROM events WHERE id = 1;
```

**Dev (Preview/Local):**
```sql
SELECT name, date, venue_id FROM events WHERE id = 1;
```

**Expected:**
- [ ] Same event name
- [ ] Same date
- [ ] Same venue_id
- [ ] All event details match

---

### **Test 8: Schema Consistency**

#### Verify Table Schemas Match

**Production:**
```sql
\d venues
\d events
\d bookings
```

**Dev:**
```sql
\d venues
\d events
\d bookings
```

**Expected:**
- [ ] Venues table: Same columns in both
- [ ] Events table: Same columns in both (including legacy `venue` column)
- [ ] Bookings table: Same columns in both

---

## 🧪 Functional Tests

### **Test 9: Authentication (Preview & Local)**

#### Preview Environment
1. Go to Preview URL
2. Click "Sign Up" or "Sign In"
3. Create/use test account
4. Verify authentication works

**Checklist:**
- [ ] Sign up works
- [ ] Sign in works
- [ ] User session persists
- [ ] Sign out works
- [ ] Using Clerk test keys (not live)

#### Local Environment
1. Go to http://localhost:3000
2. Click "Sign Up" or "Sign In"
3. Create/use test account
4. Verify authentication works

**Checklist:**
- [ ] Sign up works
- [ ] Sign in works
- [ ] User session persists
- [ ] Sign out works

---

### **Test 10: Payment Flow (Preview Only)**

**DO NOT test payments on Production!**

#### Preview Environment
1. Go to Preview URL
2. Find an event with internal ticketing
3. Click "Buy Tickets"
4. Enter test card: `4242 4242 4242 4242`
5. Complete payment

**Checklist:**
- [ ] Checkout page loads
- [ ] Stripe form displays
- [ ] Test card accepted
- [ ] Payment succeeds
- [ ] Redirected to success page
- [ ] Booking created in dev database
- [ ] Email confirmation sent

#### Verify in Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. Find your test payment

**Checklist:**
- [ ] Payment appears in Stripe test dashboard
- [ ] Webhook delivered successfully
- [ ] No errors in webhook logs

---

## 📋 Final Verification Summary

### Code
- [ ] All environments on same commit (ignoring deployment triggers)
- [ ] No uncommitted changes
- [ ] Backup branch (`develop-backup`) exists with previous work

### Data
- [ ] Production: 113 venues, 352 events, 5 real bookings
- [ ] Dev: 113 venues, 352 events, 5 anonymized bookings
- [ ] Sample data matches across environments
- [ ] Schemas are identical

### Integrations
- [ ] Production uses live keys (Clerk, Stripe)
- [ ] Preview uses test keys (Clerk, Stripe)
- [ ] Local uses test keys (Clerk, Stripe)
- [ ] Webhooks configured correctly
- [ ] Email service working

### Functionality
- [ ] All environments load without errors
- [ ] Events display correctly
- [ ] Venue data displays correctly
- [ ] Authentication works (Preview/Local)
- [ ] Payments work with test card (Preview)

---

## ✅ Sign-Off

Once all tests pass:

**Verified by:** _______________  
**Date:** _______________  
**Status:** 
- [ ] ✅ All environments mirrored successfully
- [ ] ⚠️ Issues found (document below)
- [ ] ❌ Failed (requires fixes)

**Issues Found:**
```
(Document any discrepancies or issues here)
```

---

## 🚀 Next Steps

After verification passes:

1. **Set up Playwright** for automated regression tests
2. **Define critical user flows** to test
3. **Create test suite** for:
   - Homepage load
   - Event browsing
   - Event detail view
   - Authentication flow
   - Booking flow (with test card)
   - Admin panel access
4. **Integrate tests** into CI/CD pipeline
5. **Document testing workflow**

---

**Ready to proceed with regression test setup!** 🎯
