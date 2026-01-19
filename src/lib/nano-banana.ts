/**
 * Nano-Banana AI Service Client
 * Handles AI-powered educational video reel generation
 */

export interface NanoBananaGenerationRequest {
    materialId: string;
    lessonId: string;
    content: string;
    subject?: string;
    gradeLevel?: string;
    teacherGuidance?: string;
    language?: 'en' | 'ar' | 'both';
}

export interface NanoBananaGenerationResponse {
    success: boolean;
    requestId?: string;
    status?: 'queued' | 'processing' | 'completed' | 'failed';
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    metadata?: {
        titleEn: string;
        titleAr: string;
        descriptionEn: string;
        descriptionAr: string;
        keywordsEn: string[];
        keywordsAr: string[];
        topicsEn: string[];
        topicsAr: string[];
        captionsEn?: string;
        captionsAr?: string;
    };
    error?: string;
    errorCode?: string;
    retryable?: boolean;
}

export interface NanoBananaStatusResponse {
    success: boolean;
    requestId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    progress?: number;
    videoUrl?: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    metadata?: NanoBananaGenerationResponse['metadata'];
    error?: string;
    errorCode?: string;
}

export class NanoBananaError extends Error {
    public errorCode?: string;
    public retryable: boolean;

    constructor(message: string, errorCode?: string, retryable = false) {
        super(message);
        this.name = 'NanoBananaError';
        this.errorCode = errorCode;
        this.retryable = retryable;
    }
}

// Environment variables
const NANO_BANANA_API_URL = process.env.NANO_BANANA_API_URL || 'https://api.nano-banana.ai/v1';
const NANO_BANANA_API_KEY = process.env.NANO_BANANA_API_KEY || '';

/**
 * Check if Nano-Banana service is configured
 */
export function isNanoBananaConfigured(): boolean {
    return !!(NANO_BANANA_API_URL && NANO_BANANA_API_KEY);
}

/**
 * Create headers for Nano-Banana API requests
 */
function getHeaders(): HeadersInit {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANO_BANANA_API_KEY}`,
        'User-Agent': 'Eduverse-Reels/1.0',
    };
}

/**
 * Delay helper for retry logic
 */
function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Submit a video generation request to Nano-Banana AI
 */
export async function submitGenerationRequest(
    request: NanoBananaGenerationRequest,
    retryCount = 0
): Promise<NanoBananaGenerationResponse> {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

    // Validate API configuration
    if (!isNanoBananaConfigured()) {
        throw new NanoBananaError(
            'Nano-Banana AI service is not configured. Please set NANO_BANANA_API_URL and NANO_BANANA_API_KEY.',
            'CONFIG_ERROR',
            false
        );
    }

    // Validate request
    if (!request.content || request.content.trim().length < 100) {
        throw new NanoBananaError(
            'Material content is too short for video generation. Minimum 100 characters required.',
            'INVALID_INPUT',
            false
        );
    }

    try {
        const response = await fetch(`${NANO_BANANA_API_URL}/generate`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({
                material_id: request.materialId,
                lesson_id: request.lessonId,
                content: request.content,
                subject: request.subject,
                grade_level: request.gradeLevel,
                teacher_guidance: request.teacherGuidance,
                language: request.language || 'both',
                max_duration: 120, // 2 minutes max
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new NanoBananaError(
                data.error || 'Failed to submit generation request',
                data.error_code || 'API_ERROR',
                isRetryableError(response.status)
            );
        }

        return {
            success: true,
            requestId: data.request_id,
            status: data.status || 'queued',
        };
    } catch (error: any) {
        console.error(`Error submitting generation request (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

        // Handle NanoBananaError
        if (error instanceof NanoBananaError) {
            if (error.retryable && retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return submitGenerationRequest(request, retryCount + 1);
            }
            return {
                success: false,
                error: error.message,
                errorCode: error.errorCode,
                retryable: error.retryable,
            };
        }

        // Handle network errors
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return submitGenerationRequest(request, retryCount + 1);
            }
            return {
                success: false,
                error: 'Network error connecting to AI service. Please check your connection.',
                retryable: true,
            };
        }

        // Generic error
        return {
            success: false,
            error: error.message || 'Failed to submit generation request',
            retryable: false,
        };
    }
}

