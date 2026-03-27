'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Globe } from 'lucide-react';
import type { IdentityFormData } from '@/types/enrollment';

interface Step5IdentityInfoProps {
  locale: string;
  data: IdentityFormData;
  onChange: (updates: Partial<IdentityFormData>) => void;
  errors: Record<string, string>;
  readOnly: boolean;
}

const RESIDENCY_STATUSES = [
  { value: 'resident', en: 'UAE Resident', ar: 'مقيم في الإمارات' },
  { value: 'citizen', en: 'UAE Citizen', ar: 'مواطن إماراتي' },
  { value: 'visitor', en: 'Visitor', ar: 'زائر' },
  { value: 'transit', en: 'In Transit', ar: 'عبور' },
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

export default function Step5IdentityInfo({
  locale,
  data,
  onChange,
  errors,
  readOnly,
}: Step5IdentityInfoProps) {
  const isRTL = locale === 'ar';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'الهوية والإقامة' : 'Identity & Residency'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'أدخل بيانات الهوية والإقامة للطالب.'
            : 'Enter the student identity and residency details.'}
        </p>
      </div>

      {/* Emirates ID toggle */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
        <ToggleSwitch
          checked={data.emirates_id_available}
          onChange={(val) => onChange({ emirates_id_available: val })}
          label={isRTL ? 'هل الهوية الإماراتية متاحة؟' : 'Emirates ID Available?'}
          disabled={readOnly}
        />

        {data.emirates_id_available && (
          <div className="space-y-2 animate-in fade-in">
            <FieldLabel
              en="Emirates ID Number"
              ar="رقم الهوية الإماراتية"
              isRTL={isRTL}
              required
            />
            <Input
              value={data.emirates_id_number || ''}
              onChange={(e) => onChange({ emirates_id_number: e.target.value })}
              placeholder="784-YYYY-NNNNNNN-C"
              disabled={readOnly}
              dir="ltr"
              aria-invalid={!!errors.emirates_id_number}
            />
            <p className="text-[11px] text-gray-400">
              {isRTL
                ? 'الصيغة: 784-YYYY-NNNNNNN-C'
                : 'Format: 784-YYYY-NNNNNNN-C'}
            </p>
            <FieldError error={errors.emirates_id_number} />
          </div>
        )}
      </div>

      {/* Passport */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Student Passport Number"
            ar="رقم جواز سفر الطالب"
            isRTL={isRTL}
            required
          />
          <Input
            value={data.student_passport_number}
            onChange={(e) =>
              onChange({ student_passport_number: e.target.value })
            }
            disabled={readOnly}
            dir="ltr"
            aria-invalid={!!errors.student_passport_number}
          />
          <FieldError error={errors.student_passport_number} />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Passport Expiry Date"
            ar="تاريخ انتهاء الجواز"
            isRTL={isRTL}
          />
          <Input
            type="date"
            value={data.student_passport_expiry}
            onChange={(e) =>
              onChange({ student_passport_expiry: e.target.value })
            }
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Visa */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Residence Visa Number"
            ar="رقم تأشيرة الإقامة"
            isRTL={isRTL}
          />
          <Input
            value={data.residence_visa_number || ''}
            onChange={(e) =>
              onChange({ residence_visa_number: e.target.value })
            }
            disabled={readOnly}
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Visa Expiry Date"
            ar="تاريخ انتهاء التأشيرة"
            isRTL={isRTL}
          />
          <Input
            type="date"
            value={data.residence_visa_expiry || ''}
            onChange={(e) =>
              onChange({ residence_visa_expiry: e.target.value })
            }
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Residency status & Country */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <FieldLabel
            en="Residency Status"
            ar="حالة الإقامة"
            isRTL={isRTL}
          />
          <select
            className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
            value={data.residency_status}
            onChange={(e) => onChange({ residency_status: e.target.value })}
            disabled={readOnly}
          >
            <option value="">{isRTL ? '-- اختر --' : '-- Select --'}</option>
            {RESIDENCY_STATUSES.map((rs) => (
              <option key={rs.value} value={rs.value}>
                {isRTL ? rs.ar : rs.en}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <FieldLabel
            en="Country of Residence"
            ar="دولة الإقامة"
            isRTL={isRTL}
          />
          <Input
            value={data.country_of_residence}
            onChange={(e) =>
              onChange({ country_of_residence: e.target.value })
            }
            placeholder={isRTL ? 'مثال: الإمارات' : 'e.g. UAE'}
            disabled={readOnly}
          />
        </div>
      </div>

      {/* Identity note */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
        <Globe className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          {isRTL
            ? 'يجب توفير رقم جواز السفر أو الهوية الإماراتية على الأقل.'
            : 'At least a passport number or Emirates ID must be provided.'}
        </p>
      </div>
    </div>
  );
}
