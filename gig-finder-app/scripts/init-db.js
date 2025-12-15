import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function initDb() {
    try {
        console.log("Connecting to DB:", process.env.POSTGRES_URL?.split('@')[1]);
        const client = await pool.connect();

        console.log("Creating 'events' table with full schema...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                venue VARCHAR(255) NOT NULL,
                date TIMESTAMP NOT NULL,
                genre VARCHAR(50),
                description TEXT,
                price VARCHAR(50),
                user_id VARCHAR(255),
                fingerprint VARCHAR(255) UNIQUE, 
                max_capacity INTEGER DEFAULT 100,
                tickets_sold INTEGER DEFAULT 0,
                is_internal_ticketing BOOLEAN DEFAULT FALSE,
                ticket_url TEXT,
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log("Creating 'bookings' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
                customer_name TEXT NOT NULL,
                customer_email TEXT NOT NULL,
                quantity INTEGER DEFAULT 1,
                status TEXT DEFAULT 'confirmed',
                checked_in_at TIMESTAMP DEFAULT NULL,
                created_at TIMESTAMP DEFAULT NOW()
            )
        `);

        console.log("Database initialized successfully with full schema!");
        client.release();
    } catch (err) {
        console.error("Error initializing DB:", err);
    } finally {
        await pool.end();
    }
}

initDb();
