export default function TeacherAssessmentsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-7 bg-gray-100 rounded-lg w-40" />
                <div className="h-10 bg-gray-100 rounded-xl w-36" />
            </div>
            <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-gray-50">
                        <div className="h-10 w-10 bg-gray-100 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-2/5" />
                            <div className="h-3 bg-gray-50 rounded w-1/4" />
                        </div>
                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                        <div className="h-8 bg-gray-50 rounded w-20" />
                    </div>
                ))}
            </div>
        </div>
    );
}
