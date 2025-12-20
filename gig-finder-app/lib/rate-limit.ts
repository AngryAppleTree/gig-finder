/**
 * Simple in-memory rate limiter
 * For production, consider using Upstash Redis or Vercel Edge Config
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
    /**
     * Maximum number of requests allowed in the window
     */
    maxRequests: number;
    /**
     * Time window in milliseconds
     */
    windowMs: number;
}

export interface RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
}

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
    identifier: string,
    config: RateLimitConfig
): RateLimitResult {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // No entry or expired - create new
    if (!entry || now > entry.resetTime) {
        const resetTime = now + config.windowMs;
        rateLimitStore.set(identifier, {
            count: 1,
            resetTime
        });
        return {
            success: true,
            limit: config.maxRequests,
            remaining: config.maxRequests - 1,
            reset: resetTime
        };
    }

    // Entry exists and not expired
    if (entry.count >= config.maxRequests) {
        return {
            success: false,
            limit: config.maxRequests,
            remaining: 0,
            reset: entry.resetTime
        };
    }

    // Increment count
    entry.count++;
    rateLimitStore.set(identifier, entry);

    return {
        success: true,
        limit: config.maxRequests,
        remaining: config.maxRequests - entry.count,
        reset: entry.resetTime
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
    // Try various headers that might contain the real IP
    const headers = request.headers;

    return (
        headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') || // Cloudflare
        headers.get('x-vercel-forwarded-for') || // Vercel
        'unknown'
    );
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
    // General API endpoints
    api: {
        maxRequests: 100,
        windowMs: 15 * 60 * 1000 // 15 minutes
    },
    // Stripe webhook (more lenient)
    webhook: {
        maxRequests: 50,
        windowMs: 60 * 1000 // 1 minute
    },
    // Authentication endpoints
    auth: {
        maxRequests: 10,
        windowMs: 15 * 60 * 1000 // 15 minutes
    },
    // Booking/payment endpoints (stricter)
    booking: {
        maxRequests: 20,
        windowMs: 15 * 60 * 1000 // 15 minutes
    },
    // Email sending
    email: {
        maxRequests: 5,
        windowMs: 60 * 60 * 1000 // 1 hour
    }
} as const;
