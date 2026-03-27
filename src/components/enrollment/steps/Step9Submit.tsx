'use client';

import { Button } from '@/components/ui/button';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import type { WizardFormData } from '../EnrollmentWizard';

interface Step9SubmitProps {
  locale: string;
  formData: WizardFormData;
  completenessScore: number;
  onSubmit: () => void;
  loading: boolean;
  readOnly: boolean;
}

export default function Step9Submit({
  locale,
  formData,
  completenessScore,
  onSubmit,
  loading,
  readOnly,
}: Step9SubmitProps) {
  const isRTL = locale === 'ar';
  const { student, academic, guardians, identity, medical, declarations, documents } = formData;

  // Compute blockers
  const blockers: string[] = [];

  if (!student.full_name_en) blockers.push(isRTL ? 'اسم الطالب (إنجليزي) مفقود' : 'Student name (English) is missing');
  if (!student.full_name_ar) blockers.push(isRTL ? 'اسم الطالب (عربي) مفقود' : 'Student name (Arabic) is missing');
  if (!student.date_of_birth) blockers.push(isRTL ? 'تاريخ الميلاد مفقود' : 'Date of birth is missing');
  if (!student.gender) blockers.push(isRTL ? 'الجنس مفقود' : 'Gender is missing');
  if (!student.nationality) blockers.push(isRTL ? 'الجنسية مفقودة' : 'Nationality is missing');
  if (!academic.applying_grade_id) blockers.push(isRTL ? 'الصف المطلوب مفقود' : 'Applying grade is missing');
  if (!guardians[0]?.full_name_en) blockers.push(isRTL ? 'اسم ولي الأمر مفقود' : 'Guardian name is missing');
  if (!guardians[0]?.mobile) blockers.push(isRTL ? 'رقم جوال ولي الأمر مفقود' : 'Guardian mobile is missing');
  if (!guardians[0]?.email) blockers.push(isRTL ? 'بريد ولي الأمر مفقود' : 'Guardian email is missing');
  if (!identity.student_passport_number && !identity.emirates_id_number) {
    blockers.push(isRTL ? 'رقم الجواز أو الهوية الإماراتية مفقود' : 'Passport or Emirates ID is missing');
  }

  // Declarations check
  if (!declarations.info_correct) blockers.push(isRTL ? 'إقرار صحة المعلومات غير مقبول' : 'Information correctness declaration not accepted');
  if (!declarations.docs_authentic) blockers.push(isRTL ? 'إقرار أصالة المستندات غير مقبول' : 'Document authenticity declaration not accepted');
  if (!declarations.accepts_verification) blockers.push(isRTL ? 'إقرار التحقق غير مقبول' : 'Verification acceptance not accepted');
  if (!declarations.acknowledges_attestation) blockers.push(isRTL ? 'إقرار التصديق غير مقبول' : 'Attestation acknowledgement not accepted');
  if (!declarations.acknowledges_missing_delays) blockers.push(isRTL ? 'إقرار التأخير غير مقبول' : 'Missing delays acknowledgement not accepted');
  if (!declarations.privacy_policy_accepted) blockers.push(isRTL ? 'سياسة الخصوصية غير مقبولة' : 'Privacy policy not accepted');

  const canSubmit = blockers.length === 0 && !readOnly;

  // Count documents
  const totalDocs = documents.length;
  const uploadedDocs = documents.filter((d) => d.status !== 'missing').length;

  // Score color
  const scoreColor =
    completenessScore >= 80
      ? 'text-green-600'
      : completenessScore >= 50
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 mb-4">
          <Send className="w-8 h-8 text-brand-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isRTL ? 'تأكيد التقديم' : 'Submit Application'}
        </h2>
        <p className="text-gray-500 mt-2">
          {isRTL
            ? 'راجع الملخص النهائي وقدم طلبك.'
            : 'Review the final summary and submit your application.'}
        </p>
      </div>

      {/* Completeness score */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 text-center">
        <p className="text-sm text-gray-500 mb-2">
          {isRTL ? 'نسبة الإكمال' : 'Completeness Score'}
        </p>
        <p className={`text-5xl font-extrabold ${scoreColor}`}>
          {completenessScore}%
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-xs mx-auto">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              completenessScore >= 80
                ? 'bg-green-500'
                : completenessScore >= 50
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${completenessScore}%` }}
          />
        </div>
      </div>

      {/* Quick summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <ShieldCheck className="w-6 h-6 text-brand-primary mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {isRTL ? 'الطالب' : 'Student'}
          </p>
          <p className="font-bold text-gray-900 text-sm truncate">
            {student.full_name_en || (isRTL ? 'غير محدد' : 'Not specified')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <FileCheck className="w-6 h-6 text-brand-primary mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {isRTL ? 'الصف' : 'Grade'}
          </p>
          <p className="font-bold text-gray-900 text-sm">
            {academic.applying_grade_name || (isRTL ? 'غير محدد' : 'Not specified')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 text-center">
          <FileCheck className="w-6 h-6 text-brand-primary mx-auto mb-2" />
          <p className="text-xs text-gray-500">
            {isRTL ? 'المستندات' : 'Documents'}
          </p>
          <p className="font-bold text-gray-900 text-sm">
            {uploadedDocs} / {totalDocs || '-'}
          </p>
        </div>
      </div>

      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="font-bold text-red-800 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5" />
            {isRTL
              ? `${blockers.length} عنصر(عناصر) يجب إكمالها قبل التقديم`
              : `${blockers.length} item(s) must be completed before submission`}
          </h3>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Ready message */}
      {canSubmit && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-bold text-green-800">
              {isRTL ? 'طلبك جاهز للتقديم!' : 'Your application is ready to submit!'}
            </h3>
            <p className="text-sm text-green-700 mt-1">
              {isRTL
                ? 'بعد التقديم، سيتم مراجعة طلبك من قبل فريق القبول.'
                : 'After submission, your application will be reviewed by the admissions team.'}
            </p>
          </div>
        </div>
      )}

      {/* Submit button */}
      <div className="text-center pt-4">
        <Button
          className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-12 py-3 text-base"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin me-2" />
              {isRTL ? 'جاري التقديم...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send className="w-5 h-5 me-2" />
              {isRTL ? 'تقديم الطلب' : 'Submit Application'}
            </>
          )}
        </Button>
        {!canSubmit && !readOnly && (
          <p className="text-xs text-gray-400 mt-3">
            {isRTL
              ? 'أكمل جميع الحقول المطلوبة والإقرارات للتقديم.'
              : 'Complete all required fields and declarations to submit.'}
          </p>
        )}
      </div>
    </div>
  );
}
