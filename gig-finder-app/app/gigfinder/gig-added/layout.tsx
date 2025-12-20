import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Event Added - GigFinder',
    description: 'Your event has been submitted successfully',
};

export default function GigAddedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
