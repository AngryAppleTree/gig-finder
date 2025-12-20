import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'My Gigs - GigFinder',
    description: 'Manage your events and view ticket sales',
};

export default function MyGigsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
