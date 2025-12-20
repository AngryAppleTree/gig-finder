import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GigFinder - Discover Live Music in Scotland",
  description: "Find and book tickets for live music events across Scotland. Discover gigs in Edinburgh, Glasgow, and beyond.",
};

import { ClerkProvider } from "@clerk/nextjs";

// ... existing imports

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Skip to main content link for keyboard users */}
          <a
            href="#main-content"
            className="skip-link"
            style={{
              position: 'absolute',
              left: '-9999px',
              zIndex: 999,
              padding: '1rem',
              background: 'var(--color-primary)',
              color: 'var(--color-bg)',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onFocus={(e) => e.currentTarget.style.left = '0'}
            onBlur={(e) => e.currentTarget.style.left = '-9999px'}
          >
            Skip to main content
          </a>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
