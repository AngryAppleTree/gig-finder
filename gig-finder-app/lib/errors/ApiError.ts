/**
 * Custom API Error Class
 * 
 * Provides structured error information from API responses
 */
export class ApiError extends Error {
    public readonly status: number;
    public readonly statusText: string;
    public readonly url: string;
    public readonly body?: any;

    constructor(response: Response, body?: any) {
        const message = body?.error || body?.message || response.statusText || 'An error occurred';
        super(message);

        this.name = 'ApiError';
        this.status = response.status;
        this.statusText = response.statusText;
        this.url = response.url;
        this.body = body;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    /**
     * Check if error is a specific HTTP status
     */
    is(status: number): boolean {
        return this.status === status;
    }

    /**
     * Check if error is a client error (4xx)
     */
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    /**
     * Check if error is a server error (5xx)
     */
    isServerError(): boolean {
        return this.status >= 500;
    }

    /**
     * Get user-friendly error message
     */
    getUserMessage(): string {
        // Specific status code messages
        switch (this.status) {
            case 400:
                return this.message || 'Invalid request. Please check your input.';
            case 401:
                return 'You must be signed in to perform this action.';
            case 403:
                return 'You do not have permission to perform this action.';
            case 404:
                return 'The requested resource was not found.';
            case 409:
                return this.message || 'This action conflicts with existing data.';
            case 422:
                return this.message || 'The data provided is invalid.';
            case 500:
                return 'A server error occurred. Please try again later.';
            case 503:
                return 'The service is temporarily unavailable. Please try again later.';
            default:
                return this.message || 'An unexpected error occurred. Please try again.';
        }
    }

    /**
     * Convert to JSON for logging
     */
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            status: this.status,
            statusText: this.statusText,
            url: this.url,
            body: this.body,
        };
    }
}
