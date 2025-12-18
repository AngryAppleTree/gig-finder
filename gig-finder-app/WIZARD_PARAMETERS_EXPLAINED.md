# GigFinder Wizard Parameters Explained

This document explains all the parameters collected by the GigFinder wizard and how they are used to filter and find gigs.

## Overview

The GigFinder wizard collects user preferences through a 4-step journey, plus an optional "Quick Search" feature. These parameters are then used to filter events from the database and external APIs (like Skiddle) to provide personalized gig recommendations.

---

## Parameters Collected

### 1. **keyword** 
**Source:** Quick Search only  
**Type:** String (optional)  
**User Question:** N/A (Quick Search input field: "Artist or Venue")

**Purpose:**  
Allows users to search for specific artists, bands, or venue names directly without going through the wizard steps.

**How it's used:**
- Passed to the `/api/events` endpoint as a query parameter
- The API searches for matching event names, artist names, or venue names
- This is a text-based search that looks for partial matches

**Example values:**
- `"The Beatles"`
- `"King Tut's"`
- `"jazz"`

---

### 2. **location**
**Source:** Derived from postcode or Quick Search  
**Type:** String  
**User Question:** N/A (derived automatically)

**Purpose:**  
Specifies the primary city/area to search for gigs. This is automatically determined based on the user's postcode.

**How it's used:**
- Derived from the postcode prefix (e.g., `EH` → Edinburgh, `G` → Glasgow)
- Defaults to `"Edinburgh"` if no postcode is provided
- Passed to the Skiddle API to fetch events in that location
- Used as the base location for distance calculations

**Example values:**
- `"Edinburgh"` (default)
- `"Glasgow"` (if postcode starts with 'G')

**Code reference (Wizard.tsx, lines 145-147):**
```typescript
let location = 'Edinburgh';
if (userChoices.postcode?.startsWith('G')) location = 'Glasgow';
params.append('location', location);
```

---

### 3. **minDate**
**Source:** Step 1 - "When do you want to go?" OR Quick Search  
**Type:** String (ISO date format: YYYY-MM-DD)  
**User Question:** "When do you want to go?"

**Purpose:**  
Filters events to only show gigs happening on or after a specific date.

**How it's used:**
- Passed to the `/api/events` endpoint
- The API filters out any events with dates before this value
- Ensures users only see upcoming gigs relevant to their timeframe

**User options in wizard:**
- **"Tonight"** → Uses current date
- **"This Weekend"** → Uses the upcoming weekend date
- **"This Week"** → Uses current date (shows all gigs this week)
- **"Pick a Date"** → User selects a custom date via date picker
- **"I Don't Know"** → No date filter applied (shows all future gigs)

**Example values:**
- `"2025-12-20"` (custom date)
- `"2025-12-18"` (tonight)

**Code reference (Wizard.tsx, line 151):**
```typescript
if (userChoices.customDate) params.append('minDate', userChoices.customDate);
```

---

### 4. **genre**
**Source:** Not collected by wizard (future feature)  
**Type:** String  
**User Question:** N/A (not currently in wizard)

**Purpose:**  
Filters events by music genre/vibe category.

**How it's used:**
- Can be passed as a URL parameter to the results page
- Filters gigs based on their `vibe` property
- The system maps Skiddle's genre data to internal "vibe" categories

**Available vibe categories:**
- `rock_blues_punk`
- `indie_alt`
- `metal`
- `pop`
- `electronic`
- `hiphop`
- `acoustic`
- `classical`
- `surprise` (no filter - shows all genres)

**Example values:**
- `"rock_blues_punk"`
- `"electronic"`
- `"indie_alt"`

**Code reference (results/page.tsx, lines 108-114):**
```typescript
// 3. Genre/Vibe filtering
if (genre && genre !== 'surprise') {
    transformedGigs = transformedGigs.filter(gig => {
        if (!gig.vibe) return true;
        return gig.vibe === genre;
    });
}
```

**Note:** While genre filtering exists in the codebase, it's not currently part of the wizard flow. It can be added as a future enhancement.

---

### 5. **budget**
**Source:** Step 4 - "What's your budget?"  
**Type:** String (category)  
**User Question:** "What's your budget?"

**Purpose:**  
Filters events based on ticket price to match the user's spending preferences.

**How it's used:**
- Applied as a client-side filter on the results page
- Compares the event's `priceVal` (numeric price) against budget ranges
- Events without price information are included by default

