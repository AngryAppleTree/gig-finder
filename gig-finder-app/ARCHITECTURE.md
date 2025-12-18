# GigFinder Application Architecture

## 📱 Frontend Pages (User-Facing)

### **🔍 Search & Discovery**
- `/app/page.tsx` - Homepage / Landing page
- `/app/gigfinder/page.tsx` - Search wizard (Steps 1-4)
- `/app/gigfinder/results/page.tsx` - Search results page

### **🎫 Event Management (Promoters)**
- `/app/gigfinder/add-event/page.tsx` - Create new event form
- `/app/gigfinder/gig-added/page.tsx` - Event creation success page
- `/app/gigfinder/edit/[id]/page.tsx` - Edit existing event
- `/app/gigfinder/my-gigs/page.tsx` - View my created events
- `/app/gigfinder/my-gigs/guestlist/[id]/page.tsx` - View guest list for event
- `/app/gigfinder/my-gigs/scan/[id]/page.tsx` - QR code scanner for check-in

### **🎟️ Booking (Attendees)**
- `/app/gigfinder/booking-success/page.tsx` - Booking confirmation page
- `/app/gigfinder/booking-cancelled/page.tsx` - Booking cancellation page
- `/app/gigfinder/my-bookings/page.tsx` - View my bookings
- `/app/gigfinder/my-bookings/cancel/[id]/page.tsx` - Cancel a booking
- `/app/gigfinder/success-static/page.tsx` - Static success page

### **👤 Authentication**
- `/app/sign-in/[[...rest]]/page.tsx` - Clerk sign-in page
- `/app/sign-up/[[...rest]]/page.tsx` - Clerk sign-up page

### **📄 Static Pages**
- `/app/contact/page.tsx` - Contact page
- `/app/privacy/page.tsx` - Privacy policy

---

## 🔧 Admin Panel

### **Admin Pages**
- `/app/admin/page.tsx` - Admin dashboard (redirects to protected)
- `/app/admin/(protected)/page.tsx` - Protected admin dashboard
- `/app/admin/(protected)/layout.tsx` - Admin layout wrapper
- `/app/admin/login/page.tsx` - Admin login page

### **Admin - Bookings**
- `/app/admin/(protected)/bookings/page.tsx` - View all bookings

### **Admin - Events**
- `/app/admin/(protected)/events/page.tsx` - View/manage all events
- `/app/admin/(protected)/events/new/page.tsx` - Create event (admin)

### **Admin - Venues**
- `/app/admin/(protected)/venues/page.tsx` - Venue CRUD management

---

## 🔌 API Routes

### **Events API**
- `/app/api/events/route.ts` - **CORE** - Fetch events (manual + Skiddle)
- `/app/api/events/manual/route.ts` - Create manual events
- `/app/api/events/user/route.ts` - Fetch user's events

### **Bookings API**
- `/app/api/bookings/route.ts` - **CORE** - Create/fetch bookings
- `/app/api/bookings/email/route.ts` - Send booking confirmation emails
- `/app/api/bookings/my-bookings/route.ts` - Fetch user's bookings
- `/app/api/bookings/refund/route.ts` - Process refunds
- `/app/api/bookings/scan/route.ts` - QR code check-in

### **Stripe API**
- `/app/api/stripe/checkout/route.ts` - **CORE** - Create Stripe checkout session
- `/app/api/stripe/webhook/route.ts` - **CORE** - Handle Stripe webhooks

### **Admin API**
- `/app/api/admin/login/route.ts` - Admin authentication
- `/app/api/admin/logout/route.ts` - Admin logout
- `/app/api/admin/bookings/route.ts` - Admin booking management
- `/app/api/admin/events/route.ts` - Admin event management
- `/app/api/admin/venues/route.ts` - **NEW** - Venue CRUD operations
- `/app/api/admin/scrape/route.ts` - **NEW** - Run scrapers

### **Database Setup**
- `/app/api/setup-db/route.ts` - Initial database setup
- `/app/api/setup-db/ticketing/route.ts` - Ticketing tables setup

---

## 🧩 Reusable Components

### **GigFinder Components** (`/components/gigfinder/`)
- `Wizard.tsx` - Multi-step search wizard
- `GigCard.tsx` - **CORE** - Event card display
- `BookingModal.tsx` - **CORE** - Booking modal (free + paid)
- `types.ts` - TypeScript interfaces for events/gigs

### **Layout Components** (`/components/`)
- `Header.tsx` - Site header/navigation
- `Footer.tsx` - Site footer

---

## 🤖 Backend Services

### **Scrapers** (`/scraper/`)
- `ingest-banshee.js` - Banshee Labyrinth scraper
- `ingest-sneaky.js` - Sneaky Pete's scraper
- `ingest-stramash.js` - Stramash scraper
- `ingest-leith.js` - Leith Depot scraper
- `api-wrappers.ts` - **NEW** - API-safe scraper wrappers
- `venue-helper.js` - **NEW** - Venue lookup helper

### **Database Scripts** (`/scripts/`)
- `add-sell-tickets-column.js` - Migration: Add sell_tickets column
- `create-venues-table.js` - **NEW** - Migration: Create venues table
- `drop-venue-column.js` - **NEW** - Migration: Drop old venue column
- `increase-name-length.js` - Migration: Increase event name to 200 chars
- `check-events.js` - Utility: Check events data
- `show-events-data.js` - Utility: Display events table

---

## 📊 Database Schema

### **Tables**
- `events` - All events (manual + scraped)
  - Uses `venue_id` FK to venues table
  - `user_id` determines source (user_* = manual, scraper_* = scraped)
  
- `venues` - **NEW** - Venue master data
  - name, address, city, postcode
  - latitude, longitude (for distance calc)
  - capacity, website
  
- `bookings` - Event bookings
  - Links to events and users
  - Tracks Stripe payment IDs

---

## 🔑 Key Dependencies

### **Data Flow**
```
User Search → Wizard → Results Page
                ↓
          Events API (route.ts)
                ↓
    ┌─────────┴─────────┐
    ↓                   ↓
Manual Events      Skiddle API
(DB + Scrapers)    (External)
    ↓
Venues Table (JOIN)
```

### **Booking Flow**
```
Event Card → BookingModal
                ↓
        ┌───────┴───────┐
        ↓               ↓
    Free Booking    Paid Booking
        ↓               ↓
  Bookings API    Stripe Checkout
        ↓               ↓
    Database        Webhook → DB
```

---

## 🎯 Critical Files (Likely to be "LOCKED")

### **Core User Experience**
1. `/app/api/events/route.ts` - Events API (search results)
2. `/app/gigfinder/results/page.tsx` - Results display
3. `/components/gigfinder/GigCard.tsx` - Event cards
4. `/components/gigfinder/BookingModal.tsx` - Booking flow

### **Core Booking System**
5. `/app/api/bookings/route.ts` - Booking creation
6. `/app/api/stripe/checkout/route.ts` - Payment flow
7. `/app/api/stripe/webhook/route.ts` - Payment confirmation

### **Core Data Integrity**
8. `/app/api/admin/venues/route.ts` - Venue management
9. `/scraper/venue-helper.js` - Venue lookup

---

**Review this and tell me which files/sections you want to LOCK! 🔒**
