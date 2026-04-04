export default function TeacherCoursesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-40" />
                <div className="h-10 bg-gray-100 rounded-xl w-32" />
            </div>
            {/* Filter tabs skeleton */}
            <div className="flex gap-4 border-b border-gray-200 pb-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-4 bg-gray-100 rounded w-20" />
                ))}
            </div>
            {/* Course cards skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                        <div className="h-32 bg-gray-50" />
                        <div className="p-5 space-y-3">
                            <div className="h-5 bg-gray-100 rounded w-3/4" />
                            <div className="h-3 bg-gray-50 rounded w-full" />
                            <div className="flex gap-2 pt-2">
                                <div className="h-6 bg-gray-100 rounded-full w-16" />
                                <div className="h-6 bg-gray-50 rounded-full w-12" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
