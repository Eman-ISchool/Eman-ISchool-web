export default function AdminStudentsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-36" />
                <div className="h-10 bg-gray-100 rounded-xl w-28" />
            </div>
            {/* Search bar skeleton */}
            <div className="h-10 bg-gray-50 rounded-lg w-full max-w-sm" />
            {/* Table skeleton */}
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-100">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-4 bg-gray-100 rounded" />
                    ))}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-gray-100 rounded-full" />
                            <div className="h-4 bg-gray-50 rounded w-24" />
                        </div>
                        <div className="h-4 bg-gray-50 rounded w-20" />
                        <div className="h-4 bg-gray-50 rounded w-16" />
                        <div className="h-5 bg-gray-100 rounded-full w-14" />
                        <div className="h-4 bg-gray-50 rounded w-12" />
                    </div>
                ))}
            </div>
        </div>
    );
}
