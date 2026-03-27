'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, ArrowRightLeft } from 'lucide-react';
import type { AcademicFormData, TransferSource } from '@/types/enrollment';

interface Step3AcademicInfoProps {
  locale: string;
  data: AcademicFormData;
  onChange: (updates: Partial<AcademicFormData>) => void;
  errors: Record<string, string>;
  readOnly: boolean;
}

const GRADES = [
  { id: 'kg1', name: 'KG 1' },
  { id: 'kg2', name: 'KG 2' },
  { id: 'grade-1', name: 'Grade 1' },
  { id: 'grade-2', name: 'Grade 2' },
  { id: 'grade-3', name: 'Grade 3' },
  { id: 'grade-4', name: 'Grade 4' },
  { id: 'grade-5', name: 'Grade 5' },
  { id: 'grade-6', name: 'Grade 6' },
  { id: 'grade-7', name: 'Grade 7' },
  { id: 'grade-8', name: 'Grade 8' },
  { id: 'grade-9', name: 'Grade 9' },
  { id: 'grade-10', name: 'Grade 10' },
  { id: 'grade-11', name: 'Grade 11' },
  { id: 'grade-12', name: 'Grade 12' },
];

const ACADEMIC_YEARS = ['2025-2026', '2026-2027', '2027-2028'];

const TRANSFER_SOURCES: { value: TransferSource; en: string; ar: string }[] = [
  { value: 'egypt', en: 'Egypt', ar: 'مصر' },
  { value: 'another_uae_emirate', en: 'Another UAE Emirate', ar: 'إمارة أخرى' },
  { value: 'same_emirate', en: 'Same Emirate', ar: 'نفس الإمارة' },
  { value: 'gcc_country', en: 'GCC Country', ar: 'دولة خليجية' },
  { value: 'outside_uae_gcc', en: 'Outside UAE/GCC', ar: 'خارج الإمارات والخليج' },
];

const UAE_EMIRATES = [
  { en: 'Abu Dhabi', ar: 'أبوظبي' },
  { en: 'Dubai', ar: 'دبي' },
  { en: 'Sharjah', ar: 'الشارقة' },
  { en: 'Ajman', ar: 'عجمان' },
  { en: 'Umm Al Quwain', ar: 'أم القيوين' },
  { en: 'Ras Al Khaimah', ar: 'رأس الخيمة' },
  { en: 'Fujairah', ar: 'الفجيرة' },
];

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

function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-primary' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

