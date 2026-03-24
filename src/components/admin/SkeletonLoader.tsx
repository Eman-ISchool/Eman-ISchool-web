'use client';

import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'input' | 'button';
  className?: string;
}

export function SkeletonLoader({ variant = 'card', className = '' }: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-200 rounded-lg';

  const variants = {
    card: 'h-32 w-full rounded-lg',
    table: 'h-8 w-full',
    input: 'h-10 w-full',
    button: 'h-10 w-20',
  };

  return (
    <div className={cn(baseClasses, className)} role="status" aria-label="Loading...">
      <div className="animate-pulse space-y-4">
        {variant === 'card' && (
          <div className="grid grid-cols-1 gap-4">
            <div className="h-32 w-full bg-gray-200 rounded-lg" />
            <div className="h-32 w-full bg-gray-200 rounded-lg" />
            <div className="h-32 w-full bg-gray-200 rounded-lg" />
          </div>
        )}

        {variant === 'table' && (
          <div className="space-y-4">
            <div className="h-8 w-full bg-gray-200 rounded-lg" />
            <div className="h-8 w-full bg-gray-200 rounded-lg" />
          </div>
        )}

        {variant === 'input' && (
          <div className="h-10 w-full bg-gray-200 rounded-lg" />
        )}

        {variant === 'button' && (
          <div className="h-10 w-20 bg-gray-200 rounded-lg" />
        )}
      </div>
    </div>
  );
}

export default SkeletonLoader;
