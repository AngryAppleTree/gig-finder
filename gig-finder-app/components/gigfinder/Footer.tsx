import Link from 'next/link';

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="logo-container">
                    <img src="/gigfinder/gigfinder-logo.png" alt="GigFinder Logo" className="main-logo" />
                    <div className="powered-by">
                        <span className="powered-text">Powered by</span>
                        <span className="angry-apple-text">Angry Apple Tree</span>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; 2025 Angry Apple Tree Ltd. All rights reserved. | <Link href="/privacy">Privacy Policy</Link> | <Link href="/terms">Terms of Service</Link> | <Link href="/contact">Contact</Link> | <Link href="/admin">Admin</Link></p>
            </div>
        </footer>
    );
}