export default function Step3AcademicInfo({
  locale,
  data,
  onChange,
  errors,
  readOnly,
}: Step3AcademicInfoProps) {
  const isRTL = locale === 'ar';
  const isTransfer = data.enrollment_type === 'transfer';

  const handleGradeChange = (gradeId: string) => {
    const grade = GRADES.find((g) => g.id === gradeId);
    onChange({
      applying_grade_id: gradeId,
      applying_grade_name: grade?.name || '',
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'التفاصيل الأكاديمية' : 'Academic Information'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'حدد نوع التسجيل والصف المطلوب.'
            : 'Specify the enrollment type and desired grade.'}
        </p>
      </div>

      {/* Enrollment Type */}
      <div className="space-y-2">
        <FieldLabel
          en="Enrollment Type"
          ar="نوع التسجيل"
          isRTL={isRTL}
          required
        />
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              value: 'new' as const,
              en: 'New Student',
              ar: 'طالب جديد',
              desc_en: 'First-time enrollment',
              desc_ar: 'تسجيل لأول مرة',
            },
            {
              value: 'transfer' as const,
              en: 'Transfer Student',
              ar: 'طالب منقول',
              desc_en: 'Transferring from another school',
              desc_ar: 'نقل من مدرسة أخرى',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ enrollment_type: opt.value })}
              className={`border-2 rounded-xl p-4 text-start transition-all ${
                data.enrollment_type === opt.value
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <h4 className="font-bold text-gray-900">
                {isRTL ? opt.ar : opt.en}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? opt.desc_ar : opt.desc_en}
              </p>
            </button>
          ))}
        </div>
        <FieldError error={errors.enrollment_type} />
      </div>

      {/* Grade & Academic Year */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Applying Grade"
            ar="الصف المطلوب"
            isRTL={isRTL}
            required
          />
          <select
            className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            value={data.applying_grade_id}
            onChange={(e) => handleGradeChange(e.target.value)}
            disabled={readOnly}
          >
            <option value="">{isRTL ? '-- اختر الصف --' : '-- Select Grade --'}</option>
            {GRADES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
          <FieldError error={errors.applying_grade_id} />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Academic Year"
            ar="العام الدراسي"
            isRTL={isRTL}
            required
          />
          <select
            className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            value={data.academic_year}
            onChange={(e) => onChange({ academic_year: e.target.value })}
            disabled={readOnly}
          >
            {ACADEMIC_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <FieldError error={errors.academic_year} />
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-2">
        <FieldLabel en="Curriculum" ar="المنهج الدراسي" isRTL={isRTL} />
        <Input
          value={data.curriculum || ''}
          onChange={(e) => onChange({ curriculum: e.target.value })}
          placeholder={isRTL ? 'مثال: المنهج المصري' : 'e.g. Egyptian Curriculum'}
          disabled={readOnly}
        />
      </div>

      {/* Transfer-specific fields */}
      {isTransfer && (
        <div className="space-y-6 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 text-brand-primary">
            <ArrowRightLeft className="w-5 h-5" />
            <h3 className="font-bold text-lg">
              {isRTL ? 'تفاصيل النقل' : 'Transfer Details'}
            </h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel
                en="Previous School Name"
                ar="اسم المدرسة السابقة"
                isRTL={isRTL}
                required
              />
              <Input
                value={data.previous_school_name || ''}
                onChange={(e) => onChange({ previous_school_name: e.target.value })}
                disabled={readOnly}
                aria-invalid={!!errors.previous_school_name}
              />
              <FieldError error={errors.previous_school_name} />
            </div>

            <div className="space-y-2">
              <FieldLabel
                en="Previous School Country"
                ar="دولة المدرسة السابقة"
                isRTL={isRTL}
                required
              />
              <Input
                value={data.previous_school_country || ''}
                onChange={(e) =>
                  onChange({ previous_school_country: e.target.value })
                }
                disabled={readOnly}
                aria-invalid={!!errors.previous_school_country}
              />
              <FieldError error={errors.previous_school_country} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel
                en="Previous School Emirate"
                ar="إمارة المدرسة السابقة"
                isRTL={isRTL}
              />
              <select
                className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={data.previous_school_emirate || ''}
                onChange={(e) =>
                  onChange({ previous_school_emirate: e.target.value })
                }
                disabled={readOnly}
              >
                <option value="">
                  {isRTL ? '-- اختر الإمارة --' : '-- Select Emirate --'}
                </option>
                {UAE_EMIRATES.map((e) => (
                  <option key={e.en} value={e.en}>
                    {isRTL ? e.ar : e.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <FieldLabel
                en="Grade Completed"
                ar="الصف المكتمل"
                isRTL={isRTL}
              />
              <select
                className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={data.previous_grade_completed || ''}
                onChange={(e) =>
                  onChange({ previous_grade_completed: e.target.value })
                }
                disabled={readOnly}
              >
                <option value="">
                  {isRTL ? '-- اختر --' : '-- Select --'}
                </option>
                {GRADES.map((g) => (
                  <option key={g.id} value={g.name}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <FieldLabel
                en="Transfer Source"
                ar="مصدر النقل"
                isRTL={isRTL}
              />
              <select
                className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={data.transfer_source || ''}
                onChange={(e) =>
                  onChange({
                    transfer_source: (e.target.value || undefined) as
                      | TransferSource
                      | undefined,
                  })
                }
                disabled={readOnly}
              >
                <option value="">
                  {isRTL ? '-- اختر --' : '-- Select --'}
                </option>
                {TRANSFER_SOURCES.map((ts) => (
                  <option key={ts.value} value={ts.value}>
                    {isRTL ? ts.ar : ts.en}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <FieldLabel
                en="Last Report Card Year"
                ar="سنة آخر شهادة"
                isRTL={isRTL}
              />
              <Input
                value={data.last_report_card_year || ''}
                onChange={(e) =>
                  onChange({ last_report_card_year: e.target.value })
                }
                placeholder={isRTL ? 'مثال: 2025' : 'e.g. 2025'}
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <ToggleSwitch
              checked={data.is_mid_year_transfer || false}
              onChange={(val) => onChange({ is_mid_year_transfer: val })}
              label={isRTL ? 'نقل منتصف العام' : 'Mid-year Transfer'}
              disabled={readOnly}
            />

            <ToggleSwitch
              checked={data.transcript_available || false}
              onChange={(val) => onChange({ transcript_available: val })}
              label={isRTL ? 'كشف الدرجات متاح' : 'Transcript Available'}
              disabled={readOnly}
            />

            <ToggleSwitch
              checked={data.transfer_certificate_available || false}
              onChange={(val) =>
                onChange({ transfer_certificate_available: val })
              }
              label={isRTL ? 'شهادة النقل متاحة' : 'Transfer Certificate Available'}
              disabled={readOnly}
            />
          </div>

          {/* Transfer Reason */}
          <div className="space-y-2">
            <FieldLabel
              en="Transfer Reason"
              ar="سبب النقل"
              isRTL={isRTL}
            />
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.transfer_reason || ''}
              onChange={(e) => onChange({ transfer_reason: e.target.value })}
              placeholder={
                isRTL ? 'أدخل سبب النقل...' : 'Enter the reason for transfer...'
              }
              disabled={readOnly}
            />
          </div>
        </div>
      )}
    </div>
  );
}
