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
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Wizard } from '../../components/gigfinder/Wizard';
import { Footer } from '../../components/gigfinder/Footer';
import { BookingModal } from '../../components/gigfinder/BookingModal';

export default async function GigFinderPage() {
    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

    return (
        <>
            {/* Auth Header Overlay */}
            <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode="modal">
                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Sign In</button>
                    </SignInButton>
                </SignedOut>
            </div>

            <Wizard isAdmin={isAdmin} />

            <Footer />
            <BookingModal />

            {/* Legacy Script - Maintained for Booking functions only */}
            <Script src="/gigfinder/script-api.js?v=15" strategy="afterInteractive" />
        </>
    );
}
