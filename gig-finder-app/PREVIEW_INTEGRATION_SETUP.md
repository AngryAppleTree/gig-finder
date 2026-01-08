# Preview Environment - Complete Integration Verification

**Created:** 2026-01-07  
**Purpose:** Verify all integrations work correctly in Preview environment

---

## 📊 Integration Status Summary

| Integration | Production | Preview | Status |
|-------------|-----------|---------|--------|
| **Stripe Secret Key** | ✅ Live key | ✅ Test key | ✅ Configured |
| **Stripe Publishable Key** | ✅ Live key | ✅ Test key | ✅ Configured (just added) |
| **Stripe Webhook** | ✅ Live webhook | ✅ Test webhook | ⚠️ **VERIFY URL** |
| **Resend Email** | ✅ Configured | ✅ Configured | ✅ Same key (OK) |
| **Admin Email** | ✅ Configured | ✅ Configured | ✅ Same (OK) |
| **Disable Skiddle** | ✅ Set | ⚠️ **NOT SET** | ⚠️ **MISSING** |

---

## ⚠️ Issues Found

### 1. Stripe Webhook - Needs Preview URL

**Problem:** Stripe webhook is configured, but needs to point to Preview URL

**Solution:**

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://gigfinder-git-develop-*.vercel.app/api/webhooks/stripe`
   - Replace `*` with your actual Preview URL
4. Events to send:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy the **Signing secret** (starts with `whsec_...`)
6. Update Vercel environment variable:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET preview
   # Paste the new webhook secret
   ```

### 2. DISABLE_SKIDDLE - Missing in Preview

**Problem:** `DISABLE_SKIDDLE` is only set for Production, not Preview

**Impact:** Scraper might run in Preview (probably should be disabled)

**Solution:**

```bash
vercel env add DISABLE_SKIDDLE preview
# Enter: true
```

---

## 🧪 Complete Testing Guide

### **1. Stripe Payment Flow Test**

#### Step 1: Find an Event
1. Go to Preview URL: `https://gigfinder-git-develop-*.vercel.app`
2. Browse events (should see 352 events)
3. Click on any event with internal ticketing enabled

#### Step 2: Start Checkout
1. Click "Buy Tickets" or "Book Now"
2. Enter quantity (e.g., 2 tickets)
3. Click "Proceed to Checkout"

#### Step 3: Complete Payment with Test Card
1. **Card Number:** `4242 4242 4242 4242`
2. **Expiry:** Any future date (e.g., `12/25`)
3. **CVC:** Any 3 digits (e.g., `123`)
4. **Name:** Any name (e.g., `Test User`)
5. **Email:** Your test email
6. **ZIP:** Any 5 digits (e.g., `12345`)
7. Click "Pay"

#### Step 4: Verify Success
- ✅ Payment should succeed
- ✅ Redirected to success page
- ✅ Booking created in database
- ✅ Email confirmation sent (check your inbox)

#### Step 5: Check Stripe Dashboard
1. Go to https://dashboard.stripe.com/test/payments
2. You should see the test payment
3. Check webhook logs: https://dashboard.stripe.com/test/webhooks
4. Verify webhook was delivered successfully

---

### **2. Test Different Card Scenarios**

| Card Number | Expected Result | Use Case |
|-------------|----------------|----------|
| `4242 4242 4242 4242` | ✅ Success | Normal payment |
| `4000 0000 0000 0002` | ❌ Declined | Test error handling |
| `4000 0000 0000 9995` | ❌ Insufficient funds | Test error handling |
| `4000 0025 0000 3155` | ⚠️ Requires 3D Secure | Test authentication |

**For all cards:**
- Expiry: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

---

### **3. Resend Email Test**

#### Test Booking Confirmation Email

1. Complete a test booking (using test card above)
2. Check your email inbox
3. Verify you received:
   - ✅ Booking confirmation email
   - ✅ Event details (name, date, venue)
   - ✅ Booking reference/ID
   - ✅ QR code (if applicable)

#### Check Resend Dashboard

1. Go to https://resend.com/emails
2. Find your test email
3. Verify:
   - ✅ Email was sent
   - ✅ Email was delivered
   - ✅ No errors

---

### **4. Admin Settings Test**

