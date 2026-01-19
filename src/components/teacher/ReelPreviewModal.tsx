/**
 * Reel Preview Modal Component
 * Modal for previewing generated AI reels before approval
 */

'use client';

import { useState } from 'react';

interface ReelPreviewModalProps {
    reel: any;
    isOpen: boolean;
    onClose: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onRequestRegenerate?: () => void;
}

export default function ReelPreviewModal({
    reel,
    isOpen,
    onClose,
    onApprove,
    onReject,
    onRequestRegenerate,
}: ReelPreviewModalProps) {
    if (!isOpen) return null;

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

                    {/* Video player */}
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

                    {/* Metadata */}
                    <div className="space-y-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* English metadata */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    English Metadata
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={reel.title_en}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            defaultValue={reel.description_en || ''}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Keywords
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={Array.isArray(reel.keywords_en) ? reel.keywords_en.join(', ') : ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Topics
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={Array.isArray(reel.topics_en) ? reel.topics_en.join(', ') : ''}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Captions
                                        </label>
                                        <textarea
                                            defaultValue={reel.captions_en || ''}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                            {/* Arabic metadata */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                    البيانات بالعربية
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            العنوان
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={reel.title_ar}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الوصف
                                        </label>
                                        <textarea
                                            defaultValue={reel.description_ar || ''}
                                            rows={3}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الكلمات المفتاحية
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={Array.isArray(reel.keywords_ar) ? reel.keywords_ar.join('، ') : ''}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            المواضيع
                                        </label>
                                        <input
                                            type="text"
                                            defaultValue={Array.isArray(reel.topics_ar) ? reel.topics_ar.join('، ') : ''}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            الترجمة النصية
                                        </label>
                                        <textarea
                                            defaultValue={reel.captions_ar || ''}
                                            rows={4}
                                            dir="rtl"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

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
                                            href={`/teacher/lessons/${reel.lesson_id}`}
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            View Lesson
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 p-6 border-t border-gray-200">
                            {onRequestRegenerate && (
                                <button
                                    onClick={onRequestRegenerate}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Request Regeneration
                                </button>
                            )}
                            <div className="flex-1"></div>
                            {onReject && (
                                <button
                                    onClick={onReject}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Reject
                                </button>
                            )}
                            {onApprove && (
                                <button
                                    onClick={onApprove}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Approve & Publish
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
