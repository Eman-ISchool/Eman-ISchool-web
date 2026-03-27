'use client';

import { Clock, AlertTriangle, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import { APPLICATION_STATUS_LABELS } from '@/types/enrollment';

export interface EnrollmentStatusData {
    applicationId: string;
    applicationNumber: string;
    status: EnrollmentAppStatus;
    pendingItemsCount: number;
    lastUpdateDate: string;
    studentName?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    enrollment_activated: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    provisionally_accepted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    under_review: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    submitted: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    pending_documents: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    pending_verification: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    action_required: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    draft: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
};

function getStatusColors(status: EnrollmentAppStatus) {
    return STATUS_COLORS[status] || { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' };
}

interface EnrollmentStatusCardProps {
    data: EnrollmentStatusData;
    compact?: boolean;
    locale?: string;
    localizedOnboardingHref?: string;
}

export function EnrollmentStatusCard({ data, compact = false, locale, localizedOnboardingHref }: EnrollmentStatusCardProps) {
    const colors = getStatusColors(data.status);
    const isProvisional = data.status === 'provisionally_accepted';
    const isApproved = data.status === 'approved' || data.status === 'enrollment_activated';
    const formattedDate = new Date(data.lastUpdateDate).toLocaleDateString(locale === 'ar' ? 'ar-AE' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    if (compact) {
        return (
            <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg}`}>
                            {isApproved ? (
                                <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                            ) : isProvisional ? (
                                <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                            ) : (
                                <FileText className={`w-5 h-5 ${colors.text}`} />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Enrollment Status</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                                {APPLICATION_STATUS_LABELS[data.status]}
                            </span>
                        </div>
                    </div>
                    {localizedOnboardingHref && (
                        <Link href={localizedOnboardingHref} className="text-teal-600 hover:text-teal-700">
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    )}
                </div>
                {data.pendingItemsCount > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-amber-600">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{data.pendingItemsCount} pending item{data.pendingItemsCount !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={`rounded-2xl border ${colors.border} bg-white shadow-sm overflow-hidden`}>
            {/* Status header band */}
            <div className={`${colors.bg} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                    {isApproved ? (
                        <CheckCircle2 className={`w-5 h-5 ${colors.text}`} />
                    ) : isProvisional ? (
                        <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                    ) : (
                        <FileText className={`w-5 h-5 ${colors.text}`} />
                    )}
                    <h3 className="font-semibold text-slate-800">Enrollment Status</h3>
                </div>
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {APPLICATION_STATUS_LABELS[data.status]}
                </span>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 space-y-3">
                {/* Application number */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Application No.</span>
                    <span className="font-mono font-medium text-slate-700">{data.applicationNumber}</span>
                </div>

                {/* Pending items */}
                {data.pendingItemsCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Pending Items</span>
                        <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {data.pendingItemsCount}
                        </span>
                    </div>
                )}

                {/* Last update */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="text-slate-700">{formattedDate}</span>
                </div>
            </div>
        </div>
    );
}
