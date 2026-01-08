# Direct Event Links - Implementation Plan

## Overview
Create shareable event detail pages at `/gigfinder/event/[id]` to allow users to link directly to specific gigs for social media sharing and marketing.

## Current State
- Events are only viewable in the results list
- No way to share a specific event
- Workaround: Use keyword search (`?keyword=screamin`)

## Requirements

### 1. Event Detail Page (`/app/gigfinder/event/[id]/page.tsx`)
**Features:**
- Display full event information
- Show verification badge (✓ Verified or ⚠ Community Post)
- Booking button (if internal ticketing enabled)
- External ticket link (if available)
- Venue information
- Event description
- Date, time, price
- Event image
- Share buttons (copy link, social media)

**SEO Requirements:**
- Dynamic meta tags (title, description)
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD for events)

### 2. API Endpoint (`/app/api/events/[id]/route.ts`)
**Purpose:** Fetch single event by ID
**Returns:**
- Event data with venue information
- Verification status
- All fields needed for display

### 3. Update GigCard Component
**Add:** Click handler to navigate to event detail page
**Options:**
- Click entire card → detail page
- OR add "View Details" button
- Keep existing "Book Now" / "Buy Tickets" functionality

### 4. Results Page Enhancement (Optional)
**Add:** Support for `?eventId=993` parameter
**Behavior:** If eventId param exists, scroll to and highlight that event

## Technical Implementation

### File Structure
```
app/gigfinder/event/[id]/
  └── page.tsx          # Event detail page component

app/api/events/[id]/
  └── route.ts          # API endpoint for single event
```

### Data Flow
1. User clicks event card or shares link
2. Navigate to `/gigfinder/event/[id]`
3. Page fetches event data from `/api/events/[id]`
4. Display event with full details
5. User can book/buy tickets or share

### SEO Meta Tags Example
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const event = await fetchEvent(params.id);
  
  return {
    title: `${event.name} at ${event.venue} | GigFinder`,
    description: event.description || `${event.name} on ${event.date}`,
    openGraph: {
      title: event.name,
      description: event.description,
      images: [event.imageUrl],
      type: 'event',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.name,
      description: event.description,
      images: [event.imageUrl],
    },
  };
}
```

## Estimated Effort
- API endpoint: 30 minutes
- Event detail page: 1.5 hours
- GigCard updates: 30 minutes
- SEO/meta tags: 30 minutes
- Testing: 30 minutes
**Total: 3 hours**

## Testing Checklist
- [ ] Event detail page loads correctly
- [ ] All event data displays properly
- [ ] Verification badge shows correctly
- [ ] Booking/ticketing buttons work
- [ ] Share link copies correctly
- [ ] SEO meta tags render
- [ ] Social media previews work (Twitter, Facebook)
- [ ] 404 handling for invalid event IDs
- [ ] Mobile responsive design

## Future Enhancements
- QR code for event sharing
- Add to calendar functionality
- Related events section
- Event analytics (view count)
