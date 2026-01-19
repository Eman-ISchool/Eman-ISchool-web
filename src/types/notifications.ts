/**
 * Notification System Type Definitions
 *
 * Comprehensive TypeScript types for notification payloads, templates, and preferences.
 * These types support multi-channel notifications (email, push, SMS, in-app) with
 * timezone-aware scheduling and customizable preferences.
 */

import type {
  NotificationChannel,
  NotificationStatus,
  NotificationType,
  NotificationPriority,
  DigestFrequency,
} from './database';

// ============================================
// NOTIFICATION PAYLOAD TYPES
// ============================================
// Type-specific payload data for the notification_queue.data JSONB field

/**
 * Payload for class/lesson reminder notifications
 */
export interface ClassReminderPayload {
  lesson_id: string;
  course_id: string;
  course_title: string;
  lesson_title: string;
  start_time: string; // ISO timestamp
  end_time: string; // ISO timestamp
  meet_link: string | null;
  teacher_name: string;
  minutes_until_start?: number; // e.g., 1440 (24h), 60 (1h), 15 (15min)
  action_url?: string; // Link to join/view lesson
}

/**
 * Payload for grade update notifications
 */
export interface GradeUpdatePayload {
  grade_id: string;
  course_id: string;
  course_title: string;
  assignment_title: string;
  score: number;
  max_score: number;
  percentage: number;
  teacher_name: string;
  feedback?: string;
  action_url?: string; // Link to view grade details
}

/**
 * Payload for announcement notifications
 */
export interface AnnouncementPayload {
  announcement_id: string;
  course_id?: string; // Optional - school-wide announcements have no course
  course_title?: string;
  announcement_title: string;
  announcement_body: string;
  author_name: string;
  author_role: 'teacher' | 'admin';
  action_url?: string; // Link to view full announcement
}

/**
 * Payload for class cancellation notifications (critical)
 */
export interface CancellationPayload {
  lesson_id: string;
  course_id: string;
  course_title: string;
  lesson_title: string;
  original_start_time: string; // ISO timestamp
  original_end_time: string; // ISO timestamp
  reason?: string;
  teacher_name: string;
  rescheduled_to?: string; // ISO timestamp if rescheduled
  action_url?: string; // Link to view course/schedule
}

/**
 * Payload for assignment due date reminder notifications
 */
export interface AssignmentDuePayload {
  assignment_id: string;
  course_id: string;
  course_title: string;
  assignment_title: string;
  due_date: string; // ISO timestamp
  hours_until_due?: number; // e.g., 48, 24, 6
  submission_status: 'not_started' | 'in_progress' | 'submitted';
  action_url?: string; // Link to submit assignment
}

/**
 * Payload for exam/test reminder notifications
 */
export interface ExamReminderPayload {
  exam_id: string;
  course_id: string;
  course_title: string;
  exam_title: string;
  exam_date: string; // ISO timestamp
  exam_duration_minutes: number;
  location?: string;
  teacher_name: string;
  days_until_exam?: number; // e.g., 7, 3, 1
  action_url?: string; // Link to exam details/materials
}

/**
 * Union type of all notification payloads
 * Used for type-safe handling of notification.data field
 */
export type NotificationPayload =
  | ClassReminderPayload
  | GradeUpdatePayload
  | AnnouncementPayload
  | CancellationPayload
  | AssignmentDuePayload
  | ExamReminderPayload;

/**
 * Type guard to check notification payload type
 */
export type NotificationPayloadMap = {
  class_reminder: ClassReminderPayload;
  grade_update: GradeUpdatePayload;
  announcement: AnnouncementPayload;
  cancellation: CancellationPayload;
  assignment_due: AssignmentDuePayload;
  exam_reminder: ExamReminderPayload;
};

// ============================================
// NOTIFICATION CREATION TYPES
// ============================================

/**
 * Input for creating a new notification
 * Used by NotificationService.createNotification()
 */
export interface CreateNotificationInput<T extends NotificationType = NotificationType> {
  user_id: string;
  notification_type: T;
  channels?: NotificationChannel[]; // If not provided, use user preferences
  priority?: NotificationPriority;
  title: string;
  body: string;
  data: NotificationPayloadMap[T];
  scheduled_for?: Date | string; // If not provided, send immediately
  max_retries?: number;
}

