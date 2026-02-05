import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { locales } from '@/i18n/config';
import AuthProvider from '@/components/AuthProvider';
import LanguageProviderWrapper from '@/components/LanguageProviderWrapper';
import NetworkMonitor from '@/components/NetworkMonitor';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

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

  // Get messages for the current locale
  const messages = await getMessages();

  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <AuthProvider>
      <LanguageProviderWrapper>
        <NextIntlClientProvider messages={messages}>
          <div lang={locale} dir={direction} className="min-h-screen flex flex-col">
            <NetworkMonitor />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </LanguageProviderWrapper>
    </AuthProvider>
  );
}