#### Verify Admin Access

1. Go to Preview URL: `https://gigfinder-git-develop-*.vercel.app/admin`
2. Sign in with your admin account
3. Verify you can access admin panel

#### Check Admin Email

The `ADMIN_EMAIL` environment variable controls who can access `/admin`

**Current setting:** Shared across all environments (same email)

**To verify:**
1. Try accessing `/admin` with admin email → Should work ✅
2. Try accessing `/admin` with non-admin email → Should be blocked ❌

---

### **5. Scraper Settings Test**

#### Verify DISABLE_SKIDDLE

**After adding the variable:**

1. Go to `/admin` in Preview
2. Look for Skiddle scraper controls
3. Verify scraper is disabled (if `DISABLE_SKIDDLE=true`)

**If scraper is enabled:**
- Test running it (it will use test database, so safe)
- Verify events are created in dev database

---

## 🔧 Quick Setup Commands

### Add Missing Environment Variables

```bash
# Add DISABLE_SKIDDLE to Preview
vercel env add DISABLE_SKIDDLE preview
# Enter: true

# Update Stripe webhook secret (after creating Preview webhook)
vercel env add STRIPE_WEBHOOK_SECRET preview
# Paste: whsec_... (from Stripe dashboard)

# Trigger redeploy
git commit --allow-empty -m "Update Preview env vars"
git push origin develop
```

---

## ✅ Complete Verification Checklist

### Stripe Integration
- [ ] Test card payment succeeds (`4242 4242 4242 4242`)
- [ ] Declined card shows error (`4000 0000 0000 0002`)
- [ ] Booking created in database
- [ ] Payment appears in Stripe test dashboard
- [ ] Webhook delivered successfully
- [ ] Webhook secret is correct

### Resend Email
- [ ] Booking confirmation email received
- [ ] Email contains correct event details
- [ ] Email contains booking reference
- [ ] QR code attached (if applicable)
- [ ] Email appears in Resend dashboard

### Admin Settings
- [ ] Can access `/admin` with admin email
- [ ] Cannot access `/admin` with non-admin email
- [ ] Admin panel loads correctly
- [ ] Can view events
- [ ] Can view bookings

### Scraper Settings
- [ ] `DISABLE_SKIDDLE` is set for Preview
- [ ] Scraper behavior matches setting
- [ ] No accidental production scraping

### Database
- [ ] Preview uses `gig-finder-dev` database
- [ ] Has 113 venues
- [ ] Has 352 events
- [ ] Has 5 anonymized bookings
- [ ] Test bookings are created correctly

---

## 🚨 Common Issues & Solutions

### Issue: Webhook not receiving events

**Solution:**
1. Check webhook URL is correct (Preview URL, not Production)
2. Verify webhook secret matches Vercel env var
3. Check Stripe dashboard webhook logs for errors

### Issue: Email not sending

**Solution:**
1. Check Resend dashboard for errors
2. Verify `RESEND_API_KEY` is set
3. Check `EMAIL_FROM` is a verified domain

### Issue: Admin access denied

**Solution:**
1. Verify `ADMIN_EMAIL` matches your Clerk user email
2. Check Clerk user is signed in
3. Clear cookies and try again

### Issue: Payment fails with "Invalid API key"

**Solution:**
1. Verify `STRIPE_SECRET_KEY` is set for Preview
2. Ensure it's a TEST key (`sk_test_...`), not live key
3. Check Stripe dashboard for key validity

---

## 📝 Test Payment Card Quick Reference

**Success:**
```
Card: 4242 4242 4242 4242
Exp: 12/25
CVC: 123
ZIP: 12345
```

**Declined:**
```
Card: 4000 0000 0000 0002
Exp: 12/25
CVC: 123
ZIP: 12345
```

**Insufficient Funds:**
```
Card: 4000 0000 0000 9995
Exp: 12/25
CVC: 123
ZIP: 12345
```

---

## 🎯 Next Steps After Verification

1. ✅ All integrations verified
2. ✅ Test payment flow works
3. ✅ Emails sending correctly
4. ✅ Admin access working
5. → **Ready to set up regression tests!**

---

**Status:** ⚠️ Awaiting verification - add missing env vars and test
