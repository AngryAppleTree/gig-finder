/**
 * API-safe scraper wrappers
 * These don't close the database pool, making them safe for serverless/API usage
 */

import { Pool } from 'pg';
import * as cheerio from 'cheerio';
import { findOrCreateVenue } from '@/lib/venue-utils';

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false }
});

// Banshee Scraper (API-safe)
export async function scrapeBansheeAPI() {
    console.log('🚀 Starting Banshee Labyrinth Scraper (API Mode)...');
    const url = 'https://www.thebansheelabyrinth.com/cinema/';
    const VENUE_NAME = 'The Banshee Labyrinth';
    const USER_ID = 'scraper_banshee';

    const client = await pool.connect();
    try {
        // Get or create venue
        const venue = await findOrCreateVenue({
            name: VENUE_NAME,
            city: 'Edinburgh',
            postcode: 'EH1 1SR',
            capacity: 70
        }, 'banshee_scraper');

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch ${url}`);

        const html = await resp.text();
        const $ = cheerio.load(html);
        const days = $('.day').toArray();

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        let addedCount = 0;

        for (const dayEl of days) {
            const dateText = $(dayEl).find('.date-number').text().trim();
            if (!dateText) continue;
            const dayNum = parseInt(dateText, 10);
            if (isNaN(dayNum)) continue;

            const events: Array<{ title: string; link: string; imageUrl: string | null | undefined }> = [];
            $(dayEl).find('.events-container .event').each((i, ev) => {
                let title = $(ev).text().trim();
                let link = $(ev).attr('href');
                const img = $(ev).find('img');
                let imageUrl = null;
                if (img.length > 0) {
                    const alt = img.attr('alt');
                    if (alt) title = alt;
                    imageUrl = img.attr('src');
                }
                if (!link) link = url;
                if (title) events.push({ title, link, imageUrl });
            });

            for (const evt of events) {
                if (!evt.title) continue;
                if (/booking/i.test(evt.title) || /possible booking/i.test(evt.title)) continue;

                const eventDate = new Date(currentYear, currentMonth, dayNum, 19, 0, 0);
                const dateStr = eventDate.toISOString().split('T')[0];

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                if (eventDate < yesterday) continue;

                const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${evt.title.toLowerCase().trim()}`;

                const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
                if (existRes.rows.length === 0) {
                    await client.query(
                        `INSERT INTO events (
                              name, venue_id, date, price, ticket_url, description, 
                              fingerprint, user_id, approved, created_at, genre, image_url
                          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), $10, $11)`,
                        [
                            evt.title.substring(0, 200),
                            venue.id,
                            eventDate,
                            'Free',
                            evt.link,
                            'Scraped from /cinema',
                            fingerprint,
                            USER_ID,
                            true,
                            'Cinema/Varies',
                            evt.imageUrl
                        ]
                    );
                    addedCount++;
                }
            }
        }
        return { success: true, count: addedCount };
    } finally {
        client.release();
        // Don't close pool in API mode
    }
}

// Sneaky Pete's Scraper (API-safe)
export async function scrapeSneakyAPI() {
    console.log('🎸 Starting Sneaky Pete\'s Scraper (API Mode)...');
    const feedUrl = 'https://www.sneakypetes.co.uk/feed/';
    const VENUE_NAME = 'Sneaky Pete\'s';
    const USER_ID = 'scraper_sneaky';

    const client = await pool.connect();
    try {
        // Get or create venue
        const venue = await findOrCreateVenue({
            name: VENUE_NAME,
            city: 'Edinburgh',
            postcode: 'EH1 1SR',
            capacity: 100
        }, 'sneaky_scraper');

        const resp = await fetch(feedUrl);
        if (!resp.ok) throw new Error('Failed to fetch RSS');

        const xml = await resp.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        const items = $('item').toArray().slice(0, 20);
        let addedCount = 0;

        for (const item of items) {
            const title = $(item).find('title').text().trim();
            const link = $(item).find('link').text().trim();
            const pubDate = $(item).find('pubDate').text();

            if (!title || !pubDate) continue;

            const eventDate = new Date(pubDate);
            if (isNaN(eventDate.getTime())) continue;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (eventDate < yesterday) continue;

            const dateStr = eventDate.toISOString().split('T')[0];
            const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${title.toLowerCase().trim()}`;

            const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
            if (existRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO events (
                        name, venue_id, date, price, ticket_url, fingerprint, 
                        user_id, approved, created_at, genre
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)`,
                    [
                        title.substring(0, 200),
                        venue.id,
                        eventDate,
                        'Free',
                        link,
                        fingerprint,
                        USER_ID,
                        true,
                        'Live Music'
                    ]
                );
                addedCount++;
            }
        }
        return { success: true, count: addedCount };
    } finally {
        client.release();
    }
}

