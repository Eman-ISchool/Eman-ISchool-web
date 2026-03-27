import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Tajawal } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';
import { cookies } from 'next/headers';
// E2E rebuild trigger

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: true,
});

// Since Geist might not be available from next/font/google directly in this version,
// we will just use a generic sans or assuming it's imported correctly.
// Let's use Inter as the closest fallback to Geist if we don't have Geist files local, 
// or since Geist became standard in Next 15, we can use Inter for now or fetch Next.js 14 specific.
import { Inter } from 'next/font/google';

const geistFallback = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Eman ISchool | المدرسة الإلكترونية الأولى",
  description: "منصة تعليمية رائدة تقدم المنهج المصري والأزهري. تعلم أينما كنت.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Eman ISchool",
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

export const viewport: Viewport = {
  themeColor: "#161616",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value ?? defaultLocale;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={`${tajawal.variable} ${geistFallback.variable} font-sans`}>
      <body className={`antialiased min-h-screen flex flex-col bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
