/**
 * Timezone Utilities
 *
 * Provides timezone-aware scheduling utilities for notifications.
 * Handles quiet hours enforcement, timezone conversions, and scheduling
 * notifications during user's acceptable hours.
 */

import type { QuietHours } from '@/types/notifications';
import type { NotificationPriority } from '@/types/database';

// ============================================
// TYPES
// ============================================

/**
 * Time in HH:MM format
 */
export type TimeString = string;

/**
 * Result of checking if time is within quiet hours
 */
export interface QuietHoursCheck {
  isQuietHours: boolean;
  nextAvailableTime?: Date;
  reason?: string;
}

/**
 * Options for scheduling with timezone awareness
 */
export interface TimezoneSchedulingOptions {
  timezone: string;
  quietHours?: QuietHours;
  priority?: NotificationPriority;
  respectQuietHours?: boolean;
}

// ============================================
// QUIET HOURS UTILITIES
// ============================================

/**
 * Parse time string in HH:MM format to hours and minutes
 */
export function parseTimeString(timeStr: TimeString): { hours: number; minutes: number } | null {
  if (!timeStr || typeof timeStr !== 'string') {
    return null;
  }

  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }

  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return null;
  }

  return { hours, minutes };
}

/**
 * Convert time string to minutes since midnight
 */
export function timeStringToMinutes(timeStr: TimeString): number | null {
  const parsed = parseTimeString(timeStr);
  if (!parsed) {
    return null;
  }

  return parsed.hours * 60 + parsed.minutes;
}

/**
 * Get current time in user's timezone as minutes since midnight
 */
export function getCurrentTimeInTimezone(timezone: string): number {
  try {
    const now = new Date();

    // Convert to user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);

    return hours * 60 + minutes;
  } catch (error) {
    // If timezone is invalid, use UTC
    console.error(`Invalid timezone: ${timezone}`, error);
    const now = new Date();
    return now.getUTCHours() * 60 + now.getUTCMinutes();
  }
}

/**
 * Check if current time is within quiet hours
 * Handles cases where quiet hours span midnight (e.g., 22:00 to 08:00)
 */
export function isWithinQuietHours(
  currentTime: number,
  quietHoursStart: number,
  quietHoursEnd: number
): boolean {
  // If quiet hours don't span midnight (e.g., 14:00 to 18:00)
  if (quietHoursStart < quietHoursEnd) {
    return currentTime >= quietHoursStart && currentTime < quietHoursEnd;
  }

  // If quiet hours span midnight (e.g., 22:00 to 08:00)
  // Quiet hours = 22:00-23:59 OR 00:00-08:00
  return currentTime >= quietHoursStart || currentTime < quietHoursEnd;
}

/**
 * Calculate minutes until quiet hours end
 */
export function minutesUntilQuietHoursEnd(
  currentTime: number,
  quietHoursEnd: number
): number {
  const minutesInDay = 24 * 60;

  if (currentTime < quietHoursEnd) {
    // Same day
    return quietHoursEnd - currentTime;
  } else {
    // Next day
    return minutesInDay - currentTime + quietHoursEnd;
  }
}

/**
 * Check if a specific date/time is within user's quiet hours
 */
export function checkQuietHours(
  scheduledFor: Date,
  timezone: string,
  quietHours?: QuietHours
): QuietHoursCheck {
  // If quiet hours not enabled, always allow
  if (!quietHours || !quietHours.enabled) {
    return { isQuietHours: false };
  }

  // Parse quiet hours
  const startMinutes = timeStringToMinutes(quietHours.start);
  const endMinutes = timeStringToMinutes(quietHours.end);

  if (startMinutes === null || endMinutes === null) {
    console.error('Invalid quiet hours format', quietHours);
    return { isQuietHours: false };
  }

  // Get scheduled time in user's timezone
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(scheduledFor);
    const hours = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
    const minutes = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
    const scheduledMinutes = hours * 60 + minutes;

    const inQuietHours = isWithinQuietHours(scheduledMinutes, startMinutes, endMinutes);

    if (!inQuietHours) {
      return { isQuietHours: false };
    }

    // Calculate next available time (after quiet hours end)
    const minutesToWait = minutesUntilQuietHoursEnd(scheduledMinutes, endMinutes);
    const nextAvailableTime = new Date(scheduledFor.getTime() + minutesToWait * 60 * 1000);

    return {
      isQuietHours: true,
      nextAvailableTime,
      reason: `User's quiet hours (${quietHours.start} - ${quietHours.end} ${timezone})`,
    };
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return { isQuietHours: false };
  }
}

