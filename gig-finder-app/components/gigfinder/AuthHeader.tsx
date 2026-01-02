'use client';

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";

export function AuthHeader() {
    const { isLoaded, userId } = useAuth();

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '25px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            // Adding a small indicator to see if the component is alive
            minWidth: '100px',
            minHeight: '40px',
            justifyContent: 'flex-end'
        }}>
            {!isLoaded ? (
                // While loading, show a disabled-looking button so it's not "gone"
                <button
                    className="btn-primary"
                    style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.9rem',
                        opacity: 0.7,
                        cursor: 'wait'
                    }}
                >
                    Loading...
                </button>
            ) : userId ? (
                <UserButton afterSignOutUrl="/gigfinder" />
            ) : (
                <SignInButton mode="redirect">
                    <button
                        className="btn-primary"
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem',
                            cursor: 'pointer'
                        }}
                    >
                        Sign In
                    </button>
                </SignInButton>
            )}
        </div>
    );
}
