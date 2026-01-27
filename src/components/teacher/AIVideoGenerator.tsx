'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Sparkles, Loader2, CheckCircle, XCircle, Video } from 'lucide-react';
import { useVideoGeneration } from '@/hooks/useVideoGeneration';
import { useLanguage } from '@/context/LanguageContext';

interface AIVideoGeneratorProps {
    classId?: string;
    subject?: string;
    gradeLevel?: string;
}

export function AIVideoGenerator({ classId, subject, gradeLevel }: AIVideoGeneratorProps) {
    const { data: session } = useSession();
    const { language } = useLanguage();
    const [prompt, setPrompt] = useState('');
    const { isGenerating, progress, videoUrl, error, status, generateVideo, reset } = useVideoGeneration();

    const isArabic = language === 'ar';
    const maxChars = 500;

    const handleGenerate = async () => {
        if (!prompt.trim() || !session?.user?.id) return;

        await generateVideo({
            prompt: prompt.trim(),
            teacherId: session.user.id,
            classId,
            subject,
            gradeLevel,
        });
    };

    const handleReset = () => {
        reset();
        setPrompt('');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">
                        {isArabic ? 'إنشاء فيديو بالذكاء الاصطناعي' : 'AI Video Generator'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {isArabic ? 'أنشئ مقاطع فيديو تعليمية من النص' : 'Create educational videos from text'}
                    </p>
                </div>
            </div>

            {/* Status Display */}
            {status === 'completed' && videoUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <p className="text-green-800 font-medium">
                            {isArabic ? 'تم إنشاء الفيديو بنجاح!' : 'Video generated successfully!'}
                        </p>
                    </div>
                    <video
                        src={videoUrl}
                        controls
                        className="w-full rounded-lg"
                        style={{ maxHeight: '300px' }}
                    />
                    <button
                        onClick={handleReset}
                        className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        {isArabic ? 'إنشاء فيديو جديد' : 'Create New Video'}
                    </button>
                </div>
            )}

            {status === 'failed' && error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-5 h-5 text-red-600" />
                        <p className="text-red-800 font-medium">
                            {isArabic ? 'فشل إنشاء الفيديو' : 'Video generation failed'}
                        </p>
                    </div>
                    <p className="text-sm text-red-700 mb-3">{error}</p>
                    <button
                        onClick={handleReset}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        {isArabic ? 'حاول مرة أخرى' : 'Try Again'}
                    </button>
                </div>
            )}

            {/* Input Form */}
            {(status === 'idle' || status === 'generating') && (
                <>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {isArabic ? 'اكتب النص أو السيناريو' : 'Enter text or script'}
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value.slice(0, maxChars))}
                            disabled={isGenerating}
                            placeholder={
                                isArabic
                                    ? 'مثال: شرح مبسط لمفهوم الجاذبية للصف الثامن...'
                                    : 'Example: A simple explanation of gravity for grade 8 students...'
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            rows={4}
                            dir={isArabic ? 'rtl' : 'ltr'}
                        />
                        <div className="flex justify-between items-center text-sm">
                            <span className={`${prompt.length > maxChars * 0.9 ? 'text-orange-600' : 'text-gray-500'}`}>
                                {prompt.length} / {maxChars}
                            </span>
                            {prompt.length >= 10 && (
                                <span className="text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-4 h-4" />
                                    {isArabic ? 'جاهز للإنشاء' : 'Ready to generate'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {isGenerating && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                                </span>
                                <span className="text-purple-600 font-medium">{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-600 text-center">
                                {isArabic
                                    ? 'قد يستغرق هذا 1-2 دقيقة. يرجى عدم إغلاق الصفحة.'
                                    : 'This may take 1-2 minutes. Please don\'t close the page.'}
                            </p>
                        </div>
                    )}

                    {/* Generate Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || prompt.length < 10}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {isArabic ? 'جاري الإنشاء...' : 'Generating...'}
                            </>
                        ) : (
                            <>
                                <Video className="w-5 h-5" />
                                {isArabic ? 'إنشاء الفيديو' : 'Generate Video'}
                            </>
                        )}
                    </button>
                </>
            )}

            {/* Info Box */}
            {status === 'idle' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-xs text-blue-800">
                        {isArabic
                            ? '💡 نصيحة: كن محددًا في وصفك للحصول على أفضل النتائج. سيتم نشر الفيديو تلقائيًا للطلاب.'
                            : '💡 Tip: Be specific in your description for best results. Videos are automatically published to students.'}
                    </p>
                </div>
            )}
        </div>
    );
}
