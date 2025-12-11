import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { scrapeBanshee } from '@/scraper/ingest-banshee';
import { scrapeSneaky } from '@/scraper/ingest-sneaky';
import { scrapeStramash } from '@/scraper/ingest-stramash';
import { scrapeLeith } from '@/scraper/ingest-leith';

async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;
    const adminEmail = process.env.ADMIN_EMAIL;
    const userEmail = user.emailAddresses[0]?.emailAddress;
    return adminEmail && userEmail === adminEmail;
}

export async function POST(req: Request) {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { scraper } = body;

        let result;
        if (scraper === 'banshee') {
            await scrapeBanshee();
            result = 'Banshee Labyrinth Scraper Completed';
        } else if (scraper === 'sneaky') {
            await scrapeSneaky();
            result = 'Sneaky Pete\'s Scraper Completed';
        } else if (scraper === 'stramash') {
            await scrapeStramash();
            result = 'Stramash Scraper Completed';
        } else if (scraper === 'leith') {
            await scrapeLeith();
            result = 'Leith Depot Scraper Completed';
        } else {
            return NextResponse.json({ error: 'Invalid scraper name' }, { status: 400 });
        }

        return NextResponse.json({ message: result });
    } catch (error) {
        console.error('Scraper API Error:', error);
        return NextResponse.json({ error: 'Scraper Execution Failed' }, { status: 500 });
    }
}
