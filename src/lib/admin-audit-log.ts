/**
 * Admin Audit Log Utilities
 * Logs admin actions on reels for audit trail
 */

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Log admin action on a reel
 */
export async function logAdminReelAction(
    reelId: string,
    action: 'flagged' | 'removed' | 'approved' | 'rejected',
    adminId: string,
    details?: {
        reason?: string;
    }
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for audit logging');
            return;
        }

        const metadata: Record<string, any> = {
            admin_action: action,
            admin_id: adminId,
            ...details,
        };

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                action: `admin_${action}`,
                status: 'success',
                metadata,
            } as any);

        console.log(`Admin action logged: ${action} on reel ${reelId} by admin ${adminId}`);
    } catch (error: any) {
        console.error('Error logging admin action:', error);
    }
}

/**
 * Log admin viewing a reel
 */
export async function logAdminReelView(
    reelId: string,
    adminId: string,
) {
    try {
        if (!supabaseAdmin) {
            console.error('Supabase not configured for audit logging');
            return;
        }

        await supabaseAdmin
            .from('generation_logs')
            .insert({
                reel_id: reelId,
                action: 'admin_viewed',
                status: 'success',
                metadata: {
                    admin_action: 'viewed',
                    admin_id: adminId,
                },
            } as any);

        console.log(`Admin view logged: reel ${reelId} viewed by admin ${adminId}`);
    } catch (error: any) {
        console.error('Error logging admin view:', error);
    }
}
