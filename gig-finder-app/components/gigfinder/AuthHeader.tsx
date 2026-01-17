'use client';

import { UserButton, SignInButton, useAuth } from "@clerk/nextjs";
import styles from './AuthHeader.module.css';

export function AuthHeader() {
    const { isLoaded, userId } = useAuth();

    return (
        <div className={styles.container}>
            {!isLoaded ? (
                // While loading, show a disabled-looking button so it's not "gone"
                <button
                    className={`btn-primary ${styles.loadingButton}`}
                >
                    Loading...
                </button>
            ) : userId ? (
                <UserButton afterSignOutUrl="/gigfinder" />
            ) : (
                <SignInButton mode="redirect">
                    <button
                        className={`btn-primary ${styles.signInButton}`}
                    >
                        Sign In
                    </button>
                </SignInButton>
            )}
        </div>
    );
}
