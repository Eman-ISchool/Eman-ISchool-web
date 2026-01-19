export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50 via-gray-50 to-gray-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-black px-4 py-12">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}
