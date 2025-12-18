# Event Management for API Scrapers

This document explains how to use the shared event utilities when integrating event APIs (like Ticketmaster, Eventbrite, etc.) to persist events to the database.

## Overview

The `findOrCreateEvent()` utility automatically:
1. Checks if an event exists in the database (by fingerprint)
2. Creates it if it doesn't exist
3. Prepopulates with available data from the API
4. Leaves fields blank if data isn't available
5. Returns the event ID for use in responses
6. **No admin notification** (events are auto-approved)

## Why Persist Events?

Persisting Skiddle (and other API) events to the database provides several benefits:

1. **Better filtering** - Budget and other filters work on actual stored data
2. **Faster responses** - No need to call external APIs every time
3. **Deduplication** - Events are deduplicated at database level
4. **Consistency** - All events (manual and scraped) use the same data structure
5. **Price data** - Numeric `ticket_price` field enables accurate budget filtering

## Quick Start

### 1. Import the Utility

```typescript
import { findOrCreateEvent, type EventData } from '@/lib/event-utils';
```

### 2. Process Events from Your API

When you fetch events from an external API, persist them to the database:

```typescript
// Example: Processing Ticketmaster events
const ticketmasterEvents = await fetchFromTicketmaster();

for (const event of ticketmasterEvents) {
    // Get or create the venue first
    const venue = await findOrCreateVenue(venueData, 'ticketmaster');
    
    // Prepare event data
    const eventData: EventData = {
        name: event.name,
        venueId: venue.id,
        date: event.dates.start.localDate,
        time: event.dates.start.localTime,
        genre: event.classifications?.[0]?.genre?.name,
        description: event.info || event.pleaseNote,
        price: event.priceRanges?.[0]?.min ? `£${event.priceRanges[0].min}` : 'TBA',
        ticketPrice: event.priceRanges?.[0]?.min,
        ticketUrl: event.url,
        imageUrl: event.images?.[0]?.url,
        source: 'ticketmaster'
    };

    // Persist to database
    const persistedEvent = await findOrCreateEvent(eventData);
    
    if (persistedEvent.isNew) {
        console.log(`✨ New event created: ${persistedEvent.name}`);
    }
}
```

## EventData Interface

```typescript
interface EventData {
    name: string;           // Required - event name
    venueId: number;        // Required - venue database ID
    date: string;           // Required - ISO date (YYYY-MM-DD)
    time?: string;          // Optional - time (HH:MM format)
    genre?: string;         // Optional - genre/category
    description?: string;   // Optional - event description
    price?: string;         // Optional - display price (e.g., "£15.00", "Free")
    ticketPrice?: number;   // Optional - numeric price for filtering
    ticketUrl?: string;     // Optional - link to buy tickets
    imageUrl?: string;      // Optional - event image URL
    source: string;         // Required - API source ('skiddle', 'ticketmaster', etc.)
}
```

**Important:** 
- `name`, `venueId`, `date`, and `source` are required
- All other fields are optional
- If the API doesn't provide a field, just omit it or pass `undefined`

## Return Value

```typescript
interface EventResult {
    id: number;             // Database ID of the event
    name: string;           // Event name
    venueId: number;        // Venue database ID
    date: Date;             // Event date
    isNew: boolean;         // true if event was just created
}
```

## Deduplication

Events are deduplicated using a **fingerprint**:

```
fingerprint = date|venue_id|event_name
```

Example: `2025-12-20|venue_42|the_beatles_tribute`

- If an event with the same fingerprint exists, it returns the existing event
- This prevents duplicate events from the same source
- Manual events take priority over scraped events

## Example: Skiddle Integration

Here's how it's currently used in the Skiddle scraper:

```typescript
// After processing venues
for (const event of skiddleResults) {
    // Get venue ID
    const venueId = venueMap.get(event.venue.name.toLowerCase());
    
    // Prepare event data
    const eventData: EventData = {
        name: event.eventname,
        venueId: venueId,
        date: event.date,
        time: event.openingtimes?.doorsopen,
        genre: event.genres?.[0]?.name,
        description: event.description,
        price: priceText,
        ticketPrice: priceVal,
        ticketUrl: event.link,
        imageUrl: event.imageurl,
        source: 'skiddle'
    };

    // Persist to database
    const persistedEvent = await findOrCreateEvent(eventData);
    
    // Use persistedEvent.id for display
}
```

## Price Handling

The system handles two price fields:

### 1. `price` (Display Price)
- String field for display purposes
- Examples: "£15.00", "Free", "£10-£20", "TBA"
- Shown to users in the UI

### 2. `ticketPrice` (Numeric Price)
- Number field for filtering
- Used by budget filter
- Extracted from display price if not provided

**Automatic Price Parsing:**

If you only provide `price`, the system will try to extract `ticketPrice`:

```typescript
const eventData = {
    price: "£15.00",
    // ticketPrice will be auto-extracted as 15.00
};
```

