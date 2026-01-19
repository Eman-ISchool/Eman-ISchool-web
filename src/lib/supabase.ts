import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables with fallbacks for different naming conventions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';

// Lazy initialization to prevent errors when env vars are not set
let _supabase: SupabaseClient<Database> | null = null;
let _supabaseAdmin: SupabaseClient<Database> | null = null;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
export const isSupabaseAdminConfigured = !!(supabaseUrl && supabaseServiceKey);

// Client-side Supabase client (uses anon key, respects RLS)
export const supabase: SupabaseClient<Database> | null = (() => {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase client not initialized: missing URL or anon key');
        return null;
    }
    if (!_supabase) {
        _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
export const supabaseAdmin: SupabaseClient<Database> | null = (() => {
    if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('Supabase admin client not initialized: missing URL or service key');
        return null;
    }
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        });
    }
    return _supabaseAdmin;
})();

// Helper to get server-side client
export function getServerSupabase(): SupabaseClient<Database> {
    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase environment variables');
    }
    // Non-null assertion is safe here because we throw an error above if supabaseAdmin is null
    return supabaseAdmin!;
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

// Type for updates
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];
export type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];
export type ReelUpdate = Database['public']['Tables']['reels']['Update'];
export type ReelProgressUpdate = Database['public']['Tables']['reel_progress']['Update'];
export type GenerationLogUpdate = Database['public']['Tables']['generation_logs']['Update'];
