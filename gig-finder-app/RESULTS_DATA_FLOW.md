# GigFinder Results Data Flow

## Overview
This document explains how the wizard search parameters are used to fetch and filter event data in GigFinder.

---

## Data Flow Diagram

```
┌─────────────┐
│   Wizard    │ User fills out search form
│  (Step 1-5) │
└──────┬──────┘
       │
       │ URL Parameters
       ▼
┌─────────────────────────────────────────────┐
│ /gigfinder/results?keyword=...&location=... │
└──────┬──────────────────────────────────────┘
       │
       │ Extract searchParams
       ▼
┌──────────────────────┐
│  Results Page        │
│  performSearch()     │
└──────┬───────────────┘
       │
       │ API Call: /api/events?keyword=...&location=...&minDate=...
       ▼
┌────────────────────────────────────────────┐
│  /api/events (Server-Side)                 │
│  1. Fetch Manual Events (Database)         │
│  2. Fetch Skiddle Events (External API)    │
│  3. Deduplicate & Merge                    │
│  4. Return Combined Results                │
└──────┬─────────────────────────────────────┘
       │
       │ JSON Response: { events: [...] }
       ▼
┌──────────────────────┐
│  Results Page        │
│  Client-Side Filters │
│  1. Distance         │
│  2. Venue Size       │
│  3. Genre/Vibe       │
│  4. Budget           │
└──────┬───────────────┘
       │
       │ Filtered & Sorted Results
       ▼
┌──────────────────────┐
│  Display GigCards    │
└──────────────────────┘
```

---

## Search Parameters (from Wizard)

### Collected in Wizard:
1. **keyword** - Event name search (Step 1)
2. **location** - City (Step 1) - Default: "Edinburgh"
3. **minDate** - Earliest date (Step 2)
4. **genre** - Music genre/vibe (Step 3)
5. **budget** - Price range (Step 4)
6. **venueSize** - Venue capacity (Step 5)
7. **postcode** - User's postcode (Step 5)
8. **distance** - Distance radius (Step 5)

### URL Format:
```
/gigfinder/results?keyword=jazz&location=Edinburgh&minDate=2025-01-01&genre=jazz&budget=cheap&venueSize=small&postcode=EH1&distance=local
```

---

## API Query (`/api/events`)

### Parameters Sent to API:
- **keyword** - Passed to both DB and Skiddle
- **location** - Used for Skiddle lat/lon lookup
- **minDate** - Passed to Skiddle

### Parameters NOT Sent to API (Client-Side Only):
- **genre** - Filtered client-side
- **budget** - Filtered client-side
- **venueSize** - Filtered client-side
- **postcode** - Used for distance calculation client-side
- **distance** - Filtered client-side

---

## Database Query (Manual Events)

### SQL Query:
```sql
SELECT 
    e.*,
    v.name as venue_name,
    v.capacity as venue_capacity,
    v.latitude as venue_latitude,
    v.longitude as venue_longitude,
    v.city as venue_city,
    v.postcode as venue_postcode,
    v.address as venue_address
FROM events e
LEFT JOIN venues v ON e.venue_id = v.id
WHERE e.date >= CURRENT_DATE
  AND (e.name ILIKE '%keyword%' OR v.name ILIKE '%keyword%')  -- if keyword provided
ORDER BY e.date ASC
```

### Fields Returned:
- **Event fields:** id, name, date, genre, description, price, ticket_url, image_url, is_internal_ticketing, tickets_sold, max_capacity, ticket_price, user_id, fingerprint
- **Venue fields:** venue_name, venue_capacity, venue_latitude, venue_longitude, venue_city, venue_postcode, venue_address
- **NEW:** presale_price, presale_caption

---

## Skiddle API Query

### API Endpoint:
```
https://www.skiddle.com/api/v1/events/search/
```

### Parameters:
- `api_key` - Skiddle API key
- `latitude` - 55.9533 (Edinburgh) or 55.8642 (Glasgow)
- `longitude` - -3.1883 (Edinburgh) or -4.2518 (Glasgow)
- `radius` - 20 miles
- `order` - date
- `limit` - 100
- `eventcode` - LIVE
- `minDate` - If provided
- `maxDate` - If provided
- `g` - Genre (if provided)
- `keyword` - If provided

---

## Data Transformation

