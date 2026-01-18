/**
 * API Client Library
 * 
 * Barrel export for easy imports
 */

// Main API client
export { api, ApiClient } from './api-client';

// Types
export type {
    ApiResponse,
    PaginatedResponse,
    Event,
    CreateEventRequest,
    UpdateEventRequest,
    EventSearchParams,
    Booking,
    CreateBookingRequest,
    SendEmailRequest,
    CheckInRequest,
    RefundRequest,
    Venue,
    ApiClientConfig,
    RequestOptions,
} from './api-types';

// Constants
export { API_ROUTES, STORAGE_KEYS, QUERY_PARAMS } from './api-routes';

// Errors
export { ApiError } from './errors/ApiError';
