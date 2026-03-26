/**
 * Notification Templates System
 *
 * Provides template registry with content templates for all notification types
 * across different channels (email, push, SMS, in-app). Supports template
 * rendering with variable substitution and multi-language support.
 */

import type {
  NotificationChannel,
  NotificationType,
} from '@/types/database';
import type {
  NotificationTemplate,
  TemplateContext,
  RenderedTemplate,
  ClassReminderPayload,
  GradeUpdatePayload,
  AnnouncementPayload,
  CancellationPayload,
  AssignmentDuePayload,
  ExamReminderPayload,
} from '@/types/notifications';

// ============================================
// TEMPLATE REGISTRY
// ============================================

/**
 * Template registry storing all notification templates
 * Organized by notification type and channel
 */
const TEMPLATE_REGISTRY: Record<NotificationType, Partial<Record<NotificationChannel, NotificationTemplate>>> = {
  class_reminder: {
    email: {
      type: 'class_reminder',
      channel: 'email',
      subject: 'Class Reminder: {{course_title}} - {{lesson_title}}',
      bodyTemplate: `Hello {{user_name}},

This is a reminder that your class "{{lesson_title}}" for {{course_title}} is coming up soon.

Class Details:
- Course: {{course_title}}
- Lesson: {{lesson_title}}
- Teacher: {{teacher_name}}
- Start Time: {{start_time}}
- End Time: {{end_time}}
{{#if meet_link}}
- Join Link: {{meet_link}}
{{/if}}

{{#if minutes_until_start}}
{{#if (eq minutes_until_start 1440)}}
Your class starts in 24 hours.
{{else if (eq minutes_until_start 60)}}
Your class starts in 1 hour.
{{else if (eq minutes_until_start 15)}}
Your class starts in 15 minutes!
{{/if}}
{{/if}}

{{#if action_url}}
Click here to join or view details: {{action_url}}
{{/if}}

See you in class!`,
      variables: ['user_name', 'course_title', 'lesson_title', 'teacher_name', 'start_time', 'end_time', 'meet_link', 'minutes_until_start', 'action_url'],
    },
    push: {
      type: 'class_reminder',
      channel: 'push',
      bodyTemplate: '{{lesson_title}} for {{course_title}} starts {{time_until}}',
      variables: ['lesson_title', 'course_title', 'time_until'],
    },
    sms: {
      type: 'class_reminder',
      channel: 'sms',
      smsTemplate: 'Reminder: {{lesson_title}} ({{course_title}}) starts {{time_until}}. {{#if meet_link}}Join: {{meet_link}}{{/if}}',
      bodyTemplate: 'Reminder: {{lesson_title}} ({{course_title}}) starts {{time_until}}',
      variables: ['lesson_title', 'course_title', 'time_until', 'meet_link'],
    },
    in_app: {
      type: 'class_reminder',
      channel: 'in_app',
      bodyTemplate: '{{lesson_title}} for {{course_title}} starts {{time_until}}',
      variables: ['lesson_title', 'course_title', 'time_until'],
    },
  },
  grade_update: {
    email: {
      type: 'grade_update',
      channel: 'email',
      subject: 'New Grade Posted: {{assignment_title}} - {{course_title}}',
      bodyTemplate: `Hello {{user_name}},

A new grade has been posted for your assignment in {{course_title}}.

Grade Details:
- Course: {{course_title}}
- Assignment: {{assignment_title}}
- Score: {{score}}/{{max_score}} ({{percentage}}%)
- Teacher: {{teacher_name}}
{{#if feedback}}

Teacher Feedback:
{{feedback}}
{{/if}}

{{#if action_url}}
View full details: {{action_url}}
{{/if}}

Keep up the great work!`,
      variables: ['user_name', 'course_title', 'assignment_title', 'score', 'max_score', 'percentage', 'teacher_name', 'feedback', 'action_url'],
    },
    push: {
      type: 'grade_update',
      channel: 'push',
      bodyTemplate: 'New grade for {{assignment_title}}: {{score}}/{{max_score}} ({{percentage}}%)',
      variables: ['assignment_title', 'score', 'max_score', 'percentage'],
    },
    sms: {
      type: 'grade_update',
      channel: 'sms',
      smsTemplate: 'Grade posted: {{assignment_title}} - {{score}}/{{max_score}} ({{percentage}}%)',
      bodyTemplate: 'Grade posted: {{assignment_title}} - {{score}}/{{max_score}} ({{percentage}}%)',
      variables: ['assignment_title', 'score', 'max_score', 'percentage'],
    },
    in_app: {
      type: 'grade_update',
      channel: 'in_app',
      bodyTemplate: 'New grade for {{assignment_title}}: {{score}}/{{max_score}} ({{percentage}}%)',
      variables: ['assignment_title', 'score', 'max_score', 'percentage'],
    },
  },
  announcement: {
    email: {
      type: 'announcement',
      channel: 'email',
      subject: '{{#if course_title}}[{{course_title}}] {{/if}}{{announcement_title}}',
      bodyTemplate: `Hello {{user_name}},

{{#if course_title}}
A new announcement has been posted for {{course_title}}.
{{else}}
A new school-wide announcement has been posted.
{{/if}}

{{announcement_title}}

{{announcement_body}}

Posted by: {{author_name}} ({{author_role}})

{{#if action_url}}
View full announcement: {{action_url}}
{{/if}}`,
      variables: ['user_name', 'course_title', 'announcement_title', 'announcement_body', 'author_name', 'author_role', 'action_url'],
    },
    push: {
      type: 'announcement',
      channel: 'push',
      bodyTemplate: '{{announcement_title}}',
      variables: ['announcement_title'],
    },
    sms: {
      type: 'announcement',
      channel: 'sms',
      smsTemplate: '{{#if course_title}}[{{course_title}}] {{/if}}{{announcement_title}}',
      bodyTemplate: '{{#if course_title}}[{{course_title}}] {{/if}}{{announcement_title}}',
      variables: ['course_title', 'announcement_title'],
    },
    in_app: {
      type: 'announcement',
      channel: 'in_app',
      bodyTemplate: '{{announcement_title}}',
      variables: ['announcement_title'],
    },
  },
  cancellation: {
    email: {
      type: 'cancellation',
      channel: 'email',
      subject: 'Class Cancelled: {{lesson_title}} - {{course_title}}',
      bodyTemplate: `Hello {{user_name}},

IMPORTANT: The following class has been cancelled.

Cancelled Class Details:
- Course: {{course_title}}
- Lesson: {{lesson_title}}
- Originally Scheduled: {{original_start_time}} - {{original_end_time}}
- Teacher: {{teacher_name}}
{{#if reason}}

Reason: {{reason}}
{{/if}}
{{#if rescheduled_to}}

RESCHEDULED TO: {{rescheduled_to}}
{{else}}

This class has not been rescheduled yet. We'll notify you when a new time is set.
{{/if}}

We apologize for any inconvenience.

{{#if action_url}}
View course schedule: {{action_url}}
{{/if}}`,
      variables: ['user_name', 'course_title', 'lesson_title', 'original_start_time', 'original_end_time', 'teacher_name', 'reason', 'rescheduled_to', 'action_url'],
    },
    push: {
      type: 'cancellation',
      channel: 'push',
      bodyTemplate: 'CANCELLED: {{lesson_title}} ({{course_title}}) on {{original_start_time}}{{#if rescheduled_to}} - Rescheduled to {{rescheduled_to}}{{/if}}',
      variables: ['lesson_title', 'course_title', 'original_start_time', 'rescheduled_to'],
    },
    sms: {
      type: 'cancellation',
      channel: 'sms',
      smsTemplate: 'CANCELLED: {{lesson_title}} ({{course_title}}) on {{original_start_time}}{{#if rescheduled_to}}. Rescheduled to {{rescheduled_to}}{{/if}}',
      bodyTemplate: 'CANCELLED: {{lesson_title}} ({{course_title}}) on {{original_start_time}}{{#if rescheduled_to}}. Rescheduled to {{rescheduled_to}}{{/if}}',
      variables: ['lesson_title', 'course_title', 'original_start_time', 'rescheduled_to'],
    },
    in_app: {
      type: 'cancellation',
      channel: 'in_app',
      bodyTemplate: 'Class cancelled: {{lesson_title}} on {{original_start_time}}{{#if rescheduled_to}} - Rescheduled to {{rescheduled_to}}{{/if}}',
      variables: ['lesson_title', 'original_start_time', 'rescheduled_to'],
    },
  },
  assignment_due: {
    email: {
      type: 'assignment_due',
      channel: 'email',
      subject: 'Assignment Due Soon: {{assignment_title}} - {{course_title}}',
      bodyTemplate: `Hello {{user_name}},

This is a reminder that an assignment is due soon.

Assignment Details:
- Course: {{course_title}}
- Assignment: {{assignment_title}}
- Due Date: {{due_date}}
{{#if hours_until_due}}
- Time Until Due: {{hours_until_due}} hours
{{/if}}
- Status: {{submission_status}}

{{#if (eq submission_status 'not_started')}}
You haven't started this assignment yet. Don't miss the deadline!
{{else if (eq submission_status 'in_progress')}}
You have started this assignment. Make sure to submit before the deadline!
{{else if (eq submission_status 'submitted')}}
Great! You've already submitted this assignment.
{{/if}}

{{#if action_url}}
{{#if (ne submission_status 'submitted')}}
Submit your assignment: {{action_url}}
{{else}}
View your submission: {{action_url}}
{{/if}}
{{/if}}`,
      variables: ['user_name', 'course_title', 'assignment_title', 'due_date', 'hours_until_due', 'submission_status', 'action_url'],
    },
    push: {
      type: 'assignment_due',
      channel: 'push',
      bodyTemplate: '{{assignment_title}} due {{time_until}}',
      variables: ['assignment_title', 'time_until'],
    },
    sms: {
      type: 'assignment_due',
      channel: 'sms',
      smsTemplate: 'Reminder: {{assignment_title}} ({{course_title}}) due {{time_until}}',
      bodyTemplate: 'Reminder: {{assignment_title}} ({{course_title}}) due {{time_until}}',
      variables: ['assignment_title', 'course_title', 'time_until'],
    },
    in_app: {
      type: 'assignment_due',
      channel: 'in_app',
      bodyTemplate: '{{assignment_title}} due {{time_until}}',
      variables: ['assignment_title', 'time_until'],
    },
  },
  exam_reminder: {
    email: {
      type: 'exam_reminder',
      channel: 'email',
      subject: 'Exam Reminder: {{exam_title}} - {{course_title}}',
      bodyTemplate: `Hello {{user_name}},

This is a reminder about an upcoming exam.

Exam Details:
- Course: {{course_title}}
- Exam: {{exam_title}}
- Date: {{exam_date}}
- Duration: {{exam_duration_minutes}} minutes
- Teacher: {{teacher_name}}
{{#if location}}
- Location: {{location}}
{{/if}}
{{#if days_until_exam}}

Your exam is in {{days_until_exam}} day(s).
{{/if}}

Make sure you're well prepared!

{{#if action_url}}
View exam details and study materials: {{action_url}}
{{/if}}

Good luck!`,
      variables: ['user_name', 'course_title', 'exam_title', 'exam_date', 'exam_duration_minutes', 'teacher_name', 'location', 'days_until_exam', 'action_url'],
    },
    push: {
      type: 'exam_reminder',
      channel: 'push',
      bodyTemplate: 'Exam reminder: {{exam_title}} ({{course_title}}) {{time_until}}',
      variables: ['exam_title', 'course_title', 'time_until'],
    },
    sms: {
      type: 'exam_reminder',
      channel: 'sms',
      smsTemplate: 'Exam: {{exam_title}} ({{course_title}}) on {{exam_date}}{{#if location}} at {{location}}{{/if}}',
      bodyTemplate: 'Exam: {{exam_title}} ({{course_title}}) on {{exam_date}}{{#if location}} at {{location}}{{/if}}',
      variables: ['exam_title', 'course_title', 'exam_date', 'location'],
    },
    in_app: {
      type: 'exam_reminder',
      channel: 'in_app',
      bodyTemplate: 'Exam: {{exam_title}} {{time_until}}',
      variables: ['exam_title', 'time_until'],
    },
  },
};

