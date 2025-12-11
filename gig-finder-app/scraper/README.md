# GigFinder Scrapers

This directory contains scripts to ingest events from local Edinburgh venues.

## Scrapers

### 1. Leith Depot (`ingest-leith.js`)
- **Source:** `leithdepot.com/events`
- **Technique:** `fetch` + `cheerio` (Custom HTML scraping)
- **Status:** ✅ Active

### 2. Sneaky Pete's (`ingest-sneaky.js`)
- **Source:** `sneakypetes.co.uk/feed` (RSS)
- **Technique:** RSS XML Parsing
- **Status:** ✅ Active

### 3. The Banshee Labyrinth (`ingest-banshee.js`)
- **Source:** `thebansheelabyrinth.com/cinema` (Calendar page)
- **Technique:** `fetch` + `cheerio` (Custom HTML scraping)
- **Status:** ✅ Active

### 4. Stramash (`ingest-stramash.js`)
- **Source:** `stramashedinburgh.com/events/feed` (RSS + Crawler)
- **Technique:** Hybrid. Gets links from RSS, checks Schema.org JSON-LD data on page for dates.
- **Status:** ✅ Active

## Usage
Run scraping manually:

```bash
node scraper/ingest-leith.js
node scraper/ingest-sneaky.js
node scraper/ingest-stramash.js
```

## Maintenance
- **Cleaning DB:** To remove all scraper data (user_id='scraper_v1' etc), run `node scraper/clean-db.js`.
- **Database:** Ensure `.env.local` contains valid `POSTGRES_URL`.

## Notes
- **TicketWeb/Ticketmaster:** Protected by bot detection. Use Skiddle API for these venues.
- **Wix Sites (Bannermans):** Hard to scrape. Use Skiddle.
