# GigFinder Application Sitemap

**Generated:** 2026-01-08  
**Purpose:** Complete map of all pages and API routes for regression testing

---

## 🌐 Public Pages (No Authentication Required)

### **1. Root & Main Pages**

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/` | `app/page.tsx` | Root redirect → `/gigfinder` | No |
| `/gigfinder` | `app/gigfinder/page.tsx` | **Main homepage** - Event search wizard | No |
| `/gigfinder/results` | `app/gigfinder/results/page.tsx` | Search results display | No |
| `/contact` | `app/contact/page.tsx` | Contact form | No |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy | No |
| `/terms` | `app/terms/page.tsx` | Terms of service | No |
| `/pledge` | `app/pledge/page.tsx` | Pledge page | No |
| `/test` | `app/test/page.tsx` | Test page (dev only?) | No |

---

## 🔐 Authentication Pages

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/sign-in` | `app/sign-in/[[...rest]]/page.tsx` | Clerk sign-in | No |
| `/sign-up` | `app/sign-up/[[...rest]]/page.tsx` | Clerk sign-up | No |

---

## 👤 User Pages (Authentication Required)

### **Event Management**

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/gigfinder/add-event` | `app/gigfinder/add-event/page.tsx` | Add new event form | Yes |
| `/gigfinder/edit/[id]` | `app/gigfinder/edit/[id]/page.tsx` | Edit existing event | Yes (owner) |
| `/gigfinder/gig-added` | `app/gigfinder/gig-added/page.tsx` | Success page after adding event | Yes |

### **Booking Management**

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/gigfinder/my-bookings` | `app/gigfinder/my-bookings/page.tsx` | User's booking list | Yes |
| `/gigfinder/my-bookings/cancel/[id]` | `app/gigfinder/my-bookings/cancel/[id]/page.tsx` | Cancel booking | Yes (owner) |
| `/gigfinder/booking-success` | `app/gigfinder/booking-success/page.tsx` | Booking confirmation page | Yes |
| `/gigfinder/booking-cancelled` | `app/gigfinder/booking-cancelled/page.tsx` | Booking cancellation confirmation | Yes |

### **Event Organizer Pages**

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/gigfinder/my-gigs` | `app/gigfinder/my-gigs/page.tsx` | Event organizer dashboard | Yes (organizer) |
| `/gigfinder/my-gigs/guestlist/[id]` | `app/gigfinder/my-gigs/guestlist/[id]/page.tsx` | View event guest list | Yes (organizer) |
| `/gigfinder/my-gigs/scan/[id]` | `app/gigfinder/my-gigs/scan/[id]/page.tsx` | QR code scanner for check-in | Yes (organizer) |

---

## 🔧 Admin Pages (Admin Role Required)

| Route | File | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/admin` | `app/admin/(protected)/page.tsx` | Admin dashboard | Yes (admin) |
| `/admin/login` | `app/admin/login/page.tsx` | Admin login page | No |
| `/admin/events` | `app/admin/(protected)/events/page.tsx` | Manage all events | Yes (admin) |
| `/admin/events/new` | `app/admin/(protected)/events/new/page.tsx` | Create new event (admin) | Yes (admin) |
| `/admin/bookings` | `app/admin/(protected)/bookings/page.tsx` | View all bookings | Yes (admin) |
| `/admin/venues` | `app/admin/(protected)/venues/page.tsx` | Manage venues | Yes (admin) |

---

## 🔌 API Routes

### **Public APIs**

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/events` | `app/api/events/route.ts` | GET | Fetch events (with filters) |
| `/api/events/manual` | `app/api/events/manual/route.ts` | POST | Submit manual event |
| `/api/events/user` | `app/api/events/user/route.ts` | GET | Get user's events |
| `/api/venues` | `app/api/venues/route.ts` | GET | Fetch venues |
| `/api/contact` | `app/api/contact/route.ts` | POST | Submit contact form |
| `/api/setup-db` | `app/api/setup-db/route.ts` | POST | Initialize database |
| `/api/setup-db/ticketing` | `app/api/setup-db/ticketing/route.ts` | POST | Setup ticketing tables |

### **Booking APIs**

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/bookings` | `app/api/bookings/route.ts` | GET/POST | Fetch/create bookings |
| `/api/bookings/my-bookings` | `app/api/bookings/my-bookings/route.ts` | GET | Get user's bookings |
| `/api/bookings/email` | `app/api/bookings/email/route.ts` | POST | Send booking email |
| `/api/bookings/scan` | `app/api/bookings/scan/route.ts` | POST | Check-in via QR scan |
| `/api/bookings/refund` | `app/api/bookings/refund/route.ts` | POST | Process refund |

### **Stripe APIs**

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/stripe/checkout` | `app/api/stripe/checkout/route.ts` | POST | Create Stripe checkout session |
| `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | POST | Handle Stripe webhooks |

