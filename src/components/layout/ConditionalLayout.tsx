'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

/**
 * Conditionally renders Header + Footer only on PUBLIC pages.
 * Dashboard portals (teacher, student, admin, parent) have their own
 * navigation (side-navs) and don't need the public chrome.
 *
 * This saves:
 * - Header's useSession() call (triggers /api/auth/session on every render)
 * - Header's cart-store hydration
 * - Footer DOM + style overhead
 * - NetworkMonitor Capacitor initialization
 */
const PORTAL_PREFIXES = ['/teacher', '/student', '/admin', '/parent', '/auth', '/dashboard'];

function isPortalRoute(pathname: string): boolean {
    // Strip locale prefix like /en/ or /ar/
    const withoutLocale = pathname.replace(/^\/(en|ar)/, '');
    return PORTAL_PREFIXES.some(prefix => withoutLocale.startsWith(prefix));
}

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isPortal = isPortalRoute(pathname);

    if (isPortal) {
        return <>{children}</>;
    }

    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
