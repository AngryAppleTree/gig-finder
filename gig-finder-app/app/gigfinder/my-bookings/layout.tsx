import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Bookings - GigFinder',
    description: 'View and manage your ticket bookings',
};

export default function MyBookingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
