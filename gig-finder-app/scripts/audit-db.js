import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

async function audit() {
    console.log("Auditing DB Connection...");
    console.log("URL Config:", process.env.POSTGRES_URL ? "Found" : "Missing");

    try {
        const client = await pool.connect();
        console.log("Connected successfully.");

        // Check Count
        const res = await client.query("SELECT COUNT(*) FROM events");
        console.log(`Total Events: ${res.rows[0].count}`);

        // Check Future Query (matches API logic)
        const futureRes = await client.query("SELECT * FROM events WHERE date >= CURRENT_DATE ORDER BY date ASC LIMIT 5");
        console.log(`Future Events (Next 5): ${futureRes.rowCount}`);
        futureRes.rows.forEach(e => console.log(` - ${e.name} @ ${e.venue} (${e.date})`));

        client.release();
    } catch (err) {
        console.error("Audit Failed:", err);
    } finally {
        await pool.end();
    }
}

audit();
