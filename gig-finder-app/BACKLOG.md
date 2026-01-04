# GigFinder Backlog

## High Priority

### 1. Adding Guardrails 🛡️
**Status:** Urgent  
**Description:** Implement technical boundaries to prevent unauthorized database mutations by AI agents.

**Objectives:**
- Move production credentials (`.env.production.local`) out of the active workspace.
- Implement Neon Database Branching for development work.
- Create a Read-Only database role for AI analysis tasks.
- Establish a "Safe Command" checklist for migrations.

---

### 2. Direct Event Links & Detail Pages
**Status:** Post-Beta - Requires automated testing first  
**Description:** Add ability to link directly to a specific event for sharing

**Features:**
- Event detail page at `/gigfinder/event/[id]`
- Support `?eventId=993` parameter in results page
- Shareable links for social media/marketing
- Deep linking support

**Current Workaround:**
- Use keyword search: `?keyword=screamin`

**Prerequisites:**
- ✅ Implement automated testing (Playwright)
- ✅ Test coverage for event display logic

**Technical Requirements:**
- New route: `app/gigfinder/event/[id]/page.tsx`
- Update results page to support `eventId` param
- SEO meta tags for event pages
- Social sharing preview cards

**Estimated Effort:** 2-3 hours (after testing in place)

---

### 3. Guestlist Workflow Refinement
**Status:** High Priority - Requires collaboration  
**Description:** Improve the free guestlist/RSVP booking experience to differentiate it from paid ticketing

**Current State:**
- Button text: "Book Now" (confusing - sounds like payment)
- Same modal as paid tickets
- No clear distinction between free and paid events

**Proposed Changes:**
- Change button text to "Get on Guest List"
- Dedicated guestlist modal (simpler, no payment fields)
- Clear messaging: "Free entry - just RSVP"
- Email confirmation: "You're on the list!"
- Organizer view: Guestlist management interface

**Business Logic:**
- If `sellTickets = true` → Show "Buy Tickets" only
- If `isInternalTicketing = true` (but `sellTickets = false`) → Show "Get on Guest List" only
- Never show both buttons simultaneously

**User Experience Goals:**
- Make free events feel welcoming (not transactional)
- Reduce confusion between paid/free
- Encourage RSVPs for capacity planning

**Estimated Effort:** 4-6 hours (requires design discussion)

---

### 4. Refund System
**Status:** Blocked - Requires Stripe integration to be live  
**Description:** Allow users and admins to cancel bookings and issue refunds

**Features:**
- User-initiated cancellation (before event date)
- Admin-initiated refunds
- Automatic capacity restoration
- Partial refunds (if applicable)
- Refund confirmation emails
- Update booking status to 'refunded'

**Technical Requirements:**
- Stripe Refund API integration
- Update bookings table status
- Decrease tickets_sold count
- Restore available capacity
- Send refund confirmation email
- Handle edge cases (event already happened, full capacity, etc.)

**Estimated Effort:** 4-6 hours

---

### 5. Merchandise Bundling
**Status:** New Feature  
**Description:** Allow users to pre-purchase merchandise (e.g., albums) with their ticket at a discounted price

**Features:**
- Add merchandise items to events (name, price, description, image)
- Display merch options in booking modal
- Bundle pricing (e.g., Ticket + Album = £5 off)
- Quantity selection for merch items
- Include merch in order confirmation email
- Merch pickup instructions (at venue door)
- Admin management of merch items

**User Flow:**
```
1. User clicks "Book Now"
2. Selects ticket quantity
3. Sees optional add-ons:
   - [ ] Add Album - £10 (Save £5 when bundled!)
   - [ ] Add T-Shirt - £15
4. Selects merchandise
5. Sees updated total: £25 (Ticket £15 + Album £10)
6. Proceeds to payment
7. Receives confirmation with pickup instructions
```

**Technical Requirements:**
- New table: `merchandise` (id, event_id, name, price, description, image_url, stock)
- New table: `booking_merchandise` (booking_id, merchandise_id, quantity)
- Update BookingModal UI to show merch options
- Update Stripe checkout to include merch line items
- Update confirmation email template
- Admin interface to manage merch
- Stock tracking and validation

**Database Schema:**
```sql
CREATE TABLE merchandise (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES events(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  bundle_discount DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE booking_merchandise (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  merchandise_id INTEGER REFERENCES merchandise(id),
  quantity INTEGER NOT NULL,
  price_paid DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Estimated Effort:** 8-12 hours

---

## Medium Priority
- **Fix Stramash Scraper Timeout**: The Stramash scraper currently times out on Vercel even with batching. It requires fetching individual event pages to get the full date/time from JSON-LD, which is too slow for a synchronous API response.
    - *Potential Solutions*:
        - Move to a background job / cron (Vercel Cron).
        - Implement a dedicated scraping service.
        - Rely solely on RSS feed data (approximate dates).

## Low Priority

### WORM Protection for Bookings Table
**Status:** Post-Beta  
**Description:** Implement Write-Once-Read-Many (WORM) logic for the bookings table to ensure immutability of payment/ticket records

**Rationale:**
- Financial/legal compliance
- Audit trail integrity
- Prevent accidental deletion of payment records
- Enable Stripe reconciliation

**Implementation Options:**
1. Database-level triggers (prevent UPDATE/DELETE)
2. Application-level guards in API routes
3. Audit table pattern for modifications

**Recommended:** Combination of DB triggers + audit table for cancellations/refunds

**Estimated Effort:** 2-4 hours

---

### Clean Up Legacy Event Ghost Code
**Status:** Low Priority  
**Description:** Clean up legacy unapproved events and improve admin UI for handling edge cases

**Issues:**
- ~10 legacy events exist with `approved = false` from before the "Live but Unverified" system
- Some events have contradictory states (`approved = false, verified = true`)
- Admin UI shows "VERIFY" button for unapproved events (confusing workflow)
- Admin sort order prioritizes `approved` instead of `verified` status

**Proposed Fixes:**
1. Disable or hide "VERIFY" button for unapproved events
2. Update admin sort order to show unverified events first
3. Add bulk action to approve all legacy unapproved events
4. OR add cleanup script to delete old unapproved events

**Note:** This only affects legacy data. New events work correctly.

**Estimated Effort:** 1-2 hours

---
