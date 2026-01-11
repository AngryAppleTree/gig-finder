'use client';

import { useEffect, useState, useRef, use } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ScanPage.module.css';

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

    // Determine overlay class based on result type
    const getOverlayClass = () => {
        if (scanResult.success) return `${styles.resultOverlay} ${styles.success}`;
        if (scanResult.duplicate) return `${styles.resultOverlay} ${styles.duplicate}`;
        return `${styles.resultOverlay} ${styles.error}`;
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Link href={`/gigfinder/my-gigs/guestlist/${eventId}`} className={styles.backLink}>
                    &larr; Back to List
                </Link>
                <h1 className={styles.title}>Ticket Scanner</h1>
            </div>

            {/* Camera Viewport */}
            <div className={styles.scannerViewport}>
                <div id="reader" className={styles.readerContainer}></div>
            </div>

            {/* Result Overlay */}
            {scanResult && !scanResult.loading && (
                <div className={getOverlayClass()}>
                    <div className={styles.resultIcon}>
                        {scanResult.success ? '✅' : (scanResult.duplicate ? '⚠️' : '❌')}
                    </div>

                    <h2 className={styles.resultTitle}>
                        {scanResult.success ? 'VALID TICKET' : (scanResult.duplicate ? 'ALREADY USED' : 'INVALID')}
                    </h2>

                    {scanResult.guest && (
                        <p className={styles.guestName}>
                            {scanResult.guest}
                        </p>
                    )}

                    <p className={styles.resultMessage}>
                        {scanResult.message || scanResult.error}
                        {scanResult.details && <><br />{scanResult.details}</>}
                    </p>

                    <button onClick={nextScan} className={styles.scanNextButton}>
                        Scan Next
                    </button>
                </div>
            )}
        </div>
    );
}
