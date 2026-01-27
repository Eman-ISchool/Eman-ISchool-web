/**
 * Reel Notification Helpers
 * Handles notification triggers for reel-related events
 */

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Log a reel generation notification
 */
export async function logGenerationNotification(
    teacherId: string,
    reelId: string,
    lessonId: string | null,
    materialId: string,
    status: 'success' | 'failed'
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                teacher_id: teacherId,
                lesson_id: lessonId,
                lesson_material_id: materialId,
                action: 'generation_completed',
                status,
                metadata: {
                    notification_type: 'generation',
                    teacher_notified: true,
                },
            } as any);

        console.log(`Generation notification logged: ${status} for reel ${reelId} to teacher ${teacherId}`);
    } catch (error: any) {
        console.error('Error logging generation notification:', error);
    }
}

/**
 * Log a reel failure notification
 */
export async function logFailureNotification(
    teacherId: string,
    reelId: string | null,
    lessonId: string | null,
    materialId: string,
    errorMessage: string,
    errorCode?: string,
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                teacher_id: teacherId,
                lesson_id: lessonId,
                lesson_material_id: materialId,
                action: 'generation_failed',
                status: 'failed',
                error_message: errorMessage,
                metadata: {
                    error_code: errorCode,
                    notification_type: 'failure',
                    teacher_notified: true,
                },
            } as any);

        console.log(`Failure notification logged: for reel ${reelId || 'N/A'} to teacher ${teacherId}`);
    } catch (error: any) {
        console.error('Error logging failure notification:', error);
    }
}

/**
 * Log a material update notification (when material with existing reel is updated)
 */
export async function logMaterialUpdateNotification(
    teacherId: string,
    reelId: string,
    lessonId: string | null,
    materialId: string,
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                teacher_id: teacherId,
                lesson_id: lessonId,
                lesson_material_id: materialId,
                action: 'material_updated',
                status: 'success',
                metadata: {
                    notification_type: 'material_update',
                    teacher_notified: true,
                },
            } as any);

        console.log(`Material update notification logged: for reel ${reelId} to teacher ${teacherId}`);
    } catch (error: any) {
        console.error('Error logging material update notification:', error);
    }
}

/**
 * Log a reel approval notification
 */
export async function logApprovalNotification(
    teacherId: string,
    reelId: string,
    lessonId: string | null,
    materialId: string,
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                teacher_id: teacherId,
                lesson_id: lessonId,
                lesson_material_id: materialId,
                action: 'reel_approved',
                status: 'success',
                metadata: {
                    notification_type: 'approval',
                    teacher_notified: true,
                },
            } as any);

        console.log(`Approval notification logged: for reel ${reelId} to teacher ${teacherId}`);
    } catch (error: any) {
        console.error('Error logging approval notification:', error);
    }
}

/**
 * Log a reel rejection notification
 */
export async function logRejectionNotification(
    teacherId: string,
    reelId: string,
    lessonId: string | null,
    materialId: string,
    reason: string,
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                teacher_id: teacherId,
                lesson_id: lessonId,
                lesson_material_id: materialId,
                action: 'reel_rejected',
                status: 'success',
                metadata: {
                    notification_type: 'rejection',
                    teacher_notified: true,
                    rejection_reason: reason,
                },
            } as any);

        console.log(`Rejection notification logged: for reel ${reelId} to teacher ${teacherId}`);
    } catch (error: any) {
        console.error('Error logging rejection notification:', error);
    }
}

/**
 * Create notification record in notifications table (if it exists)
 * This is a placeholder - in production, this would integrate with your actual notification system
 */
export async function createNotificationRecord(
    userId: string,
    type: 'generation' | 'approval' | 'rejection' | 'material_update',
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, any>,
) {
    try {
        // TODO: Integrate with actual notification system
        console.log(`Notification record created: ${type} - ${title} for user ${userId}`);
    } catch (error: any) {
        console.error('Error creating notification record:', error);
    }
}

/**
 * Notify admin of AI service failure during reel generation
 * @param jobId - Processing job ID that failed
 * @param sourceId - Source content ID
 * @param error - Error details
 * @param step - Current step when failure occurred
 */
export async function notifyAdminOfAIFailure(
    jobId: string,
    sourceId: string,
    error: any,
    step?: string
): Promise<void> {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for notification logging');
            return;
        }

        // Get admin users
        const { data: admins, error: adminError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('role', 'admin');

        if (adminError || !admins || admins.length === 0) {
            console.warn('[Reel Notifications] No admin users found');
            return;
        }

        // Log failure notification
        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: null,
                teacher_id: null,
                lesson_id: null,
                lesson_material_id: sourceId,
                action: 'ai_service_failure',
                status: 'failed',
                error_message: error?.message || 'Unknown AI service error',
                metadata: {
                    notification_type: 'ai_failure',
                    admin_notified: true,
                    job_id: jobId,
                    failed_step: step || 'unknown',
                    error_code: error?.code,
                    error_details: error?.stack,
                },
            } as any);

        // Create in-app notifications for all admins
        for (const admin of admins as Array<{ id: string }>) {
            await createNotificationRecord(
                admin.id,
                'generation',
                'AI Service Failure',
                `Reel generation job ${jobId} failed at step: ${step || 'unknown'}. Error: ${error?.message || 'Unknown error'}`,
                `/admin/reels?jobId=${jobId}`,
                {
                    jobId,
                    sourceId,
                    step,
                    error: error?.message,
                    timestamp: new Date().toISOString(),
                }
            );
        }

        console.log(`[Reel Notifications] AI failure notification sent to ${admins.length} admins for job ${jobId}`);
    } catch (error: any) {
        console.error('[Reel Notifications] Error notifying admin of AI failure:', error);
    }
}
