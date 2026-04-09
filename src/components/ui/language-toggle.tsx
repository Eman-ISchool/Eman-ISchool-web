'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const isArabic = locale === 'ar';

  return (
    <button
      onClick={() => switchLocale(isArabic ? 'en' : 'ar')}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700',
        'hover:bg-slate-50 hover:border-slate-300 transition-colors',
        className
      )}
      aria-label={isArabic ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <Globe className="h-4 w-4" />
      <span>{isArabic ? 'EN' : 'AR'}</span>
    </button>
  );
}
