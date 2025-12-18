# GigFinder Acceptance Criteria (Given/When/Then)

## 🔍 Search & Discovery

### AC-001: Postcode Entry Validation
**Given** I am on the wizard search page (Step 1)  
**When** I enter a valid UK postcode (e.g., "EH1 1SR")  
**Then** the postcode is accepted and I can proceed to the next step

**Given** I am on the wizard search page (Step 1)  
**When** I enter an invalid postcode (e.g., "12345")  
**Then** I see an error message and cannot proceed

---

### AC-002: Distance Selection
**Given** I have entered a valid postcode  
**When** I select "Local (10 miles)" on Step 2  
**Then** the distance parameter is set to "local" and I proceed to Step 3

**Given** I have entered a valid postcode  
**When** I select "Within 100 miles" on Step 2  
**Then** the distance parameter is set to "100miles" and I proceed to Step 3

**Given** I have entered a valid postcode  
**When** I select "Anywhere" on Step 2  
**Then** no distance filter is applied and I proceed to Step 3

---

### AC-003: Venue Size Filtering
**Given** I am on Step 3 (Venue Size)  
**When** I select "Small (≤100 capacity)"  
**Then** only events at venues with capacity ≤100 are shown in results

**Given** I am on Step 3 (Venue Size)  
**When** I select "Medium (100-5000 capacity)"  
**Then** only events at venues with capacity 100-5000 are shown in results

**Given** I am on Step 3 (Venue Size)  
**When** I select "Any Size"  
**Then** all events are shown regardless of venue capacity

---

### AC-004: Budget Filtering
**Given** I am on Step 4 (Budget)  
**When** I select "Free"  
**Then** only events with price = £0.00 are shown in results

**Given** I am on Step 4 (Budget)  
**When** I select "Low (£0-20)"  
**Then** only events with price £0.01-£20.00 are shown in results

**Given** I am on Step 4 (Budget)  
**When** I select "Any Budget"  
**Then** all events are shown regardless of price

---

### AC-005: Results Ordering
**Given** I have completed the search wizard  
**When** I view the results page  
**Then** events are displayed in chronological order (soonest first)

**Given** there are events happening today  
**When** I view the results page  
**Then** today's events appear at the top of the list

---

### AC-006: Wizard Navigation
**Given** I am on Step 3 of the wizard  
**When** I click the "Back" button  
**Then** I return to Step 2 with my previous selection preserved

**Given** I am on Step 4 of the wizard  
**When** I click "Search"  
**Then** I am redirected to the results page with all my selections applied

---

## 🎫 Event Browsing

### AC-007: Event Card Display
**Given** I am viewing search results  
**When** I see an event card  
**Then** it displays: event name, venue name, date, time, price, and image (or placeholder)

**Given** an event has a venue with known capacity  
**When** I view the event card  
**Then** the venue capacity is displayed

---

### AC-008: Manual Event Actions
**Given** I am viewing a user-created event (source='manual')  
**When** I look at the event card  
**Then** I see a "Book Now" button

**Given** I am viewing a user-created event  
**When** I click "Book Now"  
**Then** the booking modal opens with event details

---

### AC-009: Scraped Event Actions
**Given** I am viewing a scraped event (source='scraped')  
**When** I look at the event card  
**Then** I see a "Get Tickets" or "More Info" button (NOT "Book Now")

**Given** I am viewing a scraped event with a ticket URL  
**When** I click "Get Tickets"  
**Then** I am redirected to the external ticketing website

---

### AC-010: Venue Data Display
**Given** an event is linked to a venue via venue_id  
**When** I view the event  
**Then** the venue name, capacity, and location are displayed from the venues table

**Given** a venue has latitude and longitude coordinates  
**When** I search with a postcode  
**Then** the distance to the venue is calculated and displayed accurately

---

## 📝 Event Creation

### AC-011: Add Event Form Validation
**Given** I am on the "Add Event" form  
**When** I try to submit without filling required fields  
**Then** I see validation errors and the form does not submit

**Given** I am on the "Add Event" form  
**When** I fill all required fields correctly  
**Then** the form submits successfully

---

### AC-012: Venue Selection
**Given** I am on the "Add Event" form  
**When** I click the venue dropdown  
**Then** I see all venues from the venues table

**Given** I select a venue from the dropdown  
**When** I submit the form  
**Then** the event is created with the correct venue_id

---

### AC-013: Guest List Option
**Given** I am creating a new event  
**When** I check "Enable Guest List (Free)"  
**Then** the event is created with `is_internal_ticketing = true` and `price = 0`

**Given** I have enabled the guest list  
**When** users view my event  
**Then** they see a "Book Now" button for free bookings

---

### AC-014: Paid Ticketing Option
**Given** I am creating a new event  
**When** I check "Sell Tickets (Paid)" and set a price  
**Then** the event is created with `sell_tickets = true` and the specified price

**Given** I have enabled paid ticketing  
**When** users view my event  
**Then** they see a "Book Now" button that redirects to Stripe checkout

---

### AC-015: Event Appears in Search
**Given** I have successfully created an event  
**When** I search for events in that date range  
**Then** my event appears in the search results

**Given** my event has a future date  
**When** I search for events  
**Then** my event is included in the results

---

## 🎟️ Booking System

### AC-016: Free Guest List Booking
**Given** I am viewing an event with guest list enabled  
**When** I click "Book Now"  
**Then** a modal opens requesting my name, email, and quantity

**Given** I have filled in my details in the booking modal  
**When** I click "Submit"  
**Then** my booking is created and I see a success message

---

### AC-017: Paid Ticket Booking
**Given** I am viewing an event with paid tickets  
**When** I click "Book Now" and enter my details  
**Then** I am redirected to Stripe checkout

