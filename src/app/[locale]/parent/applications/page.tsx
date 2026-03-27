'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    ChevronRight,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    AlertTriangle,
    Loader2,
    User,
} from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import { APPLICATION_STATUS_LABELS } from '@/types/enrollment';
import { DataState, createIdleState, createLoadingState, createErrorState, createSuccessState } from '@/types/page-state';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

interface ApplicationListItem {
    id: string;
    applicationNumber: string;
    studentName: string;
    grade: string;
    status: EnrollmentAppStatus;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
    timeline: { status: EnrollmentAppStatus; date: string; label: string }[];
}

// --------------------------------------------------------------------------
// Status helpers
// --------------------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    enrollment_activated: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    provisionally_accepted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    under_review: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    pending_documents: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    pending_verification: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    pending_attestation: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    pending_translation: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    awaiting_transfer_certificate: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    action_required: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    incomplete: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
};

function getStatusColors(status: EnrollmentAppStatus) {
    return STATUS_COLORS[status] || { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
}

function getStatusIcon(status: EnrollmentAppStatus) {
    if (status === 'approved' || status === 'enrollment_activated') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4" />;
    if (status === 'action_required') return <AlertTriangle className="w-4 h-4" />;
    if (status === 'draft' || status === 'incomplete') return <FileText className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
}

// --------------------------------------------------------------------------
// Mock data
// --------------------------------------------------------------------------

const MOCK_APPLICATIONS: ApplicationListItem[] = [
    {
        id: 'app-001',
        applicationNumber: 'APP-2026-0001',
        studentName: 'Ahmed Hassan',
        grade: 'Grade 10',
        status: 'provisionally_accepted',
        submittedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        timeline: [
            { status: 'draft', date: new Date(Date.now() - 21 * 86400000).toISOString(), label: 'Application started' },
            { status: 'submitted', date: new Date(Date.now() - 14 * 86400000).toISOString(), label: 'Application submitted' },
            { status: 'under_review', date: new Date(Date.now() - 10 * 86400000).toISOString(), label: 'Under review' },
            { status: 'provisionally_accepted', date: new Date(Date.now() - 2 * 86400000).toISOString(), label: 'Provisionally accepted' },
        ],
    },
    {
        id: 'app-002',
        applicationNumber: 'APP-2026-0002',
        studentName: 'Sara Hassan',
        grade: 'Grade 7',
        status: 'under_review',
        submittedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        timeline: [
            { status: 'draft', date: new Date(Date.now() - 10 * 86400000).toISOString(), label: 'Application started' },
            { status: 'submitted', date: new Date(Date.now() - 5 * 86400000).toISOString(), label: 'Application submitted' },
            { status: 'under_review', date: new Date(Date.now() - 3 * 86400000).toISOString(), label: 'Under review' },
        ],
    },
    {
        id: 'app-003',
        applicationNumber: 'APP-2026-0003',
        studentName: 'Omar Hassan',
        grade: 'Grade 4',
        status: 'draft',
        submittedAt: null,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        timeline: [
            { status: 'draft', date: new Date(Date.now() - 2 * 86400000).toISOString(), label: 'Application started' },
        ],
    },
];

// --------------------------------------------------------------------------
// Page Component
// --------------------------------------------------------------------------

export default function ParentApplicationsPage() {
    const pathname = usePathname();
    const router = useRouter();
    const locale = getLocaleFromPathname(pathname);
    const isAr = locale === 'ar';

    const [state, setState] = useState<DataState<ApplicationListItem[]>>(createIdleState());
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setState(createLoadingState());
        try {
            // In production: GET /api/enrollment/applications
            await new Promise((resolve) => setTimeout(resolve, 500));
            setState(createSuccessState(MOCK_APPLICATIONS));
        } catch {
            setState(createErrorState('Failed to load applications', () => fetchData()));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString(isAr ? 'ar-AE' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });

    if (state.status === 'loading' || state.status === 'idle') {
        return (
            <div className={`space-y-4 ${isAr ? 'rtl' : 'ltr'}`}>
                <div className="h-8 w-56 animate-pulse bg-teal-100/70 rounded-xl" />
                <div className="h-12 w-48 animate-pulse bg-teal-100/70 rounded-2xl" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 animate-pulse bg-teal-100/70 rounded-2xl" />
                ))}
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className={`flex flex-col items-center justify-center py-16 space-y-4 ${isAr ? 'rtl' : 'ltr'}`}>
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
    const applications = state.data;

    return (
        <div className={`space-y-6 pb-8 ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-800">
                        {isAr ? 'طلبات التسجيل' : 'Applications'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {isAr ? 'تتبع طلبات التسجيل لأبنائك' : "Track your children's enrollment applications"}
                    </p>
                </div>
                <Link
                    href={withLocalePrefix('/enrollment/apply', locale)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    {isAr ? 'طلب جديد' : 'New Application'}
                </Link>
            </div>

            {/* Applications List */}
            {applications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                        {isAr ? 'لا توجد طلبات بعد' : 'No applications yet'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                        {isAr ? 'ابدأ بتقديم طلب تسجيل جديد' : 'Start by submitting a new enrollment application'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {applications.map((app) => {
                        const colors = getStatusColors(app.status);
                        const isExpanded = expandedId === app.id;
                        const isDraft = app.status === 'draft' || app.status === 'incomplete';

                        return (
                            <div
                                key={app.id}
                                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
                            >
                                {/* Card header */}
                                <div className="px-5 py-4">
                                    <div className="flex items-start gap-3">
                                        {/* Student avatar */}
                                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                            <User className="w-5 h-5 text-teal-600" />
                                        </div>

                                        {/* Student info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-slate-800 truncate">
                                                    {app.studentName}
                                                </h3>
                                                <span
                                                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                                                >
                                                    {getStatusIcon(app.status)}
                                                    {APPLICATION_STATUS_LABELS[app.status]}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {app.grade} &middot; {app.applicationNumber}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {app.submittedAt
                                                    ? `${isAr ? 'تم التقديم:' : 'Submitted:'} ${formatDate(app.submittedAt)}`
                                                    : `${isAr ? 'تم الإنشاء:' : 'Created:'} ${formatDate(app.createdAt)}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-3">
                                        {isDraft && (
                                            <Link
                                                href={withLocalePrefix(`/enrollment/apply?id=${app.id}`, locale)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                                            >
                                                {isAr ? 'متابعة' : 'Continue'}
                                                <ChevronRight className={`w-3.5 h-3.5 ${isAr ? 'rotate-180' : ''}`} />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setExpandedId(isExpanded ? null : app.id)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                        >
                                            {isExpanded
                                                ? isAr ? 'إخفاء التفاصيل' : 'Hide Timeline'
                                                : isAr ? 'عرض التفاصيل' : 'View Timeline'}
                                        </button>
                                    </div>
                                </div>

                                {/* Timeline (expandable) */}
                                {isExpanded && (
                                    <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                                            {isAr ? 'الجدول الزمني' : 'Application Timeline'}
                                        </h4>
                                        <div className="relative">
                                            {app.timeline.map((event, idx) => {
                                                const evColors = getStatusColors(event.status);
                                                const isLast = idx === app.timeline.length - 1;

                                                return (
                                                    <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                                                        {/* Timeline dot & line */}
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className={`w-3 h-3 rounded-full border-2 ${
                                                                    isLast
                                                                        ? `${evColors.border} ${evColors.bg}`
                                                                        : 'border-slate-300 bg-slate-100'
                                                                }`}
                                                            />
                                                            {!isLast && (
                                                                <div className="w-0.5 flex-1 bg-slate-200 mt-1" />
                                                            )}
                                                        </div>

                                                        {/* Event details */}
                                                        <div className="pb-1">
                                                            <p
                                                                className={`text-sm font-medium ${
                                                                    isLast ? 'text-slate-800' : 'text-slate-500'
                                                                }`}
                                                            >
                                                                {event.label}
                                                            </p>
                                                            <p className="text-xs text-slate-400 mt-0.5">
                                                                {formatDate(event.date)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
