import './gigfinder.css';

export default function GigFinderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />

            {children}
        </>
    );
}
