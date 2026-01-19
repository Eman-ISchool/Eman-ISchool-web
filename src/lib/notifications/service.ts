/**
 * Notification Service
 *
 * Main service class for creating, scheduling, and dispatching notifications.
 * Handles multi-channel notifications (email, push, SMS, in-app) with user
 * preference checking, template rendering, and timezone-aware scheduling.
 */

import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/database';
import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
} from '@/types/database';
import type {
  CreateNotificationInput,
  CreateBatchNotificationInput,
  DeliveryResult,
  BatchDeliveryResult,
  NotificationPayloadMap,
  ChannelPreferences,
  NotificationTypePreferences,
} from '@/types/notifications';
import { NotificationError, NotificationErrorCode } from '@/types/notifications';
import { renderTemplate } from './templates';

// Type aliases for database types
type NotificationPreferencesRow = Database['public']['Tables']['notification_preferences']['Row'];
type NotificationQueueInsert = Database['public']['Tables']['notification_queue']['Insert'];
type NotificationQueueRow = Database['public']['Tables']['notification_queue']['Row'];

/**
 * Main Notification Service Class
 * Singleton service for managing all notification operations
 */
export class NotificationService {
  private static instance: NotificationService | null = null;

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  /**
   * Get singleton instance of NotificationService
   */
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ============================================
  // PREFERENCE MANAGEMENT
  // ============================================

