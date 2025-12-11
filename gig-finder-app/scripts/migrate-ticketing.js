require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log('🔗 Connecting to database...');
    try {
        const client = await pool.connect();
        console.log('✅ Connected.');

        console.log('🛠  Running migration: Adding ticketing columns...');

        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS is_internal_ticketing BOOLEAN DEFAULT FALSE;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS max_capacity INTEGER DEFAULT 100;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS tickets_sold INTEGER DEFAULT 0;`);
        await client.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_url TEXT;`);

        console.log('🛠  Running migration: Creating bookings table...');
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

        console.log('✅ Migration successful!');
        client.release();
        process.exit(0);
    } catch (e) {
        console.error('❌ Migration Failed:', e.message);
        process.exit(1);
    }
}

migrate();
