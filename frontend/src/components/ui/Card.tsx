'use client';

import { forwardRef, type HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─── Types ──────────────────────────────────────────────────────

type CardVariant = 'default' | 'selected' | 'interactive';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
}

// ─── Styles ─────────────────────────────────────────────────────

const base =
  'rounded-2xl border transition-all duration-200 ease-in-out';

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white border-cream-300 shadow-sm',
  selected:
    'bg-coffee-50 border-coffee-400 shadow-md ring-2 ring-coffee-200',
  interactive:
    'bg-white border-cream-300 shadow-sm hover:shadow-md hover:border-coffee-200 cursor-pointer active:scale-[0.98]',
};

const paddingStyles: Record<CardPadding, string> = {
  none: '',
  sm: 'p-2.5 sm:p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-4 sm:p-7',
};

// ─── Component ──────────────────────────────────────────────────

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      className,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    // If onClick is provided but variant is default, upgrade to interactive
    const resolvedVariant = onClick && variant === 'default' ? 'interactive' : variant;

    return (
      <div
        ref={ref}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={twMerge(
          clsx(
            base,
            variantStyles[resolvedVariant],
            paddingStyles[padding],
            className,
          ),
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export { Card };
export type { CardProps, CardVariant, CardPadding };