/**
 * Check the status of a generation request
 */
export async function checkGenerationStatus(
    requestId: string,
    retryCount = 0
): Promise<NanoBananaStatusResponse> {
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

    if (!isNanoBananaConfigured()) {
        throw new NanoBananaError(
            'Nano-Banana AI service is not configured.',
            'CONFIG_ERROR',
            false
        );
    }

    try {
        const response = await fetch(`${NANO_BANANA_API_URL}/status/${requestId}`, {
            method: 'GET',
            headers: getHeaders(),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new NanoBananaError(
                data.error || 'Failed to check generation status',
                data.error_code || 'API_ERROR',
                isRetryableError(response.status)
            );
        }

        return {
            success: true,
            requestId: data.request_id,
            status: data.status,
            progress: data.progress,
            videoUrl: data.video_url,
            thumbnailUrl: data.thumbnail_url,
            durationSeconds: data.duration_seconds,
            metadata: data.metadata ? {
                titleEn: data.metadata.title_en,
                titleAr: data.metadata.title_ar,
                descriptionEn: data.metadata.description_en,
                descriptionAr: data.metadata.description_ar,
                keywordsEn: data.metadata.keywords_en || [],
                keywordsAr: data.metadata.keywords_ar || [],
                topicsEn: data.metadata.topics_en || [],
                topicsAr: data.metadata.topics_ar || [],
                captionsEn: data.metadata.captions_en,
                captionsAr: data.metadata.captions_ar,
            } : undefined,
            error: data.error,
            errorCode: data.error_code,
        };
    } catch (error: any) {
        console.error(`Error checking generation status (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

        // Handle NanoBananaError
        if (error instanceof NanoBananaError) {
            if (error.retryable && retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return checkGenerationStatus(requestId, retryCount + 1);
            }
            return {
                success: false,
                requestId,
                status: 'failed',
                error: error.message,
                errorCode: error.errorCode,
            };
        }

        // Handle network errors
        if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAYS[retryCount] || 4000);
                return checkGenerationStatus(requestId, retryCount + 1);
            }
            return {
                success: false,
                requestId,
                status: 'failed',
                error: 'Network error connecting to AI service.',
            };
        }

        // Generic error
        return {
            success: false,
            requestId,
            status: 'failed',
            error: error.message || 'Failed to check generation status',
        };
    }
}

/**
 * Poll generation status until completion or failure
 */
export async function pollGenerationUntilComplete(
    requestId: string,
    maxPolls = 30, // 30 polls = 5 minutes with 10s intervals
    pollInterval = 10000 // 10 seconds
): Promise<NanoBananaStatusResponse> {
    for (let i = 0; i < maxPolls; i++) {
        const status = await checkGenerationStatus(requestId);

        if (status.status === 'completed') {
            return status;
        }

        if (status.status === 'failed') {
            return status;
        }

        // Wait before next poll
        await delay(pollInterval);
    }

    // Max polls reached without completion
    return {
        success: false,
        requestId,
        status: 'failed',
        error: 'Generation timed out after maximum polling duration.',
    };
}

/**
 * Determine if an HTTP status code is retryable
 */
function isRetryableError(status: number): boolean {
    return status === 429 || (status >= 500 && status < 600);
}

/**
 * Validate if a video URL is properly formatted
 */
export function isValidVideoUrl(url: string | null | undefined): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Get user-friendly error message for Nano-Banana errors
 */
export function getUserFriendlyErrorMessage(error: NanoBananaError | string): string {
    if (typeof error === 'string') {
        return error;
    }

    switch (error.errorCode) {
        case 'CONFIG_ERROR':
            return 'AI service is not configured. Please contact support.';
        case 'INVALID_INPUT':
            return error.message;
        case 'RATE_LIMIT':
            return 'Too many generation requests. Please try again later.';
        case 'SERVICE_UNAVAILABLE':
            return 'AI service is temporarily unavailable. Please try again later.';
        case 'INSUFFICIENT_CONTENT':
            return 'The material does not have enough content to generate a video. Please add more details.';
        case 'CONTENT_POLICY_VIOLATION':
            return 'The content violates our policies. Please review and modify the material.';
        default:
            return 'An error occurred while generating the video. Please try again.';
    }
}
