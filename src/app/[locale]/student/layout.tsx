import { StudentSideNav } from '@/components/student/StudentSideNav';

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[var(--color-bg-soft)]">
            <main className="main-with-sidenav">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {children}
                </div>
            </main>
            <StudentSideNav />
        </div>
    );
}
