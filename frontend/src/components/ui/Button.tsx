'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Types ──────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

// ─── Styles ─────────────────────────────────────────────────────

const base =
  'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-400 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-coffee-500 text-white hover:bg-coffee-600 active:scale-[0.98]',
  secondary:
    'bg-cream-200 text-mocha-600 hover:bg-cream-300 active:scale-[0.98]',
  outline:
    'border-[1.5px] border-coffee-300 text-coffee-600 bg-transparent hover:bg-coffee-50 hover:border-coffee-400',
  ghost:
    'text-coffee-600 bg-transparent hover:bg-cream-200',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-sm px-4 py-2.5 min-h-[40px]',
  md: 'text-base px-5 py-3 min-h-[44px]',
  lg: 'text-lg px-6 py-3.5 min-h-[48px]',
};

// ─── Spinner ────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          clsx(
            base,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className,
          ),
        )}
        {...props}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps, ButtonVariant, ButtonSize };
