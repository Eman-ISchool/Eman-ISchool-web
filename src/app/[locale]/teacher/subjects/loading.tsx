export default function TeacherSubjectsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-36" />
                <div className="h-10 bg-gray-100 rounded-xl w-32" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
                        <div className="h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-50 rounded w-full" />
                        <div className="h-3 bg-gray-50 rounded w-1/2" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-8 bg-gray-100 rounded w-20" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