## Batch Processing

For better performance when processing many events:

```typescript
import { findOrCreateEvents } from '@/lib/event-utils';

const events: EventData[] = apiEvents.map(event => ({
    name: event.name,
    venueId: venueMap.get(event.venue.toLowerCase()),
    date: event.date,
    source: 'ticketmaster',
    // ... other fields
}));

const results = await findOrCreateEvents(events);

console.log(`Created ${results.filter(r => r.isNew).length} new events`);
```

## Updating Existing Events

If your API provides more complete data than what's in the database:

```typescript
import { updateEventData } from '@/lib/event-utils';

// Find or create event
const event = await findOrCreateEvent(eventData);

// If we have additional data, update it
if (!event.isNew && ticketmasterImageUrl) {
    await updateEventData(event.id, {
        imageUrl: ticketmasterImageUrl
    });
}
```

## Cleanup Old Events

Remove events that have already happened:

```typescript
import { deleteOldEvents } from '@/lib/event-utils';

// Delete events older than today
const deletedCount = await deleteOldEvents(new Date());

// Delete only Skiddle events older than today
const deletedCount = await deleteOldEvents(new Date(), 'skiddle');
```

## Best Practices

### 1. Process Venues First

Always create/find venues before creating events:

```typescript
// 1. Process venues
const venueMap = new Map();
for (const event of apiEvents) {
    const venue = await findOrCreateVenue(venueData, 'ticketmaster');
    venueMap.set(event.venue.name.toLowerCase(), venue.id);
}

// 2. Process events
for (const event of apiEvents) {
    const venueId = venueMap.get(event.venue.name.toLowerCase());
    const eventData = { venueId, /* ... */ };
    await findOrCreateEvent(eventData);
}
```

### 2. Handle Missing Data Gracefully

```typescript
const eventData: EventData = {
    name: event.name,
    venueId: venueId,
    date: event.date,
    time: event.time || undefined, // Use undefined for missing data
    description: event.description || undefined,
    source: 'ticketmaster'
};
```

### 3. Use Descriptive Source Names

```typescript
await findOrCreateEvent({ source: 'ticketmaster', /* ... */ });
await findOrCreateEvent({ source: 'eventbrite', /* ... */ });
await findOrCreateEvent({ source: 'songkick', /* ... */ });
```

### 4. Log New Events

```typescript
const event = await findOrCreateEvent(eventData);

if (event.isNew) {
    console.log(`✨ New event: ${event.name} on ${event.date}`);
}
```

### 5. Error Handling

```typescript
try {
    const event = await findOrCreateEvent(eventData);
    // Use event...
} catch (error) {
    console.error(`Failed to persist event ${eventData.name}:`, error);
    // Continue with other events or handle appropriately
}
```

## Future API Integrations

When adding a new event API:

1. **Import the utilities**
2. **Process venues first** using `findOrCreateVenue()`
3. **Process events** using `findOrCreateEvent()`
4. **Use unique source name** (e.g., 'ticketmaster', 'eventbrite')

Example structure:

```typescript
// /app/api/events/ticketmaster/route.ts
import { findOrCreateVenue } from '@/lib/venue-utils';
import { findOrCreateEvent, type EventData } from '@/lib/event-utils';

export async function GET(request: NextRequest) {
    // 1. Fetch events from Ticketmaster API
    const events = await fetchTicketmasterEvents();
    
    // 2. Process venues
    const venueMap = new Map();
    for (const event of events) {
        const venue = await findOrCreateVenue(venueData, 'ticketmaster');
        venueMap.set(event.venue.name.toLowerCase(), venue.id);
    }
    
    // 3. Process and persist events
    for (const event of events) {
        const venueId = venueMap.get(event.venue.name.toLowerCase());
        const eventData: EventData = {
            name: event.name,
            venueId: venueId!,
            date: event.date,
            ticketPrice: event.price,
            source: 'ticketmaster',
            // ... other fields
        };
        
        await findOrCreateEvent(eventData);
    }
    
    // 4. Return events from database
    // ...
}
```

## Database Schema

For reference, the events table structure includes:

```sql
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    venue_id INTEGER REFERENCES venues(id),
    date TIMESTAMP NOT NULL,
    genre VARCHAR(50),
    description TEXT,
    price VARCHAR(50),
    ticket_price DECIMAL(10, 2),  -- Numeric price for filtering
    price_currency VARCHAR(3) DEFAULT 'GBP',
    ticket_url TEXT,
    image_url TEXT,
    user_id VARCHAR(255),
    fingerprint VARCHAR(255) UNIQUE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Benefits

✅ **Centralized event data** - All events stored in one place  
✅ **Better filtering** - Budget filter works on numeric `ticket_price`  
✅ **Faster responses** - No repeated API calls  
✅ **Automatic deduplication** - Fingerprint-based  
✅ **Future-proof** - Works with any event API  
✅ **No admin spam** - Events auto-approved, no notifications
