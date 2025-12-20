import { Pool } from 'pg';

/**
 * Singleton database connection pool
 * Prevents connection exhaustion by reusing connections
 */

let pool: Pool | null = null;

export function getPool(): Pool {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false },
            // Connection pool configuration
            max: 20, // Maximum number of clients in the pool
            idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
            connectionTimeoutMillis: 2000, // Return error after 2 seconds if no connection available
        });

        // Handle pool errors
        pool.on('error', (err) => {
            console.error('Unexpected database pool error:', err);
        });

        // Log pool stats in development
        if (process.env.NODE_ENV === 'development') {
            pool.on('connect', () => {
                console.log('Database client connected');
            });
            pool.on('remove', () => {
                console.log('Database client removed');
            });
        }
    }

    return pool;
}

/**
 * Close the database pool (for graceful shutdown)
 */
export async function closePool(): Promise<void> {
    if (pool) {
        await pool.end();
        pool = null;
    }
}
