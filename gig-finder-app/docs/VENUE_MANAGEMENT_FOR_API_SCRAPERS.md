# Venue Management for API Scrapers

This document explains how to use the shared venue utilities when integrating new event APIs (like Ticketmaster, Eventbrite, etc.).

## Overview

The `findOrCreateVenue()` utility automatically:
1. Checks if a venue exists in the database
2. Creates it if it doesn't exist
3. Prepopulates with available data from the API
4. Notifies the admin about new venues
5. Returns the venue ID for use in event creation

## Quick Start

### 1. Import the Utility

```typescript
import { findOrCreateVenue, type VenueData } from '@/lib/venue-utils';
```

### 2. Process Venues from Your API

When you fetch events from an external API, process the venues first:

```typescript
// Example: Processing Ticketmaster events
const ticketmasterEvents = await fetchFromTicketmaster();

for (const event of ticketmasterEvents) {
    // Extract venue data from the API response
    const venueData: VenueData = {
        name: event._embedded.venues[0].name,
        address: event._embedded.venues[0].address?.line1,
        city: event._embedded.venues[0].city?.name,
        postcode: event._embedded.venues[0].postalCode,
        latitude: event._embedded.venues[0].location?.latitude,
        longitude: event._embedded.venues[0].location?.longitude,
        capacity: event._embedded.venues[0].capacity,
        website: event._embedded.venues[0].url
    };

    // Find or create the venue
    const venue = await findOrCreateVenue(venueData, 'ticketmaster');
    
    // Use venue.id when creating the event
    // venue.isNew tells you if it was just created
}
```

### 3. Use the Venue ID

Once you have the venue, use its ID when creating events in your database:

```typescript
await client.query(
    `INSERT INTO events (name, venue_id, date, ...)
     VALUES ($1, $2, $3, ...)`,
    [eventName, venue.id, eventDate, ...]
);
```

## VenueData Interface

```typescript
interface VenueData {
    name: string;           // Required - venue name
    address?: string;       // Optional - street address
    city?: string;          // Optional - city name
    postcode?: string;      // Optional - postal code
    latitude?: number;      // Optional - GPS latitude
    longitude?: number;     // Optional - GPS longitude
    capacity?: number;      // Optional - venue capacity
    website?: string;       // Optional - venue website URL
}
```

**Important:** Only `name` is required. All other fields are optional. If the API doesn't provide a field, just omit it or pass `undefined`.

## Return Value

```typescript
interface VenueResult {
    id: number;             // Database ID of the venue
    name: string;           // Venue name
    capacity: number | null;
    latitude: number | null;
    longitude: number | null;
    city: string | null;
    isNew: boolean;         // true if venue was just created
}
```

## Example: Skiddle Integration

Here's how it's currently used in the Skiddle scraper:

```typescript
// After fetching Skiddle events
const venueMap = new Map<string, number>();

for (const event of skiddleResults) {
    const venueName = event.venue?.name;
    
    // Skip if already processed
    if (!venueName || venueMap.has(venueName.toLowerCase())) {
        continue;
    }

    const venueData: VenueData = {
        name: venueName,
        city: event.venue.town || location,
        latitude: event.venue.latitude ? parseFloat(event.venue.latitude) : undefined,
        longitude: event.venue.longitude ? parseFloat(event.venue.longitude) : undefined,
    };

    const venueResult = await findOrCreateVenue(venueData, 'skiddle');
    venueMap.set(venueName.toLowerCase(), venueResult.id);
    
    if (venueResult.isNew) {
        console.log(`✨ New venue created: ${venueName}`);
    }
}
```

## Batch Processing

For better performance when processing many venues, use `findOrCreateVenues()`:

```typescript
import { findOrCreateVenues } from '@/lib/venue-utils';

const venues: VenueData[] = events.map(event => ({
    name: event.venue.name,
    city: event.venue.city,
    // ... other fields
}));

const venueMap = await findOrCreateVenues(venues, 'ticketmaster');

// Access venues by name
const venue = venueMap.get(venueName.toLowerCase());
```

