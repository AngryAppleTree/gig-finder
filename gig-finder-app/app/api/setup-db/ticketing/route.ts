import { Pool } from 'pg';
import { NextResponse } from 'next/server';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET() {
    try {
        const client = await pool.connect();

        console.log('📦 Starting Ticketing Migration...');

        // 1. Create Bookings Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id),
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                status TEXT DEFAULT 'confirmed',
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        // 2. Add ticketing columns to Events
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_internal_ticketing BOOLEAN DEFAULT FALSE;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_url TEXT;`);

        // 3. Add Check-In Column (New)
        await client.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMP DEFAULT NULL;`);

        client.release();
        console.log('✅ Ticketing schema updated.');
        return NextResponse.json({ message: "Ticketing tables and columns configured successfully." });
    } catch (error: any) {
        console.error('❌ Migration Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
