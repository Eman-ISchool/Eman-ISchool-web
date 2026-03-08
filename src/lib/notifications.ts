/**
 * Simple Notification Helper
 *
 * A lightweight helper for creating in-app notifications directly in API routes.
 * This provides a simple interface for the education platform feature.
 *
 * For more advanced notification features (email, push, SMS, scheduling),
 * use the full NotificationService from src/lib/notifications/service.ts
 */

import { supabaseAdmin } from '@/lib/supabase';

/**
 * Create an in-app notification for a user
 *
 * @param userId - The user ID to send the notification to
 * @param type - Notification type (e.g., 'enrollment_approved', 'payment_confirmed')
 * @param title - Short heading for the notification
 * @param message - Full notification body
 * @param link - Optional deep link to relevant page
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return;
  }

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      link: link || null,
      is_read: false,
    });

  if (error) {
    console.error('Failed to create notification:', error);
    // Don't throw - notifications shouldn't block the main flow
  }
}

/**
 * Create batch notifications for multiple users
 *
 * @param userIds - Array of user IDs to notify
 * @param type - Notification type
 * @param title - Short heading
 * @param message - Full notification body
 * @param link - Optional deep link
 */
export async function createBatchNotifications(
  userIds: string[],
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  if (!supabaseAdmin || userIds.length === 0) {
    return;
  }

  const notifications = userIds.map((userId) => ({
    user_id: userId,
    type,
    title,
    message,
    link: link || null,
    is_read: false,
  }));

  const { error } = await supabaseAdmin
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Failed to create batch notifications:', error);
  }
}

/**
 * Get unread notification count for a user
 *
 * @param userId - The user ID
 * @returns Number of unread notifications
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  if (!supabaseAdmin) {
    return 0;
  }

  const { count, error } = await supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to get unread count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Mark notifications as read
 *
 * @param userId - The user ID
 * @param notificationIds - Specific notification IDs to mark as read (optional)
 * @param markAllRead - If true, mark all notifications as read for the user
 */
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[],
  markAllRead?: boolean
): Promise<number> {
  if (!supabaseAdmin) {
    return 0;
  }

  let query = supabaseAdmin
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (markAllRead) {
    query = query.eq('is_read', false);
  } else if (notificationIds && notificationIds.length > 0) {
    query = query.in('id', notificationIds);
  } else {
    return 0;
  }

  const { count, error } = await query.select('*', { count: 'exact', head: true });

  if (error) {
    console.error('Failed to mark notifications as read:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Get notifications for a user
 *
 * @param userId - The user ID
 * @param options - Query options
 * @returns Array of notifications
 */
export async function getUserNotifications(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    isRead?: boolean;
  } = {}
) {
  if (!supabaseAdmin) {
    return { notifications: [], total: 0 };
  }

  const { limit = 20, offset = 0, isRead } = options;

  let query = supabaseAdmin
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (isRead !== undefined) {
    query = query.eq('is_read', isRead);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Failed to get notifications:', error);
    return { notifications: [], total: 0 };
  }

  return {
    notifications: data || [],
    total: count || 0,
  };
}

/**
 * Notify enrolled students about course-related events
 *
 * @param courseId - The course ID
 * @param type - Notification type (e.g., 'class_reminder', 'material_uploaded')
 * @param title - Short heading for the notification
 * @param message - Full notification body
 * @param link - Optional deep link to relevant page
 */
export async function notifyEnrolledStudents(
  courseId: string,
  type: string,
  title: string,
  message: string,
  link?: string
): Promise<void> {
  if (!supabaseAdmin) {
    console.error('Supabase admin client not configured');
    return;
  }

  try {
    // Fetch all active enrollments for this course
    const { data: enrollments, error: fetchError } = await supabaseAdmin
      .from('enrollments')
      .select('student_id')
      .eq('course_id', courseId)
      .eq('status', 'active');

    if (fetchError) {
      console.error('Failed to fetch enrollments for notification:', fetchError);
      return;
    }

    if (!enrollments || enrollments.length === 0) {
      return;
    }

    // Send notification to each enrolled student
    const notificationPromises = enrollments.map((enrollment) =>
      createNotification(
        enrollment.student_id,
        type,
        title,
        message,
        link
      )
    );

    // Use Promise.allSettled to handle partial failures gracefully
    const results = await Promise.allSettled(notificationPromises);
    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length > 0) {
      console.error(
        `Failed to send ${failures.length} of ${notificationPromises.length} notifications for course ${courseId}`
      );
      // Log individual failures for debugging
      failures.forEach((failure, index) => {
        if (failure.status === 'rejected') {
          console.error(
            `  - Failed for student ${enrollments[index]?.student_id}:`,
            failure.reason
          );
        }
      });
    }
  } catch (error) {
    console.error('Error sending notifications to enrolled students:', error);
    // Don't fail the main operation if notifications fail
  }
}
