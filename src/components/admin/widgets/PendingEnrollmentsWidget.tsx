'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import {
    User,
    Mail,
    BookOpen,
    Calendar,
    Check,
    X,
    Loader2,
} from 'lucide-react';

interface Enrollment {
    id: string;
    student_name: string;
    parent_email: string;
    course_title: string;
    created_at: string;
}

interface PendingEnrollmentsWidgetProps {
    className?: string;
}

export default function PendingEnrollmentsWidget({
    className = '',
}: PendingEnrollmentsWidgetProps) {
    const locale = useLocale();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<Record<string, boolean>>({});
    const [rejectModal, setRejectModal] = useState<{
        enrollmentId: string;
        isOpen: boolean;
        reason: string;
    }>({ enrollmentId: '', isOpen: false, reason: '' });

    const isArabic = locale === 'ar';

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/enrollments?status=pending&limit=10');
            if (!res.ok) throw new Error('Failed to fetch enrollments');
            const data = await res.json();
            setEnrollments(data.enrollments || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const handleApprove = async (enrollmentId: string) => {
        try {
            setProcessing((prev) => ({ ...prev, [enrollmentId]: true }));
            const res = await fetch(`/api/enrollments/${enrollmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' }),
            });
            if (!res.ok) throw new Error('Failed to approve enrollment');
            
            // Remove the approved enrollment from the list
            setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
        } catch (err: any) {
            alert(isArabic ? 'فشل الموافقة على التسجيل' : 'Failed to approve enrollment');
        } finally {
            setProcessing((prev) => ({ ...prev, [enrollmentId]: false }));
        }
    };

    const handleReject = async () => {
        const { enrollmentId, reason } = rejectModal;
        if (!reason.trim()) {
            alert(isArabic ? 'يرجى إدخال سبب الرفض' : 'Please enter a rejection reason');
            return;
        }

        try {
            setProcessing((prev) => ({ ...prev, [enrollmentId]: true }));
            const res = await fetch(`/api/enrollments/${enrollmentId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
            });
            if (!res.ok) throw new Error('Failed to reject enrollment');
            
            // Remove the rejected enrollment from the list
            setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
            setRejectModal({ enrollmentId: '', isOpen: false, reason: '' });
        } catch (err: any) {
            alert(isArabic ? 'فشل رفض التسجيل' : 'Failed to reject enrollment');
        } finally {
            setProcessing((prev) => ({ ...prev, [enrollmentId]: false }));
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className={`admin-card ${className}`}>
            <div className="admin-card-header flex items-center justify-between">
                <h3 className="admin-card-title">
                    <User className="w-5 h-5 text-blue-500" />
                    {isArabic ? 'تسجيلات معلقة' : 'Pending Enrollments'}
                </h3>
                {enrollments.length > 0 && (
                    <span className="admin-badge admin-badge-warning">{enrollments.length}</span>
                )}
            </div>
            <div className="admin-card-body p-0">
                {loading ? (
                    <div className="p-8 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        {isArabic ? 'فشل تحميل التسجيلات' : 'Failed to load enrollments'}
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                        <p className="text-gray-500">
                            {isArabic ? 'لا توجد تسجيلات معلقة' : 'No pending enrollments'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {enrollments.map((enrollment) => (
                            <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="space-y-3">
                                    {/* Student Name */}
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-800">{enrollment.student_name}</span>
                                    </div>

                                    {/* Parent Email */}
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{enrollment.parent_email}</span>
                                    </div>

                                    {/* Course */}
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-600">{enrollment.course_title}</span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">{formatDate(enrollment.created_at)}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-2">
                                        <button
                                            onClick={() => handleApprove(enrollment.id)}
                                            disabled={processing[enrollment.id]}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processing[enrollment.id] ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Check className="w-4 h-4" />
                                            )}
                                            {isArabic ? 'موافقة' : 'Approve'}
                                        </button>
                                        <button
                                            onClick={() => setRejectModal({ enrollmentId: enrollment.id, isOpen: true, reason: '' })}
                                            disabled={processing[enrollment.id]}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {processing[enrollment.id] ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <X className="w-4 h-4" />
                                            )}
                                            {isArabic ? 'رفض' : 'Reject'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Reject Modal */}
            {rejectModal.isOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {isArabic ? 'رفض التسجيل' : 'Reject Enrollment'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {isArabic ? 'يرجى إدخال سبب رفض التسجيل' : 'Please enter a reason for rejecting this enrollment'}
                        </p>
                        <textarea
                            value={rejectModal.reason}
                            onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                            placeholder={isArabic ? 'سبب الرفض...' : 'Rejection reason...'}
                            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                            rows={4}
                        />
                        <div className="flex items-center gap-2 mt-4">
                            <button
                                onClick={handleReject}
                                disabled={processing[rejectModal.enrollmentId]}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {processing[rejectModal.enrollmentId] ? (
                                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                ) : (
                                    isArabic ? 'تأكيد الرفض' : 'Confirm Reject'
                                )}
                            </button>
                            <button
                                onClick={() => setRejectModal({ enrollmentId: '', isOpen: false, reason: '' })}
                                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                {isArabic ? 'إلغاء' : 'Cancel'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
