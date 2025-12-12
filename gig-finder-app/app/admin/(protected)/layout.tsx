import { redirect } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import AdminHeader from '../AdminHeader';

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await currentUser();
    const isAdmin = user?.publicMetadata?.role === 'admin';

    if (!isAdmin) {
        // Not admin (or not logged in) -> Redirect to Home (or Clerk Sign In? Home is safer)
        redirect('/');
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <AdminHeader />
            <main className="p-6">
                {children}
            </main>
        </div>
    );
}
