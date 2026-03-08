/**
 * i18n Logger Utility
 * 
 * Logs missing translation keys to stderr for debugging.
 * Called from fallback paths in form components.
 */

export function logMissingKey(keyPath: string, locale: string): void {
    const message = `[i18n] Missing key: ${keyPath} (locale: ${locale})`;
    
    // Log to stderr in development
    if (process.env.NODE_ENV === 'development') {
        console.warn(message);
    } else {
        // In production, still log but to stderr
        console.error(message);
    }
}

/**
 * Helper to get translation value with fallback and logging
 * 
 * @param value - The translation value (may be undefined if key is missing)
 * @param keyPath - The key path for logging (e.g., 'teacher.subjects.createTitle')
 * @param locale - Current locale
 * @param fallback - Fallback value if translation is missing
 * @returns The translation value or fallback
 */
export function getTranslationWithFallback(
    value: string | undefined,
    keyPath: string,
    locale: string,
    fallback: string
): string {
    if (value === undefined || value === null) {
        logMissingKey(keyPath, locale);
        return fallback;
    }
    
    return value;
}
