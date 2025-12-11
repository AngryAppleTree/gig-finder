# GigFinder Backlog

## High Priority

## Medium Priority
- **Fix Stramash Scraper Timeout**: The Stramash scraper currently times out on Vercel even with batching. It requires fetching individual event pages to get the full date/time from JSON-LD, which is too slow for a synchronous API response.
    - *Potential Solutions*:
        - Move to a background job / cron (Vercel Cron).
        - Implement a dedicated scraping service.
        - Rely solely on RSS feed data (approximate dates).

## Low Priority
