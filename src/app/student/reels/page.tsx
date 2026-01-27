'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import ReelFeed, { type Reel } from '@/components/reels/ReelFeed';
import { DatabaseSetupInstructions } from '@/components/reels/DatabaseSetupInstructions';

type FilterType = 'all' | 'bookmarked' | 'not_understood';

export default function StudentReelsPage() {
    const { data: session, status } = useSession();
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');

    useEffect(() => {
        // Wait for session to load
        if (status === 'loading') {
            return;
        }

        // Redirect to sign in if not authenticated
        if (status === 'unauthenticated') {
            signIn();
            return;
        }

        // Fetch reels if authenticated
        if (status === 'authenticated' && session?.user) {
            fetchReels();
        } else {
            setLoading(false);
            setError('Unable to retrieve user information. Please try logging in again.');
        }
    }, [session, status, filter]);

    const fetchReels = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/reels/feed?filter=${filter}&limit=20&offset=0`);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                // Check if this is a database configuration error
                if (errorData.error?.includes('does not exist') ||
                    errorData.error?.includes('Database not configured') ||
                    errorData.details?.includes('relation') ||
                    response.status === 500) {
                    throw new Error('DATABASE_NOT_CONFIGURED');
                }

                throw new Error('Failed to fetch reels');
            }

            const data = await response.json();

            // Check if we got empty data - might need setup
            if (!data.reels || data.reels.length === 0) {
                if (filter === 'all') {
                    throw new Error('NO_REELS_FOUND');
                }
                // For filtered views, empty results are ok
                setReels([]);
                return;
            }

            // Transform API data to Reel format
            const transformedReels: Reel[] = data.reels.map((reel: any) => ({
                id: reel.id,
                title_en: reel.title_en,
                title_ar: reel.title_ar,
                description_en: reel.description_en || '',
                description_ar: reel.description_ar || '',
                video_url: reel.video_url,
                thumbnail_url: reel.thumbnail_url || '',
                duration_seconds: reel.duration_seconds,
                teacher_id: reel.teacher_id,
                is_bookmarked: reel.is_bookmarked || false,
                is_understood: reel.is_understood || false,
                progress: reel.progress || 0,
            }));

            setReels(transformedReels);
        } catch (err: any) {
            console.error('Error fetching reels:', err);
            setError(err.message || 'Failed to load reels');
        } finally {
            setLoading(false);
        }
    };

    const handleBookmark = useCallback(async (reelId: string) => {
        try {
            const response = await fetch(`/api/reels/${reelId}/bookmark`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                // Update local state
                setReels(prev => prev.map(reel =>
                    reel.id === reelId ? { ...reel, is_bookmarked: !reel.is_bookmarked } : reel
                ));
            }
        } catch (err) {
            console.error('Error bookmarking reel:', err);
        }
    }, []);

    const handleUnderstood = useCallback(async (reelId: string) => {
        try {
            const response = await fetch(`/api/reels/${reelId}/understood`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                // Update local state
                setReels(prev => prev.map(reel =>
                    reel.id === reelId ? { ...reel, is_understood: !reel.is_understood } : reel
                ));
            }
        } catch (err) {
            console.error('Error marking reel as understood:', err);
        }
    }, []);

    const handleProgressUpdate = useCallback(async (reelId: string, progress: number, lastPosition: number) => {
        try {
            await fetch(`/api/reels/${reelId}/progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress, lastPosition }),
            });

            // Update local state
            setReels(prev => prev.map(reel =>
                reel.id === reelId ? { ...reel, progress } : reel
            ));
        } catch (err) {
            console.error('Error updating progress:', err);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Educational Reels
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

    if (error) {
        // Show setup instructions for database errors
        if (error === 'DATABASE_NOT_CONFIGURED' || error === 'NO_REELS_FOUND') {
            return <DatabaseSetupInstructions />;
        }

        // Show regular error for other issues
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        Educational Reels
                    </h1>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <p className="text-red-800">
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Filter Bar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-white">
                        Educational Reels
                    </h1>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('bookmarked')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'bookmarked'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Bookmarked
                        </button>
                        <button
                            onClick={() => setFilter('not_understood')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filter === 'not_understood'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            Not Understood
                        </button>
                    </div>
                </div>
            </div>

            {/* Reel Feed */}
            <div className="pt-16">
                <ReelFeed
                    reels={reels}
                    onBookmark={handleBookmark}
                    onUnderstood={handleUnderstood}
                    onProgressUpdate={handleProgressUpdate}
                />
            </div>
        </div>
    );
}