## Admin Notifications

When a new venue is created, the admin automatically receives an email notification with:
- Venue name
- City
- Capacity (if available)
- Source (e.g., 'skiddle', 'ticketmaster')

This allows the admin to:
- Review new venues
- Add missing information (address, capacity, etc.)
- Verify venue details are correct

## Best Practices

### 1. Deduplicate Venues

Process each unique venue only once per scraper run:

```typescript
const processedVenues = new Set<string>();

for (const event of events) {
    const venueName = event.venue.name.toLowerCase();
    
    if (processedVenues.has(venueName)) {
        continue; // Already processed
    }
    
    await findOrCreateVenue(venueData, 'your-api-name');
    processedVenues.add(venueName);
}
```

### 2. Handle Missing Data Gracefully

Not all APIs provide complete venue information. That's okay:

```typescript
const venueData: VenueData = {
    name: event.venue.name, // Always required
    city: event.venue.city || undefined, // Use undefined for missing data
    latitude: event.venue.lat ? parseFloat(event.venue.lat) : undefined,
    // Don't include fields you don't have
};
```

### 3. Use Descriptive Source Names

The `source` parameter helps identify where venues came from:

```typescript
await findOrCreateVenue(venueData, 'ticketmaster');
await findOrCreateVenue(venueData, 'eventbrite');
await findOrCreateVenue(venueData, 'songkick');
```

### 4. Log New Venues

It's helpful to log when new venues are created:

```typescript
const venue = await findOrCreateVenue(venueData, 'ticketmaster');

if (venue.isNew) {
    console.log(`✨ New venue: ${venue.name} (ID: ${venue.id})`);
}
```

## Updating Existing Venues

If your API provides more complete data than what's in the database, you can update venues:

```typescript
import { updateVenueData } from '@/lib/venue-utils';

// Find or create venue
const venue = await findOrCreateVenue(venueData, 'ticketmaster');

// If we have additional data not in the database, update it
if (!venue.capacity && ticketmasterCapacity) {
    await updateVenueData(venue.id, {
        capacity: ticketmasterCapacity
    });
}
```

## Error Handling

The utility handles errors gracefully:

```typescript
try {
    const venue = await findOrCreateVenue(venueData, 'ticketmaster');
    // Use venue...
} catch (error) {
    console.error(`Failed to process venue ${venueData.name}:`, error);
    // Continue with other venues or handle appropriately
}
```

## Future API Integrations

When adding a new event API:

1. **Create a new API route** (e.g., `/app/api/events/ticketmaster/route.ts`)
2. **Import the venue utility** at the top
3. **Process venues** before creating events
4. **Use venue IDs** when inserting events
5. **Use a unique source name** (e.g., 'ticketmaster', 'eventbrite')

Example structure:

```typescript
// /app/api/events/ticketmaster/route.ts
import { findOrCreateVenue, type VenueData } from '@/lib/venue-utils';

export async function GET(request: NextRequest) {
    // 1. Fetch events from Ticketmaster API
    const events = await fetchTicketmasterEvents();
    
    // 2. Process venues
    const venueMap = new Map();
    for (const event of events) {
        const venueData: VenueData = { /* ... */ };
        const venue = await findOrCreateVenue(venueData, 'ticketmaster');
        venueMap.set(event.venue.name.toLowerCase(), venue.id);
    }
    
    // 3. Create events using venue IDs
    // ...
}
```

## Database Schema

For reference, the venues table structure:

```sql
CREATE TABLE venues (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    address TEXT,
    city VARCHAR(100),
    postcode VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    capacity INTEGER,
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);
```

Events reference venues via `venue_id`:

```sql
ALTER TABLE events 
ADD COLUMN venue_id INTEGER REFERENCES venues(id);
```
