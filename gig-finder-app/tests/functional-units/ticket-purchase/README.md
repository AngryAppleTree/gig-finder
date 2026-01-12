# Ticket Purchase Functional Unit

## Overview
This functional unit covers the **unauthenticated ticket purchasing flow** for GigFinder. These tests verify that users can browse events and complete ticket purchases without needing to create an account.

## Scope

### In Scope
- **Event Discovery:** Finding events to purchase tickets for
- **Ticket Selection:** Choosing ticket types and quantities
- **Checkout Flow:** Completing purchase with payment
- **Confirmation:** Receiving booking confirmation and tickets
- **Guest List (Free Events):** Adding name to guest list for free events
- **Stripe Integration:** Payment processing for paid events

### Out of Scope
- Event creation (covered in `event-management`)
- Search and filtering (covered in `landing-and-search`)
- User account management (covered in `event-management`)

## User Journey

```
1. User finds event (via search or direct link)
   ↓
2. User clicks "Buy Tickets" or "Book Now"
   ↓
3. User enters booking details (name, email, quantity)
   ↓
4. For PAID events:
   - User enters payment details (Stripe)
   - Payment processed
   ↓
5. User receives confirmation
   - Email with ticket/QR code
   - Confirmation page displayed
```

## Test Files

### Planned Tests

1. **`event-detail-page.spec.ts`**
   - Event details display correctly
   - Ticket button shows correct text based on ticketing type
   - Price information displayed
   - Venue and date information

2. **`free-event-booking.spec.ts`**
   - Guest list form displays for free events
   - Can submit name and email
   - Receives confirmation
   - Added to guest list

3. **`paid-event-checkout.spec.ts`**
   - Stripe checkout form displays
   - Can enter payment details
   - Payment processing
   - Receives booking confirmation

4. **`booking-confirmation.spec.ts`**
   - Confirmation page displays after booking
   - Shows booking details
   - QR code displayed
   - Email sent notification

5. **`external-ticketing.spec.ts`**
   - External ticket links work correctly
   - "Get Tickets" button navigates to external URL
   - No internal booking flow shown

## Authentication Requirements

**None** - All tests in this functional unit should run **unauthenticated** (chromium project only).

These are public-facing features that don't require user accounts.

## Test Data Requirements

### Required Test Events
- **Free event with guest list** (e.g., "sdwfgh")
- **Paid event with Stripe** (created by add-event-submit tests)
- **Event with external ticketing** (Skiddle events)

### Environment Variables
- `STRIPE_PUBLISHABLE_KEY` - For Stripe checkout tests
- Test mode Stripe keys should be used

## Page Objects

### Existing (Reusable)
- `GigCard.ts` - For event cards in search results
- `Homepage.ts` - For navigation

### New (To Create)
- `EventDetailPage.ts` - Event detail page interactions
- `BookingFormPage.ts` - Booking form for free events
- `StripeCheckoutPage.ts` - Stripe payment form
- `ConfirmationPage.ts` - Post-booking confirmation

## Success Criteria

✅ Users can book free events without authentication  
✅ Users can purchase paid tickets via Stripe  
✅ External ticketing links work correctly  
✅ Confirmation emails sent (mocked in tests)  
✅ QR codes generated for bookings  
✅ All tests pass in both localhost and PREVIEW environments  

## Notes

- These tests should work on PREVIEW since they don't require authentication
- Stripe tests should use test mode keys
- Email sending should be mocked or verified via API calls
- QR code generation should be verified but not scanned

## Related Documentation

- `/tests/TEST_ORGANIZATION_COMPLETE.md` - Overall test structure
- `/tests/AUTHENTICATION_GUIDE.md` - Auth setup (not needed for this unit)
- `/ACCEPTANCE_CRITERIA.md` - Feature requirements
