export default function AdminLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* KPI Cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
                        <div className="h-4 bg-gray-100 rounded w-24" />
                        <div className="h-8 bg-gray-50 rounded w-16" />
                        <div className="h-3 bg-gray-50 rounded w-20" />
                    </div>
                ))}
            </div>
            {/* Table skeleton */}
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="h-6 bg-gray-100 rounded w-48" />
                </div>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
                        <div className="h-10 w-10 bg-gray-100 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-1/3" />
                            <div className="h-3 bg-gray-50 rounded w-1/4" />
                        </div>
                        <div className="h-6 bg-gray-100 rounded w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
