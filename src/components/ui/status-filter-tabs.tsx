'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface StatusFilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface StatusFilterTabsProps {
  options: StatusFilterOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function StatusFilterTabs({
  options,
  value,
  onChange,
  className,
}: StatusFilterTabsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 overflow-x-auto border-b border-gray-200 scrollbar-hide',
        className
      )}
      role="tablist"
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            value === option.value
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          {option.label}
          {option.count !== undefined && (
            <span
              className={cn(
                'inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium',
                value === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'bg-gray-100 text-gray-600'
              )}
            >
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
