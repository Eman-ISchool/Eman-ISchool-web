import { defaultLocale, locales, type Locale } from '@/i18n/config';

export const isLocaleSegment = (value?: string | null): value is Locale => {
    if (!value) return false;
    return (locales as readonly string[]).includes(value);
};

export const getLocaleFromPathname = (pathname?: string | null): Locale => {
    if (!pathname) return defaultLocale;
    const segment = pathname.split('/')[1];
    return isLocaleSegment(segment) ? segment : defaultLocale;
};

export const hasLocalePrefix = (path: string): boolean => {
    if (!path.startsWith('/')) return false;
    const segment = path.split('/')[1];
    return isLocaleSegment(segment);
};

export const withLocalePrefix = (path: string, locale?: string | null): string => {
    if (!path.startsWith('/')) return path;
    if (hasLocalePrefix(path)) return path;
    const safeLocale = isLocaleSegment(locale) ? locale : defaultLocale;
    return `/${safeLocale}${path}`;
};
