import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Results - GigFinder',
    description: 'Browse live music events matching your search',
};

export default function ResultsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
