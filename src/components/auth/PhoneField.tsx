'use client';

import { useId, useState, useRef, useEffect } from 'react';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, Check } from 'lucide-react';

const COUNTRY_OPTIONS = [
  { code: '1', emoji: '🇺🇸', label: { ar: 'الولايات المتحدة', en: 'United States' } },
  { code: '44', emoji: '🇬🇧', label: { ar: 'المملكة المتحدة', en: 'United Kingdom' } },
  { code: '249', emoji: '🇸🇩', label: { ar: 'السودان', en: 'Sudan' } },
  { code: '966', emoji: '🇸🇦', label: { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' } },
  { code: '20', emoji: '🇪🇬', label: { ar: 'مصر', en: 'Egypt' } },
  { code: '971', emoji: '🇦🇪', label: { ar: 'الإمارة العربية المتحدة', en: 'UAE' } },
  { code: '974', emoji: '🇶🇦', label: { ar: 'قطر', en: 'Qatar' } },
  { code: '965', emoji: '🇰🇼', label: { ar: 'الكويت', en: 'Kuwait' } },
  { code: '973', emoji: '🇧🇭', label: { ar: 'البحرين', en: 'Bahrain' } },
  { code: '968', emoji: '🇴🇲', label: { ar: 'عمان', en: 'Oman' } },
  { code: '962', emoji: '🇯🇴', label: { ar: 'الأردن', en: 'Jordan' } },
  { code: '961', emoji: '🇱🇧', label: { ar: 'لبنان', en: 'Lebanon' } },
  { code: '964', emoji: '🇮🇶', label: { ar: 'العراق', en: 'Iraq' } },
  { code: '967', emoji: '🇾🇪', label: { ar: 'اليمن', en: 'Yemen' } },
  { code: '963', emoji: '🇸🇾', label: { ar: 'سوريا', en: 'Syria' } },
  { code: '970', emoji: '🇵🇸', label: { ar: 'فلسطين', en: 'Palestine' } },
  { code: '218', emoji: '🇱🇾', label: { ar: 'ليبيا', en: 'Libya' } },
  { code: '216', emoji: '🇹🇳', label: { ar: 'تونس', en: 'Tunisia' } },
  { code: '213', emoji: '🇩🇿', label: { ar: 'الجزائر', en: 'Algeria' } },
  { code: '212', emoji: '🇲🇦', label: { ar: 'موريتانيا', en: 'Mauritania' } },
  { code: '256', emoji: '🇺🇬', label: { ar: 'أوغندا', en: 'Uganda' } },
  { code: '255', emoji: '🇹🇿', label: { ar: 'تنزانيا', en: 'Tanzania' } },
  { code: '254', emoji: '🇰🇪', label: { ar: 'كينيا', en: 'Kenya' } },
  { code: '234', emoji: '🇳🇬', label: { ar: 'نيجيريا', en: 'Nigeria' } },
  { code: '233', emoji: '🇬🇭', label: { ar: 'غانا', en: 'Ghana' } },
  { code: '221', emoji: '🇸🇳', label: { ar: 'سنغال', en: 'Senegal' } },
  { code: '235', emoji: '🇹🇩', label: { ar: 'تشاد', en: 'Chad' } },
  { code: '250', emoji: '🇷🇼', label: { ar: 'رواندا', en: 'Rwanda' } },
  { code: '257', emoji: '🇧🇮', label: { ar: 'بوروندي', en: 'Burundi' } },
  { code: '260', emoji: '🇿🇲', label: { ar: 'زامبيا', en: 'Zambia' } },
  { code: '263', emoji: '🇿🇼', label: { ar: 'زيمبابوي', en: 'Zimbabwe' } },
  { code: '211', emoji: '🇸🇸', label: { ar: 'جنوب السودان', en: 'South Sudan' } },
];

interface PhoneFieldProps {
  countryCode: string;
  locale: 'ar' | 'en';
  onCountryCodeChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  phone: string;
  disabled?: boolean;
  label: string;
  required?: boolean;
}

export { COUNTRY_OPTIONS };

export function PhoneField({
  countryCode,
  locale,
  onCountryCodeChange,
  onPhoneChange,
  phone,
  disabled = false,
  label,
  required = true,
}: PhoneFieldProps) {
  const isArabic = locale === 'ar';
  const phoneId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = COUNTRY_OPTIONS.find((o) => o.code === countryCode) || COUNTRY_OPTIONS[5];

  const filtered = search
    ? COUNTRY_OPTIONS.filter(
        (o) =>
          o.label[locale].toLowerCase().includes(search.toLowerCase()) ||
          o.code.includes(search)
      )
    : COUNTRY_OPTIONS;

  useEffect(() => {
    if (open && searchRef.current) searchRef.current.focus();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="space-y-2">
      <Label htmlFor={phoneId} className="text-sm font-semibold text-gray-900">
        {label}
      </Label>
      <div className={`flex gap-0 ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setOpen(!open)}
            disabled={disabled}
            className={`flex h-12 items-center gap-1.5 border border-gray-200 bg-white px-3 text-sm hover:bg-gray-50 transition ${
              isArabic ? 'rounded-l-none rounded-r-xl border-l-0' : 'rounded-r-none rounded-l-xl border-r-0'
            }`}
          >
            <span>{selected.emoji}</span>
            <span className="text-gray-700">+{selected.code}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {open && (
            <div
              ref={dialogRef}
              className={`absolute z-50 mt-1 w-72 rounded-xl border border-gray-200 bg-white shadow-xl ${
                isArabic ? 'right-0' : 'left-0'
              }`}
            >
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isArabic ? 'ابحث' : 'Search'}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </div>
              <div className="max-h-64 overflow-y-auto py-1">
                {filtered.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      onCountryCodeChange(option.code);
                      setOpen(false);
                      setSearch('');
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2.5 text-sm hover:bg-gray-50 transition ${
                      isArabic ? 'flex-row-reverse text-right' : 'text-left'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <span>{option.emoji}</span>
                      <span className="text-gray-900">{option.label[locale]}</span>
                      <span className="text-gray-500">{option.code}</span>
                    </div>
                    {option.code === countryCode && (
                      <Check className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          id={phoneId}
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          className={`h-12 flex-1 border-gray-200 focus-visible:border-gray-400 focus-visible:ring-0 ${
            isArabic ? 'rounded-r-none rounded-l-xl' : 'rounded-l-none rounded-r-xl'
          }`}
          placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value.replace(/[^\d\s-]/g, ''))}
          disabled={disabled}
          required={required}
        />
      </div>
    </div>
  );
}