/**
 * Batch notification creation input
 * Used for sending the same notification to multiple users
 */
export interface CreateBatchNotificationInput<T extends NotificationType = NotificationType> {
  user_ids: string[];
  notification_type: T;
  channels?: NotificationChannel[];
  priority?: NotificationPriority;
  title: string;
  body: string;
  data: NotificationPayloadMap[T];
  scheduled_for?: Date | string;
  max_retries?: number;
}

// ============================================
// TEMPLATE TYPES
// ============================================

/**
 * Template variables that can be used in notification templates
 * These are replaced with actual values when rendering templates
 */
export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Template configuration for a specific notification type and channel
 */
export interface NotificationTemplate {
  type: NotificationType;
  channel: NotificationChannel;
  subject?: string; // For email channel
  bodyTemplate: string; // Template string with {{variable}} placeholders
  htmlTemplate?: string; // HTML template for email channel
  smsTemplate?: string; // Concise template for SMS channel
  variables: string[]; // List of required variables
}

/**
 * Template rendering context
 * Contains all data needed to render a template
 */
export interface TemplateContext<T extends NotificationType = NotificationType> {
  notification_type: T;
  payload: NotificationPayloadMap[T];
  user: {
    id: string;
    name: string;
    email: string;
    preferred_language?: 'en' | 'ar';
  };
  metadata: {
    unsubscribe_url?: string;
    action_url?: string;
    app_url: string;
  };
}

/**
 * Rendered template output
 */
export interface RenderedTemplate {
  subject?: string; // For email
  body: string; // Plain text body
  html?: string; // HTML body for email
}

// ============================================
// PREFERENCE TYPES
// ============================================

/**
 * User notification preferences update input
 * Used for updating user preferences via API
 */
export interface UpdateNotificationPreferencesInput {
  email_enabled?: boolean;
  push_enabled?: boolean;
  sms_enabled?: boolean;
  in_app_enabled?: boolean;
  digest_frequency?: DigestFrequency;
  quiet_hours_enabled?: boolean;
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string; // HH:MM format
  timezone?: string; // IANA timezone string
  class_reminders_enabled?: boolean;
  grade_updates_enabled?: boolean;
  announcements_enabled?: boolean;
  cancellations_enabled?: boolean;
  phone_number?: string | null;
}

/**
 * Quiet hours configuration
 */
export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
  timezone: string; // IANA timezone
}

/**
 * Channel preferences for a user
 */
export interface ChannelPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  in_app: boolean;
}

/**
 * Notification type preferences for a user
 */
export interface NotificationTypePreferences {
  class_reminders: boolean;
  grade_updates: boolean;
  announcements: boolean;
  cancellations: boolean;
}

// ============================================
// DELIVERY TYPES
// ============================================

/**
 * Delivery result for a single notification
 */
export interface DeliveryResult {
  success: boolean;
  notification_id: string;
  channel: NotificationChannel;
  external_id?: string; // Provider-specific ID (Resend, Twilio, etc.)
  error?: string;
  attempted_at: Date;
}

/**
 * Batch delivery result
 */
export interface BatchDeliveryResult {
  total: number;
  successful: number;
  failed: number;
  results: DeliveryResult[];
}

/**
 * Email delivery options
 */
