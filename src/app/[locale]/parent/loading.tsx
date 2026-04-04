export default function ParentLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-7 bg-gray-100 rounded-lg w-48" />
                    <div className="h-4 bg-gray-50 rounded w-64 mt-2" />
                </div>
            </div>
            {/* Student cards skeleton */}
            <div className="grid md:grid-cols-2 gap-5">
                {[1, 2].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gray-100 rounded-full" />
                            <div className="space-y-2">
                                <div className="h-5 bg-gray-100 rounded w-32" />
                                <div className="h-3 bg-gray-50 rounded w-24" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[1, 2, 3].map(j => (
                                <div key={j} className="text-center space-y-1">
                                    <div className="h-6 bg-gray-50 rounded w-8 mx-auto" />
                                    <div className="h-3 bg-gray-50 rounded w-12 mx-auto" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
