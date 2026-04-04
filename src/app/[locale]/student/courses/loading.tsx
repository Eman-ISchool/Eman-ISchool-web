export default function StudentCoursesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-7 bg-gray-100 rounded-lg w-40" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                        <div className="h-32 bg-gray-50" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 bg-gray-100 rounded w-3/4" />
                            <div className="h-3 bg-gray-50 rounded w-full" />
                            <div className="h-3 bg-gray-50 rounded w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
