'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Types ──────────────────────────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

// ─── Component ──────────────────────────────────────────────────

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-mocha-600 mb-1.5"
          >
            {label}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          className={twMerge(
            clsx(
              'w-full rounded-xl border bg-white px-4 py-3 text-base text-espresso-800 placeholder:text-latte-500 transition-colors duration-150 min-h-[44px]',
              'focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-coffee-400',
              error
                ? 'border-red-400 focus:ring-red-300 focus:border-red-400'
                : 'border-cream-300 hover:border-coffee-200',
              className,
            ),
          )}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}

        {!error && helperText && (
          <p className="mt-1.5 text-sm text-latte-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
