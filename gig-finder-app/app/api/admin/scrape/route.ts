import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { scrapeBansheeAPI, scrapeSneakyAPI, scrapeStramashAPI, scrapeLeithAPI } from '@/scraper/api-wrappers';

async function checkAdmin() {
    const user = await currentUser();
    if (!user) return false;

    // Check metadata role OR verified email address
    const isAdminRole = user.publicMetadata?.role === 'admin';
    const isAdminEmail = user.emailAddresses.some(email =>
        email.emailAddress === process.env.ADMIN_EMAIL
    );

    return isAdminRole || isAdminEmail;
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
            stats = await scrapeBansheeAPI();
        } else if (scraper === 'sneaky') {
            stats = await scrapeSneakyAPI();
        } else if (scraper === 'stramash') {
            stats = await scrapeStramashAPI();
        } else if (scraper === 'leith') {
            stats = await scrapeLeithAPI();
        } else {
            return NextResponse.json({ error: 'Invalid scraper name' }, { status: 400 });
        }

        return NextResponse.json({
            message: `${scraper} Scraper Completed`,
            stats: stats
        });
    } catch (error) {
        console.error('Scraper API Error:', error);
        return NextResponse.json({
            error: 'Scraper Execution Failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
