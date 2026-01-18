# 🚀 API Client Library

Production-ready, type-safe API client for the GigFinder application.

## 📁 Structure

```
lib/
├── api-client.ts       # Main API client class
├── api-types.ts        # TypeScript types for requests/responses
├── api-routes.ts       # API endpoint constants
├── index.ts            # Barrel export
└── errors/
    └── ApiError.ts     # Custom error class
```

## 🎯 Features

- ✅ **Type-Safe**: Full TypeScript support with generics
- ✅ **Error Handling**: Custom `ApiError` class with user-friendly messages
- ✅ **Timeout Support**: Configurable request timeouts (default: 30s)
- ✅ **Retry Logic**: Optional automatic retries for failed requests
- ✅ **Centralized Routes**: All API endpoints defined as constants
- ✅ **Hooks**: Request/response/error interceptors
- ✅ **Singleton Pattern**: Single instance shared across app

## 📖 Usage

### Basic Import

```typescript
import { api } from '@/lib';
```

### Events API

```typescript
// Search events
const { events } = await api.events.search({
    location: 'Edinburgh',
    genre: 'rock_blues_punk',
    budget: '20',
});

// Get event by ID
const event = await api.events.getById(123);

// Get user's events
const { events } = await api.events.getUserEvents();

// Create event
const { event, message } = await api.events.create({
    name: 'My Gig',
    venue: 'The Venue',
    date: '2026-02-01',
    time: '20:00',
    price: 'Free',
    // ... other fields
});

// Update event
const { event, message } = await api.events.update(123, {
    name: 'Updated Name',
});

// Delete event
const { message } = await api.events.deleteUserEvent(123);
```

### Bookings API

```typescript
// Get bookings for event
const { bookings } = await api.bookings.getByEventId(123);

// Get user's bookings
const { bookings } = await api.bookings.getMyBookings();

// Add guest to list
const { booking, message } = await api.bookings.create({
    eventId: 123,
    name: 'John Doe',
    email: 'john@example.com',
});

// Send email to all guests
const { message, sent } = await api.bookings.sendEmail({
    eventId: 123,
    subject: 'Event Update',
    message: 'See you tonight!',
});

// Check in guest (QR scan)
const { booking, message } = await api.bookings.checkIn({
    bookingId: 456,
    eventId: 123,
});

// Request refund
const { message } = await api.bookings.requestRefund(456);
```

### Venues API

```typescript
// Get all venues
const { venues } = await api.venues.getAll();

// Get venue by ID
const { venue } = await api.venues.getById(123);
```

## 🛡️ Error Handling

The API client throws `ApiError` instances for failed requests:

```typescript
import { api, ApiError } from '@/lib';

try {
    const event = await api.events.getById(999);
} catch (error) {
    if (error instanceof ApiError) {
        // Access error details
        console.log(error.status);        // 404
        console.log(error.message);       // "Event not found"
        console.log(error.getUserMessage()); // User-friendly message
        
        // Check error type
        if (error.is(404)) {
            // Handle not found
        }
        
        if (error.isClientError()) {
            // Handle 4xx errors
        }
        
        if (error.isServerError()) {
            // Handle 5xx errors
        }
    }
}
```

### User-Friendly Error Messages

`ApiError.getUserMessage()` provides user-friendly messages:

- **400**: "Invalid request. Please check your input."
- **401**: "You must be signed in to perform this action."
- **403**: "You do not have permission to perform this action."
- **404**: "The requested resource was not found."
- **500**: "A server error occurred. Please try again later."

## 🔧 Configuration

### Custom Configuration

```typescript
import { ApiClient } from '@/lib';

const customApi = new ApiClient({
    baseUrl: 'https://api.example.com',
    timeout: 10000,        // 10 seconds
    retries: 3,            // Retry 3 times
    retryDelay: 2000,      // Wait 2s between retries
    
    // Hooks
    onRequest: (url, options) => {
        console.log('Request:', url);
    },
    
    onResponse: (response) => {
        console.log('Response:', response.status);
    },
    
    onError: (error) => {
        console.error('Error:', error);
    },
});
```

### Request Options

```typescript
// Custom timeout for specific request
const event = await api.events.getById(123, {
    timeout: 5000, // 5 seconds
});

// Enable retry for specific request
const events = await api.events.search(params, {
    retry: true,
    retries: 3,
});
```

## 📝 Type Safety

All methods are fully typed:

```typescript
import type { Event, CreateEventRequest } from '@/lib';

// TypeScript knows the shape of the response
const event: Event = await api.events.getById(123);

// TypeScript validates request data
const request: CreateEventRequest = {
    name: 'My Gig',
    venue: 'The Venue',
    date: '2026-02-01',
    time: '20:00',
    price: 'Free',
};

const { event, message } = await api.events.create(request);
```

## 🎨 Constants

Use constants instead of magic strings:

```typescript
import { API_ROUTES, STORAGE_KEYS, QUERY_PARAMS } from '@/lib';

// API routes
console.log(API_ROUTES.EVENTS.BASE);           // '/api/events'
console.log(API_ROUTES.EVENTS.BY_ID(123));     // '/api/events/123'

// Storage keys
localStorage.setItem(STORAGE_KEYS.DRAFT_EVENT, JSON.stringify(draft));

// Query params
const params = new URLSearchParams();
params.set(QUERY_PARAMS.LOCATION, 'Edinburgh');
```

## 🧪 Testing

The API client is designed to be easily testable:

```typescript
import { ApiClient } from '@/lib';

// Create mock instance for testing
const mockApi = new ApiClient({
    onRequest: (url, options) => {
        // Intercept requests in tests
    },
});
```

## 🚀 Migration Guide

### Before (Direct fetch)

```typescript
const res = await fetch('/api/events/user');
if (res.ok) {
    const data = await res.json();
    setEvents(data.events);
} else {
    console.error('Failed to fetch');
}
```

### After (API client)

```typescript
try {
    const { events } = await api.events.getUserEvents();
    setEvents(events);
} catch (error) {
    if (error instanceof ApiError) {
        setError(error.getUserMessage());
    }
}
```

## 📊 Benefits

- ✅ **Consistent error handling** across all API calls
- ✅ **Type safety** prevents runtime errors
- ✅ **Centralized configuration** (timeout, retries, etc.)
- ✅ **Easier testing** with interceptors
- ✅ **Better developer experience** with autocomplete
- ✅ **Easier refactoring** (change endpoint once, not 16 times)
- ✅ **User-friendly error messages** out of the box

## 🎯 Next Steps

1. ✅ API Client created
2. ⏳ Migrate My Gigs page
3. ⏳ Migrate Event Detail page
4. ⏳ Migrate remaining pages

See `API_MIGRATION_PLAN.md` for full migration roadmap.
