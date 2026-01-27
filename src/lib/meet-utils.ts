
/**
 * Utilities for handling Google Meet links
 * Note: Jitsi Meet fallback has been removed - only Google Meet is supported
 */

/**
 * Validates if the string is a valid Google Meet URL
 */
export function isGoogleMeetUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    return url.startsWith('https://meet.google.com/');
}

/**
 * Extracts the meeting code from a Google Meet URL
 */
export function getMeetCode(url: string): string | null {
    if (!isGoogleMeetUrl(url)) return null;
    return url.split('meet.google.com/')[1]?.split('?')[0] || null;
}

/**
 * Formats a Google Meet URL for display
 */
export function formatMeetLink(url: string): string {
    const code = getMeetCode(url);
    return code ? `meet.google.com/${code}` : url;
}

/**
 * Check if a meeting link exists and is valid
 */
export function hasMeetLink(meetLink: string | null | undefined): boolean {
    return isGoogleMeetUrl(meetLink);
}

/**
 * Validates a Google Meet link for joining and returns structured validation result
 * Used by the classroom page to validate before opening the Meet link
 */
export function validateMeetLinkForJoining(meetLink: string | null | undefined): {
    isValid: boolean;
    error?: string;
} {
    if (!meetLink || meetLink.trim() === '') {
        return {
            isValid: false,
            error: 'لا يوجد رابط اجتماع متاح لهذا الدرس'
        };
    }

    if (!isGoogleMeetUrl(meetLink)) {
        return {
            isValid: false,
            error: 'رابط الاجتماع غير صالح. يرجى التواصل مع المعلم للحصول على الرابط الصحيح'
        };
    }

    return { isValid: true };
}
