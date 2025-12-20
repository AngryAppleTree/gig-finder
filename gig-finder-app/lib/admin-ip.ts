import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from './rate-limit';

/**
 * IP allowlist for admin routes
 * Add your IP addresses here
 */
const ADMIN_IP_ALLOWLIST = process.env.ADMIN_IP_ALLOWLIST?.split(',').map(ip => ip.trim()) || [];

/**
 * Check if IP is allowed to access admin routes
 */
export function isAdminIpAllowed(request: NextRequest): boolean {
    // If no allowlist is configured, allow all (for development)
    if (ADMIN_IP_ALLOWLIST.length === 0) {
        if (process.env.NODE_ENV === 'production') {
            console.warn('⚠️ ADMIN_IP_ALLOWLIST not configured in production!');
        }
        return true;
    }

    const clientIp = getClientIp(request);

    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
        if (clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === 'localhost') {
            return true;
        }
    }

    return ADMIN_IP_ALLOWLIST.includes(clientIp);
}

/**
 * Middleware to restrict admin routes by IP
 */
export function adminIpRestriction(request: NextRequest): NextResponse | null {
    if (!isAdminIpAllowed(request)) {
        return NextResponse.json(
            { error: 'Access denied: IP not authorized' },
            { status: 403 }
        );
    }
    return null; // Allow request to proceed
}
