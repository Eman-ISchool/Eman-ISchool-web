'use client';

import { LanguageProvider as ContextLanguageProvider } from '@/context/LanguageContext';

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
    return <ContextLanguageProvider>{children}</ContextLanguageProvider>;
}