// ============================================
// SCHEDULING UTILITIES
// ============================================

/**
 * Adjust scheduled time to respect quiet hours
 * Returns the original time if not in quiet hours, or the next available time
 */
export function adjustForQuietHours(
  scheduledFor: Date,
  options: TimezoneSchedulingOptions
): Date {
  const { timezone, quietHours, priority, respectQuietHours = true } = options;

  // Critical notifications bypass quiet hours
  if (priority === 'critical') {
    return scheduledFor;
  }

  // If respect quiet hours is disabled, return original time
  if (!respectQuietHours) {
    return scheduledFor;
  }

  // Check if scheduled time is within quiet hours
  const check = checkQuietHours(scheduledFor, timezone, quietHours);

  if (check.isQuietHours && check.nextAvailableTime) {
    return check.nextAvailableTime;
  }

  return scheduledFor;
}

/**
 * Get the next available delivery time considering quiet hours
 * If immediate delivery is not possible, returns the next available time
 */
export function getNextDeliveryTime(
  timezone: string,
  quietHours?: QuietHours,
  priority?: NotificationPriority
): Date {
  const now = new Date();
  return adjustForQuietHours(now, { timezone, quietHours, priority });
}

/**
 * Batch adjust multiple scheduled times for quiet hours
 * Useful for scheduling multiple notifications at once
 */
export function batchAdjustForQuietHours(
  scheduledTimes: Date[],
  options: TimezoneSchedulingOptions
): Date[] {
  return scheduledTimes.map((time) => adjustForQuietHours(time, options));
}

// ============================================
// TIMEZONE CONVERSION UTILITIES
// ============================================

/**
 * Convert UTC date to user's local timezone
 * Returns a new Date object representing the same instant
 */
export function convertToUserTimezone(utcDate: Date, timezone: string): Date {
  // The Date object is always in UTC internally, but we can format it
  // in the user's timezone for display purposes
  return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
}

/**
 * Format date in user's timezone
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  try {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone,
      ...options,
    };

    return new Intl.DateTimeFormat('en-US', defaultOptions).format(date);
  } catch (error) {
    console.error(`Error formatting date in timezone ${timezone}:`, error);
    return date.toISOString();
  }
}

/**
 * Get timezone offset in hours for a specific date
 */
export function getTimezoneOffset(date: Date, timezone: string): number {
  try {
    // Get the time in UTC
    const utcTime = date.getTime();

    // Get the time in the target timezone
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    const tzTime = tzDate.getTime();

    // Calculate offset in hours
    const offsetMs = tzTime - utcTime;
    return offsetMs / (1000 * 60 * 60);
  } catch (error) {
    console.error(`Error calculating timezone offset for ${timezone}:`, error);
    return 0;
  }
}

/**
 * Check if a timezone string is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================
// SCHEDULING WINDOW UTILITIES
// ============================================

/**
 * Get acceptable hours window for a timezone
 * Returns the start and end of the acceptable delivery window
 */
export interface DeliveryWindow {
  start: Date;
  end: Date;
}

/**
 * Calculate the next delivery window for a user
 * Takes into account quiet hours and returns the next available window
 */
