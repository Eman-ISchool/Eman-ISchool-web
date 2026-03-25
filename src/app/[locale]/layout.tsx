import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import NextTopLoader from 'nextjs-toploader';
import { locales } from '@/i18n/config';
import AuthProvider from '@/components/AuthProvider';
import LanguageProviderWrapper from '@/components/LanguageProviderWrapper';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { PwaInstallProvider } from '@/contexts/PwaInstallContext';
import ServiceWorkerRegistration from '@/components/pwa/ServiceWorkerRegistration';

interface LocaleLayoutProps {
  children: ReactNode;
  params: { locale: string };
}

// Generate static params for static export
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: LocaleLayoutProps) {
  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);

  // Get messages for the current locale
  const messages = await getMessages({ locale });

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <AuthProvider>
      <NextIntlClientProvider messages={messages}>
        <LanguageProviderWrapper>
          <PwaInstallProvider>
            <ServiceWorkerRegistration />
            <div lang={locale} dir={direction} className="min-h-screen flex flex-col">
              <NextTopLoader color="#4A90E2" showSpinner={false} height={3} />
              <ConditionalLayout>
                {children}
              </ConditionalLayout>
            </div>
          </PwaInstallProvider>
        </LanguageProviderWrapper>
      </NextIntlClientProvider>
    </AuthProvider>
  );
}
