'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface LoadingPageProps {
  className?: string;
}

export function LoadingPage({ className }: LoadingPageProps) {
  return (
    <div className={cn('flex min-h-[400px] items-center justify-center', className)}>
      <div className="space-y-4 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse space-y-4', className)}>
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-1/2 rounded bg-slate-200" />
      <div className="h-4 w-5/6 rounded bg-slate-200" />
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-slate-200 bg-white p-4', className)}>
      <div className="animate-pulse space-y-3">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="h-8 w-1/2 rounded bg-slate-200" />
        <div className="h-3 w-2/3 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 w-24 rounded bg-slate-200 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-slate-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-4 py-3">
            <div className="flex gap-4 animate-pulse">
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 w-24 rounded bg-slate-200" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
