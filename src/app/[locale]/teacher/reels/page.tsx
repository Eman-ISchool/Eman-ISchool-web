/**
 * Teacher Reels Management Page
 * Displays all reels and source content for a teacher with filtering and management options
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ReelStatusBadge from '@/components/teacher/ReelStatusBadge';
import ReelPreviewModal from '@/components/teacher/ReelPreviewModal';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface Reel {
    id: string;
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    video_url: string;
    thumbnail_url: string | null;
    duration_seconds: number;
    status: 'queued' | 'processing' | 'pending_review' | 'approved' | 'rejected' | 'failed' | 'published' | 'unpublished';
    created_at: string;
    lesson_id: string | null;
    subject: string | null;
    grade_level: string | null;
    source_id?: string;
    source_type?: 'auto_generated' | 'uploaded' | 'recorded' | 'external';
}

interface SourceContent {
    id: string;
    type: 'video' | 'document' | 'recording' | 'external_link';
    status: 'uploaded' | 'processing' | 'transcribing' | 'ready' | 'failed';
    original_filename: string;
    file_size: number;
    duration_seconds: number | null;
    page_count: number | null;
    created_at: string;
    processing_job?: {
        id: string;
        status: 'pending' | 'processing' | 'paused' | 'completed' | 'failed';
        current_step: string;
        progress_percent: number;
        error_message: string | null;
    };
    generated_reels?: Reel[];
}

type ViewMode = 'reels' | 'source-content';

export default function TeacherReelsPage() {
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const [viewMode, setViewMode] = useState<ViewMode>('reels');
    const [reels, setReels] = useState<Reel[]>([]);
    const [sourceContent, setSourceContent] = useState<SourceContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending_review' | 'approved' | 'rejected' | 'failed' | 'processing' | 'ready' | 'published' | 'unpublished'>('all');
    const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        fetchData();

        // Start polling for processing items
        const interval = setInterval(() => {
            if (viewMode === 'source-content') {
                fetchSourceContent();
            }
        }, 5000); // Poll every 5 seconds

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [viewMode, filter]);

    const fetchData = () => {
        if (viewMode === 'reels') {
            fetchReels();
        } else {
            fetchSourceContent();
        }
    };

    const fetchReels = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query params
            const params = new URLSearchParams();
            if (filter !== 'all') {
                params.append('status', filter);
            }
            
            const response = await fetch(`/api/reels?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch reels');
            }
            
            const data = await response.json();
            setReels(data.data || []);
        } catch (err: any) {
            console.error('Error fetching reels:', err);
            setError(err.message || 'Failed to load reels');
        } finally {
            setLoading(false);
        }
    };

    const fetchSourceContent = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch('/api/source-content');
            
            if (!response.ok) {
                throw new Error('Failed to fetch source content');
            }
            
            const data = await response.json();
            setSourceContent(data.data || []);
        } catch (err: any) {
            console.error('Error fetching source content:', err);
            setError(err.message || 'Failed to load source content');
        } finally {
            setLoading(false);
        }
    };

    const handlePreviewClick = (reel: Reel) => {
        setSelectedReel(reel);
        setIsPreviewModalOpen(true);
    };

    const handlePublish = async (reelId: string) => {
        try {
            const response = await fetch(`/api/reels/${reelId}/publish`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to publish reel');
            }

            // Refresh reels list
            fetchData();
        } catch (err) {
            console.error('[TeacherReels] Error publishing reel:', err);
            alert('Failed to publish reel. Please try again.');
        }
    };

    const handleUnpublish = async (reelId: string) => {
        try {
            const response = await fetch(`/api/reels/${reelId}/unpublish`, {
                method: 'POST',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to unpublish reel');
            }

            // Refresh reels list
            fetchData();
        } catch (err) {
            console.error('[TeacherReels] Error unpublishing reel:', err);
            alert('Failed to unpublish reel. Please try again.');
        }
    };

    const handleDelete = async (reelId: string) => {
        if (!confirm('Are you sure you want to delete this reel? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`/api/reels/${reelId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete reel');
            }

            // Refresh reels list
            fetchData();
        } catch (err) {
            console.error('[TeacherReels] Error deleting reel:', err);
            alert('Failed to delete reel. Please try again.');
        }
    };

    const handleModalClose = () => {
        setIsPreviewModalOpen(false);
        setSelectedReel(null);
    };

    const handleReelUpdate = () => {
        // Refresh the reels list after any updates
        fetchData();
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number | null): string => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getSourceStatusColor = (status: SourceContent['status']): string => {
        switch (status) {
            case 'uploaded':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
            case 'transcribing':
                return 'bg-yellow-100 text-yellow-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getProcessingProgress = (job?: SourceContent['processing_job']): number => {
        return job?.progress_percent || 0;
    };

    if (loading && reels.length === 0 && sourceContent.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">
                        My Reels
                    </h1>
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <p className="text-gray-600 mb-4">
                            Loading...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Reels
                    </h1>
                    <Link
                        href={withLocalePrefix('/teacher/reels/upload', locale)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Upload Content
                    </Link>
                </div>

                {/* View Mode Toggle */}
                <div className="mb-6 flex gap-4">
                    <button
                        onClick={() => setViewMode('reels')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'reels'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Generated Reels
                    </button>
                    <button
                        onClick={() => setViewMode('source-content')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'source-content'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        Source Content
                    </button>
                </div>

                {/* Reels View */}
                {viewMode === 'reels' && (
                    <div className="space-y-6">
                        <div className="mb-6 flex gap-4 border-b border-gray-200">
                            <button
                                onClick={() => setFilter('all')}
                                className={`border-b-2 px-4 pb-4 font-medium transition-colors ${
                                    filter === 'all'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                                type="button"
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('pending_review')}
                                className={`border-b-2 px-4 pb-4 font-medium transition-colors ${
                                    filter === 'pending_review'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                                type="button"
                            >
                                Pending Review
                            </button>
                            <button
                                onClick={() => setFilter('approved')}
                                className={`border-b-2 px-4 pb-4 font-medium transition-colors ${
                                    filter === 'approved'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                                type="button"
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilter('rejected')}
                                className={`border-b-2 px-4 pb-4 font-medium transition-colors ${
                                    filter === 'rejected'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                                type="button"
                            >
                                Rejected
                            </button>
                            <button
                                onClick={() => setFilter('failed')}
                                className={`border-b-2 px-4 pb-4 font-medium transition-colors ${
                                    filter === 'failed'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                                type="button"
                            >
                                Failed
                            </button>
                        </div>

                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <div className="rounded-lg bg-white p-6 shadow-md">
                            {reels.length === 0 ? (
                                <div className="py-12 text-center">
                                    <p className="mb-4 text-gray-600">
                                        No reels found. Generate your first AI reel from lesson materials.
                                    </p>
                                    <Link
                                        href={withLocalePrefix('/teacher/reels/upload', locale)}
                                        className="inline-block rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        Upload Content
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reels.map((reel) => (
                                        <div
                                            key={reel.id}
                                            className="cursor-pointer rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
                                            onClick={() => handlePreviewClick(reel)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="mb-1 text-lg font-semibold text-gray-900">
                                                        {reel.title_en}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {reel.description_en}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <ReelStatusBadge status={reel.status} />
                                                    <div className="flex gap-1">
                                                        {reel.status === 'published' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUnpublish(reel.id);
                                                                }}
                                                                className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-gray-200"
                                                                title="Unpublish reel"
                                                                type="button"
                                                            >
                                                                Unpublish
                                                            </button>
                                                        )}
                                                        {reel.status === 'unpublished' && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePublish(reel.id);
                                                                }}
                                                                className="rounded bg-green-100 px-2 py-1 text-xs text-green-800 hover:bg-green-200"
                                                                title="Publish reel"
                                                                type="button"
                                                            >
                                                                Publish
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(reel.id);
                                                            }}
                                                            className="rounded bg-red-100 px-2 py-1 text-xs text-red-800 hover:bg-red-200"
                                                            title="Delete reel"
                                                            type="button"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                {reel.duration_seconds > 0 && (
                                                    <span>
                                                        {Math.floor(reel.duration_seconds / 60)}:
                                                        {(reel.duration_seconds % 60)
                                                            .toString()
                                                            .padStart(2, '0')}
                                                    </span>
                                                )}
                                                <span>
                                                    Created: {new Date(reel.created_at).toLocaleDateString()}
                                                </span>
                                                {reel.subject && <span>Subject: {reel.subject}</span>}
                                                {reel.grade_level && <span>Grade: {reel.grade_level}</span>}
                                                {reel.source_type && (
                                                    <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                                                        {reel.source_type}
                                                    </span>
                                                )}
                                            </div>

                                            {reel.lesson_id && (
                                                <div className="mt-2">
                                                    <a
                                                        href={withLocalePrefix(`/dashboard/classroom/${reel.lesson_id}`, locale)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        View Source Lesson
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Source Content View */}
                {viewMode === 'source-content' && (
                    <>
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
                                onClick={() => setFilter('processing')}
                                className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                                    filter === 'processing'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Processing
                            </button>
                            <button
                                onClick={() => setFilter('ready')}
                                className={`pb-4 px-4 border-b-2 font-medium transition-colors ${
                                    filter === 'ready'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Ready
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

                        {/* Error message */}
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Source content list */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {sourceContent.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600 mb-4">
                                        No source content found. Upload your first file to generate reels.
                                    </p>
                                    <Link
                                        href={withLocalePrefix('/teacher/reels/upload', locale)}
                                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Upload Content
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {sourceContent.map((source) => (
                                        <div
                                            key={source.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {source.original_filename}
                                                        </h3>
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSourceStatusColor(source.status)}`}>
                                                            {source.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                                        <span>Type: {source.type}</span>
                                                        <span>Size: {formatFileSize(source.file_size)}</span>
                                                        {source.duration_seconds && (
                                                            <span>Duration: {formatDuration(source.duration_seconds)}</span>
                                                        )}
                                                        {source.page_count && (
                                                            <span>Pages: {source.page_count}</span>
                                                        )}
                                                        <span>
                                                            Uploaded: {new Date(source.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Processing progress */}
                                            {(source.status === 'processing' || source.status === 'transcribing') && source.processing_job && (
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span className="text-gray-600">
                                                            {source.processing_job.current_step}
                                                        </span>
                                                        <span className="font-medium text-blue-600">
                                                            {getProcessingProgress(source.processing_job)}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${getProcessingProgress(source.processing_job)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Generated reels count */}
                                            {source.status === 'ready' && source.generated_reels && source.generated_reels.length > 0 && (
                                                <div className="mt-3 flex items-center gap-4">
                                                    <span className="text-sm text-gray-600">
                                                        Generated {source.generated_reels.length} reel{source.generated_reels.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <Link
                                                        href={withLocalePrefix(`/teacher/reels/upload?sourceId=${source.id}`, locale)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        View Details
                                                    </Link>
                                                </div>
                                            )}

                                            {/* Error message */}
                                            {source.status === 'failed' && source.processing_job?.error_message && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                                                    <p className="text-sm text-red-800">
                                                        {source.processing_job.error_message}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Preview Modal */}
                {selectedReel && (
                    <ReelPreviewModal
                        reel={selectedReel}
                        isOpen={isPreviewModalOpen}
                        onClose={handleModalClose}
                        onUpdate={handleReelUpdate}
                    />
                )}
            </div>
        </div>
    );
}