// ============================================
// TEMPLATE RETRIEVAL
// ============================================

/**
 * Get template for a specific notification type and channel
 */
export function getTemplate(
  type: NotificationType,
  channel: NotificationChannel
): NotificationTemplate | null {
  const typeTemplates = TEMPLATE_REGISTRY[type];
  if (!typeTemplates) {
    return null;
  }

  const template = typeTemplates[channel];
  return template || null;
}

/**
 * Get all templates for a specific notification type
 */
export function getTemplatesForType(
  type: NotificationType
): Partial<Record<NotificationChannel, NotificationTemplate>> {
  return TEMPLATE_REGISTRY[type] || {};
}

/**
 * Check if a template exists for a given type and channel
 */
export function hasTemplate(
  type: NotificationType,
  channel: NotificationChannel
): boolean {
  return !!getTemplate(type, channel);
}

// ============================================
// TEMPLATE RENDERING
// ============================================

/**
 * Simple template variable replacement
 * Replaces {{variable}} with actual values from context
 * Supports basic conditionals: {{#if var}}...{{/if}}
 */
function replaceVariables(template: string, variables: Record<string, any>): string {
  let result = template;

  // Handle conditionals first: {{#if variable}}...{{/if}}
  const ifRegex = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(ifRegex, (match, varName, content) => {
    const value = variables[varName];
    // Show content if value is truthy
    if (value) {
      return replaceVariables(content, variables);
    }
    return '';
  });

  // Handle equality conditionals: {{#if (eq var value)}}...{{/if}}
  const eqRegex = /\{\{#if\s+\(eq\s+(\w+)\s+([^\)]+)\)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(eqRegex, (match, varName, expectedValue, content) => {
    const actualValue = variables[varName];
    const cleanExpectedValue = expectedValue.trim();
    // Compare values (handle both string and number comparison)
    if (String(actualValue) === cleanExpectedValue) {
      return replaceVariables(content, variables);
    }
    return '';
  });

  // Handle not-equal conditionals: {{#if (ne var value)}}...{{/if}}
  const neRegex = /\{\{#if\s+\(ne\s+(\w+)\s+([^\)]+)\)\}\}([\s\S]*?)\{\{\/if\}\}/g;
  result = result.replace(neRegex, (match, varName, expectedValue, content) => {
    const actualValue = variables[varName];
    const cleanExpectedValue = expectedValue.trim();
    // Compare values (handle both string and number comparison)
    if (String(actualValue) !== cleanExpectedValue) {
      return replaceVariables(content, variables);
    }
    return '';
  });

  // Handle else-if chains: {{else if (eq var value)}}
  const elseIfRegex = /\{\{else\s+if\s+\(eq\s+(\w+)\s+([^\)]+)\)\}\}([\s\S]*?)(?=\{\{else|$)/g;
  result = result.replace(elseIfRegex, (match, varName, expectedValue, content) => {
    const actualValue = variables[varName];
    const cleanExpectedValue = expectedValue.trim();
    if (String(actualValue) === cleanExpectedValue) {
      return replaceVariables(content, variables);
    }
    return '';
  });

  // Handle else: {{else}}
  // This is a fallback - if we reach here, the previous conditions were false
  // The else handling is implicit through the if/else-if chain

  // Replace simple variables: {{variable}}
  const varRegex = /\{\{(\w+)\}\}/g;
  result = result.replace(varRegex, (match, varName) => {
    const value = variables[varName];
    if (value === null || value === undefined) {
      return '';
    }
    return String(value);
  });

  // Clean up any leftover conditional markers
  result = result.replace(/\{\{else\}\}[\s\S]*?$/g, '');

  // Clean up extra blank lines (more than 2 consecutive newlines)
  result = result.replace(/\n{3,}/g, '\n\n');

  return result.trim();
}

/**
 * Format time until a date for human-readable display
 */
function formatTimeUntil(minutes?: number): string {
  if (!minutes) return '';

  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return days === 1 ? 'in 24 hours' : `in ${days} days`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? 'in 1 hour' : `in ${hours} hours`;
  }
  return minutes === 1 ? 'in 1 minute' : `in ${minutes} minutes`;
}

/**
 * Format hours until due date for display
 */
function formatHoursUntil(hours?: number): string {
  if (!hours) return '';

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return days === 1 ? 'in 1 day' : `in ${days} days`;
  }
  return hours === 1 ? 'in 1 hour' : `in ${hours} hours`;
}

/**
 * Format days until exam for display
 */
function formatDaysUntil(days?: number): string {
  if (!days) return '';

  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * Prepare template variables from notification payload
 */
function prepareTemplateVariables<T extends NotificationType>(
  context: TemplateContext<T>
): Record<string, any> {
  const { notification_type, payload, user, metadata } = context;

  // Base variables available to all templates
  const baseVariables = {
    user_name: user.name,
    user_email: user.email,
    unsubscribe_url: metadata.unsubscribe_url || '',
    action_url: metadata.action_url || payload.action_url || '',
    app_url: metadata.app_url,
  };

  // Type-specific variable preparation
  switch (notification_type) {
    case 'class_reminder': {
      const data = payload as ClassReminderPayload;
      return {
        ...baseVariables,
        ...data,
        time_until: formatTimeUntil(data.minutes_until_start),
      };
    }

    case 'grade_update': {
      const data = payload as GradeUpdatePayload;
      return {
        ...baseVariables,
        ...data,
      };
    }

    case 'announcement': {
      const data = payload as AnnouncementPayload;
      return {
        ...baseVariables,
        ...data,
      };
    }

    case 'cancellation': {
      const data = payload as CancellationPayload;
      return {
        ...baseVariables,
        ...data,
      };
    }

    case 'assignment_due': {
      const data = payload as AssignmentDuePayload;
      return {
        ...baseVariables,
        ...data,
        time_until: formatHoursUntil(data.hours_until_due),
      };
    }

    case 'exam_reminder': {
      const data = payload as ExamReminderPayload;
      return {
        ...baseVariables,
        ...data,
        time_until: formatDaysUntil(data.days_until_exam),
      };
    }

    default:
      return {
        ...baseVariables,
        ...payload,
      };
  }
}

/**
 * Render a template with the given context
 * Returns null if template doesn't exist for the channel
 */
export function renderTemplate<T extends NotificationType>(
  context: TemplateContext<T>,
  channel: NotificationChannel
): RenderedTemplate | null {
  const template = getTemplate(context.notification_type, channel);
  if (!template) {
    return null;
  }

  // Prepare variables for rendering
  const variables = prepareTemplateVariables(context);

  // Render based on channel
  const rendered: RenderedTemplate = {
    body: replaceVariables(template.bodyTemplate, variables),
  };

  // Add subject for email
  if (channel === 'email' && template.subject) {
    rendered.subject = replaceVariables(template.subject, variables);
  }

  // Add HTML template for email (if we had HTML templates)
  if (channel === 'email' && template.htmlTemplate) {
    rendered.html = replaceVariables(template.htmlTemplate, variables);
  }

  return rendered;
}

/**
 * Render templates for multiple channels
 * Returns a map of channel to rendered template
 */
export function renderTemplatesForChannels<T extends NotificationType>(
  context: TemplateContext<T>,
  channels: NotificationChannel[]
): Record<NotificationChannel, RenderedTemplate | null> {
  const result: Record<string, RenderedTemplate | null> = {};

  for (const channel of channels) {
    result[channel] = renderTemplate(context, channel);
  }

  return result as Record<NotificationChannel, RenderedTemplate | null>;
}

/**
 * Validate that all required variables are present in the payload
 */
export function validateTemplateVariables(
  template: NotificationTemplate,
  variables: Record<string, any>
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  for (const varName of template.variables) {
    // Skip optional variables (those used in conditionals)
    if (varName.includes('?') || varName.startsWith('if_')) {
      continue;
    }

    // Check if variable exists and is not null/undefined
    if (variables[varName] === null || variables[varName] === undefined) {
      // Some variables are optional based on context
      const optionalVars = ['meet_link', 'feedback', 'reason', 'rescheduled_to', 'location', 'action_url', 'unsubscribe_url'];
      if (!optionalVars.includes(varName)) {
        missing.push(varName);
      }
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}

// ============================================
// EXPORTS
// ============================================

export { TEMPLATE_REGISTRY };