### Manual Events → Gig Format:
```javascript
{
    id: e.id,
    name: e.name,
    venue: e.venue_name,
    location: e.venue_name,
    town: e.venue_city,
    coords: { lat: e.venue_latitude, lon: e.venue_longitude },
    capacity: e.venue_capacity,
    dateObj: e.date,
    date: "Fri 20 Dec",  // Formatted
    time: "20:00",       // Extracted from timestamp
    priceVal: 10.00,     // Numeric for filtering
    price: "£10.00",     // Display string
    vibe: "jazz",        // Mapped from genre
    ticketUrl: e.ticket_url,
    description: e.description,
    imageUrl: e.image_url,
    source: "manual",    // or "scraped"
    isInternalTicketing: e.is_internal_ticketing,
    ticketsSold: e.tickets_sold,
    maxCapacity: e.max_capacity,
    ticketPrice: e.ticket_price,
    presale_price: e.presale_price,      // NEW
    presale_caption: e.presale_caption   // NEW
}
```

### Skiddle Events → Gig Format:
```javascript
{
    id: `skiddle_${e.id}`,
    name: e.eventname,
    venue: e.venue.name,
    location: e.venue.name,
    town: e.venue.town,
    coords: { lat: e.venue.latitude, lon: e.venue.longitude },
    capacity: getVenueCapacity(e.venue.name),
    dateObj: e.date,
    date: "Fri 20 Dec",
    time: e.openingtimes.doorsopen,
    priceVal: parseFloat(e.entryprice),
    price: e.entryprice,
    vibe: mapGenreToVibe(e.genres),
    ticketUrl: e.link,
    description: e.description,
    imageUrl: e.imageurl,
    source: "skiddle",
    priority: 3
}
```

---

## Client-Side Filtering (Results Page)

### 1. Distance Filtering
```javascript
if (postcode && distance) {
    // Get user coordinates from postcode
    const userCoords = postcodeCoordinates[postcode.split(' ')[0]];
    
    // Calculate distance to each venue
    gigs = gigs.map(g => ({
        ...g,
        distance: calculateDistance(userCoords, venueCoords)
    }));
    
    // Filter by distance
    if (distance === 'local') {
        gigs = gigs.filter(g => g.distance <= 10);
    } else if (distance === '100miles') {
        gigs = gigs.filter(g => g.distance <= 100);
    }
}
```

### 2. Venue Size Filtering
```javascript
if (venueSize && venueSize !== 'any') {
    gigs = gigs.filter(gig => {
        if (venueSize === 'small') return gig.capacity <= 100;
        if (venueSize === 'medium') return gig.capacity > 100 && gig.capacity <= 5000;
        if (venueSize === 'huge') return gig.capacity > 5000;
        return true;
    });
}
```

### 3. Genre/Vibe Filtering
```javascript
if (genre && genre !== 'surprise') {
    gigs = gigs.filter(gig => gig.vibe === genre);
}
```

### 4. Budget Filtering
```javascript
if (budget && budget !== 'any') {
    gigs = gigs.filter(gig => {
        if (budget === 'free') return gig.priceVal === 0;
        if (budget === 'cheap') return gig.priceVal <= 10;
        if (budget === 'medium') return gig.priceVal > 10 && gig.priceVal <= 30;
        if (budget === 'expensive') return gig.priceVal > 30;
        return true;
    });
}
```

---

## Deduplication Strategy

### Fingerprint Format:
```
{date}|{venue_lowercase}|{event_name_lowercase}
```

### Example:
```
2025-01-20|the banshee labyrinth|jazz night
```

### Process:
1. Manual events create fingerprints
2. Skiddle events are checked against manual fingerprints
3. If fingerprint matches, Skiddle event is skipped
4. This prevents duplicates when same event is in both sources

---

## Priority System

Events are sorted by priority:
- **Priority 1:** Manual events (user-created or scraped)
- **Priority 3:** Skiddle events

Manual events appear first in results.

---

## Key Files

### Frontend:
- `/app/gigfinder/results/page.tsx` - Results page & client-side filtering
- `/components/gigfinder/GigCard.tsx` - Event card display
- `/components/gigfinder/types.ts` - Gig interface
- `/components/gigfinder/constants.ts` - Postcode coords & venue locations

### Backend:
- `/app/api/events/route.ts` - Main events API (DB + Skiddle)
- `/app/api/events/genre-mapping.ts` - Genre → Vibe mapping
- `/app/api/events/venue-capacities.ts` - Venue capacity lookup

### Database:
- `events` table - Manual/scraped events
- `venues` table - Venue details (capacity, coordinates, etc.)

---

## Summary

### Server-Side (API):
- ✅ Keyword search (DB + Skiddle)
- ✅ Location (Skiddle lat/lon)
- ✅ Date range (Skiddle)
- ✅ Fetch all events >= today
- ✅ JOIN with venues for rich data
- ✅ Deduplicate via fingerprints

### Client-Side (Results Page):
- ✅ Distance filtering (postcode + radius)
- ✅ Venue size filtering (capacity)
- ✅ Genre/vibe filtering
- ✅ Budget filtering (price)
- ✅ Sort by distance (if postcode provided)

This hybrid approach keeps the API fast while allowing flexible client-side filtering!
