/**
 * API Route Constants
 * 
 * Centralized definition of all API endpoints
 * Prevents typos and makes refactoring easier
 */

export const API_ROUTES = {
    // Events
    EVENTS: {
        BASE: '/api/events',
        BY_ID: (id: string | number) => `/api/events/${id}`,
        USER: '/api/events/user',
        USER_BY_ID: (id: string | number) => `/api/events/user?id=${id}`,
        MANUAL: '/api/events/manual',
    },

    // Bookings
    BOOKINGS: {
        BASE: '/api/bookings',
        BY_EVENT: (eventId: string | number) => `/api/bookings?eventId=${eventId}`,
        MY_BOOKINGS: '/api/bookings/my-bookings',
        EMAIL: '/api/bookings/email',
        SCAN: '/api/bookings/scan',
        REFUND: '/api/bookings/refund',
    },

    // Venues
    VENUES: {
        BASE: '/api/venues',
        BY_ID: (id: string | number) => `/api/venues/${id}`,
    },

    // Admin (for future use)
    ADMIN: {
        SCRAPE: '/api/admin/scrape',
        LOGIN: '/api/admin/login',
    },
} as const;

/**
 * Storage Keys for localStorage/sessionStorage
 */
export const STORAGE_KEYS = {
    DRAFT_EVENT: 'GIGFINDER_DRAFT_EVENT',
    USER_PREFERENCES: 'GIGFINDER_USER_PREFS',
    SEARCH_HISTORY: 'GIGFINDER_SEARCH_HISTORY',
} as const;

/**
 * Query Parameter Keys
 */
export const QUERY_PARAMS = {
    KEYWORD: 'keyword',
    LOCATION: 'location',
    MIN_DATE: 'minDate',
    GENRE: 'genre',
    BUDGET: 'budget',
    VENUE_SIZE: 'venueSize',
    POSTCODE: 'postcode',
    DISTANCE: 'distance',
} as const;
