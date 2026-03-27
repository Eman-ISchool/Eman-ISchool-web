'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Globe, Camera } from 'lucide-react';
import type { StudentPersonalFormData } from '@/types/enrollment';

interface Step2StudentInfoProps {
  locale: string;
  data: StudentPersonalFormData;
  onChange: (updates: Partial<StudentPersonalFormData>) => void;
  errors: Record<string, string>;
  readOnly: boolean;
}

function FieldLabel({
  en,
  ar,
  isRTL,
  required,
}: {
  en: string;
  ar: string;
  isRTL: boolean;
  required?: boolean;
}) {
  return (
    <Label className="block">
      <span>{isRTL ? ar : en}</span>
      {!isRTL && <span className="text-[11px] text-gray-400 ms-2">({ar})</span>}
      {isRTL && <span className="text-[11px] text-gray-400 ms-2">({en})</span>}
      {required && <span className="text-red-500 ms-1">*</span>}
    </Label>
  );
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="text-xs text-red-500 mt-1">{error}</p>;
}

export default function Step2StudentInfo({
  locale,
  data,
  onChange,
  errors,
  readOnly,
}: Step2StudentInfoProps) {
  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'معلومات الطالب' : 'Student Information'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'أدخل البيانات الشخصية للطالب.'
            : 'Enter the personal details of the student.'}
        </p>
      </div>

      {/* Names */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Full Name (English)"
            ar="الاسم الكامل (إنجليزي)"
            isRTL={isRTL}
            required
          />
          <Input
            value={data.full_name_en}
            onChange={(e) => onChange({ full_name_en: e.target.value })}
            placeholder="e.g. Ahmed Ali Mohammed"
            disabled={readOnly}
            dir="ltr"
            aria-invalid={!!errors.full_name_en}
          />
          <p className="text-[11px] text-gray-400">
            {isRTL
              ? 'يرجى إدخال الاسم بالأحرف الإنجليزية فقط'
              : 'English letters only'}
          </p>
          <FieldError error={errors.full_name_en} />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Full Name (Arabic)"
            ar="الاسم الكامل (عربي)"
            isRTL={isRTL}
            required
          />
          <Input
            value={data.full_name_ar}
            onChange={(e) => onChange({ full_name_ar: e.target.value })}
            placeholder="مثال: أحمد علي محمد"
            disabled={readOnly}
            dir="rtl"
            aria-invalid={!!errors.full_name_ar}
          />
          <p className="text-[11px] text-gray-400">
            {isRTL
              ? 'يرجى إدخال الاسم بالأحرف العربية فقط'
              : 'Arabic letters only'}
          </p>
          <FieldError error={errors.full_name_ar} />
        </div>
      </div>

      {/* DOB, Gender */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Date of Birth"
            ar="تاريخ الميلاد"
            isRTL={isRTL}
            required
          />
          <Input
            type="date"
            value={data.date_of_birth}
            onChange={(e) => onChange({ date_of_birth: e.target.value })}
            disabled={readOnly}
            aria-invalid={!!errors.date_of_birth}
          />
          <FieldError error={errors.date_of_birth} />
        </div>

        <div className="space-y-2">
          <FieldLabel en="Gender" ar="الجنس" isRTL={isRTL} required />
          <select
            className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            value={data.gender}
            onChange={(e) => onChange({ gender: e.target.value })}
            disabled={readOnly}
          >
            <option value="">{isRTL ? '-- اختر --' : '-- Select --'}</option>
            <option value="male">{isRTL ? 'ذكر' : 'Male'}</option>
            <option value="female">{isRTL ? 'أنثى' : 'Female'}</option>
          </select>
          <FieldError error={errors.gender} />
        </div>
      </div>

      {/* Nationality, Religion */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel en="Nationality" ar="الجنسية" isRTL={isRTL} required />
          <Input
            value={data.nationality}
            onChange={(e) => onChange({ nationality: e.target.value })}
            placeholder={isRTL ? 'مثال: مصري' : 'e.g. Egyptian'}
            disabled={readOnly}
            aria-invalid={!!errors.nationality}
          />
          <FieldError error={errors.nationality} />
        </div>

        <div className="space-y-2">
          <FieldLabel en="Religion" ar="الديانة" isRTL={isRTL} />
          <Input
            value={data.religion}
            onChange={(e) => onChange({ religion: e.target.value })}
            placeholder={isRTL ? 'اختياري' : 'Optional'}
            disabled={readOnly}
          />
          <p className="text-[11px] text-gray-400">
            {isRTL ? 'حسب سياسة المدرسة' : 'Configurable per school policy'}
          </p>
        </div>
      </div>

      {/* Mother tongue, Preferred language */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel en="Mother Tongue" ar="اللغة الأم" isRTL={isRTL} />
          <Input
            value={data.mother_tongue}
            onChange={(e) => onChange({ mother_tongue: e.target.value })}
            placeholder={isRTL ? 'مثال: العربية' : 'e.g. Arabic'}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Preferred Language"
            ar="اللغة المفضلة"
            isRTL={isRTL}
          />
          <select
            className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            value={data.preferred_language || ''}
            onChange={(e) => onChange({ preferred_language: e.target.value })}
            disabled={readOnly}
          >
            <option value="">{isRTL ? '-- اختر --' : '-- Select --'}</option>
            <option value="en">{isRTL ? 'الإنجليزية' : 'English'}</option>
            <option value="ar">{isRTL ? 'العربية' : 'Arabic'}</option>
          </select>
        </div>
      </div>

      {/* Place of birth, Secondary nationality */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel en="Place of Birth" ar="مكان الميلاد" isRTL={isRTL} />
          <Input
            value={data.place_of_birth}
            onChange={(e) => onChange({ place_of_birth: e.target.value })}
            placeholder={isRTL ? 'مثال: القاهرة، مصر' : 'e.g. Cairo, Egypt'}
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Secondary Nationality"
            ar="الجنسية الثانوية"
            isRTL={isRTL}
          />
          <Input
            value={data.secondary_nationality || ''}
            onChange={(e) => onChange({ secondary_nationality: e.target.value })}
            placeholder={isRTL ? 'اختياري' : 'Optional'}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Student photo note */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
        <Camera className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-gray-700">
            {isRTL ? 'صورة الطالب' : 'Student Photo'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {isRTL
              ? 'سيتم رفع صورة الطالب في خطوة المستندات.'
              : 'Student photo will be uploaded in the Documents step.'}
          </p>
        </div>
      </div>
    </div>
  );
}
