/**
 * API Client
 * 
 * Centralized HTTP client for all API requests
 * Provides type-safe methods for interacting with the backend
 */

import { ApiError } from './errors/ApiError';
import { API_ROUTES } from './api-routes';
import type {
    ApiClientConfig,
    RequestOptions,
    Event,
    CreateEventRequest,
    UpdateEventRequest,
    EventSearchParams,
    Booking,
    CreateBookingRequest,
    SendEmailRequest,
    CheckInRequest,
    RefundRequest,
    RefundResponse,
    Venue,
} from './api-types';

/**
 * Main API Client Class
 */
class ApiClient {
    private config: ApiClientConfig;
    private defaultTimeout = 30000; // 30 seconds

    constructor(config: ApiClientConfig = {}) {
        this.config = {
            baseUrl: config.baseUrl || '',
            timeout: config.timeout || this.defaultTimeout,
            retries: config.retries || 0,
            retryDelay: config.retryDelay || 1000,
            ...config,
        };
    }

    /**
     * Core request method
     */
    private async request<T>(
        url: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const {
            timeout = this.config.timeout,
            retry = false,
            retries = this.config.retries || 0,
            ...fetchOptions
        } = options;

        const fullUrl = `${this.config.baseUrl}${url}`;

        // Call onRequest hook if provided
        if (this.config.onRequest) {
            this.config.onRequest(fullUrl, fetchOptions);
        }

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        try {
            const response = await fetch(fullUrl, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Call onResponse hook if provided
            if (this.config.onResponse) {
                this.config.onResponse(response);
            }

            // Handle non-OK responses
            if (!response.ok) {
                let errorBody;
                try {
                    errorBody = await response.json();
                } catch {
                    // Response body is not JSON
                    errorBody = await response.text();
                }

                const error = new ApiError(response, errorBody);

                // Call onError hook if provided
                if (this.config.onError) {
                    this.config.onError(error);
                }

                throw error;
            }

            // Parse response
            const contentType = response.headers.get('content-type');
            if (contentType?.includes('application/json')) {
                return await response.json();
            } else {
                return await response.text() as unknown as T;
            }

        } catch (error) {
            clearTimeout(timeoutId);

            // Handle timeout
            if (error instanceof Error && error.name === 'AbortError') {
                const timeoutError = new Error(`Request timeout after ${timeout}ms`);
                if (this.config.onError) {
                    this.config.onError(timeoutError);
                }
                throw timeoutError;
            }

            // Retry logic (if enabled and not an ApiError)
            if (retry && retries > 0 && !(error instanceof ApiError)) {
                await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                return this.request<T>(url, { ...options, retries: retries - 1 });
            }

            throw error;
        }
    }

    /**
     * GET request
     */
    async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'GET',
        });
    }

    /**
     * POST request
     */
    async post<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * PUT request
     */
    async put<T>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    /**
     * DELETE request
     */
    async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
        return this.request<T>(url, {
            ...options,
            method: 'DELETE',
        });
    }

    // ========================================================================
    // Event API Methods
    // ========================================================================

    events = {
        /**
         * Search events with filters
         */
        search: async (params: EventSearchParams): Promise<{ events: Event[] }> => {
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const url = queryParams.toString()
                ? `${API_ROUTES.EVENTS.BASE}?${queryParams.toString()}`
                : API_ROUTES.EVENTS.BASE;

            return this.get<{ events: Event[] }>(url);
        },

        /**
         * Get event by ID
         */
        getById: async (id: string | number): Promise<Event> => {
            const response = await this.get<{ event: Event }>(API_ROUTES.EVENTS.BY_ID(id));
            return response.event;
        },

        /**
         * Get all user's events
         */
        getUserEvents: async (): Promise<{ events: Event[] }> => {
            return this.get<{ events: Event[] }>(API_ROUTES.EVENTS.USER);
        },

        /**
         * Get specific user event by ID
         */
        getUserEvent: async (id: string | number): Promise<{ event: Event }> => {
            return this.get<{ event: Event }>(API_ROUTES.EVENTS.USER_BY_ID(id));
        },

        /**
         * Create new event
         */
        create: async (data: CreateEventRequest): Promise<{ event: Event; message: string }> => {
            return this.post<{ event: Event; message: string }>(API_ROUTES.EVENTS.MANUAL, data);
        },

        /**
         * Update existing event
         */
        update: async (id: string | number, data: UpdateEventRequest): Promise<{ event: Event; message: string }> => {
            return this.put<{ event: Event; message: string }>(API_ROUTES.EVENTS.USER, { ...data, id });
        },

        /**
         * Delete user event
         */
        deleteUserEvent: async (id: string | number): Promise<{ message: string }> => {
            return this.delete<{ message: string }>(API_ROUTES.EVENTS.USER_BY_ID(id));
        },
    };

    // ========================================================================
    // Booking API Methods
    // ========================================================================

    bookings = {
        /**
         * Get bookings for an event
         */
        getByEventId: async (eventId: string | number): Promise<{ bookings: Booking[] }> => {
            return this.get<{ bookings: Booking[] }>(API_ROUTES.BOOKINGS.BY_EVENT(eventId));
        },

        /**
         * Get user's bookings
         */
        getMyBookings: async (): Promise<{ bookings: Booking[] }> => {
            return this.get<{ bookings: Booking[] }>(API_ROUTES.BOOKINGS.MY_BOOKINGS);
        },

        /**
         * Create new booking (manual guest list entry)
         */
        create: async (data: CreateBookingRequest): Promise<{ booking: Booking; message: string }> => {
            return this.post<{ booking: Booking; message: string }>(API_ROUTES.BOOKINGS.BASE, data);
        },

        /**
         * Send email to all guests
         */
        sendEmail: async (data: SendEmailRequest): Promise<{ message: string; sent: number }> => {
            return this.post<{ message: string; sent: number }>(API_ROUTES.BOOKINGS.EMAIL, data);
        },

        /**
         * Check in guest (QR scan)
         */
        checkIn: async (data: CheckInRequest): Promise<{ booking: Booking; message: string }> => {
            return this.post<{ booking: Booking; message: string }>(API_ROUTES.BOOKINGS.SCAN, data);
        },

        /**
         * Request refund
         */
        requestRefund: async (bookingId: number): Promise<RefundResponse> => {
            return this.post<RefundResponse>(API_ROUTES.BOOKINGS.REFUND, { bookingId });
        },
    };

    // ========================================================================
    // Venue API Methods
    // ========================================================================

    venues = {
        /**
         * Get all venues
         */
        getAll: async (): Promise<{ venues: Venue[] }> => {
            return this.get<{ venues: Venue[] }>(API_ROUTES.VENUES.BASE);
        },

        /**
         * Get venue by ID
         */
        getById: async (id: string | number): Promise<{ venue: Venue }> => {
            return this.get<{ venue: Venue }>(API_ROUTES.VENUES.BY_ID(id));
        },
    };
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const api = new ApiClient();

// Export class for testing or custom instances
export { ApiClient };
