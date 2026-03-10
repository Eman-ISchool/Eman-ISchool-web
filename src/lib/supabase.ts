import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables with fallbacks for different naming conventions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Lazy initialization to prevent errors when env vars are not set
let _supabase: SupabaseClient<any> | null = null;
let _supabaseAdmin: SupabaseClient<any> | null = null;

function hasMeaningfulSupabaseValue(value: string) {
    const normalized = value.trim().toLowerCase();
    return Boolean(
        normalized &&
        !normalized.includes('placeholder') &&
        !normalized.includes('missing')
    );
}

// Check if Supabase is configured
export const isSupabaseConfigured =
    hasMeaningfulSupabaseValue(supabaseUrl) && hasMeaningfulSupabaseValue(supabaseAnonKey);
export const isSupabaseAdminConfigured =
    hasMeaningfulSupabaseValue(supabaseUrl) && hasMeaningfulSupabaseValue(supabaseServiceKey);

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase: SupabaseClient<any> = (() => {
    const clientUrl = supabaseUrl || 'http://localhost:54321';
    const clientKey = supabaseAnonKey || 'public-anon-key-missing';

    if (!isSupabaseConfigured) {
        console.warn('Supabase client using fallback URL/key because environment variables are missing');
    }

    if (!_supabase) {
        _supabase = createClient<Database>(clientUrl, clientKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
            },
        });
    }
    return _supabase;
})();

// Server-side Supabase client (uses service role key, bypasses RLS)
// Use this ONLY in API routes and server components
export const supabaseAdmin: SupabaseClient<any> = (() => {
    const adminUrl = supabaseUrl || 'http://localhost:54321';
    const adminKey = supabaseServiceKey || 'service-role-key-missing';

    if (!isSupabaseAdminConfigured) {
        console.warn('Supabase admin client using fallback URL/key because environment variables are missing');
    }

    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient<Database>(adminUrl, adminKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return _supabaseAdmin;
})();

// Helper to get server-side client
export function getServerSupabase(): SupabaseClient<any> {
    if (!isSupabaseAdminConfigured) {
        console.warn('Supabase admin environment variables are missing; requests may fail at runtime');
    }
    return supabaseAdmin;
}

// Types for database entities
export type User = Database['public']['Tables']['users']['Row'];
export type Course = Database['public']['Tables']['courses']['Row'];
export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type Attendance = Database['public']['Tables']['attendance']['Row'];
export type Enrollment = Database['public']['Tables']['enrollments']['Row'];
export type MeetingLog = Database['public']['Tables']['meeting_logs']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Reel = Database['public']['Tables']['reels']['Row'];
export type ReelProgress = Database['public']['Tables']['reel_progress']['Row'];
export type GenerationLog = Database['public']['Tables']['generation_logs']['Row'];

export type Assessment = Database['public']['Tables']['assessments']['Row'];
export type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row'];
export type AssessmentSubmission = Database['public']['Tables']['assessment_submissions']['Row'];
export type AssessmentAnswer = Database['public']['Tables']['assessment_answers']['Row'];

// Type for inserts
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
export type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
export type EnrollmentInsert = Database['public']['Tables']['enrollments']['Insert'];
export type MeetingLogInsert = Database['public']['Tables']['meeting_logs']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type ReelInsert = Database['public']['Tables']['reels']['Insert'];
export type ReelProgressInsert = Database['public']['Tables']['reel_progress']['Insert'];
export type GenerationLogInsert = Database['public']['Tables']['generation_logs']['Insert'];

export type AssessmentInsert = Database['public']['Tables']['assessments']['Insert'];
export type AssessmentQuestionInsert = Database['public']['Tables']['assessment_questions']['Insert'];
export type AssessmentSubmissionInsert = Database['public']['Tables']['assessment_submissions']['Insert'];
export type AssessmentAnswerInsert = Database['public']['Tables']['assessment_answers']['Insert'];

// Type for updates
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];
export type ReelUpdate = Database['public']['Tables']['reels']['Update'];
export type ReelProgressUpdate = Database['public']['Tables']['reel_progress']['Update'];
export type GenerationLogUpdate = Database['public']['Tables']['generation_logs']['Update'];

export type AssessmentUpdate = Database['public']['Tables']['assessments']['Update'];
export type AssessmentQuestionUpdate = Database['public']['Tables']['assessment_questions']['Update'];
export type AssessmentSubmissionUpdate = Database['public']['Tables']['assessment_submissions']['Update'];
export type AssessmentAnswerUpdate = Database['public']['Tables']['assessment_answers']['Update'];

// New types for Platform Upgrade
export type ParentStudent = Database['public']['Tables']['parent_student']['Row'];
export type Grade = Database['public']['Tables']['grades']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Material = Database['public']['Tables']['materials']['Row'];
export type Meeting = Database['public']['Tables']['meetings']['Row'];
export type Invoice = Database['public']['Tables']['invoices']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type SupportTicket = Database['public']['Tables']['support_tickets']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Discount = Database['public']['Tables']['discounts']['Row'];
export type EnrollmentApplication = Database['public']['Tables']['enrollment_applications']['Row'];
export type EnrollmentApplicationInsert = Database['public']['Tables']['enrollment_applications']['Insert'];
export type EnrollmentApplicationUpdate = Database['public']['Tables']['enrollment_applications']['Update'];
