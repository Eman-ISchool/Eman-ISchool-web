'use client';

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CountryCode {
  code: string;
  dialCode: string;
  name: string;
  flag: string;
}

const COMMON_COUNTRIES: CountryCode[] = [
  { code: 'EG', dialCode: '+20', name: 'مصر', flag: '🇪🇬' },
  { code: 'SA', dialCode: '+966', name: 'السعودية', flag: '🇸🇦' },
  { code: 'AE', dialCode: '+971', name: 'الإمارات', flag: '🇦🇪' },
  { code: 'JO', dialCode: '+962', name: 'الأردن', flag: '🇯🇴' },
  { code: 'KW', dialCode: '+965', name: 'الكويت', flag: '🇰🇼' },
  { code: 'QA', dialCode: '+974', name: 'قطر', flag: '🇶🇦' },
  { code: 'BH', dialCode: '+973', name: 'البحرين', flag: '🇧🇭' },
  { code: 'OM', dialCode: '+968', name: 'عُمان', flag: '🇴🇲' },
  { code: 'IQ', dialCode: '+964', name: 'العراق', flag: '🇮🇶' },
  { code: 'LB', dialCode: '+961', name: 'لبنان', flag: '🇱🇧' },
  { code: 'SY', dialCode: '+963', name: 'سوريا', flag: '🇸🇾' },
  { code: 'PS', dialCode: '+970', name: 'فلسطين', flag: '🇵🇸' },
  { code: 'LY', dialCode: '+218', name: 'ليبيا', flag: '🇱🇾' },
  { code: 'SD', dialCode: '+249', name: 'السودان', flag: '🇸🇩' },
  { code: 'TN', dialCode: '+216', name: 'تونس', flag: '🇹🇳' },
  { code: 'DZ', dialCode: '+213', name: 'الجزائر', flag: '🇩🇿' },
  { code: 'MA', dialCode: '+212', name: 'المغرب', flag: '🇲🇦' },
  { code: 'YE', dialCode: '+967', name: 'اليمن', flag: '🇾🇪' },
  { code: 'US', dialCode: '+1', name: 'USA', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'UK', flag: '🇬🇧' },
  { code: 'DE', dialCode: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', dialCode: '+33', name: 'France', flag: '🇫🇷' },
  { code: 'TR', dialCode: '+90', name: 'تركيا', flag: '🇹🇷' },
];

interface CountryCodeSelectorProps {
  value: CountryCode;
  onChange: (country: CountryCode) => void;
  className?: string;
}

export function CountryCodeSelector({ value, onChange, className }: CountryCodeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = COMMON_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm hover:bg-gray-100 transition-colors h-full"
      >
        <span className="text-lg leading-none">{value.flag}</span>
        <span className="font-medium text-gray-700">{value.dialCode}</span>
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full start-0 z-50 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-lg border border-gray-200 py-2 ps-8 pe-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onChange(country);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 transition-colors',
                  value.code === country.code && 'bg-primary/5 text-primary'
                )}
              >
                <span className="text-lg leading-none">{country.flag}</span>
                <span className="flex-1 text-start">{country.name}</span>
                <span className="text-gray-400">{country.dialCode}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { COMMON_COUNTRIES };