### **Admin APIs**

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/admin/login` | `app/api/admin/login/route.ts` | POST | Admin authentication |
| `/api/admin/logout` | `app/api/admin/logout/route.ts` | POST | Admin logout |
| `/api/admin/events` | `app/api/admin/events/route.ts` | GET/POST/PUT/DELETE | Manage events |
| `/api/admin/bookings` | `app/api/admin/bookings/route.ts` | GET | View all bookings |
| `/api/admin/venues` | `app/api/admin/venues/route.ts` | GET/POST | Manage venues |
| `/api/admin/scrape` | `app/api/admin/scrape/route.ts` | POST | Trigger event scraper |
| `/api/admin/setup-audit` | `app/api/admin/setup-audit/route.ts` | POST | Setup audit logs |
| `/api/admin/migrate-bookings` | `app/api/admin/migrate-bookings/route.ts` | POST | Migrate booking data |
| `/api/admin/reset-checkins` | `app/api/admin/reset-checkins/route.ts` | POST | Reset check-in status |
| `/api/admin/notify-first-event` | `app/api/admin/notify-first-event/route.ts` | POST | Send first event notification |
| `/api/admin/notify-new-venue` | `app/api/admin/notify-new-venue/route.ts` | POST | Send new venue notification |

### **Debug APIs**

| Route | File | Method | Purpose |
|-------|------|--------|---------|
| `/api/debug/env-check` | `app/api/debug/env-check/route.ts` | GET | Check environment variables |

---

## 📊 Page Categories for Testing

### **Priority 1: Critical User Flows (Must Test)**
1. `/gigfinder` - Homepage/Search
2. `/gigfinder/results` - Search results
3. `/gigfinder/add-event` - Add event
4. `/gigfinder/booking-success` - Booking confirmation
5. `/sign-in` - Authentication
6. `/api/stripe/checkout` - Payment processing
7. `/api/bookings` - Booking creation

### **Priority 2: User Features (Should Test)**
1. `/gigfinder/my-bookings` - View bookings
2. `/gigfinder/my-gigs` - Organizer dashboard
3. `/gigfinder/my-gigs/scan/[id]` - QR scanning
4. `/gigfinder/edit/[id]` - Edit event
5. `/api/bookings/scan` - Check-in API
6. `/api/events/user` - User events API

### **Priority 3: Admin Features (Nice to Test)**
1. `/admin` - Admin dashboard
2. `/admin/events` - Event management
3. `/admin/bookings` - Booking management
4. `/admin/venues` - Venue management
5. `/api/admin/*` - Admin APIs

### **Priority 4: Static Pages (Low Priority)**
1. `/contact` - Contact form
2. `/privacy` - Privacy policy
3. `/terms` - Terms of service
4. `/pledge` - Pledge page

---

## 🎯 Test Coverage Recommendations

### **Phase 1: Core Functionality (5 tests)**
- Homepage loads and wizard works
- Search returns results
- Event detail page displays
- Booking flow with test payment
- Authentication (sign-up/sign-in)

### **Phase 2: User Features (10 tests)**
- Add event form
- Edit event
- View my bookings
- Cancel booking
- Organizer dashboard
- Guest list view
- QR code scanning
- Email confirmations
- Refund processing
- User event management

### **Phase 3: Admin Features (5 tests)**
- Admin login
- Event management
- Booking overview
- Venue management
- Scraper trigger

### **Phase 4: Edge Cases (10 tests)**
- Invalid inputs
- Empty states
- Error handling
- Network failures
- Session expiry
- Concurrent bookings
- Sold out events
- Payment failures
- Unauthorized access
- API rate limiting

---

## 📋 Dynamic Routes

**Events:**
- `/gigfinder/edit/[id]` - Event ID
- `/gigfinder/my-gigs/guestlist/[id]` - Event ID
- `/gigfinder/my-gigs/scan/[id]` - Event ID

**Bookings:**
- `/gigfinder/my-bookings/cancel/[id]` - Booking ID

**Auth:**
- `/sign-in/[[...rest]]` - Clerk catch-all
- `/sign-up/[[...rest]]` - Clerk catch-all

---

## 🔒 Authentication Matrix

| Page/API | Public | User | Organizer | Admin |
|----------|--------|------|-----------|-------|
| `/gigfinder` | ✅ | ✅ | ✅ | ✅ |
| `/gigfinder/add-event` | ❌ | ✅ | ✅ | ✅ |
| `/gigfinder/my-gigs` | ❌ | ❌ | ✅ | ✅ |
| `/admin` | ❌ | ❌ | ❌ | ✅ |
| `/api/bookings` (POST) | ✅ | ✅ | ✅ | ✅ |
| `/api/admin/*` | ❌ | ❌ | ❌ | ✅ |

---

## 📝 Notes

**Total Pages:** 26  
**Total API Routes:** 26  
**Authentication Levels:** 4 (Public, User, Organizer, Admin)  
**Dynamic Routes:** 5  

**Recommended Test Count:** 30 tests covering all critical paths

---

**Status:** Complete sitemap ready for test planning
