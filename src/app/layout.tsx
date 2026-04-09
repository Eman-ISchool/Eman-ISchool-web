import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Tajawal, Inter } from 'next/font/google';

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
  preload: true,
});

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

// Locale and direction are handled by the [locale] layout which receives
// the locale from the URL path (middleware ensures localePrefix: 'always').
// Previously this layout called cookies() which forced every page to be
// dynamically rendered — removing it allows static/ISR rendering.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={`${tajawal.variable} ${geistFallback.variable} font-sans`}>
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* DNS prefetch for non-critical origins */}
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
      </head>
      <body className={`antialiased min-h-screen flex flex-col bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
