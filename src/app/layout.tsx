import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";
import NetworkMonitor from "@/components/NetworkMonitor";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
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
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-sans antialiased min-h-screen flex flex-col bg-gray-50`}>
        <AuthProvider>
          <LanguageProviderWrapper>
            <NetworkMonitor />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </LanguageProviderWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
