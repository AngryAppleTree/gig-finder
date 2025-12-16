# Stripe Payment Integration - TODO for Tomorrow

**Date Created:** 2025-12-16  
**Status:** ✅ Code Complete - Needs Setup & Testing

---

## 🎉 What's Been Built

### Complete Stripe payment integration for GigFinder ticket sales!

**Features:**
- ✅ Secure Stripe Checkout for paid tickets
- ✅ Free guest list flow (no payment) for £0 events
- ✅ Automatic booking creation after successful payment
- ✅ Email confirmation with QR code tickets
- ✅ Webhook handling for payment verification
- ✅ Capacity tracking and validation

**Code Status:**
- All code written and committed to `develop` branch
- Ready for setup and testing
- NOT YET DEPLOYED to production

---

## 📋 Setup Checklist

### Step 1: Get Stripe Account & Keys (15 min)

1. **Sign up for Stripe**
   - Go to: https://stripe.com
   - Create account (or log in if you have one)

2. **Get API Keys**
   - Dashboard → Developers → API keys
   - Copy these keys:
     ```
     STRIPE_SECRET_KEY=sk_test_...
     STRIPE_PUBLISHABLE_KEY=pk_test_...
     ```

3. **Add to Environment Variables**
   
   **Local Development (.env.local):**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...  # Get this in Step 3
   ```
   
   **Production (Vercel Dashboard):**
   - Settings → Environment Variables
   - Add the same 3 variables above

---

### Step 2: Run Database Migration (2 min)

```bash
cd /Users/alexanderbunch/App\ dummy/gig-finder/gig-finder-app
node scripts/add-payment-fields.js
```

**What this does:**
- Adds `payment_intent_id` column (Stripe payment reference)
- Adds `price_paid` column (amount customer paid)
- Adds `checked_in` column (entry status)
- Adds `booking_code` column (human-readable reference)

---

### Step 3: Configure Stripe Webhook (10 min)

#### For Development (Local Testing):

1. **Install Stripe CLI**
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook secret**
   - Look for: `whsec_...` in the terminal output
   - Add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### For Production (Vercel):

1. **Go to Stripe Dashboard**
   - Developers → Webhooks → Add endpoint

2. **Configure endpoint**
   - URL: `https://gigfinder-tau.vercel.app/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`

3. **Copy signing secret**
   - Click on the webhook you just created
   - Copy the "Signing secret" (starts with `whsec_...`)
   - Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

### Step 4: Test Locally (20 min)

1. **Start dev server**
   ```bash
   npm run dev
   ```

2. **Start Stripe webhook forwarding** (in another terminal)
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Create a test event**
   - Go to: http://localhost:3000/gigfinder/add-event
   - Create event with:
     - Name: "Test Paid Gig"
     - Venue: "Test Venue"
     - Date: Tomorrow
     - Price: £10.00
     - Capacity: 50
     - Enable "Guest List" ✅

4. **Test booking flow**
   - Find your event in search results
   - Click "Book Now"
   - Enter details, select quantity
   - Click "Confirm Booking"
   - Should redirect to Stripe Checkout

5. **Use test card**
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```

6. **Complete payment**
   - Should redirect to success page
   - Check email for confirmation
   - Check database for booking

---

### Step 5: Deploy to Production (10 min)

```bash
cd /Users/alexanderbunch/App\ dummy/gig-finder/gig-finder-app
git checkout main
git merge develop
git push origin main
```

**Then:**
1. Wait for Vercel deployment (~2 min)
2. Run migration on production database
3. Configure production webhook (see Step 3)
4. Test with test cards on live site

---

## 🧪 Test Cards (Stripe Test Mode)

```
✅ Success:        4242 4242 4242 4242
❌ Decline:        4000 0000 0000 0002
🔐 3D Secure:      4000 0025 0000 3155
💳 Insufficient:   4000 0000 0000 9995

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

---

## 📊 How It Works

### Paid Events (ticket_price > 0):

```
1. User clicks "Book Now" on paid event
2. BookingModal opens
3. User enters name, email, quantity
4. User clicks "Confirm Booking"
5. System detects ticket_price > 0
6. Redirects to Stripe Checkout
7. User enters card details
8. Payment processed by Stripe
9. Stripe sends webhook to your server
10. Webhook creates booking in database
11. Webhook sends email with QR code
12. User redirected to success page
```

