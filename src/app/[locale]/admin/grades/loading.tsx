export default function AdminGradesLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-7 bg-gray-100 rounded-lg w-36" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
                        <div className="h-5 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-50 rounded w-1/2" />
                        <div className="h-3 bg-gray-50 rounded w-1/3" />
                    </div>
                ))}
            </div>
        </div>
    );
}
