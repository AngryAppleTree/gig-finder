import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Booking Successful - GigFinder',
    description: 'Your ticket booking has been confirmed',
};

export default function BookingSuccessLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
