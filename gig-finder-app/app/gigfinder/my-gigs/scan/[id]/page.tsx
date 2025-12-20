'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ScanPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params);
    const eventId = unwrappedParams.id;
    const router = useRouter();

    const [scanResult, setScanResult] = useState<any>(null);
    const [lastScanned, setLastScanned] = useState<string>('');
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
        // Initialize Scanner on mount
        const timeout = setTimeout(() => {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    // Force back camera
                    videoConstraints: {
                        facingMode: { exact: "environment" }
                    },
                    // Hide camera selection UI since we're forcing back camera
                    showTorchButtonIfSupported: true,
                    showZoomSliderIfSupported: false
                },
                /* verbose= */ false
            );

            scanner.render(onScanSuccess, onScanFailure);
            scannerRef.current = scanner;
        }, 100);

        return () => {
            clearTimeout(timeout);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(e => console.error("Failed to clear scanner", e));
            }
        };
    }, []);

    const onScanSuccess = async (decodedText: string, decodedResult: any) => {
        if (decodedText === lastScanned) return; // Prevent duplicate hits

        setLastScanned(decodedText);
        setScanResult({ loading: true });

        // Pause scanner to prevent re-scanning during result display
        if (scannerRef.current) {
            try {
                await scannerRef.current.pause(true);
            } catch (e) {
                console.error('Failed to pause scanner', e);
            }
        }

        try {
            const res = await fetch('/api/bookings/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrData: decodedText })
            });
            const data = await res.json();

            const isSuccess = res.ok;
            const isDuplicate = res.status === 409;

            setScanResult({
                success: isSuccess,
                duplicate: isDuplicate,
                ...data
            });

            // Optional: Haptic feedback if on mobile
            if (window.navigator.vibrate) window.navigator.vibrate(isSuccess ? 50 : 200);

            // Auto-dismiss successful scans after 2 seconds
            if (isSuccess && !isDuplicate) {
                setTimeout(() => {
                    nextScan();
                }, 2000);
            }

        } catch (e) {
            setScanResult({ success: false, error: 'Network Error' });
        }
    };

    const onScanFailure = (error: any) => {
        // Standard scan failure (no code found in frame), ignore
    };

    const nextScan = () => {
        setScanResult(null);
        setLastScanned(''); // Allow scanning same code again if they want to re-verify

        // Resume scanner
        if (scannerRef.current) {
            try {
                scannerRef.current.resume();
            } catch (e) {
                console.error('Failed to resume scanner', e);
            }
        }
    };

    return (
        <div style={{ background: '#000', minHeight: '100vh', padding: '1rem', color: '#fff', fontFamily: 'sans-serif' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link href={`/gigfinder/my-gigs/guestlist/${eventId}`} style={{ color: '#aaa', textDecoration: 'none' }}>
                    &larr; Back to List
                </Link>
                <h1 style={{ fontSize: '1.2rem', margin: 0 }}>Ticket Scanner</h1>
            </div>

            {/* Camera Viewport */}
            <div style={{ background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
                <div id="reader" style={{ width: '100%' }}></div>
            </div>

            {/* Result Overlay */}
            {scanResult && !scanResult.loading && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, width: '100%', height: '50vh',
                    padding: '2rem',
                    background: scanResult.success ? '#0a3d0a' : (scanResult.duplicate ? '#520' : '#411'),
                    borderTop: '4px solid #fff',
                    textAlign: 'center',
                    boxShadow: '0 -5px 20px black',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
                        {scanResult.success ? '✅' : (scanResult.duplicate ? '⚠️' : '❌')}
                    </div>

                    <h2 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: '#fff' }}>
                        {scanResult.success ? 'VALID TICKET' : (scanResult.duplicate ? 'ALREADY USED' : 'INVALID')}
                    </h2>

                    {scanResult.guest && (
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '10px 0', color: '#eee' }}>
                            {scanResult.guest}
                        </p>
                    )}

                    <p style={{ color: '#aaa', margin: '0 0 20px 0' }}>
                        {scanResult.message || scanResult.error}
                        {scanResult.details && <><br />{scanResult.details}</>}
                    </p>

                    <button onClick={nextScan} style={{
                        padding: '1rem 3rem', fontSize: '1.2rem',
                        background: '#fff', color: '#000', border: 'none', borderRadius: '50px',
                        fontWeight: 'bold', cursor: 'pointer'
                    }}>
                        Scan Next
                    </button>
                </div>
            )}

            <style jsx global>{`
                #reader__scan_region {
                    background: rgba(0,0,0,0.2) !important;
                }
                #reader__dashboard_section_csr button {
                    color: black !important;
                    background: white !important;
                    padding: 5px 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-top: 10px;
                }
            `}</style>
        </div>
    );
}
