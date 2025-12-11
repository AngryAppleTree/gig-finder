import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    // Check against Environment Variable
    const adminEmail = process.env.ADMIN_EMAIL;

    // NOTE: Simple check for primary email
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!adminEmail || userEmail !== adminEmail) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-black">
                <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
                <p className="mt-4">You are not authorized to view this page.</p>
                <p className="text-sm text-gray-500 mt-2">Logged in as: {userEmail}</p>
                <div className="flex gap-4 mt-8">
                    <SignOutButton>
                        <button className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white">Sign Out</button>
                    </SignOutButton>
                    <a href="/" className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">Go Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <header className="border-b border-gray-800 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    GigFinder Admin
                </h1>
                <div className="flex gap-4">
                    <span className="text-sm text-gray-400">{userEmail}</span>
                    <SignOutButton>
                        <button className="text-sm text-red-400 hover:text-red-300">Sign Out</button>
                    </SignOutButton>
                    <a href="/" className="text-sm hover:text-white">Live Site</a>
                </div>
            </header>
            <main className="p-6">
                {children}
            </main>
        </div>
    );
}
