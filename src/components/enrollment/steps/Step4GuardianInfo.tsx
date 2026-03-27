'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Users,
  Plus,
  Trash2,
  UserPlus,
  Shield,
  Phone,
} from 'lucide-react';
import type { GuardianFormData, GuardianRelationship } from '@/types/enrollment';

interface Step4GuardianInfoProps {
  locale: string;
  guardians: GuardianFormData[];
  onChange: (guardians: GuardianFormData[]) => void;
  errors: Record<string, string>;
  readOnly: boolean;
}

const RELATIONSHIPS: { value: GuardianRelationship; en: string; ar: string }[] = [
  { value: 'father', en: 'Father', ar: 'الأب' },
  { value: 'mother', en: 'Mother', ar: 'الأم' },
  { value: 'grandfather', en: 'Grandfather', ar: 'الجد' },
  { value: 'grandmother', en: 'Grandmother', ar: 'الجدة' },
  { value: 'uncle', en: 'Uncle', ar: 'العم / الخال' },
  { value: 'aunt', en: 'Aunt', ar: 'العمة / الخالة' },
  { value: 'sibling', en: 'Sibling', ar: 'أخ / أخت' },
  { value: 'legal_guardian', en: 'Legal Guardian', ar: 'ولي أمر قانوني' },
  { value: 'other', en: 'Other', ar: 'أخرى' },
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

const CONTACT_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  primary: { en: 'Primary Contact', ar: 'جهة الاتصال الرئيسية' },
  father: { en: 'Father', ar: 'الأب' },
  mother: { en: 'Mother', ar: 'الأم' },
  guardian: { en: 'Guardian', ar: 'ولي الأمر' },
  emergency: { en: 'Emergency Contact', ar: 'جهة اتصال الطوارئ' },
};

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

function emptyGuardian(contactType: string): GuardianFormData {
  return {
    contact_type: contactType,
    relationship: 'father',
    full_name_en: '',
    full_name_ar: '',
    mobile: '',
    email: '',
    uae_address: '',
    emirate: '',
    area_city_district: '',
    emirates_id_number: '',
    passport_number: '',
    visa_number: '',
    is_legal_guardian: false,
    custody_case: false,
    guardian_authorization_notes: '',
  };
}

