import React from 'react';

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
                <p>&copy; 2025 Angry Apple Tree Ltd. All rights reserved. | <a href="/privacy.html">Privacy Policy</a> | <a href="/terms.html">Terms of Service</a> | <a href="/contact.html">Contact</a> | <a href="/admin">Admin</a></p>
            </div>
        </footer>
    );
}