export interface EmailDeliveryOptions {
  from_email?: string;
  from_name?: string;
  reply_to?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * SMS delivery options
 */
export interface SmsDeliveryOptions {
  from_number?: string;
}

/**
 * Push notification options
 */
export interface PushDeliveryOptions {
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: PushNotificationAction[];
  data?: Record<string, unknown>;
}

/**
 * Push notification action button
 */
export interface PushNotificationAction {
  action: string;
  title: string;
  icon?: string;
}

// ============================================
// DIGEST TYPES
// ============================================

/**
 * Digest notification grouping
 */
export interface DigestGroup {
  notification_type: NotificationType;
  notifications: DigestNotification[];
}

/**
 * Notification included in a digest
 */
export interface DigestNotification {
  id: string;
  title: string;
  body: string;
  created_at: string;
  action_url?: string;
}

/**
 * Digest email context
 */
export interface DigestEmailContext {
  user: {
    id: string;
    name: string;
    email: string;
  };
  period: 'daily' | 'weekly';
  period_start: Date;
  period_end: Date;
  groups: DigestGroup[];
  total_count: number;
  unsubscribe_url: string;
}

// ============================================
// SCHEDULING TYPES
// ============================================

/**
 * Scheduled notification job
 */
export interface ScheduledNotificationJob {
  id: string;
  user_id: string;
  notification_type: NotificationType;
  scheduled_for: Date;
  timezone: string;
  status: 'pending' | 'processed' | 'cancelled';
}

/**
 * Timezone-aware scheduling options
 */
export interface SchedulingOptions {
  timezone: string; // IANA timezone
  quiet_hours?: QuietHours;
  prefer_local_time?: boolean; // If true, schedule in user's local time
  respect_quiet_hours?: boolean; // If true, delay until quiet hours end
}

// ============================================
// WEBHOOK/CALLBACK TYPES
// ============================================

/**
 * Webhook payload for notification status updates
 * Sent by external providers (Resend, Twilio) for delivery tracking
 */
export interface NotificationWebhookPayload {
  provider: 'resend' | 'twilio' | 'web-push';
  external_id: string;
  status: NotificationStatus;
  timestamp: string;
  error_message?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Internal webhook for triggering notifications
 * Used by other services to trigger notifications
 */
export interface TriggerNotificationWebhook {
  trigger_type: 'lesson_created' | 'grade_posted' | 'announcement_created' | 'lesson_cancelled';
  trigger_data: Record<string, unknown>;
  target_users?: string[]; // If not provided, determine based on trigger_type
  send_immediately?: boolean;
}

// ============================================
// STATISTICS TYPES
// ============================================

/**
 * Notification statistics for a user
 */
export interface NotificationStats {
  user_id: string;
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_read: number;
  by_channel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  by_type: Record<NotificationType, number>;
}

/**
 * System-wide notification statistics
 */
export interface SystemNotificationStats {
  period_start: Date;
  period_end: Date;
  total_notifications: number;
  by_channel: Record<NotificationChannel, number>;
  by_type: Record<NotificationType, number>;
  by_status: Record<NotificationStatus, number>;
  delivery_rate: number; // Percentage
  read_rate: number; // Percentage
  avg_delivery_time_seconds: number;
}

// ============================================
// PUSH SUBSCRIPTION TYPES
// ============================================

/**
 * Push subscription data
 */
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Push subscription registration input
 */
export interface RegisterPushSubscriptionInput {
  user_id: string;
  subscription: PushSubscription;
  device_name?: string;
  user_agent?: string;
}

// ============================================
// UNSUBSCRIBE TYPES
// ============================================

/**
 * Unsubscribe token data
 */
export interface UnsubscribeTokenData {
  user_id: string;
  channels?: NotificationChannel[]; // If not provided, unsubscribe from all
  issued_at: number; // Unix timestamp
}

/**
 * Unsubscribe request input
 */
export interface UnsubscribeRequest {
  token: string;
  channels?: NotificationChannel[];
  reason?: string;
}

// ============================================
// ERROR TYPES
// ============================================

/**
 * Notification error codes
 */
export enum NotificationErrorCode {
  INVALID_USER = 'INVALID_USER',
  INVALID_CHANNEL = 'INVALID_CHANNEL',
  MISSING_PREFERENCES = 'MISSING_PREFERENCES',
  CHANNEL_DISABLED = 'CHANNEL_DISABLED',
  PHONE_NOT_VERIFIED = 'PHONE_NOT_VERIFIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  INVALID_PAYLOAD = 'INVALID_PAYLOAD',
  SCHEDULING_ERROR = 'SCHEDULING_ERROR',
}

/**
 * Notification error
 */
export class NotificationError extends Error {
  constructor(
    public code: NotificationErrorCode,
    message: string,
    public metadata?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}
