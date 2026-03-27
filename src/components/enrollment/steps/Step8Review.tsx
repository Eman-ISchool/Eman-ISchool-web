'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Edit3,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import type {
  DeclarationsFormData,
  EnrollmentDocument,
} from '@/types/enrollment';
import type { WizardFormData } from '../EnrollmentWizard';

interface Step8ReviewProps {
  locale: string;
  formData: WizardFormData;
  declarations: DeclarationsFormData;
  onDeclarationsChange: (updates: Partial<DeclarationsFormData>) => void;
  onEditStep: (step: number) => void;
  readOnly: boolean;
}

interface SectionProps {
  title: string;
  stepNumber: number;
  children: React.ReactNode;
  onEdit: () => void;
  readOnly: boolean;
  isRTL: boolean;
}

function ReviewSection({
  title,
  stepNumber,
  children,
  onEdit,
  readOnly,
  isRTL,
}: SectionProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-bold flex items-center justify-center">
            {stepNumber}
          </span>
          <span className="font-semibold text-gray-900 text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-brand-primary text-xs font-medium hover:underline cursor-pointer flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              {isRTL ? 'تعديل' : 'Edit'}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      {expanded && <div className="p-5 space-y-3">{children}</div>}
    </div>
  );
}

function DataRow({
  label,
  value,
  missing,
}: {
  label: string;
  value?: string | null | boolean;
  missing?: boolean;
}) {
  const displayValue =
    typeof value === 'boolean'
      ? value
        ? 'Yes'
        : 'No'
      : value || '';

  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{label}</span>
      {missing || !displayValue ? (
        <span className="text-red-500 flex items-center gap-1 text-xs font-medium">
          <AlertCircle className="w-3 h-3" />
          Missing
        </span>
      ) : (
        <span className="text-gray-900 font-medium text-end">{displayValue}</span>
      )}
    </div>
  );
}

const REQUIRED_DECLARATIONS: {
  key: keyof DeclarationsFormData;
  en: string;
  ar: string;
}[] = [
  {
    key: 'info_correct',
    en: 'I confirm that all information provided is correct and accurate.',
    ar: 'أؤكد أن جميع المعلومات المقدمة صحيحة ودقيقة.',
  },
  {
    key: 'docs_authentic',
    en: 'I confirm that all documents submitted are authentic.',
    ar: 'أؤكد أن جميع المستندات المقدمة أصلية.',
  },
  {
    key: 'accepts_verification',
    en: 'I accept that the school may verify all submitted information and documents.',
    ar: 'أوافق على أن المدرسة قد تتحقق من جميع المعلومات والمستندات المقدمة.',
  },
  {
    key: 'acknowledges_attestation',
    en: 'I acknowledge that certain documents may require attestation.',
    ar: 'أقر بأن بعض المستندات قد تحتاج إلى تصديق.',
  },
  {
    key: 'acknowledges_missing_delays',
    en: 'I understand that missing documents may delay the application process.',
    ar: 'أفهم أن المستندات المفقودة قد تؤخر عملية التقديم.',
  },
  {
    key: 'privacy_policy_accepted',
    en: 'I accept the privacy policy and terms of service.',
    ar: 'أوافق على سياسة الخصوصية وشروط الخدمة.',
  },
];

const OPTIONAL_CONSENTS: {
  key: keyof DeclarationsFormData;
  en: string;
  ar: string;
}[] = [
  {
    key: 'medical_emergency_consent',
    en: 'I consent to emergency medical treatment if needed.',
    ar: 'أوافق على العلاج الطبي الطارئ عند الحاجة.',
  },
  {
    key: 'communications_consent',
    en: 'I consent to receive school communications via email and SMS.',
    ar: 'أوافق على تلقي اتصالات المدرسة عبر البريد الإلكتروني والرسائل النصية.',
  },
  {
    key: 'marketing_consent',
    en: 'I consent to receive marketing materials from the school.',
    ar: 'أوافق على تلقي المواد التسويقية من المدرسة.',
  },
  {
    key: 'digital_platform_consent',
    en: 'I consent to my child using the school digital learning platform.',
    ar: 'أوافق على استخدام طفلي لمنصة التعلم الرقمية.',
  },
];

