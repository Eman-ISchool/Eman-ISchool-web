import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface PageErrorProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function PageError({
  message,
  onRetry,
  className = '',
}: PageErrorProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-red-200 min-h-[300px] ${className}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        حدث خطأ
      </h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>

      {onRetry && (
        <Button onClick={onRetry} variant="default" className="mt-2">
          إعادة المحاولة
        </Button>
      )}
    </div>
  );
}
