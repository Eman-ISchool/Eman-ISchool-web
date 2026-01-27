import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AuthProvider from "@/components/AuthProvider";
import LanguageProviderWrapper from "@/components/LanguageProviderWrapper";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eman ISchool | المدرسة الإلكترونية الأولى",
  description: "منصة تعليمية رائدة تقدم المنهج المصري والأزهري. تعلم أينما كنت.",
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
