import { getPool } from '@/lib/db';
import { NextResponse } from 'next/server';


export async function GET() {
    try {
        const client = await getPool().connect();

        // Reset table (DROP) for development consistency
        // DANGER: DISABLED FOR SAFETY
        // await client.query(`DROP TABLE IF EXISTS events`);

        // Create the "events" table with fingerprint
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

        client.release();
        return NextResponse.json({ message: "Table 'events' recreated successfully with fingerprint" });
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}
