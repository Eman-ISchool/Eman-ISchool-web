import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300 min-h-[300px] ${className}`}
    >
      {icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-sm mb-6">{description}</p>
      )}

      {action && (
        <>
          {action.href ? (
            <Link href={action.href}>
              <Button className="mt-2">{action.label}</Button>
            </Link>
          ) : (
            <Button onClick={action.onClick} className="mt-2">
              {action.label}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
