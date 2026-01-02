# Stripe Payment Flow Test Plan

## Prerequisites
- [ ] Deployed latest code to production (promote develop to main)
- [ ] Stripe live keys configured in Vercel production environment
- [ ] Webhook configured and active in Stripe Dashboard

## Test 1: Find an Event with Internal Ticketing

1. Go to https://gig-finder.co.uk/gigfinder
2. Search for events in Edinburgh (or any location)
3. Look for events with "Book Tickets" button (internal ticketing enabled)
4. If none exist, create a test event:
   - Go to `/admin/events/new`
   - Create event with `is_internal_ticketing = true`
   - Set a price (e.g., £10.00)
   - Set max_capacity (e.g., 50)

## Test 2: Book Tickets (Stripe Test Mode)

**Use Stripe Test Card:**
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/25)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Steps:**
1. Click "Book Tickets" on an event
2. Enter number of tickets (e.g., 2)
3. Click "Proceed to Payment"
4. Should redirect to Stripe Checkout
5. Fill in test card details
6. Complete payment

**Expected Results:**
- [ ] Redirected to Stripe Checkout page
- [ ] Checkout shows correct event name and price
- [ ] Payment completes successfully
- [ ] Redirected to success page
- [ ] Booking created in database
- [ ] Confirmation email sent (check logs)

## Test 3: Verify Booking in Database

1. Go to `/admin/bookings`
2. Find your test booking
3. Verify:
   - [ ] Correct event
   - [ ] Correct number of tickets
   - [ ] Correct total amount
   - [ ] Payment status = 'succeeded'
   - [ ] Stripe payment intent ID present

## Test 4: Webhook Verification

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your production webhook
3. Check recent events:
   - [ ] `checkout.session.completed` received
   - [ ] `payment_intent.succeeded` received
   - [ ] Both returned 200 OK

## Test 5: QR Code & Check-in

1. From admin bookings page, click on your test booking
2. Verify:
   - [ ] QR code displayed
   - [ ] Can scan QR code (use phone camera or QR scanner)
   - [ ] Scan redirects to check-in page
   - [ ] Can mark as checked in

## Common Issues & Fixes

### Issue: "Stripe not configured"
- Check Vercel environment variables for production
- Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` and `STRIPE_SECRET_KEY` are set

### Issue: Webhook not receiving events
- Check webhook URL is exactly `https://gig-finder.co.uk/api/stripe/webhook`
- Verify webhook signing secret matches Vercel env var
- Check webhook is enabled in Stripe Dashboard

### Issue: Payment succeeds but booking not created
- Check webhook logs in Stripe Dashboard
- Check Vercel function logs for errors
- Verify database connection

## Success Criteria

All checkboxes above should be checked ✅

## Notes
- Use test card for testing, NOT real card
- Test in incognito/private browsing to avoid cached data
- Check browser console for any JavaScript errors
