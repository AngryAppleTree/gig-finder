# Admin Console Implementation Plan

## Objective
Build a secure Admin Console for GigFinder to manage events, trigger scrapers, and oversee data quality.

## Features
1.  **Security**:
    - Protected route `/admin` using Clerk.
    - Role-based access (Restrict to Admin IDs/Emails).
2.  **Event Management**:
    - List all events (Paginated/Filtered).
    - Status indicators (Skiddle vs Manual vs Scraped).
    - Edit Event details.
    - Delete/Hide Events.
3.  **Scraper Control**:
    - UI to trigger `ingest-banshee`, `ingest-sneaky`, etc.
    - View recent scrape status/logs (if possible).
4.  **Manual Entry**:
    - Form to create new events directly in DB.

## Architecture
- **Frontend**: Next.js Pages (Client Components for interactivity).
- **Backend**: API Routes `/api/admin/...` protecting database operations.
- **Styling**: Consistent with main app (Dark mode, vibrant).

## Steps
1.  [x] Setup `/admin` route and Clerk protection.
2.  [x] Create API for fetching *All* events (ignoring date filter?).
3.  [x] Build "Event List" Table component.
4.  [x] Add "Delete" functionality. (Edit pending)
5.  [x] Add "Trigger Scraper" buttons (connecting to server-side execution).
6.  [x] Add "Create Event" form.

## Status
**Completed**. The Admin Console is fully functional and deployed logic is ready. Remember to set `ADMIN_EMAIL` in Vercel.
