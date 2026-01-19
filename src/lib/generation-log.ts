/**
 * Generation Log Helper
 * Helper functions for logging reel generation events
 */

import type { GenerationLogInsert } from '@/lib/supabase';

/**
 * Log a generation event
 */
export async function logGenerationEvent(params: {
    reelId?: string | null;
    teacherId: string;
    lessonId?: string | null;
    lessonMaterialId?: string | null;
    action: string;
    status: string;
    errorMessage?: string | null;
    metadata?: Record<string, any>;
    ipAddress?: string | null;
}, supabase: any): Promise<{ success: boolean; error?: string }> {
    try {
        const logData: GenerationLogInsert = {
            reel_id: params.reelId || null,
            teacher_id: params.teacherId,
            lesson_id: params.lessonId || null,
            lesson_material_id: params.lessonMaterialId || null,
            action: params.action,
            status: params.status,
            error_message: params.errorMessage || null,
            metadata: params.metadata || {},
            ip_address: params.ipAddress || null,
        };

        const { error } = await supabase
            .from('generation_logs')
            .insert(logData);

        if (error) {
            console.error('Error logging generation event:', error);
            return {
                success: false,
                error: `Failed to log generation event: ${error.message}`,
            };
        }

        return { success: true };
    } catch (error: any) {
        console.error('Error in logGenerationEvent:', error);
        return {
            success: false,
            error: `Unexpected error logging generation event: ${error.message}`,
        };
    }
}

/**
 * Log generation request
 */
export async function logGenerationRequest(
    params: {
        reelId: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
        requestId: string;
        contentLength: number;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'generation_requested',
            status: 'success',
            metadata: {
                request_id: params.requestId,
                content_length: params.contentLength,
            },
        },
        supabase
    );
}

/**
 * Log generation started
 */
export async function logGenerationStarted(
    params: {
        reelId: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'generation_started',
            status: 'success',
        },
        supabase
    );
}

/**
 * Log generation completed
 */
export async function logGenerationCompleted(
    params: {
        reelId: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
        durationSeconds?: number;
        videoUrl?: string;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'generation_completed',
            status: 'success',
            metadata: {
                duration_seconds: params.durationSeconds,
                video_url: params.videoUrl,
            },
        },
        supabase
    );
}

/**
 * Log generation failed
 */
export async function logGenerationFailed(
    params: {
        reelId?: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
        errorMessage: string;
        errorCode?: string;
        retryable?: boolean;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId || null,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'generation_failed',
            status: 'failed',
            error_message: params.errorMessage,
            metadata: {
                error_code: params.errorCode,
                retryable: params.retryable,
            },
        },
        supabase
    );
}

/**
 * Log content flagged
 */
export async function logContentFlagged(
    params: {
        reelId: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
        violations: Array<{ type: string; severity: string; message: string }>;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'content_flagged',
            status: 'success',
            metadata: {
                violations: params.violations,
            },
        },
        supabase
    );
}

/**
 * Log regeneration requested
 */
export async function logRegenerationRequested(
    params: {
        reelId: string;
        teacherId: string;
        lessonId?: string | null;
        lessonMaterialId?: string | null;
        reason?: string;
    },
    supabase: any
): Promise<{ success: boolean; error?: string }> {
    return logGenerationEvent(
        {
            reelId: params.reelId,
            teacherId: params.teacherId,
            lessonId: params.lessonId,
            lessonMaterialId: params.lessonMaterialId,
            action: 'regeneration_requested',
            status: 'success',
            metadata: {
                reason: params.reason,
            },
        },
        supabase
    );
}
