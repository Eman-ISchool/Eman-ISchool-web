/**
 * Teacher Reels Management Page
 * Displays all reels for a current teacher with filtering and management options
 */

'use client';

import { useState, useEffect } from 'react';
import ReelStatusBadge from '@/components/teacher/ReelStatusBadge';

export default function TeacherReelsPage() {
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected' | 'failed'>('all');

    useEffect(() => {
        // Fetch reels from API
        // TODO: Implement API call to fetch teacher's reels
        setLoading(false);
    }, [filter]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        My Reels
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 mb-4">
                            Loading reels...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    My Reels
                </h1>

                {/* Filter tabs */}
                <div className="mb-6 flex gap-4 border-b border-gray-200">
                    <button
                        onClick={() => setFilter('all')}
                        className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                            filter === 'all'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('pending_review')}
                        className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                            filter === 'pending_review'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Pending Review
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                            filter === 'approved'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                            filter === 'rejected'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Rejected
                    </button>
                    <button
                        onClick={() => setFilter('failed')}
                        className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                            filter === 'failed'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Failed
                    </button>
                </div>

                {/* Reels list */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    {reels.length === 0 ? (
                        <p className="text-gray-600">
                            No reels found. Generate your first AI reel from lesson materials.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {reels.map((reel: any) => (
                                <div
                                    key={reel.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {reel.title_en}
                                        </h3>
                                        <ReelStatusBadge status={reel.status} />
                                        <p className="text-sm text-gray-600 mb-2">
                                            {reel.description_en}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
