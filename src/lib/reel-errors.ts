/**
 * Reel Error Messages
 * User-friendly error messages for reel generation failures
 */

export interface ReelErrorMapping {
    [key: string]: string;
}

/**
 * Error message mappings for different types of errors
 */
export const REEL_ERROR_MESSAGES: ReelErrorMapping = {
    // Configuration errors
    CONFIG_ERROR: 'AI service is not configured. Please contact support.',
    INVALID_INPUT: 'The material content is invalid for video generation.',
    
    // API errors
    RATE_LIMIT: 'Too many generation requests. Please try again later.',
    SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.',
    INSUFFICIENT_CONTENT: 'The material does not have enough content to generate a video. Please add more details.',
    CONTENT_POLICY_VIOLATION: 'The content violates our policies. Please review and modify the material.',
    
    // Network errors
    NETWORK_ERROR: 'Network error connecting to AI service. Please check your connection and try again.',
    TIMEOUT: 'The generation request timed out. Please try again.',
    
    // Generation errors
    GENERATION_FAILED: 'Failed to generate a video. The AI service encountered an error. Please try again.',
    VIDEO_GENERATION_ERROR: 'Failed to generate the video file. Please try again.',
    
    // Retry messages
    RETRYABLE: 'An error occurred. You can retry this operation.',
    NON_RETRYABLE: 'An error occurred that cannot be retried. Please contact support.',
};

/**
 * Get user-friendly error message for a given error code or type
 */
export function getUserFriendlyReelError(
    errorCode?: string,
    errorMessage?: string,
    errorType?: 'config' | 'api' | 'network' | 'generation' | 'policy'
): string {
    // If custom error message is provided, use it
    if (errorMessage) {
        return errorMessage;
    }
    
    // Otherwise, look up by error code
    if (errorCode && REEL_ERROR_MESSAGES[errorCode as keyof ReelErrorMapping]) {
        return REEL_ERROR_MESSAGES[errorCode as keyof ReelErrorMapping];
    }
    
    // If error type is provided, try to find a matching message
    if (errorType) {
        switch (errorType) {
            case 'config':
                return REEL_ERROR_MESSAGES.CONFIG_ERROR;
            case 'api':
                return REEL_ERROR_MESSAGES.RATE_LIMIT;
            case 'network':
                return REEL_ERROR_MESSAGES.NETWORK_ERROR;
            case 'generation':
                return REEL_ERROR_MESSAGES.GENERATION_FAILED;
            case 'policy':
                return REEL_ERROR_MESSAGES.CONTENT_POLICY_VIOLATION;
        }
    }
    
    // Default message
    return 'An error occurred while processing your request. Please try again.';
}

/**
 * Check if an error is retryable
 */
export function isReelErrorRetryable(errorCode?: string): boolean {
    const retryableErrors = [
        'RATE_LIMIT',
        'SERVICE_UNAVAILABLE',
        'NETWORK_ERROR',
        'TIMEOUT',
    ];
    
    if (errorCode && retryableErrors.includes(errorCode)) {
        return true;
    }
    
    return false;
}
