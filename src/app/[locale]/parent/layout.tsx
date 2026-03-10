import { ParentSideNav } from '@/components/parent/ParentSideNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';

export default async function ParentLayout({
    children,
    params: { locale }
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session) {
        redirect(withLocalePrefix('/', locale));
    }

    if (user?.role === 'admin') {
        redirect(withLocalePrefix('/dashboard', locale));
    }

    if (user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-soft)]">
            <main className="main-with-sidenav">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
            <ParentSideNav />
        </div>
    );
}
