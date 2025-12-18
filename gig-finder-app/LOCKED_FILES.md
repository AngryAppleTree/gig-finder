# 🔒 LOCKED FILES - Require Approval Before Modification

**Last Updated:** 2025-12-18

## Rules:
1. Files listed here **CANNOT** be modified without explicit approval from Alexander
2. If a change impacts a locked file, I must:
   - ✋ Stop before making changes
   - 📊 Show impact analysis
   - 💬 Explain the proposed change
   - ⏸️ Wait for approval before proceeding
3. If you want to unlock a file, remove it from this list

---

## 🔐 LOCKED FILES

### **🔍 Search & Discovery**

#### Pages
- `/app/page.tsx` - Homepage/Landing page
- `/app/gigfinder/page.tsx` - Wizard container page
- `/app/gigfinder/results/page.tsx` - Search results page

#### Components
- `/components/gigfinder/Wizard.tsx` - Multi-step search wizard (Steps 1-4)
- `/components/gigfinder/GigCard.tsx` - Event card display component

#### API
- `/app/api/events/route.ts` - Events API (fetches manual + Skiddle events)

**Reason:** Core user journey - search flow must remain stable and functional.

---

### **🎨 Layout, Styling & UI**

#### Layout Files
- `/app/layout.tsx` - Root layout (Clerk provider, fonts)
- `/app/gigfinder/layout.tsx` - GigFinder section layout

#### Components
- `/components/gigfinder/Footer.tsx` - Site footer
- `/components/ui/Button.tsx` - Reusable button component
- `/components/ui/Input.tsx` - Reusable input component

#### Stylesheets
- `/app/globals.css` - Global styles
- `/app/gigfinder/gigfinder.css` - GigFinder section styles
- `/app/gigfinder/style.css` - Additional GigFinder styles
- `/public/gigfinder.css` - Public GigFinder styles

**Reason:** Look and feel is finalized. Header/footer positioning must remain consistent across all pages.

---

### **👤 Authentication & Static Pages**

#### Authentication (Clerk Integration)
- `/app/sign-in/[[...rest]]/page.tsx` - Sign-in page
- `/app/sign-up/[[...rest]]/page.tsx` - Sign-up page

#### Static Content Pages
- `/app/contact/page.tsx` - Contact page
- `/app/privacy/page.tsx` - Privacy policy
- `/app/terms/page.tsx` - Terms of service
- `/app/test/page.tsx` - Skiddle API test page (dev tool)

**Reason:** These pages are stable and working. Authentication is critical and shouldn't break.

---

### **🤖 Scrapers & Data Ingestion**

#### Scraper Scripts
- `/scraper/ingest-banshee.js` - Banshee Labyrinth scraper
- `/scraper/ingest-sneaky.js` - Sneaky Pete's scraper
- `/scraper/ingest-stramash.js` - Stramash scraper
- `/scraper/ingest-leith.js` - Leith Depot scraper

#### Scraper Infrastructure
- `/scraper/api-wrappers.ts` - API-safe scraper wrappers (for admin panel)
- `/scraper/venue-helper.js` - Venue lookup/creation helper

**Reason:** Scrapers are working correctly and populating events. Venue integration is stable. Changes could break data ingestion.

---

### **📊 Database Scripts & Migrations**

#### Migration Scripts (Already Run)
- `/scripts/create-venues-table.js` - Create venues table ✅ DONE
- `/scripts/drop-venue-column.js` - Drop old venue column ✅ DONE
- `/scripts/increase-name-length.js` - Increase event name to 200 chars ✅ DONE
- `/scripts/add-sell-tickets-column.js` - Add sell_tickets column

#### Utility Scripts
- `/scripts/check-events.js` - Check events data (debugging)
- `/scripts/show-events-data.js` - Display events table (debugging)

**Reason:** Migrations have been run successfully. Database schema is stable. Re-running could cause data corruption.

---

### **✅ Stable Pages & Components**

#### Event Management Pages
- `/app/gigfinder/gig-added/page.tsx` - Event creation success page
- `/app/gigfinder/my-gigs/page.tsx` - View my created events
- `/app/gigfinder/my-gigs/guestlist/[id]/page.tsx` - View guest list

#### Booking Pages
- `/app/gigfinder/my-bookings/page.tsx` - View my bookings
- `/app/gigfinder/success-static/page.tsx` - Static success page

#### Static Pages
- `/app/pledge/page.tsx` - Our Pledge page

#### Components
- `/components/gigfinder/QuickSearch.tsx` - Quick search component

#### API Routes
- `/app/api/contact/route.ts` - Contact form email API

#### Styles
- `/app/contact/contact.module.css` - Contact page styles

**Reason:** These pages and components are working correctly and have been tested. Changes could break user flows or styling.

---

## 🟢 UNLOCKED (OK to Modify)

*All other files not listed above are OK to modify without prior approval.*

---

## ⚠️ APPROVAL PROCESS

When a locked file needs changes:

**I will provide:**
```
⚠️ LOCKED FILE IMPACT ALERT

Request: [Your request]
Locked file(s) affected: [List of files]

Proposed changes:
- File: [filename]
  Lines: [line numbers]
  Change: [description]
  Risk: [LOW/MEDIUM/HIGH]

Impact analysis:
- [What will change]
- [What might break]
- [Why this change is needed]

Alternative approaches:
1. [Option 1]
2. [Option 2]

Approve changes? (yes/no)
```

**You respond:**
- ✅ "yes" or "approved" → I proceed
- ❌ "no" or "rejected" → I suggest alternatives
- 💬 Ask questions → I clarify

---

## 📝 Notes

- Add more files to this list as features stabilize
- Remove files when you want to unlock them
- This is a living document - update as needed
