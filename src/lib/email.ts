/**
 * Email Helper
 *
 * Simple email sending helper using Resend or Nodemailer.
 * Used alongside createNotification for transactional emails.
 */

import { supabaseAdmin } from './supabase';

// Try to import Resend first, fall back to Nodemailer
let resendClient: any = null;
let nodemailerTransporter: any = null;
let resendInitPromise: Promise<any> | null = null;
let nodemailerInitPromise: Promise<any> | null = null;

/**
 * Lazy initialize Resend client with proper async pattern
 */
async function getResendClient() {
  if (resendClient) return resendClient;
  
  if (!resendInitPromise) {
    resendInitPromise = (async () => {
      try {
        const resendModule = await import('resend');
        const { Resend } = resendModule as any;
        resendClient = new Resend(process.env.RESEND_API_KEY);
        return resendClient;
      } catch (error) {
        console.warn('Resend package not available:', error);
        return null;
      }
    })();
  }
  
  return resendInitPromise;
}

/**
 * Lazy initialize Nodemailer transporter with proper async pattern
 */
async function getNodemailerTransporter() {
  if (nodemailerTransporter) return nodemailerTransporter;
  
  if (!nodemailerInitPromise) {
    nodemailerInitPromise = (async () => {
      try {
        const nodemailerModule = await import('nodemailer');
        const nodemailer = nodemailerModule as any;
        nodemailerTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        return nodemailerTransporter;
      } catch (error) {
        console.warn('Nodemailer not available:', error);
        return null;
      }
    })();
  }
  
  return nodemailerInitPromise;
}

/**
 * Validate email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Database-backed rate limiting for email sending
 * Uses email_logs table for distributed environments
 */
async function checkRateLimit(to: string): Promise<boolean> {
  const now = new Date();
  const limit = 10; // 10 emails per hour
  const windowStart = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
  
  if (!supabaseAdmin) {
    console.error('Supabase not configured, blocking email send');
    return false; // Fail closed
  }
  
  try {
    // Count emails sent to this recipient in the last hour
    const { count, error } = await supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .eq('to', to)
      .gte('created_at', windowStart.toISOString());
    
    if (error) {
      console.error('Rate limit check error:', error);
      return false; // Fail closed on error
    }
    
    if (count !== null && count >= limit) {
      return false;
    }
    
    // Log this email attempt
    await supabaseAdmin
      .from('email_logs')
      .insert({ to, created_at: now.toISOString() });
    
    return true;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Fail closed
  }
}

/**
 * Send an email
 *
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param html - HTML content of email
 * @param text - Plain text fallback (optional)
 * @returns Promise that resolves when email is sent
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> {
  // Validate email address
  if (!isValidEmail(to)) {
    throw new Error('Invalid email address');
  }

  // Check rate limit
  if (!(await checkRateLimit(to))) {
    throw new Error('Rate limit exceeded: Too many emails sent to this recipient');
  }

  const from = process.env.EMAIL_FROM || 'noreply@eduverse.com';

  try {
    // Try Resend first
    const client = await getResendClient();
    if (client) {
      await client.emails.send({
        from,
        to,
        subject,
        html,
        text,
      });
      return;
    }

    // Fall back to Nodemailer
    const transporter = await getNodemailerTransporter();
    if (transporter) {
      await transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
      });
      return;
    }

    // No email provider configured
    console.warn('No email provider configured. Email not sent:', {
      to,
      subject,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw - email failures shouldn't block main flow
  }
}

/**
 * Send a batch of emails
 *
 * @param emails - Array of email objects with to, subject, html, text
 * @returns Promise that resolves when all emails are sent
 */
export async function sendBatchEmails(
  emails: Array<{
    to: string;
    subject: string;
    html: string;
    text?: string;
  }>
): Promise<void> {
  // Validate all email addresses first
  for (const email of emails) {
    if (!isValidEmail(email.to)) {
      console.error(`Invalid email address: ${email.to}`);
      continue; // Skip invalid emails but continue with others
    }
  }

  // Send emails in parallel with Promise.allSettled to handle partial failures
  const results = await Promise.allSettled(
    emails.map((email) => sendEmail(email.to, email.subject, email.html, email.text))
  );

  // Log any failures
  const failures = results.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    console.error(`Failed to send ${failures.length} of ${emails.length} emails`);
    failures.forEach((failure, index) => {
      if (failure.status === 'rejected') {
        console.error(`  - Failed for ${emails[index].to}:`, failure.reason);
      }
    });
  }
}

/**
 * Check if email sending is configured
 *
 * @returns true if either Resend or Nodemailer is configured
 */
export async function isEmailConfigured(): Promise<boolean> {
  const client = await getResendClient();
  const transporter = await getNodemailerTransporter();
  return !!(client || transporter);
}
