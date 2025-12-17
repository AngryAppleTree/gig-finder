export interface Gig {
    id: string | number;
    name: string;
    venue: string;
    location?: string; // Sometimes location, sometimes venue
    date: string;       // Formatted String (e.g. "Fri 12 Dec")
    time?: string;
    dateObj?: string;   // ISO String (YYYY-MM-DD)
    description?: string;
    imageUrl?: string;  // Correct field from API
    image?: string;     // Fallback?
    ticketUrl?: string | null;
    isInternalTicketing?: boolean;
    town?: string;
    postcode?: string;
    price?: string;
    distance?: number;
    vibe?: string; // For client-side filtering
    capacity?: number; // For client-side filtering
    priceVal?: number; // For client-side filtering
    source?: string; // 'manual' or 'skiddle' - determines if internal ticketing is allowed
}
