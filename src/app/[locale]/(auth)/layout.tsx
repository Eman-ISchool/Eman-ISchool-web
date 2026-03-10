export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] px-4 pb-12 pt-28 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl">
                {children}
            </div>
        </div>
    );
}
