import type { Metadata } from "next";
import "./globals.css";
import { Cairo } from 'next/font/google';
import { defaultLocale } from '@/i18n/config';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
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
  const locale = defaultLocale;
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction} className={cairo.variable}>
      <body className="font-sans antialiased min-h-screen flex flex-col bg-gray-50">
        {children}
      </body>
    </html>
  );
}
