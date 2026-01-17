# Search API Refactoring Summary

**Date**: 2026-01-17
**Objective**: Remove Skiddle scraping logic from public search API

## Changes Made

### File: `/app/api/events/route.ts`

**Before**: 362 lines (with Skiddle integration)
**After**: 142 lines (database-only)
**Reduction**: 220 lines (60% smaller)

### Removed:
1. ✅ Skiddle API integration (lines 155-361)
2. ✅ Venue processing loop with `findOrCreateVenue()` calls
3. ✅ Event processing loop with `findOrCreateEvent()` calls
4. ✅ Unused imports:
   - `getVenueCapacity`
   - `findOrCreateVenue`
   - `findOrCreateEvent`
   - `VenueData` type
   - `EventData` type
5. ✅ `SKIDDLE_API_BASE` constant
6. ✅ `SkiddleEvent` interface
7. ✅ `DISABLE_SKIDDLE` environment variable check

### Kept:
1. ✅ Database query logic (lines 65-153)
2. ✅ Rate limiting
3. ✅ Search parameter parsing
4. ✅ `mapGenreToVibe` import (needed for database events)
5. ✅ Event formatting and transformation

### Added:
1. ✅ Documentation header explaining separation of concerns
2. ✅ Cache headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=120`)
3. ✅ `source: 'database'` in response

## Files Unchanged

### `/app/api/admin/scrape-skiddle/route.ts`
- ✅ All scraping logic intact
- ✅ Still imports `findOrCreateVenue` and `findOrCreateEvent`
- ✅ Admin authentication still enforced
- ✅ Skiddle API integration preserved

### `/lib/venue-utils.ts`
- ✅ Complete file unchanged
- ✅ `findOrCreateVenue()` function available for admin scraper

### `/lib/event-utils.ts`
- ✅ Complete file unchanged
- ✅ `findOrCreateEvent()` function available for admin scraper

## Test Results

### API Tests (Manual)
- ✅ `/api/events?location=Edinburgh` → 313 events from database
- ✅ Response includes `source: 'database'`
- ✅ No scraping logs in terminal
- ✅ Fast response time (<100ms)

### Wizard Tests (Automated)
- ✅ All 7 wizard journey tests passed
- ✅ Search flow works end-to-end
- ✅ Results page displays correctly

## Performance Improvements

### Before:
- Search time: 3-5 seconds (waiting for Skiddle API)
- Database writes: 100+ INSERT attempts per search
- Terminal spam: Venue/event creation logs
- Rate limit risk: High (external API calls)

### After:
- Search time: <100ms (database query only)
- Database writes: 0 (read-only)
- Terminal spam: None
- Rate limit risk: None (no external calls)

## Architecture

### Search Flow (Public)
```
User → Wizard/QuickSearch → /api/events → Database Query → Results
                                  ↓
                            (Fast, read-only)
```

### Scraping Flow (Admin Only)
```
Admin → Admin Console → /api/admin/scrape-skiddle → Skiddle API → Database Insert
                                      ↓
                              (Isolated, controlled)
```

## Backup

Original file backed up to: `app/api/events/route.ts.backup`

To restore:
```bash
cp app/api/events/route.ts.backup app/api/events/route.ts
```

## Next Steps

1. ✅ Test in browser (manual verification)
2. ⏳ Run full Playwright test suite
3. ⏳ Commit changes
4. ⏳ Deploy to preview environment
5. ⏳ Set up cron job for admin scraper (if needed)

## Notes

- The `mapGenreToVibe` import was kept because it's used for database events (line 133)
- Admin scraper is completely independent and unaffected
- All shared utility functions (`findOrCreateVenue`, `findOrCreateEvent`) remain in `/lib/`
