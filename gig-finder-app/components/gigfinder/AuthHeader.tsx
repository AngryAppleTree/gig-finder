'use client';

import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export function AuthHeader() {
    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }}>
            <SignedIn>
                <UserButton afterSignOutUrl="/gigfinder" />
            </SignedIn>
            <SignedOut>
                <SignInButton mode="redirect">
                    <button
                        className="btn-primary"
                        onClick={() => console.log('Sign in clicked')}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >
                        Sign In
                    </button>
                </SignInButton>
            </SignedOut>
        </div>
    );
}