### Free Events (ticket_price = 0 or null):

```
1. User clicks "Book Now" on free event
2. BookingModal opens
3. User enters name, email, quantity
4. User clicks "Confirm Booking"
5. System detects ticket_price = 0
6. Booking created immediately (no payment)
7. Email sent with QR code
8. Success message shown in modal
```

---

## 📁 Files Created/Modified

### New API Routes:
- `app/api/stripe/checkout/route.ts` - Creates Stripe Checkout Session
- `app/api/stripe/webhook/route.ts` - Handles payment confirmations

### New Pages:
- `app/gigfinder/booking-success/page.tsx` - Success page
- `app/gigfinder/booking-cancelled/page.tsx` - Cancelled page

### Modified:
- `components/gigfinder/BookingModal.tsx` - Smart routing (paid vs free)

### Scripts:
- `scripts/add-payment-fields.js` - Database migration

### Documentation:
- `STRIPE_SETUP.md` - Detailed setup guide
- `STRIPE_TODO.md` - This file!

---

## 🔒 Security Notes

- ✅ Webhook signature verification (prevents fake payments)
- ✅ Server-side amount validation (prevents price tampering)
- ✅ HTTPS required in production
- ✅ Never expose STRIPE_SECRET_KEY to frontend
- ✅ Idempotent webhook handling (safe for retries)

---

## 🐛 Troubleshooting

### "Payment setup failed"
- Check `STRIPE_SECRET_KEY` is set correctly
- Verify event has `ticket_price > 0`
- Check browser console for errors

### "Webhook signature verification failed"
- Ensure `STRIPE_WEBHOOK_SECRET` is correct
- Check webhook endpoint URL matches Stripe dashboard
- Verify webhook is receiving POST requests

### Booking not created after payment
- Check webhook logs in Stripe Dashboard
- Verify database connection (`POSTGRES_URL`)
- Check email service (`RESEND_API_KEY`)
- Look at server logs for errors

### Email not received
- Check spam folder
- Verify `RESEND_API_KEY` is set
- Check `EMAIL_FROM` is configured
- Look at Resend dashboard for delivery status

---

## 📚 Resources

- **Stripe Setup Guide:** `STRIPE_SETUP.md` (in project root)
- **Stripe Dashboard:** https://dashboard.stripe.com
- **Stripe Docs:** https://stripe.com/docs
- **Test Cards:** https://stripe.com/docs/testing
- **Webhook Testing:** https://stripe.com/docs/webhooks/test

---

## ✅ Success Criteria

You'll know it's working when:

1. ✅ Can create event with price (e.g., £10.00)
2. ✅ Booking modal shows total price
3. ✅ Clicking "Confirm Booking" redirects to Stripe
4. ✅ Test card payment succeeds
5. ✅ Redirected to success page
6. ✅ Email received with QR code
7. ✅ Booking appears in database
8. ✅ Capacity decreases correctly

---

## 🚀 Going Live (After Testing)

1. **Get Live Stripe Keys**
   - Stripe Dashboard → Developers → API keys
   - Toggle "Test mode" OFF
   - Copy live keys (start with `sk_live_...` and `pk_live_...`)

2. **Update Environment Variables**
   - Replace test keys with live keys in Vercel
   - Keep test keys in `.env.local` for development

3. **Update Webhook**
   - Create new webhook in Stripe (live mode)
   - Use production URL
   - Copy new signing secret

4. **Test with Real Card**
   - Use a real card with small amount (e.g., £0.50)
   - Verify full flow works
   - Refund the test transaction

5. **Monitor**
   - Watch Stripe Dashboard for payments
   - Check webhook logs
   - Monitor database for bookings

---

## 💡 Next Steps (Future Enhancements)

- [ ] Refund system (cancel bookings, restore capacity)
- [ ] Admin booking management dashboard
- [ ] Payment analytics
- [ ] Multiple currency support
- [ ] Subscription/season tickets
- [ ] Discount codes
- [ ] Group booking discounts

---

## 📞 Support

If you get stuck:
1. Check `STRIPE_SETUP.md` for detailed instructions
2. Check Stripe Dashboard → Logs for errors
3. Check browser console for frontend errors
4. Check server logs for backend errors
5. Stripe Support: https://support.stripe.com

---

**Good luck tomorrow! 🎉**

The code is ready - you just need to add the API keys and test it!
