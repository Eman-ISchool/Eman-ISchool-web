export default function TeacherGradesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-36" />
            </div>
            {/* Grade cards skeleton */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
                        <div className="h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-50 rounded w-1/2" />
                        <div className="flex gap-2 pt-1">
                            <div className="h-5 bg-gray-100 rounded-full w-14" />
                            <div className="h-5 bg-gray-50 rounded-full w-10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