export function getNextDeliveryWindow(
  timezone: string,
  quietHours?: QuietHours
): DeliveryWindow {
  const now = new Date();

  if (!quietHours || !quietHours.enabled) {
    // No quiet hours - deliver immediately
    return {
      start: now,
      end: new Date(now.getTime() + 24 * 60 * 60 * 1000), // Next 24 hours
    };
  }

  const check = checkQuietHours(now, timezone, quietHours);

  if (!check.isQuietHours) {
    // Currently not in quiet hours - can deliver now
    // Window ends when quiet hours start
    const currentMinutes = getCurrentTimeInTimezone(timezone);
    const startMinutes = timeStringToMinutes(quietHours.start);

    if (startMinutes === null) {
      return {
        start: now,
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    let minutesUntilQuietHours: number;
    if (currentMinutes < startMinutes) {
      minutesUntilQuietHours = startMinutes - currentMinutes;
    } else {
      // Quiet hours start tomorrow
      minutesUntilQuietHours = (24 * 60) - currentMinutes + startMinutes;
    }

    return {
      start: now,
      end: new Date(now.getTime() + minutesUntilQuietHours * 60 * 1000),
    };
  }

  // Currently in quiet hours - delivery window starts when quiet hours end
  const start = check.nextAvailableTime || now;

  // Get quiet hours start time for the end of the window
  const startMinutes = timeStringToMinutes(quietHours.start);
  if (startMinutes === null) {
    return {
      start,
      end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  // Calculate when quiet hours start again (same day or next day)
  const startTime = getCurrentTimeInTimezone(timezone);
  const endMinutes = timeStringToMinutes(quietHours.end);

  if (endMinutes === null) {
    return {
      start,
      end: new Date(start.getTime() + 24 * 60 * 60 * 1000),
    };
  }

  let minutesUntilNextQuietHours: number;
  if (endMinutes < startMinutes) {
    // Quiet hours start same day after ending
    minutesUntilNextQuietHours = startMinutes - endMinutes;
  } else {
    // Quiet hours start next day
    minutesUntilNextQuietHours = (24 * 60) - endMinutes + startMinutes;
  }

  return {
    start,
    end: new Date(start.getTime() + minutesUntilNextQuietHours * 60 * 1000),
  };
}

/**
 * Check if a notification can be delivered within a time window
 */
export function canDeliverInWindow(
  scheduledFor: Date,
  window: DeliveryWindow
): boolean {
  return scheduledFor >= window.start && scheduledFor <= window.end;
}

// ============================================
// BULK SCHEDULING UTILITIES
// ============================================

/**
 * Schedule multiple notifications with staggering to avoid bursts
 * Distributes notifications across the delivery window
 */
export function staggerNotifications(
  count: number,
  timezone: string,
  quietHours?: QuietHours,
  staggerMinutes: number = 1
): Date[] {
  const window = getNextDeliveryWindow(timezone, quietHours);
  const scheduledTimes: Date[] = [];

  let currentTime = new Date(window.start);

  for (let i = 0; i < count; i++) {
    // Check if current time is still within window
    if (currentTime > window.end) {
      // Get next window
      const nextWindow = getNextDeliveryWindow(timezone, quietHours);
      currentTime = new Date(nextWindow.start);
    }

    scheduledTimes.push(new Date(currentTime));

    // Stagger by specified minutes
    currentTime = new Date(currentTime.getTime() + staggerMinutes * 60 * 1000);
  }

  return scheduledTimes;
}

/**
 * Get optimal delivery time for a notification type
 * Different notification types have different optimal delivery times
 */
export function getOptimalDeliveryTime(
  notificationType: string,
  timezone: string,
  quietHours?: QuietHours
): Date {
  const now = new Date();

  // Critical notifications (cancellations) - deliver immediately
  if (notificationType === 'cancellation') {
    return now;
  }

  // Class reminders - deliver at scheduled time (handled by caller)
  // Grade updates - deliver immediately if not in quiet hours
  // Announcements - deliver immediately if not in quiet hours
  // Assignment/exam reminders - deliver at scheduled time (handled by caller)

  return adjustForQuietHours(now, { timezone, quietHours });
}

// ============================================
// UTILITY HELPERS
// ============================================

/**
 * Get current date/time in user's timezone as a Date object
 */
export function getNowInTimezone(timezone: string): Date {
  try {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  } catch (error) {
    console.error(`Error getting current time in timezone ${timezone}:`, error);
    return new Date();
  }
}

/**
 * Calculate time difference between two timezones
 */
export function getTimezoneDifference(timezone1: string, timezone2: string): number {
  const now = new Date();
  const offset1 = getTimezoneOffset(now, timezone1);
  const offset2 = getTimezoneOffset(now, timezone2);
  return offset1 - offset2;
}

/**
 * Format quiet hours for display
 */
export function formatQuietHours(quietHours: QuietHours): string {
  if (!quietHours.enabled) {
    return 'Quiet hours disabled';
  }

  return `${quietHours.start} - ${quietHours.end} (${quietHours.timezone})`;
}

/**
 * Validate quiet hours configuration
 */
export function validateQuietHours(quietHours: QuietHours): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quietHours.enabled) {
    return { valid: true, errors: [] };
  }

  // Validate timezone
  if (!isValidTimezone(quietHours.timezone)) {
    errors.push(`Invalid timezone: ${quietHours.timezone}`);
  }

  // Validate time format
  const startMinutes = timeStringToMinutes(quietHours.start);
  const endMinutes = timeStringToMinutes(quietHours.end);

  if (startMinutes === null) {
    errors.push(`Invalid start time format: ${quietHours.start}`);
  }

  if (endMinutes === null) {
    errors.push(`Invalid end time format: ${quietHours.end}`);
  }

  // Validate that quiet hours are not 24 hours (that would block all notifications)
  if (startMinutes !== null && endMinutes !== null && startMinutes === endMinutes) {
    errors.push('Quiet hours cannot be 24 hours (start and end are the same)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