export default function Step8Review({
  locale,
  formData,
  declarations,
  onDeclarationsChange,
  onEditStep,
  readOnly,
}: Step8ReviewProps) {
  const isRTL = locale === 'ar';
  const { student, academic, guardians, identity, medical, documents } = formData;

  // Count missing required fields
  const missingFields: string[] = [];
  if (!student.full_name_en) missingFields.push('Student Name (English)');
  if (!student.full_name_ar) missingFields.push('Student Name (Arabic)');
  if (!student.date_of_birth) missingFields.push('Date of Birth');
  if (!student.gender) missingFields.push('Gender');
  if (!student.nationality) missingFields.push('Nationality');
  if (!academic.applying_grade_id) missingFields.push('Applying Grade');
  if (!guardians[0]?.full_name_en) missingFields.push('Guardian Name');
  if (!guardians[0]?.mobile) missingFields.push('Guardian Mobile');
  if (!guardians[0]?.email) missingFields.push('Guardian Email');
  if (!identity.student_passport_number && !identity.emirates_id_number) {
    missingFields.push('Passport or Emirates ID');
  }

  // Count uploaded docs
  const uploadedDocs = documents.filter(
    (d: EnrollmentDocument) => d.status !== 'missing',
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardCheck className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'المراجعة والإقرارات' : 'Review & Declarations'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'راجع بياناتك ووافق على الإقرارات المطلوبة.'
            : 'Review your information and agree to the required declarations.'}
        </p>
      </div>

      {/* Missing fields warning */}
      {missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {isRTL
                ? `${missingFields.length} حقل(حقول) مفقودة`
                : `${missingFields.length} missing field(s)`}
            </p>
            <ul className="mt-1 list-disc list-inside text-xs text-amber-700 space-y-0.5">
              {missingFields.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Data review sections */}
      <div className="space-y-4">
        {/* Student Info */}
        <ReviewSection
          title={isRTL ? 'معلومات الطالب' : 'Student Information'}
          stepNumber={2}
          onEdit={() => onEditStep(2)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          <DataRow
            label={isRTL ? 'الاسم (إنجليزي)' : 'Name (English)'}
            value={student.full_name_en}
            missing={!student.full_name_en}
          />
          <DataRow
            label={isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'}
            value={student.full_name_ar}
            missing={!student.full_name_ar}
          />
          <DataRow
            label={isRTL ? 'تاريخ الميلاد' : 'Date of Birth'}
            value={student.date_of_birth}
            missing={!student.date_of_birth}
          />
          <DataRow
            label={isRTL ? 'الجنس' : 'Gender'}
            value={student.gender}
            missing={!student.gender}
          />
          <DataRow
            label={isRTL ? 'الجنسية' : 'Nationality'}
            value={student.nationality}
            missing={!student.nationality}
          />
          <DataRow label={isRTL ? 'الديانة' : 'Religion'} value={student.religion} />
          <DataRow label={isRTL ? 'اللغة الأم' : 'Mother Tongue'} value={student.mother_tongue} />
          <DataRow label={isRTL ? 'مكان الميلاد' : 'Place of Birth'} value={student.place_of_birth} />
        </ReviewSection>

        {/* Academic */}
        <ReviewSection
          title={isRTL ? 'التفاصيل الأكاديمية' : 'Academic Details'}
          stepNumber={3}
          onEdit={() => onEditStep(3)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          <DataRow
            label={isRTL ? 'نوع التسجيل' : 'Enrollment Type'}
            value={academic.enrollment_type === 'new' ? (isRTL ? 'جديد' : 'New') : (isRTL ? 'نقل' : 'Transfer')}
          />
          <DataRow
            label={isRTL ? 'الصف المطلوب' : 'Applying Grade'}
            value={academic.applying_grade_name}
            missing={!academic.applying_grade_id}
          />
          <DataRow
            label={isRTL ? 'العام الدراسي' : 'Academic Year'}
            value={academic.academic_year}
          />
          {academic.enrollment_type === 'transfer' && (
            <>
              <DataRow
                label={isRTL ? 'المدرسة السابقة' : 'Previous School'}
                value={academic.previous_school_name}
              />
              <DataRow
                label={isRTL ? 'دولة المدرسة' : 'School Country'}
                value={academic.previous_school_country}
              />
            </>
          )}
        </ReviewSection>

        {/* Guardian */}
        <ReviewSection
          title={isRTL ? 'ولي الأمر' : 'Parent / Guardian'}
          stepNumber={4}
          onEdit={() => onEditStep(4)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          {guardians.map((g, i) => (
            <div key={i} className={i > 0 ? 'border-t border-gray-100 pt-3' : ''}>
              {guardians.length > 1 && (
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
                  {g.contact_type}
                </p>
              )}
              <DataRow
                label={isRTL ? 'الاسم' : 'Name'}
                value={g.full_name_en}
                missing={!g.full_name_en}
              />
              <DataRow
                label={isRTL ? 'الجوال' : 'Mobile'}
                value={g.mobile}
                missing={!g.mobile}
              />
              <DataRow
                label={isRTL ? 'البريد' : 'Email'}
                value={g.email}
                missing={!g.email}
              />
              <DataRow label={isRTL ? 'الإمارة' : 'Emirate'} value={g.emirate} />
            </div>
          ))}
        </ReviewSection>

        {/* Identity */}
        <ReviewSection
          title={isRTL ? 'الهوية والإقامة' : 'Identity & Residency'}
          stepNumber={5}
          onEdit={() => onEditStep(5)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          <DataRow
            label={isRTL ? 'الهوية الإماراتية' : 'Emirates ID'}
            value={
              identity.emirates_id_available
                ? identity.emirates_id_number || (isRTL ? 'متاح' : 'Available')
                : isRTL ? 'غير متاح' : 'Not Available'
            }
          />
          <DataRow
            label={isRTL ? 'جواز السفر' : 'Passport Number'}
            value={identity.student_passport_number}
          />
          <DataRow
            label={isRTL ? 'حالة الإقامة' : 'Residency Status'}
            value={identity.residency_status}
          />
          <DataRow
            label={isRTL ? 'دولة الإقامة' : 'Country of Residence'}
            value={identity.country_of_residence}
          />
        </ReviewSection>

        {/* Medical */}
        <ReviewSection
          title={isRTL ? 'الطبي والدعم' : 'Medical & Support'}
          stepNumber={6}
          onEdit={() => onEditStep(6)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          <DataRow
            label={isRTL ? 'حالة طبية' : 'Medical Condition'}
            value={medical.has_medical_condition}
          />
          {medical.has_medical_condition && (
            <DataRow
              label={isRTL ? 'التفاصيل' : 'Details'}
              value={medical.medical_condition_details}
            />
          )}
          <DataRow
            label={isRTL ? 'احتياجات خاصة (SEN)' : 'SEN'}
            value={medical.has_sen}
          />
          <DataRow
            label={isRTL ? 'سجل التطعيمات' : 'Vaccination Record'}
            value={medical.vaccination_record_available}
          />
          {medical.allergies && (
            <DataRow label={isRTL ? 'الحساسية' : 'Allergies'} value={medical.allergies} />
          )}
        </ReviewSection>

        {/* Documents */}
        <ReviewSection
          title={isRTL ? 'المستندات' : 'Documents'}
          stepNumber={7}
          onEdit={() => onEditStep(7)}
          readOnly={readOnly}
          isRTL={isRTL}
        >
          <DataRow
            label={isRTL ? 'المستندات المرفوعة' : 'Uploaded Documents'}
            value={`${uploadedDocs} / ${documents.length || '-'}`}
          />
          {documents
            .filter((d: EnrollmentDocument) => d.status === 'rejected' || d.status === 're_upload_requested')
            .map((d: EnrollmentDocument) => (
              <DataRow
                key={d.id}
                label={d.label || d.document_type}
                value={d.rejection_reason || (isRTL ? 'مطلوب إعادة الرفع' : 'Re-upload required')}
                missing
              />
            ))}
        </ReviewSection>
      </div>

      {/* Declarations */}
      <div className="border border-gray-200 rounded-xl p-6 space-y-5 bg-white">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-brand-primary" />
          {isRTL ? 'الإقرارات المطلوبة' : 'Required Declarations'}
        </h3>

        <div className="space-y-4">
          {REQUIRED_DECLARATIONS.map((decl) => (
            <label
              key={decl.key}
              className="flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!declarations[decl.key]}
                onChange={(e) =>
                  onDeclarationsChange({ [decl.key]: e.target.checked })
                }
                disabled={readOnly}
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary shrink-0"
              />
              <span className="text-sm text-gray-700">
                {isRTL ? decl.ar : decl.en}
              </span>
            </label>
          ))}
        </div>

        {/* Optional consents */}
        <div className="border-t border-gray-100 pt-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-600">
            {isRTL ? 'الموافقات الاختيارية' : 'Optional Consents'}
          </h4>
          {OPTIONAL_CONSENTS.map((decl) => (
            <label
              key={decl.key}
              className="flex items-start gap-3 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={!!declarations[decl.key]}
                onChange={(e) =>
                  onDeclarationsChange({ [decl.key]: e.target.checked })
                }
                disabled={readOnly}
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary shrink-0"
              />
              <span className="text-sm text-gray-500">
                {isRTL ? decl.ar : decl.en}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