**Given** I complete payment on Stripe  
**When** the payment succeeds  
**Then** my booking is created and I am redirected to a success page

---

### AC-018: My Gigs - View Created Events
**Given** I am logged in and have created events  
**When** I navigate to "My Gigs"  
**Then** I see a list of all my created events

**Given** I am viewing "My Gigs"  
**When** I look at an event  
**Then** I see the total number of bookings for that event

---

### AC-019: Guest List Management
**Given** I am viewing "My Gigs"  
**When** I click "View Guest List" on an event  
**Then** I see all bookings with names, emails, and quantities

**Given** I am viewing a guest list  
**When** I use the QR scanner (if implemented)  
**Then** I can check in attendees

---

## 🔧 Admin Panel

### AC-020: Admin Authentication
**Given** I am not logged in as admin  
**When** I try to access `/admin`  
**Then** I am redirected to the login page

**Given** I am on the admin login page  
**When** I enter the authorized email and password  
**Then** I am granted access to the admin panel

**Given** I am logged in as admin  
**When** I click "Logout"  
**Then** my session ends and I am redirected to the login page

---

### AC-021: Venue Management - Create
**Given** I am on the admin venues page  
**When** I click "Add Venue"  
**Then** a form appears with fields for name, address, city, postcode, lat/lon, capacity, website

**Given** I fill in the venue form  
**When** I click "Save"  
**Then** the venue is created and appears in the venues table

---

### AC-022: Venue Management - Edit
**Given** I am viewing the venues table  
**When** I click "Edit" on a venue  
**Then** the venue form is populated with existing data

**Given** I modify venue details  
**When** I click "Save"  
**Then** the venue is updated and changes are reflected immediately

---

### AC-023: Venue Management - Delete
**Given** I am viewing the venues table  
**When** I click "Delete" on a venue with no events  
**Then** I see a confirmation dialog and the venue is deleted

**Given** I try to delete a venue with existing events  
**When** I click "Delete"  
**Then** I see an error message and the venue is NOT deleted

---

### AC-024: Venue Event Count
**Given** I am viewing the venues table  
**When** I look at a venue row  
**Then** I see the total number of events at that venue

**Given** a venue has 5 events  
**When** I view the venues table  
**Then** the event count shows "5"

---

### AC-025: Scraper Execution - Success
**Given** I am on the admin scrapers page  
**When** I click "Run Scraper" for Banshee Labyrinth  
**Then** the scraper executes and I see a success message with event count

**Given** the scraper successfully adds events  
**When** I view the events table  
**Then** the new events appear with `user_id = 'scraper_banshee'`

---

### AC-026: Scraper Execution - Failure
**Given** I am on the admin scrapers page  
**When** I run a scraper that fails (e.g., Stramash with 403)  
**Then** I see an error message with details

**Given** a scraper fails  
**When** I check the events table  
**Then** no partial/corrupt data is added

---

## 🗄️ Data Integrity

### AC-027: Venue ID Foreign Key
**Given** an event is created  
**When** I query the events table  
**Then** the event has a valid `venue_id` that references the venues table

**Given** I query events with a JOIN to venues  
**When** I retrieve event data  
**Then** venue name, capacity, and coordinates are populated from the venues table

---

### AC-028: Event Source Detection
**Given** a user creates an event via the "Add Event" form  
**When** I check the event in the database  
**Then** `user_id` starts with `user_` and `source = 'manual'`

**Given** a scraper creates an event  
**When** I check the event in the database  
**Then** `user_id` is like `scraper_*` and `source = 'scraped'`

---

### AC-029: Ticketing Guardrails
**Given** an event has `source = 'manual'`  
**When** I view the event card  
**Then** I can see "Book Now" if internal ticketing is enabled

**Given** an event has `source = 'scraped'`  
**When** I view the event card  
**Then** I NEVER see "Book Now", only "Get Tickets" or "More Info"

---

### AC-030: Old Venue Column Removed
**Given** the venue migration has been run  
**When** I query the events table schema  
**Then** the old `venue` text column does not exist

**Given** events are displayed  
**When** I check the venue name  
**Then** it comes from the venues table via `venue_id`, not a text column

---

## 📱 General UX

### AC-031: Responsive Design
**Given** I am viewing the site on a mobile device  
**When** I navigate through pages  
**Then** all content is readable and interactive elements are tappable

**Given** I am viewing the site on a tablet  
**When** I use the search wizard  
**Then** the layout adapts appropriately

**Given** I am viewing the site on desktop  
**When** I browse events  
**Then** the layout uses available space effectively

---

### AC-032: Performance
**Given** I navigate to any page  
**When** the page loads  
**Then** it loads in under 2 seconds

**Given** I submit a search  
**When** the API processes the request  
**Then** results are returned in under 2 seconds

---

### AC-033: Error Handling
**Given** the database is unavailable  
**When** I try to load events  
**Then** I see a user-friendly error message (not a crash)

**Given** an API call fails  
**When** I perform an action  
**Then** I see an appropriate error message and can retry

---

## 🐛 Known Issues to Verify

### AC-034: Sneaky Pete's Date Verification
**Given** Sneaky Pete's events are in the database  
**When** I view the events  
**Then** the dates should be in 2025, not 2026 (manual verification needed)

### AC-035: Stramash Scraper 403
**Given** I run the Stramash scraper  
**When** the site blocks the request  
**Then** I see a clear error message (403 Forbidden) and the scraper handles it gracefully

### AC-036: Event Ordering Verification
**Given** there are events on multiple dates  
**When** I view search results  
**Then** events happening soonest (today, tomorrow, this week) appear first

### AC-037: Venue Coordinates Accuracy
**Given** a venue has lat/lon coordinates  
**When** I calculate distance from a postcode  
**Then** the distance is accurate (within 1 mile margin of error)
