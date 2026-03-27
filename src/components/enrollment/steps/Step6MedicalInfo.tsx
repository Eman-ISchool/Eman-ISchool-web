'use client';

import { Label } from '@/components/ui/label';
import { Heart, Syringe, AlertTriangle } from 'lucide-react';
import type { MedicalFormData } from '@/types/enrollment';

interface Step6MedicalInfoProps {
  locale: string;
  data: MedicalFormData;
  onChange: (updates: Partial<MedicalFormData>) => void;
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

export default function Step6MedicalInfo({
  locale,
  data,
  onChange,
  errors,
  readOnly,
}: Step6MedicalInfoProps) {
  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'المعلومات الطبية والدعم' : 'Medical & Support'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'أدخل المعلومات الصحية وأي احتياجات خاصة للطالب.'
            : 'Enter health information and any special needs for the student.'}
        </p>
      </div>

      {/* Medical condition */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
        <ToggleSwitch
          checked={data.has_medical_condition}
          onChange={(val) => onChange({ has_medical_condition: val })}
          label={
            isRTL
              ? 'هل لدى الطالب حالة طبية؟'
              : 'Does the student have a medical condition?'
          }
          disabled={readOnly}
        />

        {data.has_medical_condition && (
          <div className="space-y-2 animate-in fade-in">
            <FieldLabel
              en="Medical Condition Details"
              ar="تفاصيل الحالة الطبية"
              isRTL={isRTL}
              required
            />
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.medical_condition_details || ''}
              onChange={(e) =>
                onChange({ medical_condition_details: e.target.value })
              }
              placeholder={
                isRTL
                  ? 'صف الحالة الطبية بالتفصيل...'
                  : 'Describe the medical condition in detail...'
              }
              disabled={readOnly}
            />
            <FieldError error={errors.medical_condition_details} />
          </div>
        )}
      </div>

      {/* SEN / Learning support */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-4">
        <ToggleSwitch
          checked={data.has_sen}
          onChange={(val) => onChange({ has_sen: val })}
          label={
            isRTL
              ? 'هل لدى الطالب احتياجات تعليمية خاصة (SEN)؟'
              : 'Does the student have Special Educational Needs (SEN)?'
          }
          disabled={readOnly}
        />

        {data.has_sen && (
          <div className="space-y-2 animate-in fade-in">
            <FieldLabel
              en="SEN / Learning Support Details"
              ar="تفاصيل الاحتياجات التعليمية الخاصة"
              isRTL={isRTL}
              required
            />
            <textarea
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={data.sen_details || ''}
              onChange={(e) => onChange({ sen_details: e.target.value })}
              placeholder={
                isRTL
                  ? 'صف الاحتياجات التعليمية الخاصة...'
                  : 'Describe the special educational needs...'
              }
              disabled={readOnly}
            />
            <FieldError error={errors.sen_details} />
          </div>
        )}
      </div>

      {/* Vaccination */}
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
        <ToggleSwitch
          checked={data.vaccination_record_available}
          onChange={(val) => onChange({ vaccination_record_available: val })}
          label={
            isRTL
              ? 'هل سجل التطعيمات متاح؟'
              : 'Is the vaccination record available?'
          }
          disabled={readOnly}
        />
        {!data.vaccination_record_available && (
          <div className="mt-3 flex items-start gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs">
              {isRTL
                ? 'سجل التطعيمات مطلوب. يرجى توفيره في أقرب وقت.'
                : 'Vaccination record is required. Please provide it at the earliest.'}
            </p>
          </div>
        )}
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <FieldLabel en="Allergies" ar="الحساسية" isRTL={isRTL} />
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={data.allergies || ''}
          onChange={(e) => onChange({ allergies: e.target.value })}
          placeholder={
            isRTL
              ? 'اذكر أي حساسية...'
              : 'List any known allergies...'
          }
          disabled={readOnly}
        />
      </div>

      {/* Medication notes */}
      <div className="space-y-2">
        <FieldLabel
          en="Medication Notes"
          ar="ملاحظات الأدوية"
          isRTL={isRTL}
        />
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={data.medication_notes || ''}
          onChange={(e) => onChange({ medication_notes: e.target.value })}
          placeholder={
            isRTL
              ? 'أي أدوية يتناولها الطالب بانتظام...'
              : 'Any medications the student takes regularly...'
          }
          disabled={readOnly}
        />
      </div>

      {/* Health notes */}
      <div className="space-y-2">
        <FieldLabel
          en="Additional Health Notes"
          ar="ملاحظات صحية إضافية"
          isRTL={isRTL}
        />
        <textarea
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={data.health_notes || ''}
          onChange={(e) => onChange({ health_notes: e.target.value })}
          placeholder={
            isRTL
              ? 'أي معلومات صحية إضافية يجب أن تعرفها المدرسة...'
              : 'Any additional health information the school should know...'
          }
          disabled={readOnly}
        />
      </div>

      {/* Info note */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
        <Syringe className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          {isRTL
            ? 'إذا كانت هناك حالة طبية أو احتياجات خاصة، سيطلب منك رفع المستندات الداعمة في الخطوة التالية.'
            : 'If there is a medical condition or SEN, you will be asked to upload supporting documents in the next step.'}
        </p>
      </div>
    </div>
  );
}
