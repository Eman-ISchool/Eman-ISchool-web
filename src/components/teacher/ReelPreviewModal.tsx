/**
 * Reel Preview Modal Component
 * Modal for previewing generated AI reels before approval
 */

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface ReelPreviewModalProps {
    reel: any;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
}

export default function ReelPreviewModal({
    reel,
    isOpen,
    onClose,
    onUpdate,
}: ReelPreviewModalProps) {
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [metadata, setMetadata] = useState({
        title_en: reel.title_en || '',
        title_ar: reel.title_ar || '',
        description_en: reel.description_en || '',
        description_ar: reel.description_ar || '',
        keywords_en: Array.isArray(reel.keywords_en) ? reel.keywords_en.join(', ') : '',
        keywords_ar: Array.isArray(reel.keywords_ar) ? reel.keywords_ar.join('، ') : '',
        topics_en: Array.isArray(reel.topics_en) ? reel.topics_en.join(', ') : '',
        topics_ar: Array.isArray(reel.topics_ar) ? reel.topics_ar.join('، ') : '',
        captions_en: reel.captions_en || '',
        captions_ar: reel.captions_ar || '',
    });

    if (!isOpen) return null;

    const handleSaveMetadata = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/reels/${reel.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title_en: metadata.title_en,
                    title_ar: metadata.title_ar,
                    description_en: metadata.description_en,
                    description_ar: metadata.description_ar,
                    keywords_en: metadata.keywords_en.split(',').map(k => k.trim()).filter(k => k),
                    keywords_ar: metadata.keywords_ar.split('،').map(k => k.trim()).filter(k => k),
                    topics_en: metadata.topics_en.split(',').map(t => t.trim()).filter(t => t),
                    topics_ar: metadata.topics_ar.split('،').map(t => t.trim()).filter(t => t),
                    captions_en: metadata.captions_en,
                    captions_ar: metadata.captions_ar,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update metadata');
            }

            setSuccess('Metadata updated successfully');
            setIsEditing(false);
            
            if (onUpdate) {
                onUpdate();
            }
        } catch (err: any) {
            console.error('Error updating metadata:', err);
            setError(err.message || 'Failed to update metadata');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/reels/${reel.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'approve',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to approve reel');
            }

            setSuccess('Reel approved and published successfully');
            
            if (onUpdate) {
                onUpdate();
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error approving reel:', err);
            setError(err.message || 'Failed to approve reel');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = prompt('Please provide a reason for rejecting this reel:');
        if (!reason) return;

        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/reels/${reel.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'reject',
                    rejection_reason: reason,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject reel');
            }

            setSuccess('Reel rejected successfully');
            
            if (onUpdate) {
                onUpdate();
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error rejecting reel:', err);
            setError(err.message || 'Failed to reject reel');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestRegenerate = async () => {
        try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const response = await fetch(`/api/reels/${reel.id}/regenerate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to request regeneration');
            }

            setSuccess('Regeneration requested successfully');
            
            if (onUpdate) {
                onUpdate();
            }

            // Close modal after a short delay
            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error requesting regeneration:', err);
            setError(err.message || 'Failed to request regeneration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal content */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                            Preview Reel
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6 6 6 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Error/Success messages */}
                    {error && (
                        <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800">{success}</p>
                        </div>
                    )}

                    {/* Video player */}
                    {reel.video_url && (
                        <div className="aspect-[9/16] bg-black rounded-lg mb-6">
                            <video
                                className="w-full h-full"
                                controls
                                poster={reel.thumbnail_url || undefined}
                            >
                                <source src={reel.video_url} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="space-y-6 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Metadata
                            </h3>
                            {!isEditing && reel.status === 'pending_review' && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Edit Metadata
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* English metadata */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">
                                    English Metadata
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.title_en}
                                            onChange={(e) => setMetadata({ ...metadata, title_en: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={metadata.description_en}
                                            onChange={(e) => setMetadata({ ...metadata, description_en: e.target.value })}
                                            disabled={!isEditing}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.keywords_en}
                                            onChange={(e) => setMetadata({ ...metadata, keywords_en: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Topics
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.topics_en}
                                            onChange={(e) => setMetadata({ ...metadata, topics_en: e.target.value })}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Captions
                                        </label>
                                        <textarea
                                            value={metadata.captions_en}
                                            onChange={(e) => setMetadata({ ...metadata, captions_en: e.target.value })}
                                            disabled={!isEditing}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Arabic metadata */}
                            <div className="space-y-4">
                                <h4 className="text-md font-semibold text-gray-900 mb-3">
                                    البيانات بالعربية
                                </h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            العنوان
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.title_ar}
                                            onChange={(e) => setMetadata({ ...metadata, title_ar: e.target.value })}
                                            disabled={!isEditing}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الوصف
                                        </label>
                                        <textarea
                                            value={metadata.description_ar}
                                            onChange={(e) => setMetadata({ ...metadata, description_ar: e.target.value })}
                                            disabled={!isEditing}
                                            rows={3}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الكلمات المفتاحية
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.keywords_ar}
                                            onChange={(e) => setMetadata({ ...metadata, keywords_ar: e.target.value })}
                                            disabled={!isEditing}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            المواضيع
                                        </label>
                                        <input
                                            type="text"
                                            value={metadata.topics_ar}
                                            onChange={(e) => setMetadata({ ...metadata, topics_ar: e.target.value })}
                                            disabled={!isEditing}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الترجمة النصية
                                        </label>
                                        <textarea
                                            value={metadata.captions_ar}
                                            onChange={(e) => setMetadata({ ...metadata, captions_ar: e.target.value })}
                                            disabled={!isEditing}
                                            rows={4}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Edit mode action buttons */}
                        {isEditing && (
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset metadata to original values
                                        setMetadata({
                                            title_en: reel.title_en || '',
                                            title_ar: reel.title_ar || '',
                                            description_en: reel.description_en || '',
                                            description_ar: reel.description_ar || '',
                                            keywords_en: Array.isArray(reel.keywords_en) ? reel.keywords_en.join(', ') : '',
                                            keywords_ar: Array.isArray(reel.keywords_ar) ? reel.keywords_ar.join('، ') : '',
                                            topics_en: Array.isArray(reel.topics_en) ? reel.topics_en.join(', ') : '',
                                            topics_ar: Array.isArray(reel.topics_ar) ? reel.topics_ar.join('، ') : '',
                                            captions_en: reel.captions_en || '',
                                            captions_ar: reel.captions_ar || '',
                                        });
                                    }}
                                    disabled={loading}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveMetadata}
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Metadata'}
                                </button>
                            </div>
                        )}

                        {/* Reel info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                Reel Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Duration:</span>
                                    <span className="font-medium text-gray-900">{reel.duration_seconds}s</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Status:</span>
                                    <span className={`font-medium ${
                                        reel.status === 'pending_review'
                                            ? 'text-yellow-600'
                                            : reel.status === 'approved'
                                            ? 'text-green-600'
                                            : reel.status === 'rejected'
                                            ? 'text-red-600'
                                            : 'text-gray-900'
                                    }`}>
                                        {reel.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Created:</span>
                                    <span className="font-medium text-gray-900">
                                        {new Date(reel.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                {reel.lesson_id && (
                                    <div>
                                        <span className="text-gray-600">Lesson:</span>
                                        <a
                                            href={withLocalePrefix(`/dashboard/classroom/${reel.lesson_id}`, locale)}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            View Lesson
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        {reel.status === 'pending_review' && (
                            <div className="flex gap-3 p-6 border-t border-gray-200">
                                <button
                                    onClick={handleRequestRegenerate}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Requesting...' : 'Request Regeneration'}
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Rejecting...' : 'Reject'}
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Approving...' : 'Approve & Publish'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
