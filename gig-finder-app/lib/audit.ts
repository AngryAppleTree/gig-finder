import { getPool } from './db';

/**
 * Audit logging for security-sensitive actions
 */

export enum AuditAction {
    // Admin actions
    ADMIN_LOGIN = 'admin_login',
    ADMIN_LOGOUT = 'admin_logout',

    // Event management
    EVENT_CREATED = 'event_created',
    EVENT_UPDATED = 'event_updated',
    EVENT_DELETED = 'event_deleted',

    // Venue management
    VENUE_CREATED = 'venue_created',
    VENUE_UPDATED = 'venue_updated',
    VENUE_DELETED = 'venue_deleted',

    // Booking actions
    BOOKING_CREATED = 'booking_created',
    BOOKING_CANCELLED = 'booking_cancelled',
    BOOKING_REFUNDED = 'booking_refunded',

    // Guest list actions
    GUEST_ADDED = 'guest_added',
    GUEST_CHECKED_IN = 'guest_checked_in',
    EMAIL_BROADCAST = 'email_broadcast',

    // Security events
    RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    INVALID_AUTH_ATTEMPT = 'invalid_auth_attempt',
}

export interface AuditLogEntry {
    action: AuditAction;
    userId?: string;
    userEmail?: string;
    ipAddress?: string;
    resourceType?: string;
    resourceId?: string | number;
    details?: Record<string, any>;
    success: boolean;
    errorMessage?: string;
}

/**
 * Log an audit event to the database
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
    try {
        const pool = getPool();

        await pool.query(
            `INSERT INTO audit_logs 
            (action, user_id, user_email, ip_address, resource_type, resource_id, details, success, error_message, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())`,
            [
                entry.action,
                entry.userId || null,
                entry.userEmail || null,
                entry.ipAddress || null,
                entry.resourceType || null,
                entry.resourceId?.toString() || null,
                entry.details ? JSON.stringify(entry.details) : null,
                entry.success,
                entry.errorMessage || null
            ]
        );
    } catch (error) {
        // Don't throw - audit logging should never break the main flow
        console.error('Failed to write audit log:', error);
    }
}

/**
 * Get audit logs with optional filters
 */
export async function getAuditLogs(filters?: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    resourceId?: string | number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
}) {
    const pool = getPool();

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.userId) {
        query += ` AND user_id = $${paramIndex}`;
        params.push(filters.userId);
        paramIndex++;
    }

    if (filters?.action) {
        query += ` AND action = $${paramIndex}`;
        params.push(filters.action);
        paramIndex++;
    }

    if (filters?.resourceType) {
        query += ` AND resource_type = $${paramIndex}`;
        params.push(filters.resourceType);
        paramIndex++;
    }

    if (filters?.resourceId) {
        query += ` AND resource_id = $${paramIndex}`;
        params.push(filters.resourceId.toString());
        paramIndex++;
    }

    if (filters?.startDate) {
        query += ` AND created_at >= $${paramIndex}`;
        params.push(filters.startDate);
        paramIndex++;
    }

    if (filters?.endDate) {
        query += ` AND created_at <= $${paramIndex}`;
        params.push(filters.endDate);
        paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
        query += ` LIMIT $${paramIndex}`;
        params.push(filters.limit);
    } else {
        query += ' LIMIT 100'; // Default limit
    }

    const result = await pool.query(query, params);
    return result.rows;
}

/**
 * Create audit_logs table if it doesn't exist
 */
export async function createAuditLogsTable(): Promise<void> {
    const pool = getPool();

    await pool.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
            id SERIAL PRIMARY KEY,
            action VARCHAR(100) NOT NULL,
            user_id VARCHAR(255),
            user_email VARCHAR(255),
            ip_address VARCHAR(45),
            resource_type VARCHAR(100),
            resource_id VARCHAR(255),
            details JSONB,
            success BOOLEAN NOT NULL DEFAULT true,
            error_message TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
    `);
}
