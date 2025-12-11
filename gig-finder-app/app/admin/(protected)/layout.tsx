import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AdminHeader from '../AdminHeader';

export default async function ProtectedAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check for admin cookie
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('gigfinder_admin');

    if (!adminSession || adminSession.value !== 'true') {
        redirect('/admin/login');
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
