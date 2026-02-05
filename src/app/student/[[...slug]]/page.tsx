'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale } from '@/i18n/config';

interface StudentCatchAllRedirectProps {
  params?: { slug?: string[] };
}

/**
 * Student portal catch-all redirect handler for static export.
 *
 * When using `output: 'export'` in Next.js, middleware is disabled.
 * This page serves as a client-side redirect from `/student/*` to
 * the localized student path `/${defaultLocale}/student/*`.
 */
export default function StudentCatchAllRedirect({ params }: StudentCatchAllRedirectProps) {
  const router = useRouter();
  const slugPath = (params?.slug ?? []).join('/');

  useEffect(() => {
    const targetPath = slugPath
      ? `/${defaultLocale}/student/${slugPath}`
      : `/${defaultLocale}/student`;
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