**User options:**
- **"free"** → Free to £10 (priceVal === 0)
- **"low"** → £10 - £20 (priceVal > 0 && priceVal <= 20)
- **"mid"** → £20 - £50 (priceVal > 20 && priceVal <= 50)
- **"high"** → £50+ (priceVal > 50)
- **"any"** → No price filter

**Example values:**
- `"free"`
- `"mid"`
- `"any"`

**Code reference (results/page.tsx, lines 117-126):**
```typescript
// 4. Budget filtering
if (budget && budget !== 'any') {
    transformedGigs = transformedGigs.filter(gig => {
        if (gig.priceVal === undefined) return true;
        if (budget === 'free') return gig.priceVal === 0;
        if (budget === 'low') return gig.priceVal > 0 && gig.priceVal <= 20;
        if (budget === 'mid') return gig.priceVal > 20 && gig.priceVal <= 50;
        if (budget === 'high') return gig.priceVal > 50;
        return true;
    });
}
```

---

### 6. **venueSize**
**Source:** Step 3 - "What venue size?"  
**Type:** String (category)  
**User Question:** "What venue size?"

**Purpose:**  
Filters events based on venue capacity to match the user's preference for intimate or large-scale shows.

**How it's used:**
- Applied as a client-side filter on the results page
- Compares the **venue's capacity from the venues table** against size ranges
- Events at venues without capacity information are included by default (will improve as venues are added to database)

**User options:**
- **"small"** → Small & Cosy (Up to 100 capacity)
- **"medium"** → Quite Big (100 - 5,000 capacity)
- **"huge"** → Proper Huge (Over 5,000 capacity) - **Triggers rejection screen!**
- **"any"** → No size filter

**Example values:**
- `"small"`
- `"medium"`
- `"any"`

**Special behavior:**
If user selects **"huge"**, the wizard shows a humorous rejection screen:
> "GET TAE FUCK - We only do small gigs! We prefer sweaty, smelly cellars."

**Important Note:**
This filter uses **venue capacity from the venues table**, not event-specific capacity. As venues are added to the database (either manually or via API scrapers), the filtering accuracy improves. New venues from Skiddle and other APIs are automatically added to the venues table with available capacity data, and admins are notified to fill in missing information.

**Code reference (results/page.tsx, lines 97-122):**
```typescript
// 2. Venue size filtering (uses capacity from venues table)
if (venueSize && venueSize !== 'any') {
    transformedGigs = transformedGigs.filter(gig => {
        // Parse capacity - could be string or number from API
        let capacityNum: number | null = null;
        
        if (typeof gig.capacity === 'number') {
            capacityNum = gig.capacity;
        } else if (typeof gig.capacity === 'string' && gig.capacity !== 'Unknown') {
            const parsed = parseInt(gig.capacity);
            if (!isNaN(parsed)) {
                capacityNum = parsed;
            }
        }
        
        // If venue has no capacity data, include it (will improve as venues are added)
        if (capacityNum === null) return true;
        
        // Apply size filters based on venue capacity
        if (venueSize === 'small') return capacityNum <= 100;
        if (venueSize === 'medium') return capacityNum > 100 && capacityNum <= 5000;
        if (venueSize === 'huge') return capacityNum > 5000;
        
        return true;
    });
}
```

---

### 7. **postcode**
**Source:** Step 2 - "How far will you travel?"  
**Type:** String (UK postcode format)  
**User Question:** "Enter your postcode (first half)"

**Purpose:**  
Provides the user's location for distance-based filtering. Only the first part of the postcode is needed (e.g., "EH1", "G2").

**How it's used:**
- Converted to coordinates using the `postcodeCoordinates` lookup table
- Used to calculate distances to each venue
- Works in conjunction with the `distance` parameter to filter nearby gigs
- Also determines the primary location (Edinburgh vs Glasgow)

**User flow:**
1. User selects "Locally" or "Within 100 Miles"
2. Postcode input field appears
3. User enters first part of postcode (e.g., "EH1")
4. User presses Enter or clicks "Next"

**Example values:**
- `"EH1"` (Edinburgh city center)
- `"G2"` (Glasgow city center)
- `"EH8"` (Edinburgh - Newington area)

**Validation:**
- Must be at least 2 characters long
- Automatically converted to uppercase

