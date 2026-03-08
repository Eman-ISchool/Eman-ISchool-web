import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';
import { cookies } from 'next/headers';
import '@/lib/init'; // Initialize application configuration
import { initializeApp } from '@/lib/init';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "Eman ISchool | المدرسة الإلكترونية الأولى",
  description: "منصة تعليمية رائدة تقدم المنهج المصري والأزهري. تعلم أينما كنت.",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eduverse",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Initialize application configuration on first render
  if (typeof window !== 'undefined') {
    try {
      initializeApp();
    } catch (error) {
      console.error('Failed to initialize application:', error);
      // Don't block rendering, but log the error for debugging
    }
  }

  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? defaultLocale;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={`${cairo.variable} ${cairo.className} font-sans`}>
      <body className={`antialiased min-h-screen flex flex-col bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