// Stramash Scraper (API-safe)
export async function scrapeStramashAPI() {
    console.log('🚀 Starting Stramash Scraper (API Mode)...');
    const feedUrl = 'https://stramashedinburgh.com/events/feed/';
    const VENUE_NAME = 'Stramash';
    const USER_ID = 'scraper_stramash';

    const client = await pool.connect();
    try {
        // Get or create venue
        const venue = await findOrCreateVenue({
            name: VENUE_NAME,
            city: 'Edinburgh'
        }, 'stramash_scraper');

        const resp = await fetch(feedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            }
        });
        if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);

        const xml = await resp.text();
        const $ = cheerio.load(xml, { xmlMode: true });
        const items = $('item').toArray().slice(0, 5);
        let addedCount = 0;

        for (const item of items) {
            const title = $(item).find('title').text().trim();
            const link = $(item).find('link').text().trim();

            if (!title || !link) continue;

            // Fetch event page for date
            const pageResp = await fetch(link, {
                headers: { 'User-Agent': 'Mozilla/5.0' }
            });
            if (!pageResp.ok) continue;

            const pageHtml = await pageResp.text();
            const $p = cheerio.load(pageHtml);

            let eventDate: Date | null = null;
            $p('script[type="application/ld+json"]').each((i, el) => {
                if (eventDate) return;
                try {
                    const json = JSON.parse($p(el).html() || '{}');
                    const nodes = Array.isArray(json) ? json : (json['@graph'] || [json]);
                    const evt = nodes.find((n: any) => n['@type'] === 'Event' || n['@type'] === 'MusicEvent');
                    if (evt?.startDate) {
                        eventDate = new Date(evt.startDate);
                    }
                } catch (e) { /* ignore */ }
            });

            if (!eventDate) continue;

            // Type assertion needed because TypeScript can't narrow types through closures
            const validEventDate: Date = eventDate;
            if (isNaN(validEventDate.getTime())) continue;

            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (validEventDate < yesterday) continue;

            const dateStr = validEventDate.toISOString().split('T')[0];
            const fingerprint = `${dateStr}|${VENUE_NAME.toLowerCase()}|${title.toLowerCase().trim()}`;

            const existRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
            if (existRes.rows.length === 0) {
                await client.query(
                    `INSERT INTO events (
                        name, venue_id, date, price, ticket_url, fingerprint, 
                        user_id, approved, created_at, genre
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9)`,
                    [
                        title.substring(0, 200),
                        venue.id,
                        validEventDate,
                        'Free',
                        link,
                        fingerprint,
                        USER_ID,
                        true,
                        'Live Music'
                    ]
                );
                addedCount++;
            }
        }
        return { success: true, count: addedCount };
    } finally {
        client.release();
    }
}

