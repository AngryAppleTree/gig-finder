'use client';

import { useRouter } from 'next/navigation';

export default function AdminHeader() {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <header className="border-b border-gray-800 p-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                GigFinder Admin
            </h1>
            <div className="flex gap-4 items-center">
                <span className="text-sm text-gray-400">alex.bunch@angryappletree.com</span>
                <button
                    onClick={handleLogout}
                    className="text-sm text-red-400 hover:text-red-300"
                >
                    Sign Out
                </button>
                <a href="/" className="text-sm hover:text-white">Live Site</a>
            </div>
        </header>
    );
}