export default function Step4GuardianInfo({
  locale,
  guardians,
  onChange,
  errors,
  readOnly,
}: Step4GuardianInfoProps) {
  const isRTL = locale === 'ar';

  const updateGuardian = (index: number, updates: Partial<GuardianFormData>) => {
    const updated = [...guardians];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const addGuardian = (contactType: string) => {
    onChange([...guardians, emptyGuardian(contactType)]);
  };

  const removeGuardian = (index: number) => {
    if (guardians.length <= 1) return;
    onChange(guardians.filter((_, i) => i !== index));
  };

  // Determine which add buttons to show
  const existingTypes = guardians.map((g) => g.contact_type);
  const addOptions = [
    { type: 'father', en: 'Add Father Details', ar: 'إضافة بيانات الأب', icon: UserPlus },
    { type: 'mother', en: 'Add Mother Details', ar: 'إضافة بيانات الأم', icon: UserPlus },
    { type: 'guardian', en: 'Add Guardian Details', ar: 'إضافة بيانات ولي الأمر', icon: Shield },
    { type: 'emergency', en: 'Add Emergency Contact', ar: 'إضافة جهة اتصال طوارئ', icon: Phone },
  ].filter((opt) => !existingTypes.includes(opt.type));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'ولي الأمر / الوصي' : 'Parent / Guardian'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'أدخل بيانات ولي الأمر وجهات الاتصال.'
            : 'Enter parent/guardian contact and identity details.'}
        </p>
      </div>

      {/* Guardian cards */}
      {guardians.map((guardian, idx) => {
        const typeLabel =
          CONTACT_TYPE_LABELS[guardian.contact_type] || CONTACT_TYPE_LABELS.primary;
        const prefix = guardian.contact_type === 'primary' ? 'primary' : `contacts[${idx}]`;

        return (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl p-6 space-y-6 bg-white"
          >
            {/* Section header */}
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900">
                {isRTL ? typeLabel.ar : typeLabel.en}
              </h3>
              {idx > 0 && !readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeGuardian(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 me-1" />
                  {isRTL ? 'حذف' : 'Remove'}
                </Button>
              )}
            </div>

            {/* Relationship */}
            <div className="space-y-2">
              <FieldLabel
                en="Relationship"
                ar="صلة القرابة"
                isRTL={isRTL}
                required
              />
              <select
                className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                value={guardian.relationship}
                onChange={(e) =>
                  updateGuardian(idx, {
                    relationship: e.target.value as GuardianRelationship,
                  })
                }
                disabled={readOnly}
              >
                {RELATIONSHIPS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {isRTL ? r.ar : r.en}
                  </option>
                ))}
              </select>
              <FieldError error={errors[`${prefix}.relationship`]} />
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
                  value={guardian.full_name_en}
                  onChange={(e) =>
                    updateGuardian(idx, { full_name_en: e.target.value })
                  }
                  placeholder="e.g. Ali Mohammed"
                  disabled={readOnly}
                  dir="ltr"
                  aria-invalid={!!errors[`${prefix}.full_name_en`]}
                />
                <FieldError error={errors[`${prefix}.full_name_en`]} />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  en="Full Name (Arabic)"
                  ar="الاسم الكامل (عربي)"
                  isRTL={isRTL}
                />
                <Input
                  value={guardian.full_name_ar}
                  onChange={(e) =>
                    updateGuardian(idx, { full_name_ar: e.target.value })
                  }
                  placeholder="مثال: علي محمد"
                  disabled={readOnly}
                  dir="rtl"
                />
              </div>
            </div>

            {/* Contact */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FieldLabel
                  en="Mobile Number"
                  ar="رقم الجوال"
                  isRTL={isRTL}
                  required
                />
                <Input
                  value={guardian.mobile}
                  onChange={(e) =>
                    updateGuardian(idx, { mobile: e.target.value })
                  }
                  placeholder="+971 50 XXXXXXX"
                  disabled={readOnly}
                  dir="ltr"
                  aria-invalid={!!errors[`${prefix}.mobile`]}
                />
                <FieldError error={errors[`${prefix}.mobile`]} />
              </div>

              <div className="space-y-2">
                <FieldLabel
                  en="Email Address"
                  ar="البريد الإلكتروني"
                  isRTL={isRTL}
                  required
                />
                <Input
                  type="email"
                  value={guardian.email}
                  onChange={(e) =>
                    updateGuardian(idx, { email: e.target.value })
                  }
                  placeholder="parent@example.com"
                  disabled={readOnly}
                  dir="ltr"
                  aria-invalid={!!errors[`${prefix}.email`]}
                />
                <FieldError error={errors[`${prefix}.email`]} />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <FieldLabel
                en="UAE Address"
                ar="العنوان في الإمارات"
                isRTL={isRTL}
              />
              <Input
                value={guardian.uae_address}
                onChange={(e) =>
                  updateGuardian(idx, { uae_address: e.target.value })
                }
                placeholder={
                  isRTL
                    ? 'مثال: شارع الشيخ زايد، دبي'
                    : 'e.g. Sheikh Zayed Road, Dubai'
                }
                disabled={readOnly}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <FieldLabel en="Emirate" ar="الإمارة" isRTL={isRTL} />
                <select
                  className="flex h-12 w-full rounded-3xl border border-input bg-background px-4 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  value={guardian.emirate}
                  onChange={(e) =>
                    updateGuardian(idx, { emirate: e.target.value })
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
                  en="Area / City / District"
                  ar="المنطقة / المدينة / الحي"
                  isRTL={isRTL}
                />
                <Input
                  value={guardian.area_city_district || ''}
                  onChange={(e) =>
                    updateGuardian(idx, { area_city_district: e.target.value })
                  }
                  disabled={readOnly}
                />
              </div>
            </div>

            {/* Guardian-specific fields */}
            {(guardian.contact_type === 'guardian' ||
              guardian.relationship === 'legal_guardian') && (
              <div className="space-y-4 border-t border-gray-100 pt-4">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  {isRTL ? 'تفاصيل الوصاية' : 'Guardianship Details'}
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardian.custody_case || false}
                      onChange={(e) =>
                        updateGuardian(idx, { custody_case: e.target.checked })
                      }
                      disabled={readOnly}
                      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {isRTL ? 'حالة حضانة' : 'Custody Case'}
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={guardian.is_legal_guardian || false}
                      onChange={(e) =>
                        updateGuardian(idx, {
                          is_legal_guardian: e.target.checked,
                        })
                      }
                      disabled={readOnly}
                      className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {isRTL ? 'وصاية قانونية' : 'Legal Guardianship'}
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <FieldLabel
                    en="Authorization Notes"
                    ar="ملاحظات التفويض"
                    isRTL={isRTL}
                  />
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={guardian.guardian_authorization_notes || ''}
                    onChange={(e) =>
                      updateGuardian(idx, {
                        guardian_authorization_notes: e.target.value,
                      })
                    }
                    disabled={readOnly}
                    placeholder={
                      isRTL
                        ? 'أي ملاحظات إضافية حول التفويض...'
                        : 'Any additional authorization notes...'
                    }
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add buttons */}
      {!readOnly && addOptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {addOptions.map((opt) => (
            <Button
              key={opt.type}
              variant="outline"
              size="sm"
              onClick={() => addGuardian(opt.type)}
            >
              <Plus className="w-4 h-4 me-1" />
              {isRTL ? opt.ar : opt.en}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