// Leith Depot Scraper (API-safe)
export async function scrapeLeithAPI() {
    console.log('🎸 Starting Leith Depot Scraper (API Mode)...');
    const url = 'https://leithdepot.com/events.html';
    const VENUE_NAME = 'Leith Depot';
    const USER_ID = 'scraper_v1';

    const client = await pool.connect();
    try {
        // Get or create venue
        const venue = await findOrCreateVenue({
            name: VENUE_NAME,
            city: 'Edinburgh',
            postcode: 'EH6 7EQ'
        }, 'leith_scraper');

        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`Failed to fetch: ${resp.status}`);

        const html = await resp.text();
        const $ = cheerio.load(html);
        const events: any[] = [];

        $('.menu-item').each((i, el) => {
            const dateStr = $(el).find('h5').text().trim();
            const title = $(el).find('h4').text().trim();
            const priceText = $(el).find('.text-left').text().trim();
            const ticketLink = $(el).find('h4 a').attr('href') || $(el).find('.text-left a').attr('href');
            let imageUrl = $(el).find('img').attr('src');
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = `https://leithdepot.com${imageUrl}`;
            }

            if (dateStr && title) {
                events.push({ name: title, dateInfo: parseDate(dateStr), priceText, ticketUrl: ticketLink, imageUrl });
            }
        });

        let addedCount = 0;
        const currentYear = new Date().getFullYear();
        const currentMonthIndex = new Date().getMonth();
        const monthMap: Record<string, number> = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };

        for (const evt of events) {
            if (!evt.dateInfo) continue;

            const eventMonthIndex = monthMap[evt.dateInfo.month];
            let year = currentYear;
            if (eventMonthIndex < currentMonthIndex && (currentMonthIndex - eventMonthIndex) > 6) {
                year = currentYear + 1;
            }

            const monthNum = (eventMonthIndex + 1).toString().padStart(2, '0');
            const dayNum = evt.dateInfo.day.toString().padStart(2, '0');
            const dateStr = `${year}-${monthNum}-${dayNum}`;
            const timeStr = convertTime12to24(evt.dateInfo.time);
            const timestamp = `${dateStr} ${timeStr}:00`;

            const eventDateObj = new Date(dateStr);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (eventDateObj < yesterday) continue;

            const fingerprint = `${dateStr}|leith depot|${evt.name.toLowerCase().trim()}`;

            const checkRes = await client.query('SELECT id FROM events WHERE fingerprint = $1', [fingerprint]);
            if (checkRes.rows.length === 0) {
                await client.query(`
                    INSERT INTO events (
                        name, venue_id, date, genre, price, description, 
                        user_id, created_at, fingerprint, ticket_url, approved, image_url
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11)
                 `, [
                    evt.name.substring(0, 200),
                    venue.id,
                    timestamp,
                    'Indie'.substring(0, 50),
                    (evt.priceText || '12.00').substring(0, 50),
                    `Live at Leith Depot. ${evt.priceText}`.substring(0, 500),
                    USER_ID,
                    fingerprint,
                    evt.ticketUrl || null,
                    true,
                    evt.imageUrl || null
                ]);
                addedCount++;
            }
        }
        return { success: true, count: addedCount };
    } finally {
        client.release();
    }
}

function parseDate(str: string) {
    const regex = /([a-zA-Z]+)\s+(\d{1,2})\s+([a-zA-Z]+),?\s*(.+)?/i;
    const match = str.match(regex);
    if (!match) return null;
    return {
        dow: match[1],
        day: parseInt(match[2]),
        month: match[3],
        time: match[4] || '19:30'
    };
}

function convertTime12to24(time12h: string) {
    if (!time12h) return '19:30';
    if (time12h.toLowerCase().includes('tbc') || time12h.toLowerCase().includes('tba') || time12h.length > 10) {
        return '19:30';
    }

    const [time, modifier] = time12h.split(/(am|pm)/i);
    let [hours, minutes] = time.trim().split(':');
    if (!minutes) minutes = '00';
    if (isNaN(parseInt(hours))) return '19:30';

    if (hours === '12') hours = '00';
    if (modifier && modifier.toLowerCase() === 'pm') {
        hours = (parseInt(hours, 10) + 12).toString();
    }
    return `${hours}:${minutes}`;
}
