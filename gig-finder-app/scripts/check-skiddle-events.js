/**
 * Check for recent Skiddle events in the database
 */

import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function checkSkiddleEvents() {
    const sql = neon(process.env.POSTGRES_URL);

    try {
        console.log('🔍 Checking for recent event activity...\n');

        // Check total events
        const totalResult = await sql`
            SELECT COUNT(*) as count 
            FROM events
        `;
        console.log(`Total events in database: ${totalResult[0].count}`);

        // Check most recent events
        const recentResult = await sql`
            SELECT 
                id,
                name,
                date,
                venue,
                created_at,
                user_id,
                is_internal_ticketing
            FROM events 
            ORDER BY created_at DESC
            LIMIT 10
        `;

        console.log('\n📅 Most recent events (by created_at):');
        console.log('─'.repeat(80));
        recentResult.forEach((event, idx) => {
            console.log(`${idx + 1}. ${event.name}`);
            console.log(`   Venue: ${event.venue || 'N/A'}`);
            console.log(`   Event Date: ${event.date}`);
            console.log(`   Created At: ${event.created_at}`);
            console.log(`   User ID: ${event.user_id || 'System'}`);
            console.log(`   Internal Ticketing: ${event.is_internal_ticketing}`);
            console.log('');
        });

        // Check events created in last 24 hours
        const last24hResult = await sql`
            SELECT COUNT(*) as count
            FROM events 
            WHERE created_at > NOW() - INTERVAL '24 hours'
        `;
        console.log(`\n🕐 Events created in last 24 hours: ${last24hResult[0].count}`);

        // Check events created around 21:22 last night (assuming yesterday)
        const targetTimeResult = await sql`
            SELECT 
                id,
                name,
                venue,
                created_at,
                user_id
            FROM events 
            WHERE created_at::date = CURRENT_DATE - INTERVAL '1 day'
            AND EXTRACT(HOUR FROM created_at) = 21
            AND EXTRACT(MINUTE FROM created_at) BETWEEN 20 AND 25
            ORDER BY created_at DESC
        `;

        console.log(`\n🎯 Events created yesterday around 21:22: ${targetTimeResult.length}`);
        if (targetTimeResult.length > 0) {
            console.log('─'.repeat(80));
            targetTimeResult.forEach((event, idx) => {
                console.log(`${idx + 1}. ${event.name}`);
                console.log(`   Venue: ${event.venue || 'N/A'}`);
                console.log(`   Created: ${event.created_at}`);
                console.log(`   User ID: ${event.user_id || 'System'}`);
                console.log('');
            });
        }

        // Check for external events (no user_id, likely from scrapers)
        const externalResult = await sql`
            SELECT COUNT(*) as count
            FROM events 
            WHERE user_id IS NULL
            AND created_at > NOW() - INTERVAL '24 hours'
        `;
        console.log(`\n🤖 System/Scraper events in last 24 hours: ${externalResult[0].count}`);

    } catch (error) {
        console.error('❌ Error checking events:', error);
        throw error;
    }
}

checkSkiddleEvents();
