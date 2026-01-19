/**
 * Reel Metadata Editor Component
 * Bilingual form for editing reel metadata (title, description, keywords, captions, topics)
 */

'use client';

import { useState } from 'react';

interface ReelMetadataEditorProps {
    reel: any;
    onSave: (metadata: any) => void;
    onCancel: () => void;
    disabled?: boolean;
}

export default function ReelMetadataEditor({
    reel,
    onSave,
    onCancel,
    disabled = false,
}: ReelMetadataEditorProps) {
    const [titleEn, setTitleEn] = useState(reel.title_en || '');
    const [titleAr, setTitleAr] = useState(reel.title_ar || '');
    const [descriptionEn, setDescriptionEn] = useState(reel.description_en || '');
    const [descriptionAr, setDescriptionAr] = useState(reel.description_ar || '');
    const [keywordsEn, setKeywordsEn] = useState(
        Array.isArray(reel.keywords_en) ? reel.keywords_en.join(', ') : ''
    );
    const [keywordsAr, setKeywordsAr] = useState(
        Array.isArray(reel.keywords_ar) ? reel.keywords_ar.join('، ') : ''
    );
    const [topicsEn, setTopicsEn] = useState(
        Array.isArray(reel.topics_en) ? reel.topics_en.join(', ') : ''
    );
    const [topicsAr, setTopicsAr] = useState(
        Array.isArray(reel.topics_ar) ? reel.topics_ar.join('، ') : ''
    );
    const [captionsEn, setCaptionsEn] = useState(reel.captions_en || '');
    const [captionsAr, setCaptionsAr] = useState(reel.captions_ar || '');

    const handleSave = () => {
        const metadata = {
            title_en: titleEn,
            title_ar: titleAr,
            description_en: descriptionEn,
            description_ar: descriptionAr,
            keywords_en: keywordsEn.split(',').map(k => k.trim()).filter(k => k),
            keywords_ar: keywordsAr.split('، ').map(k => k.trim()).filter(k => k),
            topics_en: topicsEn.split(',').map(t => t.trim()).filter(t => t),
            topics_ar: topicsAr.split('، ').map(t => t.trim()).filter(t => t),
            captions_en: captionsEn,
            captions_ar: captionsAr,
        };

        onSave(metadata);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
                onClick={onCancel}
            ></div>

            {/* Modal content */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                            Edit Reel Metadata
                        </h2>
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6 6-6 6 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* English section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                                English Metadata
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={titleEn}
                                        onChange={(e) => setTitleEn(e.target.value)}
                                        disabled={disabled}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={descriptionEn}
                                        onChange={(e) => setDescriptionEn(e.target.value)}
                                        disabled={disabled}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Keywords (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={keywordsEn}
                                        onChange={(e) => setKeywordsEn(e.target.value)}
                                        disabled={disabled}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="e.g., algebra, equations, solving"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Topics (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={topicsEn}
                                        onChange={(e) => setTopicsEn(e.target.value)}
                                        disabled={disabled}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="e.g., mathematics, science, physics"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Captions
                                    </label>
                                    <textarea
                                        value={captionsEn}
                                        onChange={(e) => setCaptionsEn(e.target.value)}
                                        disabled={disabled}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="English captions for the video..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Arabic section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200" dir="rtl">
                                البيانات بالعربية
                            </h3>
                            <div className="space-y-4" dir="rtl">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        العنوان
                                    </label>
                                    <input
                                        type="text"
                                        value={titleAr}
                                        onChange={(e) => setTitleAr(e.target.value)}
                                        disabled={disabled}
                                        dir="rtl"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الوصف
                                    </label>
                                    <textarea
                                        value={descriptionAr}
                                        onChange={(e) => setDescriptionAr(e.target.value)}
                                        disabled={disabled}
                                        rows={3}
                                        dir="rtl"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الكلمات المفتاحية (مفصولة بفاصلة)
                                    </label>
                                    <input
                                        type="text"
                                        value={keywordsAr}
                                        onChange={(e) => setKeywordsAr(e.target.value)}
                                        disabled={disabled}
                                        dir="rtl"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="مثال: الجبر، المعادلات، الفيزياء"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        المواضيع (مفصولة بفاصلة)
                                    </label>
                                    <input
                                        type="text"
                                        value={topicsAr}
                                        onChange={(e) => setTopicsAr(e.target.value)}
                                        disabled={disabled}
                                        dir="rtl"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="مثال: الرياضيات، العلوم، الفيزياء"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        الترجمة النصية
                                    </label>
                                    <textarea
                                        value={captionsAr}
                                        onChange={(e) => setCaptionsAr(e.target.value)}
                                        disabled={disabled}
                                        rows={4}
                                        dir="rtl"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="الترجمة النصية للفيديو..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 p-6 border-t border-gray-200">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={disabled}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
