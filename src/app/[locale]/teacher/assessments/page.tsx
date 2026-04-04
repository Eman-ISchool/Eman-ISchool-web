'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Plus, ClipboardCheck, Users, Clock, TrendingUp } from 'lucide-react';
import { useLocale } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageError } from '@/components/ui/page-error';

export default function AssessmentsDashboard() {
    const { data: session, status } = useSession();
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const user = session?.user as any;

    const [assessments, setAssessments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'manage' | 'results'>('manage');

    useEffect(() => {
        if (status !== 'authenticated' || !user?.id) return;

        const fetchAssessments = async () => {
            try {
                setError(null);
                const res = await fetch(`/api/assessments?teacherId=${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAssessments(Array.isArray(data) ? data : []);
                } else {
                    setError(isArabic ? 'فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.' : 'Failed to load assessments. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching assessments:', err);
                setError(isArabic ? 'فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.' : 'Failed to load assessments. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAssessments();
    }, [status, user?.id]);

    const handleRetry = () => {
        setLoading(true);
        setError(null);
        setAssessments([]);
        // Re-trigger the effect by forcing a state change
        const fetchAssessments = async () => {
            try {
                const res = await fetch(`/api/assessments?teacherId=${user?.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setAssessments(Array.isArray(data) ? data : []);
                } else {
                    setError(isArabic ? 'فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.' : 'Failed to load assessments. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching assessments:', err);
                setError(isArabic ? 'فشل في تحميل التقييمات. يرجى المحاولة مرة أخرى.' : 'Failed to load assessments. Please try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    };

    if (status === 'loading' || loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-100 rounded-lg w-48" />
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-gray-50 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <PageError message={error} onRetry={handleRetry} />;
    }

    const manageAssessments = assessments;
    const resultAssessments = assessments.filter((a: any) =>
        (a.assessment_submissions?.[0]?.count || 0) > 0
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{isArabic ? 'التقييمات' : 'Assessments'}</h1>
                    <p className="text-gray-500 mt-1">{isArabic ? 'إنشاء وإدارة الاختبارات والامتحانات' : 'Create and manage tests, quizzes, and exams'}</p>
                </div>
                <Link
                    href={withLocalePrefix('/teacher/assessments/new', locale)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {isArabic ? 'إنشاء اختبار جديد' : 'Build New Test'}
                </Link>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'manage' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {isArabic ? 'إدارة الاختبارات' : 'Manage Tests'}
                </button>
                <button
                    onClick={() => setActiveTab('results')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'results' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {isArabic ? 'النتائج' : 'Results'}
                </button>
            </div>

            {/* Content */}
            {activeTab === 'manage' ? (
                manageAssessments.length === 0 ? (
                    <EmptyState
                        icon={<ClipboardCheck className="w-8 h-8 text-gray-400" />}
                        title={isArabic ? 'لم يتم إنشاء تقييمات' : 'No assessments created'}
                        description={isArabic ? 'أنشئ أول تقييم لاختبار طلابك.' : 'Create your first assessment to test your students.'}
                        action={{ label: isArabic ? 'إنشاء اختبار جديد' : 'Build New Test', href: withLocalePrefix('/teacher/assessments/new', locale) }}
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {manageAssessments.map((assessment: any) => (
                            <Link
                                key={assessment.id}
                                href={withLocalePrefix(`/teacher/assessments/${assessment.id}`, locale)}
                                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <ClipboardCheck className="w-8 h-8 text-blue-400" />
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${assessment.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {assessment.status === 'published' ? (isArabic ? 'منشور' : 'published') : (isArabic ? 'مسودة' : 'draft')}
                                    </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                    {assessment.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {assessment.duration_minutes || 30}min
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {assessment.assessment_submissions?.[0]?.count || 0} {isArabic ? 'تسليم' : 'submissions'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            ) : (
                resultAssessments.length === 0 ? (
                    <EmptyState
                        icon={<TrendingUp className="w-8 h-8 text-gray-400" />}
                        title={isArabic ? 'لا توجد نتائج بعد' : 'No results yet'}
                        description={isArabic ? 'ستظهر النتائج بمجرد تقديم الطلاب للتقييمات.' : 'Results will appear once students submit assessments.'}
                    />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {resultAssessments.map((assessment: any) => (
                            <Link
                                key={assessment.id}
                                href={withLocalePrefix(`/teacher/assessments/${assessment.id}/results`, locale)}
                                className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200"
                            >
                                <h3 className="font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                                    {assessment.title}
                                </h3>
                                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" />
                                        {assessment.assessment_submissions?.[0]?.count || 0} {isArabic ? 'تسليم' : 'submissions'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
