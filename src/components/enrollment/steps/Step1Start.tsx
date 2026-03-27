'use client';

import { Button } from '@/components/ui/button';
import {
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Loader2,
  PlayCircle,
  RefreshCw,
} from 'lucide-react';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import { APPLICATION_STATUS_LABELS } from '@/types/enrollment';

interface Step1StartProps {
  locale: string;
  applicationId?: string;
  applicationNumber: string;
  applicationStatus: EnrollmentAppStatus;
  onStartNew: () => void;
  onContinueDraft: () => void;
  loading: boolean;
}

export default function Step1Start({
  locale,
  applicationId,
  applicationNumber,
  applicationStatus,
  onStartNew,
  onContinueDraft,
  loading,
}: Step1StartProps) {
  const isRTL = locale === 'ar';
  const hasDraft = !!applicationId && applicationStatus === 'draft';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
          <GraduationCap className="w-8 h-8 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          {isRTL ? 'طلب التسجيل' : 'Enrollment Application'}
        </h1>
        <p className="text-gray-500 mt-2 max-w-lg mx-auto">
          {isRTL
            ? 'مرحبا بكم في نظام التسجيل. يرجى اتباع الخطوات لاستكمال طلب التسجيل.'
            : 'Welcome to the enrollment system. Please follow the steps to complete your application.'}
        </p>
      </div>

      {/* What you'll need */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5" />
          {isRTL ? 'ما ستحتاجه' : "What you'll need"}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              icon: FileText,
              en: 'Student passport & Emirates ID',
              ar: 'جواز سفر الطالب والهوية الإماراتية',
            },
            {
              icon: FileText,
              en: 'Birth certificate',
              ar: 'شهادة الميلاد',
            },
            {
              icon: FileText,
              en: 'Vaccination record',
              ar: 'سجل التطعيمات',
            },
            {
              icon: FileText,
              en: 'Parent/Guardian identification',
              ar: 'هوية ولي الأمر',
            },
            {
              icon: FileText,
              en: 'Previous school records (if transferring)',
              ar: 'سجلات المدرسة السابقة (في حال النقل)',
            },
            {
              icon: FileText,
              en: 'Student photo (passport size)',
              ar: 'صورة الطالب (حجم جواز السفر)',
            },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <item.icon className="w-4 h-4 text-brand-primary mt-0.5 shrink-0" />
              <span className="text-sm text-gray-700">
                {isRTL ? item.ar : item.en}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated time */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        {isRTL
          ? 'الوقت المقدر: 15-20 دقيقة. يمكنك الحفظ والمتابعة لاحقا.'
          : 'Estimated time: 15-20 minutes. You can save and continue later.'}
      </div>

      {/* Draft resume */}
      {hasDraft && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {isRTL ? 'لديك مسودة محفوظة' : 'You have a saved draft'}
          </h3>
          <p className="text-sm text-blue-700 mb-1">
            {isRTL ? 'رقم الطلب:' : 'Application #:'}{' '}
            <span className="font-mono font-bold">{applicationNumber}</span>
          </p>
          <p className="text-sm text-blue-700 mb-4">
            {isRTL ? 'الحالة:' : 'Status:'}{' '}
            <span className="font-semibold">{APPLICATION_STATUS_LABELS[applicationStatus]}</span>
          </p>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700 font-bold"
            onClick={onContinueDraft}
          >
            <PlayCircle className="w-4 h-4 me-2" />
            {isRTL ? 'متابعة المسودة' : 'Continue Draft'}
          </Button>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {!hasDraft && (
          <Button
            className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8 py-3 text-base"
            onClick={onStartNew}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin me-2" />
                {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 me-2" />
                {isRTL ? 'بدء طلب جديد' : 'Start New Application'}
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
