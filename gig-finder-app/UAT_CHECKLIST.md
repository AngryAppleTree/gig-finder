# GigFinder UAT Test Plan

## Test Data Setup

**Current Events in Database:**
- Banshee Labyrinth: 9 events (Dec 17-31, 2025)
- Leith Depot: 7 events (Dec 18-31, 2025)
- Sneaky Pete's: 22 events (Mar-Nov 2026) ⚠️ *Dates need manual verification*
- Test event: 1 event (user-created)

**Venues in Database:**
- The Banshee Labyrinth (ID: 1, Capacity: 200)
- Sneaky Pete's (ID: 2, Capacity: 100)
- Leith Depot (ID: 3, Capacity: 150)
- Stramash (ID: 4, Capacity: 250)
- fghjkl (ID: 5, test venue)

---

## 🔍 Search & Discovery

### Wizard Search Flow
- [ ] Step 1: Postcode entry validates UK postcodes
- [ ] Step 2: Distance selection (Local 10mi / Within 100mi / Anywhere)
- [ ] Step 3: Venue size (Small ≤100 / Medium 100-5000 / Huge >5000 / Any)
- [ ] Step 4: Budget (Free / Low £0-20 / Mid £20-50 / High £50+ / Any)
- [ ] Wizard navigation (Back/Next buttons work)
- [ ] Search redirects to results with correct parameters

### Results Page
- [ ] Events display in date order (soonest first)
- [ ] Event cards show: name, venue, date, time, price, image
- [ ] Distance filtering works
- [ ] Venue size filtering works
- [ ] Budget filtering works
- [ ] Pagination works
- [ ] "No results" message displays appropriately

---

## 🎫 Event Browsing

### Event Cards
- [ ] Manual events show correct venue name from venues table
- [ ] Scraped events show correct venue name
- [ ] Event images display
- [ ] Prices display correctly
- [ ] Dates formatted correctly
- [ ] Venue capacity displays

### Event Actions
- [ ] User-created events show "Book Now" button
- [ ] Scraped events show "Get Tickets" or "More Info"
- [ ] "Book Now" opens booking modal
- [ ] "Get Tickets" links to external URL
- [ ] Source detection works (manual vs scraped)

---

## 📝 Event Creation

### Add Event Form
- [ ] All required fields validate
- [ ] Venue dropdown populated from venues table
- [ ] Date/time picker works
- [ ] Price field accepts decimals
- [ ] Image upload works
- [ ] Max capacity field works

### Ticketing Options
- [ ] "Enable Guest List (Free)" checkbox works
- [ ] "Sell Tickets (Paid)" checkbox works
- [ ] Options save correctly to database

### After Submission
- [ ] Event appears in search results
- [ ] Event shows correct venue data
- [ ] Ticketing options work as configured
- [ ] User redirected to success page

---

## 🎟️ Booking System

### Free Guest List
- [ ] Modal opens with event details
- [ ] Name and email fields required
- [ ] Quantity selector works
- [ ] Submission creates booking
- [ ] Success message displays

### Paid Tickets
- [ ] Modal opens with event details
- [ ] Stripe checkout redirects
- [ ] Payment processes
- [ ] Booking created after payment
- [ ] User redirected to success

### My Gigs
- [ ] User sees their created events
- [ ] Event list shows booking counts
- [ ] "View Guest List" button works
- [ ] Guest list shows all bookings

---

## 🔧 Admin Panel

### Authentication
- [ ] Login page works
- [ ] Only authorized email can access
- [ ] Session persists
- [ ] Logout works

### Venue Management
- [ ] View all venues in table
- [ ] Event count per venue displays
- [ ] Create new venue works
- [ ] Edit venue works
- [ ] Delete venue works (with safety check)
- [ ] Cannot delete venue with events

### Event Management
- [ ] View all events
- [ ] Edit event works
- [ ] Delete event works

### Scrapers
- [ ] Banshee Labyrinth scraper runs
- [ ] Sneaky Pete's scraper runs
- [ ] Leith Depot scraper runs
- [ ] Stramash scraper runs (may fail with 403)
- [ ] Success/error messages display

---

## 🗄️ Data Integrity

- [ ] All events have `venue_id`
- [ ] Venue data populates correctly
- [ ] Lat/lon coordinates accurate
- [ ] User-created events: `user_id` starts with `user_`
- [ ] Scraped events: `user_id` like `scraper_*`
- [ ] Only manual events can use "Book Now"
- [ ] Scraped events never show "Book Now"

---

## 📱 General UX

- [ ] Header navigation works
- [ ] Footer links work
- [ ] Back buttons work
- [ ] Mobile view works
- [ ] Tablet view works
- [ ] Desktop view works
- [ ] No console errors
- [ ] Pages load quickly (<2s)

---

## 🐛 Known Issues to Verify

1. **Sneaky Pete's dates** - Events showing 2026 instead of 2025 (manual check needed)
2. **Stramash scraper** - May return 403 Forbidden (intermittent)
3. **Event ordering** - Verify soonest events appear first
4. **Venue data** - Confirm all venues have correct lat/lon
