'use client';

import { useId } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const COUNTRY_OPTIONS = [
  { code: '962', flag: 'JO', label: { ar: 'الأردن', en: 'Jordan' } },
  { code: '971', flag: 'AE', label: { ar: 'الإمارات', en: 'UAE' } },
  { code: '966', flag: 'SA', label: { ar: 'السعودية', en: 'Saudi Arabia' } },
  { code: '20', flag: 'EG', label: { ar: 'مصر', en: 'Egypt' } },
  { code: '965', flag: 'KW', label: { ar: 'الكويت', en: 'Kuwait' } },
  { code: '974', flag: 'QA', label: { ar: 'قطر', en: 'Qatar' } },
];

export interface PhoneCountryInputProps {
  countryCode: string;
  locale: 'ar' | 'en';
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  phone: string;
  disabled?: boolean;
  label: string;
  required?: boolean;
  error?: string;
}

export function PhoneCountryInput({
  countryCode,
  locale,
  onCountryCodeChange,
  onPhoneChange,
  phone,
  disabled = false,
  label,
  required = true,
  error,
}: PhoneCountryInputProps) {
  const isArabic = locale === 'ar';
  const phoneId = useId();
  const countryCodeId = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={phoneId} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3">
        <label className="sr-only" htmlFor={countryCodeId}>
          {isArabic ? 'مفتاح الدولة' : 'Country code'}
        </label>
        <select
          id={countryCodeId}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 disabled:opacity-50"
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          disabled={disabled}
        >
          {COUNTRY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              +{option.code} {option.label[locale]}
            </option>
          ))}
        </select>

        <div className="space-y-1.5">
          <Input
            id={phoneId}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            className={`h-11 rounded-xl border-slate-200 focus-visible:border-sky-500 focus-visible:ring-sky-100 ${
              error ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100' : ''
            }`}
            placeholder={isArabic ? '79 032 0149' : '79 032 0149'}
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value.replace(/[^\d\s-]/g, ''))}
            disabled={disabled}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${phoneId}-error` : undefined}
          />
          {error && (
            <p id={`${phoneId}-error`} className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