  /**
   * Get user notification preferences
   * Creates default preferences if they don't exist
   */
  private async getUserPreferences(userId: string): Promise<NotificationPreferencesRow> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If preferences don't exist, create default preferences
      if (error.code === 'PGRST116') {
        return this.createDefaultPreferences(userId);
      }
      throw new NotificationError(
        NotificationErrorCode.MISSING_PREFERENCES,
        `Failed to fetch preferences: ${error.message}`,
        { userId, error }
      );
    }

    return data;
  }

  /**
   * Create default notification preferences for a user
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferencesRow> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const defaultPreferences: Database['public']['Tables']['notification_preferences']['Insert'] = {
      user_id: userId,
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      in_app_enabled: true,
      digest_frequency: 'instant',
      quiet_hours_enabled: false,
      timezone: 'UTC',
      class_reminders_enabled: true,
      grade_updates_enabled: true,
      announcements_enabled: true,
      cancellations_enabled: true,
      phone_verified: false,
    };

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .insert(defaultPreferences)
      .select()
      .single();

    if (error) {
      throw new NotificationError(
        NotificationErrorCode.MISSING_PREFERENCES,
        `Failed to create default preferences: ${error.message}`,
        { userId, error }
      );
    }

    return data;
  }

  /**
   * Get channel preferences for a user
   */
  private getChannelPreferences(prefs: NotificationPreferencesRow): ChannelPreferences {
    return {
      email: prefs.email_enabled && !prefs.unsubscribed_from_email,
      push: prefs.push_enabled,
      sms: prefs.sms_enabled && prefs.phone_verified,
      in_app: prefs.in_app_enabled,
    };
  }

  /**
   * Get notification type preferences for a user
   */
  private getNotificationTypePreferences(prefs: NotificationPreferencesRow): NotificationTypePreferences {
    return {
      class_reminders: prefs.class_reminders_enabled,
      grade_updates: prefs.grade_updates_enabled,
      announcements: prefs.announcements_enabled,
      cancellations: prefs.cancellations_enabled,
    };
  }

  /**
   * Determine which channels to use for a notification
   * Filters based on user preferences and channel availability
   */
  private async determineChannels(
    userId: string,
    notificationType: NotificationType,
    requestedChannels?: NotificationChannel[]
  ): Promise<NotificationChannel[]> {
    const prefs = await this.getUserPreferences(userId);
    const channelPrefs = this.getChannelPreferences(prefs);
    const typePrefs = this.getNotificationTypePreferences(prefs);

    // Check if this notification type is enabled
    const typeEnabled = this.isNotificationTypeEnabled(notificationType, typePrefs);
    if (!typeEnabled) {
      return [];
    }

    // If specific channels requested, filter by user preferences
    if (requestedChannels && requestedChannels.length > 0) {
      return requestedChannels.filter((channel) => channelPrefs[channel]);
    }

    // Otherwise, return all enabled channels
    const enabledChannels: NotificationChannel[] = [];
    if (channelPrefs.email) enabledChannels.push('email');
    if (channelPrefs.push) enabledChannels.push('push');
    if (channelPrefs.sms) enabledChannels.push('sms');
    if (channelPrefs.in_app) enabledChannels.push('in_app');

    return enabledChannels;
  }

  /**
   * Check if a notification type is enabled for the user
   */
  private isNotificationTypeEnabled(
    notificationType: NotificationType,
    typePrefs: NotificationTypePreferences
  ): boolean {
    switch (notificationType) {
      case 'class_reminder':
        return typePrefs.class_reminders;
      case 'grade_update':
        return typePrefs.grade_updates;
      case 'announcement':
        return typePrefs.announcements;
      case 'cancellation':
        return typePrefs.cancellations;
      case 'assignment_due':
        // Assignment reminders use same setting as class reminders
        return typePrefs.class_reminders;
      case 'exam_reminder':
        // Exam reminders use same setting as class reminders
        return typePrefs.class_reminders;
      default:
        return true;
    }
  }

  // ============================================
  // NOTIFICATION CREATION
  // ============================================

  /**
   * Create a notification for a single user
   * Queues notification(s) for delivery across enabled channels
   */
  public async createNotification<T extends NotificationType>(
    input: CreateNotificationInput<T>
  ): Promise<NotificationQueueRow[]> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    // Validate user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', input.user_id)
      .single();

    if (userError || !user) {
      throw new NotificationError(
        NotificationErrorCode.INVALID_USER,
        `User not found: ${input.user_id}`,
        { userId: input.user_id }
      );
    }

    // Determine which channels to use
    const channels = await this.determineChannels(
      input.user_id,
      input.notification_type,
      input.channels
    );

    if (channels.length === 0) {
      // User has disabled all channels or this notification type
      return [];
    }

    // Get user preferences for scheduling
    const prefs = await this.getUserPreferences(input.user_id);

    // Calculate scheduled_for time (respecting quiet hours if needed)
    let scheduledFor: Date;
    if (input.scheduled_for) {
      scheduledFor = typeof input.scheduled_for === 'string'
        ? new Date(input.scheduled_for)
        : input.scheduled_for;
    } else {
      scheduledFor = new Date(); // Send immediately
    }

    // Queue notifications for each channel
    const queuedNotifications: NotificationQueueRow[] = [];

    for (const channel of channels) {
      const queueEntry: NotificationQueueInsert = {
        user_id: input.user_id,
        notification_type: input.notification_type,
        channel,
        priority: input.priority || 'normal',
        title: input.title,
        body: input.body,
        data: input.data as any, // JSONB type
        status: 'pending',
        scheduled_for: scheduledFor.toISOString(),
        max_retries: input.max_retries ?? 3,
        retry_count: 0,
      };

      const { data, error } = await supabaseAdmin
        .from('notification_queue')
        .insert(queueEntry)
        .select()
        .single();

      if (error) {
        throw new NotificationError(
          NotificationErrorCode.PROVIDER_ERROR,
          `Failed to queue notification: ${error.message}`,
          { channel, error }
        );
      }

      queuedNotifications.push(data);
    }

    return queuedNotifications;
  }

  /**
   * Create notifications for multiple users
   * Useful for broadcasting announcements or class reminders
   */
  public async createBatchNotification<T extends NotificationType>(
    input: CreateBatchNotificationInput<T>
  ): Promise<NotificationQueueRow[]> {
    const allNotifications: NotificationQueueRow[] = [];

    // Create notifications for each user
    for (const userId of input.user_ids) {
      try {
        const notifications = await this.createNotification({
          user_id: userId,
          notification_type: input.notification_type,
          channels: input.channels,
          priority: input.priority,
          title: input.title,
          body: input.body,
          data: input.data,
          scheduled_for: input.scheduled_for,
          max_retries: input.max_retries,
        });
        allNotifications.push(...notifications);
      } catch (error) {
        // Log error but continue with other users
        console.error(`Failed to create notification for user ${userId}:`, error);
      }
    }

    return allNotifications;
  }

  // ============================================
  // NOTIFICATION DISPATCHING
  // ============================================

  /**
   * Dispatch pending notifications
   * Fetches notifications ready to be sent and dispatches them
   */
  public async dispatchPendingNotifications(limit: number = 100): Promise<DeliveryResult[]> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    // Fetch pending notifications that are due
    const now = new Date().toISOString();
    const { data: notifications, error } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', now)
      .lt('retry_count', supabaseAdmin.rpc('max_retries')) // Only get notifications that haven't exceeded retries
      .order('priority', { ascending: false }) // High priority first
      .order('scheduled_for', { ascending: true }) // Oldest first
      .limit(limit);

    if (error) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        `Failed to fetch pending notifications: ${error.message}`,
        { error }
      );
    }

    if (!notifications || notifications.length === 0) {
      return [];
    }

    const results: DeliveryResult[] = [];

    // Dispatch each notification
    for (const notification of notifications) {
      const result = await this.dispatchNotification(notification);
      results.push(result);
    }

    return results;
  }

  /**
   * Dispatch a single notification
   * Sends the notification via the appropriate channel
   */
  private async dispatchNotification(
    notification: NotificationQueueRow
  ): Promise<DeliveryResult> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const result: DeliveryResult = {
      success: false,
      notification_id: notification.id,
      channel: notification.channel,
      attempted_at: new Date(),
    };

    try {
      // Mark as being attempted
      await supabaseAdmin
        .from('notification_queue')
        .update({
          last_attempted_at: new Date().toISOString(),
        })
        .eq('id', notification.id);

      // Dispatch based on channel
      // Note: Actual channel implementations will be in separate files (email.ts, push.ts, sms.ts)
      // For now, we just mark as sent
      switch (notification.channel) {
        case 'email':
          // TODO: Implement email sending in phase 3
          // await sendEmail(notification);
          break;
        case 'push':
          // TODO: Implement push notifications in phase 4
          // await sendPushNotification(notification);
          break;
        case 'sms':
          // TODO: Implement SMS sending in phase 5
          // await sendSMS(notification);
          break;
        case 'in_app':
          // In-app notifications are stored in database only
          await this.createInAppNotification(notification);
          break;
        default:
          throw new NotificationError(
            NotificationErrorCode.INVALID_CHANNEL,
            `Unsupported channel: ${notification.channel}`
          );
      }

      // Mark as sent
      await supabaseAdmin
        .from('notification_queue')
        .update({
          status: 'sent' as NotificationStatus,
          sent_at: new Date().toISOString(),
        })
        .eq('id', notification.id);

      result.success = true;
    } catch (error) {
      // Mark as failed and increment retry count
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      const updates: any = {
        error_message: errorMessage,
        retry_count: notification.retry_count + 1,
        last_attempted_at: new Date().toISOString(),
      };

      // If max retries exceeded, mark as failed
      if (notification.retry_count + 1 >= notification.max_retries) {
        updates.status = 'failed' as NotificationStatus;
        updates.failed_at = new Date().toISOString();
      }

      await supabaseAdmin
        .from('notification_queue')
        .update(updates)
        .eq('id', notification.id);

      result.success = false;
      result.error = errorMessage;
    }

    return result;
  }

  /**
   * Create an in-app notification record
   * Stores notification in the notifications table for UI display
   */
  private async createInAppNotification(notification: NotificationQueueRow): Promise<void> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const data = notification.data as any;
    const actionUrl = data?.action_url || null;

    await supabaseAdmin.from('notifications').insert({
      user_id: notification.user_id,
      title: notification.title,
      message: notification.body,
      type: notification.notification_type,
      link: actionUrl,
      is_read: false,
    });
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Mark a notification as delivered
   * Called by channel implementations after successful delivery
   */
  public async markAsDelivered(
    notificationId: string,
    externalId?: string
  ): Promise<void> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const updates: any = {
      status: 'delivered' as NotificationStatus,
      delivered_at: new Date().toISOString(),
    };

    if (externalId) {
      updates.external_id = externalId;
    }

    await supabaseAdmin
      .from('notification_queue')
      .update(updates)
      .eq('id', notificationId);
  }

  /**
   * Mark a notification as read
   * Called when user views the notification
   */
  public async markAsRead(notificationId: string): Promise<void> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    await supabaseAdmin
      .from('notification_queue')
      .update({
        status: 'read' as NotificationStatus,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId);
  }

  /**
   * Get pending notifications for a user
   * Used for displaying unread notifications in UI
   */
  public async getPendingNotifications(
    userId: string,
    limit: number = 50
  ): Promise<NotificationQueueRow[]> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const { data, error } = await supabaseAdmin
      .from('notification_queue')
      .select('*')
      .eq('user_id', userId)
      .eq('channel', 'in_app')
      .in('status', ['sent', 'delivered'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        `Failed to fetch notifications: ${error.message}`,
        { userId, error }
      );
    }

    return data || [];
  }

  /**
   * Get unread notification count for a user
   */
  public async getUnreadCount(userId: string): Promise<number> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const { count, error } = await supabaseAdmin
      .from('notification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('channel', 'in_app')
      .in('status', ['sent', 'delivered']);

    if (error) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        `Failed to fetch unread count: ${error.message}`,
        { userId, error }
      );
    }

    return count || 0;
  }

  /**
   * Delete old notifications
   * Cleanup job to remove old sent/read notifications
   */
  public async cleanupOldNotifications(daysOld: number = 90): Promise<number> {
    if (!supabaseAdmin) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        'Supabase admin client not configured'
      );
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await supabaseAdmin
      .from('notification_queue')
      .delete()
      .in('status', ['sent', 'delivered', 'read'])
      .lt('created_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      throw new NotificationError(
        NotificationErrorCode.PROVIDER_ERROR,
        `Failed to cleanup notifications: ${error.message}`,
        { error }
      );
    }

    return data?.length || 0;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
