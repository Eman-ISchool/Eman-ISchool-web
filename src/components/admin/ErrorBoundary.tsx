'use client';

import React, { ComponentType, ReactNode } from 'react';
import { AlertCircle, AlertOctagonExclamationTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: string[];
}

interface ErrorInfo {
  componentStack?: string;
  digest?: string;
  message?: string;
  name?: string;
}

export function ErrorBoundary({
  children,
  fallback = null,
  onError,
  resetKeys = [],
}: ErrorBoundaryProps) {
  const t = useTranslations();
  const isRTL = t('dir') === 'rtl';

  return (
    <div className="error-boundary-wrapper">
      <React.ErrorBoundary
        Fallback={fallback}
        onError={(error, errorInfo) => {
          console.error('Error caught by ErrorBoundary:', error, errorInfo);

          if (onError) {
            onError(error, errorInfo);
          }

          // Track error in Sentry if available
          if (typeof window !== 'undefined') {
            const Sentry = (window as any).Sentry;
            if (Sentry) {
              Sentry.withScope((scope) => {
                scope.setTag('error_boundary', 'true');
                scope.setLevel('error');
                scope.setExtra('component_stack', errorInfo?.componentStack);
                scope.setExtra('digest', errorInfo?.digest);
                scope.setExtra('message', errorInfo?.message);
                scope.setExtra('name', errorInfo?.name);
              });

              Sentry.captureException(error, {
                tags: {
                  error_boundary: 'true',
                  error_level: 'error',
                },
                extra: {
                  component_stack: errorInfo?.componentStack,
                  digest: errorInfo?.digest,
                  message: errorInfo?.message,
                  name: errorInfo?.name,
                },
              });
            }
          }

          // Reset app state on error
          if (resetKeys.length > 0) {
            resetKeys.forEach(key => {
              if (typeof window !== 'undefined' && (window as any)[key]) {
                delete (window as any)[key];
              }
            });
          }
        }}
      >
        {({ children })}
      </React.ErrorBoundary>
    </div>
  );
}

// Error display component
export function ErrorDisplay({ error }: { error: Error }) {
  const t = useTranslations();
  const isRTL = t('dir') === 'rtl';

  return (
    <div className="error-display" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start gap-3 p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertOctagonExclamationTriangle className="h-12 w-12 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <div>
            <h3 className="text-lg font-semibold text-red-900">{t('common.error')}</h3>
              <p className="text-sm text-gray-700 mt-2">{error.message || t('common.somethingWentWrong')}</p>
            </div>
            {error.name && (
              <p className="text-xs text-gray-500 font-mono mt-1">
                <code className="block bg-gray-100 px-3 py-1 rounded text-xs">
                  {error.name}
                </code>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
