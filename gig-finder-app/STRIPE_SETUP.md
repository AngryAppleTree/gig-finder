# Stripe Payment Integration Setup Guide

## Overview
This guide explains how to set up Stripe payment processing for GigFinder ticket sales.

## Features
- ✅ Secure Stripe Checkout for paid tickets
- ✅ Free guest list flow (no payment) for £0 events
- ✅ Automatic booking creation after successful payment
- ✅ Email confirmation with QR code tickets
- ✅ Webhook handling for payment verification
- ✅ Capacity tracking and validation

---

## Prerequisites

1. **Stripe Account**
   - Sign up at https://stripe.com
   - Get your API keys from Dashboard → Developers → API keys

2. **Environment Variables**
   Add these to your `.env.local` (development) and Vercel (production):

```bash
# Stripe Keys
STRIPE_SECRET_KEY=sk_test_...           # From Stripe Dashboard
STRIPE_PUBLISHABLE_KEY=pk_test_...      # From Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...         # Created in step 3 below

# Existing vars (already set)
POSTGRES_URL=...
RESEND_API_KEY=...
EMAIL_FROM=...
```

---

## Setup Steps

### 1. Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

### 2. Run Database Migration
```bash
node scripts/add-payment-fields.js
```

This adds:
- `payment_intent_id` - Stripe payment reference
- `price_paid` - Amount customer paid
- `checked_in` - Entry status
- `booking_code` - Human-readable reference

### 3. Configure Stripe Webhook

**Development (using Stripe CLI):**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook secret (whsec_...) to .env.local
```

**Production (Vercel):**
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://gigfinder-tau.vercel.app/api/stripe/webhook`
4. Events to listen for:
   - `checkout.session.completed`
5. Copy the "Signing secret" (whsec_...)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

---

## How It Works

### Flow for Paid Events (ticket_price > 0):

```
1. User clicks "Book Now" on a paid event
2. BookingModal opens, user enters details & quantity
3. User clicks "Confirm Booking"
4. Frontend calls /api/stripe/checkout
5. Stripe Checkout Session created
6. User redirected to Stripe payment page
7. User enters card details
8. Payment processed by Stripe
9. Stripe sends webhook to /api/stripe/webhook
10. Webhook creates booking in database
11. Webhook sends confirmation email with QR code
12. User redirected to /gigfinder/booking-success
```

### Flow for Free Events (ticket_price = 0 or null):

```
1. User clicks "Book Now" on a free event
2. BookingModal opens, user enters details & quantity
3. User clicks "Confirm Booking"
4. Frontend calls /api/bookings (existing flow)
5. Booking created immediately
6. Confirmation email sent
7. Success message shown in modal
```

---

## API Endpoints

### POST /api/stripe/checkout
Creates a Stripe Checkout Session for paid events.

**Request:**
```json
{
  "eventId": 123,
  "quantity": 2,
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook
Handles Stripe webhook events (payment confirmations).

**Events handled:**
- `checkout.session.completed` - Creates booking after successful payment

---

## Testing

### Test Cards (Stripe Test Mode):
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155

Expiry: Any future date
CVC: Any 3 digits
ZIP: Any 5 digits
```

### Test Flow:
1. Create event with price (e.g., £10.00)
2. Enable internal ticketing
3. Try booking tickets
4. Use test card 4242 4242 4242 4242
5. Complete payment
6. Check email for confirmation
7. Verify booking in database

---

## Database Schema

### bookings table (updated):
```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'confirmed',
  payment_intent_id VARCHAR(255),      -- NEW
  price_paid DECIMAL(10,2),            -- NEW
  checked_in BOOLEAN DEFAULT FALSE,    -- NEW
  booking_code VARCHAR(20),            -- NEW
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Security Notes

1. **Never expose STRIPE_SECRET_KEY** - Server-side only
2. **Verify webhook signatures** - Prevents fake payment confirmations
3. **Use HTTPS in production** - Required by Stripe
4. **Validate amounts** - Always check ticket_price from database
5. **Idempotency** - Webhook may be called multiple times

---

## Troubleshooting

### "Payment setup failed"
- Check STRIPE_SECRET_KEY is set correctly
- Verify event has ticket_price > 0
- Check browser console for errors

### "Webhook signature verification failed"
- Ensure STRIPE_WEBHOOK_SECRET is correct
- Check webhook endpoint URL matches Stripe dashboard
- Verify webhook is receiving POST requests

### Booking not created after payment
- Check webhook logs in Stripe Dashboard
- Verify database connection
- Check email service (RESEND_API_KEY)

---

## Going Live

1. **Switch to Live Keys**
   - Get live keys from Stripe Dashboard
   - Update environment variables in Vercel
   - Update webhook endpoint to production URL

2. **Test with Real Card**
   - Use a real card with small amount
   - Verify full flow works
   - Check email delivery

3. **Monitor**
   - Watch Stripe Dashboard for payments
   - Check webhook logs
   - Monitor database for bookings

---

## Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test Mode: Always test before going live!
