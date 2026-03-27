'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Clock, Circle, User, ChevronRight } from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import { EnrollmentStatusCard } from '@/components/student/EnrollmentStatusCard';
import type { EnrollmentStatusData } from '@/components/student/EnrollmentStatusCard';
import { OnboardingChecklist } from '@/components/student/OnboardingChecklist';
import type { StudentOnboardingTask, EnrollmentAppStatus } from '@/types/enrollment';
import { DataState, createIdleState, createLoadingState, createErrorState, createSuccessState } from '@/types/page-state';

// --------------------------------------------------------------------------
// Mock data (will be replaced by real API calls)
// --------------------------------------------------------------------------

const MOCK_ONBOARDING: {
    enrollment: EnrollmentStatusData;
    tasks: StudentOnboardingTask[];
    pendingActions: { id: string; label: string; type: string }[];
    studentProfile: { name: string; grade: string; nationality: string };
} = {
    enrollment: {
        applicationId: 'app-001',
        applicationNumber: 'APP-2026-0001',
        status: 'provisionally_accepted' as EnrollmentAppStatus,
        pendingItemsCount: 3,
        lastUpdateDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    tasks: [
        {
            id: 't1',
            application_id: 'app-001',
            student_user_id: 'stu-001',
            task_key: 'submit_emirates_id',
            title_en: 'Submit Emirates ID Copy',
            title_ar: 'تقديم نسخة من الهوية الإماراتية',
            description_en: 'Upload a clear copy of your Emirates ID (front and back)',
            description_ar: 'قم بتحميل نسخة واضحة من هويتك الإماراتية (الأمامية والخلفية)',
            is_required: true,
            is_completed: true,
            completed_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            completed_by: 'stu-001',
            sort_order: 1,
            due_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 't2',
            application_id: 'app-001',
            student_user_id: 'stu-001',
            task_key: 'complete_medical_form',
            title_en: 'Complete Medical Form',
            title_ar: 'أكمل النموذج الطبي',
            description_en: 'Fill out the student medical history form',
            description_ar: 'قم بملء استمارة التاريخ الطبي للطالب',
            is_required: true,
            is_completed: false,
            completed_at: null,
            completed_by: null,
            sort_order: 2,
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 't3',
            application_id: 'app-001',
            student_user_id: 'stu-001',
            task_key: 'uniform_collection',
            title_en: 'Collect School Uniform',
            title_ar: 'استلام الزي المدرسي',
            description_en: 'Visit the school store to collect your uniform',
            description_ar: 'قم بزيارة متجر المدرسة لاستلام الزي المدرسي',
            is_required: false,
            is_completed: false,
            completed_at: null,
            completed_by: null,
            sort_order: 3,
            due_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 't4',
            application_id: 'app-001',
            student_user_id: 'stu-001',
            task_key: 'attestation_upload',
            title_en: 'Upload Attested Transfer Certificate',
            title_ar: 'تحميل شهادة النقل المصدقة',
            description_en: 'Upload your transfer certificate after attestation from the Ministry',
            description_ar: 'قم بتحميل شهادة النقل بعد التصديق من الوزارة',
            is_required: true,
            is_completed: false,
            completed_at: null,
            completed_by: null,
            sort_order: 4,
            due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
        {
            id: 't5',
            application_id: 'app-001',
            student_user_id: 'stu-001',
            task_key: 'orientation_attend',
            title_en: 'Attend Orientation Day',
            title_ar: 'حضور يوم التوجيه',
            description_en: 'Join the new student orientation session on campus',
            description_ar: 'انضم إلى جلسة توجيه الطلاب الجدد في الحرم الجامعي',
            is_required: false,
            is_completed: true,
            completed_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            completed_by: 'stu-001',
            sort_order: 5,
            due_date: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        },
    ],
    pendingActions: [
        { id: 'pa1', label: 'Missing Emirates ID attestation', type: 'attestation' },
        { id: 'pa2', label: 'Medical form not submitted', type: 'document' },
        { id: 'pa3', label: 'Transfer certificate pending', type: 'document' },
    ],
    studentProfile: {
        name: 'Ahmed Hassan',
        grade: 'Grade 10',
        nationality: 'Egyptian',
    },
};

// --------------------------------------------------------------------------
// Page Component
// --------------------------------------------------------------------------

interface OnboardingData {
    enrollment: EnrollmentStatusData;
    tasks: StudentOnboardingTask[];
    pendingActions: { id: string; label: string; type: string }[];
    studentProfile: { name: string; grade: string; nationality: string };
}

export default function StudentOnboardingPage() {
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const isAr = locale === 'ar';

    const [state, setState] = useState<DataState<OnboardingData>>(createIdleState());

    const fetchData = useCallback(async () => {
        setState(createLoadingState());
        try {
            // In production, these would be real API calls:
            // const onboardingRes = await fetch('/api/enrollment/onboarding');
            // const appRes = await fetch(`/api/enrollment/applications/${applicationId}`);
            await new Promise((resolve) => setTimeout(resolve, 600));
            setState(createSuccessState(MOCK_ONBOARDING));
        } catch {
            setState(createErrorState('Failed to load onboarding data', () => fetchData()));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTaskComplete = async (taskId: string, completed: boolean) => {
        if (state.status !== 'success') return;
        // In production: PUT /api/enrollment/onboarding
        await new Promise((resolve) => setTimeout(resolve, 400));
        setState(
            createSuccessState({
                ...state.data,
                tasks: state.data.tasks.map((t) =>
                    t.id === taskId
                        ? {
                              ...t,
                              is_completed: completed,
                              completed_at: completed ? new Date().toISOString() : null,
                          }
                        : t
                ),
            })
        );
    };

    if (state.status === 'loading' || state.status === 'idle') {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse bg-teal-100/70 rounded-xl" />
                <div className="h-32 animate-pulse bg-teal-100/70 rounded-2xl" />
                <div className="h-64 animate-pulse bg-teal-100/70 rounded-2xl" />
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <p className="text-slate-500">{state.message}</p>
                <button
                    onClick={state.retryFn}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors"
                >
                    {isAr ? 'حاول مرة أخرى' : 'Try Again'}
                </button>
            </div>
        );
    }

    if (state.status !== 'success') return null;
    const { enrollment, tasks, pendingActions, studentProfile } = state.data;
    const isProvisional = enrollment.status === 'provisionally_accepted';
    const incompleteRequired = tasks.filter((t: StudentOnboardingTask) => t.is_required && !t.is_completed);

    return (
        <div className={`space-y-6 pb-8 ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-slate-800">
                    {isAr ? 'التسجيل والإعداد' : 'Onboarding'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {isAr ? 'تتبع حالة التسجيل وأكمل المهام المطلوبة' : 'Track your enrollment status and complete required tasks'}
                </p>
            </div>

            {/* Enrollment Status Card */}
            <EnrollmentStatusCard data={enrollment} locale={locale} />

            {/* Provisional Warning */}
            {isProvisional && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            {isAr ? 'القبول المشروط' : 'Provisional Acceptance'}
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                            {isAr
                                ? 'تم قبولك بشكل مشروط. يرجى إكمال جميع العناصر المعلقة أدناه للحصول على القبول الكامل.'
                                : 'You have been provisionally accepted. Please complete all pending mandatory items below to finalize your enrollment.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Pending Action Items */}
            {pendingActions.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <h2 className="font-semibold text-slate-800 text-sm">
                            {isAr ? 'عناصر معلقة' : 'Pending Action Items'}
                        </h2>
                        <span className="ml-auto text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            {pendingActions.length}
                        </span>
                    </div>
                    <div className="divide-y divide-slate-50">
                        {pendingActions.map((action) => (
                            <div key={action.id} className="px-5 py-3 flex items-center gap-3">
                                <Circle className="w-4 h-4 text-orange-400 shrink-0" />
                                <span className="text-sm text-slate-700 flex-1">{action.label}</span>
                                {action.type === 'document' && (
                                    <Link
                                        href={withLocalePrefix('/student/documents', locale)}
                                        className="text-xs font-medium text-teal-600 hover:text-teal-700"
                                    >
                                        {isAr ? 'رفع' : 'Upload'}
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Onboarding Checklist */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">
                        {isAr ? 'قائمة مهام الإعداد' : 'Onboarding Checklist'}
                    </h2>
                    {incompleteRequired.length > 0 && (
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isAr
                                ? `${incompleteRequired.length} مهمة إلزامية متبقية`
                                : `${incompleteRequired.length} required task${incompleteRequired.length !== 1 ? 's' : ''} remaining`}
                        </p>
                    )}
                </div>
                <div className="p-5">
                    <OnboardingChecklist
                        tasks={tasks}
                        locale={locale}
                        onComplete={handleTaskComplete}
                    />
                </div>
            </div>

            {/* Student Profile Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                    <h2 className="font-semibold text-slate-800 text-sm">
                        {isAr ? 'ملخص الملف الشخصي' : 'Student Profile Summary'}
                    </h2>
                </div>
                <div className="px-5 py-4 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                            <User className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800">{studentProfile.name}</p>
                            <p className="text-xs text-slate-500">
                                {studentProfile.grade} &middot; {studentProfile.nationality}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={withLocalePrefix('/student/profile', locale)}
                        className="flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
                    >
                        {isAr ? 'عرض الملف الشخصي الكامل' : 'View Full Profile'}
                        <ChevronRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
