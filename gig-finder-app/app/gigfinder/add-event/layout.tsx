import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add Event - GigFinder',
    description: 'Submit your live music event to GigFinder',
};

export default function AddEventLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
