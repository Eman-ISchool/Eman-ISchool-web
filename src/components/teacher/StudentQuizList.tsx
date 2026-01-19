'use client';

import { useState } from 'react';
import { User, FileText, Download, Check, Clock, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface StudentSubmission {
    studentId: string;
    studentName: string;
    studentImage?: string;
    assignmentId: string;
    assignmentTitle: string;
    status: 'pending' | 'submitted' | 'late' | 'graded';
    submittedAt?: string;
    grade?: string;
}

interface StudentQuizListProps {
    submissions: StudentSubmission[];
    title?: string;
    onSeeAll?: () => void;
    onViewSubmission?: (studentId: string, assignmentId: string) => void;
    onDownload?: (studentId: string, assignmentId: string) => void;
}

export function StudentQuizList({
    submissions,
    title,
    onSeeAll,
    onViewSubmission,
    onDownload,
}: StudentQuizListProps) {
    const { t, language } = useLanguage();
    const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'late'>('all');

    const displayTitle = title || (language === 'ar' ? 'متابعة الطلاب' : 'Student Submissions');

    const statusConfig = {
        pending: {
            label: language === 'ar' ? 'قيد الانتظار' : 'Pending',
            className: 'bg-yellow-100 text-yellow-700',
            icon: <Clock className="w-3 h-3" />,
        },
        submitted: {
            label: language === 'ar' ? 'تم التسليم' : 'Submitted',
            className: 'bg-green-100 text-green-700',
            icon: <Check className="w-3 h-3" />,
        },
        late: {
            label: language === 'ar' ? 'متأخر' : 'Late',
            className: 'bg-red-100 text-red-700',
            icon: <AlertTriangle className="w-3 h-3" />,
        },
        graded: {
            label: language === 'ar' ? 'تم التصحيح' : 'Graded',
            className: 'bg-blue-100 text-blue-700',
            icon: <Check className="w-3 h-3" />,
        },
    };

    const filteredSubmissions = submissions.filter(
        (s) => filter === 'all' || s.status === filter
    );

    const counts = {
        all: submissions.length,
        pending: submissions.filter((s) => s.status === 'pending').length,
        submitted: submissions.filter((s) => s.status === 'submitted').length,
        late: submissions.filter((s) => s.status === 'late').length,
    };

    if (submissions.length === 0) {
        return (
            <div className="card-soft p-8 text-center">
                <FileText className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-3" />
                <p className="text-[var(--color-text-secondary)]">
                    {language === 'ar' ? 'لا توجد واجبات مسلمة' : 'No submissions yet'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {displayTitle}
                </h2>
                {onSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                        {t('home.viewAll')}
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {(['all', 'pending', 'submitted', 'late'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${filter === f
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)]'
                            }`}
                    >
                        {f === 'all'
                            ? language === 'ar'
                                ? 'الكل'
                                : 'All'
                            : statusConfig[f].label}
                        <span className="opacity-75">({counts[f]})</span>
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            <div className="space-y-2">
                {filteredSubmissions.slice(0, 5).map((submission) => {
                    const config = statusConfig[submission.status];
                    return (
                        <div
                            key={`${submission.studentId}-${submission.assignmentId}`}
                            className="card-soft p-4 flex items-center gap-4"
                        >
                            {/* Student Avatar */}
                            <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden flex-shrink-0">
                                {submission.studentImage ? (
                                    <img
                                        src={submission.studentImage}
                                        alt={submission.studentName}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-[var(--color-primary)]" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[var(--color-text-primary)] truncate">
                                    {submission.studentName}
                                </h4>
                                <p className="text-sm text-[var(--color-text-secondary)] truncate">
                                    {submission.assignmentTitle}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span
                                className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.className}`}
                            >
                                {config.icon}
                                {config.label}
                            </span>

                            {/* Actions */}
                            {submission.status !== 'pending' && onDownload && (
                                <button
                                    onClick={() => onDownload(submission.studentId, submission.assignmentId)}
                                    className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                                    title={language === 'ar' ? 'تحميل' : 'Download'}
                                >
                                    <Download className="w-4 h-4 text-[var(--color-primary)]" />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
