'use client';

import * as React from 'react';
import { ChevronRight, ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const Separator = isRTL ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      <Link
        href={`/${locale}/dashboard`}
        className="flex items-center text-slate-500 hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <Separator className="h-4 w-4 text-slate-400" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-slate-500 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-900 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
