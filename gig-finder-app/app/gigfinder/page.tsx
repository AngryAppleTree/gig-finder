import Script from 'next/script';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
    title: 'GigFinder - Find Your Next Gig',
    description: 'Find live music gigs in your area. Search by location, genre, date, and budget. Discover mainstream, alternative, and new talent across the UK.',
};

export const viewport: Viewport = {
    themeColor: '#ff3366',
};

import { currentUser } from '@clerk/nextjs/server';
export const dynamic = 'force-dynamic';

import { AuthHeader } from '@/components/gigfinder/AuthHeader';
import { Wizard } from '../../components/gigfinder/Wizard';
import { Footer } from '../../components/gigfinder/Footer';
import { BookingModal } from '../../components/gigfinder/BookingModal';

export default async function GigFinderPage() {
    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
        <>
            <AuthHeader />

            <Wizard isAdmin={isAdmin} />

            <Footer />
            <BookingModal />
        </>
    );
}