**Code reference (Wizard.tsx, lines 105-114):**
```typescript
const handlePostcode = (value: string) => {
    setChoices(prev => ({ ...prev, postcode: value.toUpperCase() }));
};
const submitPostcode = () => {
    if (choices.postcode && choices.postcode.length >= 2) {
        nextStep();
    } else {
        alert('Please enter at least the first part of your postcode (e.g., EH1)');
    }
};
```

---

### 8. **distance**
**Source:** Step 2 - "How far will you travel?"  
**Type:** String (category)  
**User Question:** "How far will you travel?"

**Purpose:**  
Defines the maximum distance radius from the user's postcode for gig searching.

**How it's used:**
- Applied as a client-side filter on the results page
- Calculates the distance from user's postcode to each venue
- Filters out venues beyond the specified distance
- Uses the Haversine formula for accurate distance calculation

**User options:**
- **"local"** → Within 10 miles of postcode
- **"100miles"** → Within 100 miles of postcode

**Example values:**
- `"local"`
- `"100miles"`

**Distance calculation:**
The system:
1. Looks up user's postcode coordinates in `postcodeCoordinates`
2. Looks up each venue's coordinates in `venueLocations`
3. Calculates distance using the `calculateDistance()` function
4. Filters gigs based on the distance threshold

**Code reference (results/page.tsx, lines 74-95):**
```typescript
// 1. Distance filtering
if (postcode && distance) {
    const shortPC = postcode.split(' ')[0];
    const userCoords = postcodeCoordinates[shortPC] || postcodeCoordinates['DEFAULT'];

    if (userCoords) {
        transformedGigs = transformedGigs.map(g => {
            const venueData = venueLocations[g.venue];
            if (venueData) {
                const dist = calculateDistance(userCoords.lat, userCoords.lon, venueData.lat, venueData.lon);
                return { ...g, distance: dist };
            }
            return g;
        });

        if (distance === 'local') {
            transformedGigs = transformedGigs.filter(g => g.distance !== undefined && g.distance <= 10);
        } else if (distance === '100miles') {
            transformedGigs = transformedGigs.filter(g => g.distance !== undefined && g.distance <= 100);
        }
    }
}
```

---

## Parameter Flow Summary

### Wizard Journey (4 Steps):

**Step 1: When?**
- Collects: `minDate` (when === 'custom')
- Options: Tonight, This Weekend, This Week, Pick a Date, I Don't Know

**Step 2: Where?**
- Collects: `postcode`, `distance`
- Options: Locally (10 miles), Within 100 Miles
- Derives: `location` (Edinburgh or Glasgow)

**Step 3: Venue Size?**
- Collects: `venueSize`
- Options: Small & Cosy, Quite Big, Proper Huge, Any Size
- Special: "Proper Huge" triggers rejection screen

**Step 4: Budget?**
- Collects: `budget`
- Options: Free-£10, £10-£20, £20-£50, £50+, Any Price
- Action: Triggers search and navigation to results page

### Quick Search (Alternative Path):
- Collects: `keyword`, `location` (city), `minDate`
- Bypasses wizard steps
- Directly navigates to results page

---

## How Parameters Are Passed

### URL Structure:
```
/gigfinder/results?location=Edinburgh&minDate=2025-12-20&postcode=EH1&distance=local&venueSize=small&budget=mid
```

### API Call Structure:
```
/api/events?keyword=jazz&location=Edinburgh&minDate=2025-12-20
```

---

## Filter Application Order

1. **API-level filters** (server-side):
   - `keyword` - searches event/artist/venue names
   - `location` - fetches events in specified city
   - `minDate` - excludes past events

2. **Client-side filters** (results page):
   - `distance` + `postcode` - filters by proximity
   - `venueSize` - filters by capacity
   - `genre` - filters by music vibe
   - `budget` - filters by ticket price

---

## Data Sources

- **Skiddle API**: External events from Skiddle ticketing platform
- **Database**: User-submitted events and manually added gigs
- **Venue Locations**: Hardcoded coordinates in `constants.ts`
- **Postcode Coordinates**: Hardcoded lookup table in `constants.ts`

---

## Future Enhancements

Potential parameters to add to the wizard:
- **Genre/Vibe selection** - Currently exists in code but not in wizard UI
- **Day of week preference** - Filter by specific days
- **Time preference** - Early evening vs late night
- **Accessibility requirements** - Wheelchair access, etc.
- **Age restrictions** - 18+, all ages, etc.
