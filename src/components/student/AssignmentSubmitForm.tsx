'use client';

import { useState } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AssignmentSubmitFormProps {
    assignmentId: string;
    lessonId: string;
    locale: string;
}

export default function AssignmentSubmitForm({ assignmentId, lessonId, locale }: AssignmentSubmitFormProps) {
    const t = useTranslations('student.assignmentSubmit');
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
            setError(t('fileTooLarge'));
            return;
        }
        setFile(selectedFile);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            setError(t('fileRequired'));
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/assignments/${assignmentId}/submissions`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to submit assignment');
            }

            const data = await res.json();
            setSuccess(true);
        } catch (err: any) {
            console.error('Error submitting assignment:', err);
            setError(err.message || t('submitError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                    {t('submitSuccess')}
                </h3>
                <p className="text-green-700 mb-6">
                    {t('submitSuccessMessage')}
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    {t('submitAnother')}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-brand-primary" />
                {t('submitAssignment')}
            </h2>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="ml-auto text-red-600 hover:text-red-800 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('uploadFile')}
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.zip"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent file:mr-4 file:py-2"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <Upload className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {t('fileFormats')}: PDF, DOC, DOCX, ZIP
                    </p>
                    <p className="text-xs text-gray-500">
                        {t('maxFileSize')}: 10MB
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {t('submitting')}
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5" />
                            {t('submit')}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
