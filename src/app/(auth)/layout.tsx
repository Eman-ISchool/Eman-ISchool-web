export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8">
                {children}
            </div>
        </div>
    );
}
