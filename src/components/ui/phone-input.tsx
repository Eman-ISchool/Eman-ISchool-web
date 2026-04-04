'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { CountryCodeSelector, CountryCode, COMMON_COUNTRIES } from './country-code-selector';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  countryCode: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  placeholder = '1001234567',
  error,
  className,
  disabled,
  id,
  name,
}: PhoneInputProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex">
        <CountryCodeSelector
          value={countryCode}
          onChange={onCountryChange}
        />
        <input
          id={id}
          name={name}
          type="tel"
          dir="ltr"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 rounded-e-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors',
            'focus:ring-2 focus:ring-primary/20 focus:border-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-red-300 focus:ring-red-200 focus:border-red-400',
          )}
        />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export { COMMON_COUNTRIES };
export type { CountryCode };
