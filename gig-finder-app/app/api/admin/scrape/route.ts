import { NextResponse } from 'next/server';
import { scrapeBanshee } from '@/scraper/ingest-banshee';
import { scrapeSneaky } from '@/scraper/ingest-sneaky';
import { scrapeStramash } from '@/scraper/ingest-stramash';
import { scrapeLeith } from '@/scraper/ingest-leith';
import { cookies } from 'next/headers';

async function checkAdmin() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('gigfinder_admin');
    return adminSession?.value === 'true';
}

export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { scraper } = body;

        let stats;
        if (scraper === 'banshee') {
            stats = await scrapeBanshee();
        } else if (scraper === 'sneaky') {
            stats = await scrapeSneaky();
        } else if (scraper === 'stramash') {
            stats = await scrapeStramash();
        } else if (scraper === 'leith') {
            stats = await scrapeLeith();
        } else {
            return NextResponse.json({ error: 'Invalid scraper name' }, { status: 400 });
        }

        return NextResponse.json({
            message: `${scraper} Scraper Completed`,
            stats: stats
        });
    } catch (error) {
        console.error('Scraper API Error:', error);
        return NextResponse.json({ error: 'Scraper Execution Failed' }, { status: 500 });
    }
}
