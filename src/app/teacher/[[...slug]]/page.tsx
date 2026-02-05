'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

interface TeacherCatchAllRedirectProps {
  params?: { slug?: string[] };
}

/**
 * Teacher portal catch-all redirect handler for static export.
 *
 * When using `output: 'export'` in Next.js, middleware is disabled.
 * This page serves as a client-side redirect from `/teacher/*` to
 * the localized teacher path `/${defaultLocale}/teacher/*`.
 */
export default function TeacherCatchAllRedirect({ params }: TeacherCatchAllRedirectProps) {
  const router = useRouter();
  const slugPath = (params?.slug ?? []).join('/');

  useEffect(() => {
    const targetPath = slugPath
      ? `/${defaultLocale}/teacher/${slugPath}`
      : `/${defaultLocale}/teacher`;
    router.replace(targetPath);
  }, [router, slugPath]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-lg text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}
