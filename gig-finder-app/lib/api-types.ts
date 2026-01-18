/**
 * API Request and Response Types
 * 
 * Centralized type definitions for API interactions
 */

// ============================================================================
// Common Types
// ============================================================================

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// ============================================================================
// Event Types
// ============================================================================

export interface Event {
    id: number;
    name: string;
    venue: string;
    venue_id?: number;
    location: string;
    town?: string;
    date: string;
    time: string;
    price: string;
    priceVal?: number; // Numeric price for calculations
    genre?: string;
    imageUrl?: string;
    ticketUrl?: string;
    description?: string;
    capacity?: number;
    source: 'manual' | 'skiddle' | 'scraper';
    isVerified?: boolean;
    isInternalTicketing?: boolean;
    sellTickets?: boolean;
    presale_price?: number;
    presale_caption?: string;
    bookings_count?: number;
}

export interface CreateEventRequest {
    name: string;
    venue: string;
    venue_id?: number;
    date: string;
    time: string;
    price: string;
    genre?: string;
    description?: string;
    imageUrl?: string;
    presale_price?: string;
    presale_caption?: string;
    is_internal_ticketing?: boolean;
    sell_tickets?: boolean;
    new_venue?: {
        name: string;
        city: string;
        capacity: number | null;
    };
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {
    id: number | string;
}

export interface CreateEventResponse {
    event: Event;
    message: string;
    needsApproval?: boolean;
}

export interface UpdateEventResponse {
    event: Event;
    message: string;
}

export interface EventSearchParams {
    keyword?: string;
    location?: string;
    minDate?: string;
    genre?: string;
    budget?: string;
    venueSize?: string;
    postcode?: string;
    distance?: string;
}

// ============================================================================
// Booking Types
// ============================================================================

export interface Booking {
    id: number;
    event_id: number;
    customer_name: string;
    customer_email: string;
    quantity: number;
    records_quantity?: number;
    records_price?: number;
    platform_fee?: number;
    status: 'confirmed' | 'cancelled' | 'refunded';
    created_at: string;
    checked_in_at?: string | null;
    // Additional fields from JOIN queries (my-bookings API)
    event_name?: string;
    venue?: string;
    date?: string;
    price_paid?: number | null;
}

export interface CreateBookingRequest {
    eventId: number;
    name: string;
    email: string;
    quantity?: number;
}

export interface SendEmailRequest {
    eventId: number;
    subject: string;
    message: string;
}

export interface CheckInRequest {
    bookingId: number;
    eventId: number;
}

export interface RefundRequest {
    bookingId: number;
}

export interface RefundResponse {
    success: boolean;
    refundId: string;
    amount: number;
    message: string;
}

// ============================================================================
// Venue Types
// ============================================================================

export interface Venue {
    id: number;
    name: string;
    city?: string;
    capacity?: number;
}

// ============================================================================
// API Client Configuration
// ============================================================================

export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    onError?: (error: Error) => void;
    onRequest?: (url: string, options: RequestInit) => void;
    onResponse?: (response: Response) => void;
}

// ============================================================================
// Request Options
// ============================================================================

export interface RequestOptions extends RequestInit {
    timeout?: number;
    retry?: boolean;
    retries?: number;
}
