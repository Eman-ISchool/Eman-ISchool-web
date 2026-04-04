export default function AdminFeesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-32" />
            </div>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 space-y-2">
                        <div className="h-4 bg-gray-100 rounded w-20" />
                        <div className="h-6 bg-gray-50 rounded w-16" />
                    </div>
                ))}
            </div>
            {/* Table */}
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
                        <div className="h-4 bg-gray-100 rounded flex-1" />
                        <div className="h-4 bg-gray-50 rounded w-20" />
                        <div className="h-5 bg-gray-100 rounded-full w-16" />
                    </div>
                ))}
            </div>
        </div>
    );
}
