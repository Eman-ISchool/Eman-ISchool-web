// Database types for Supabase
// These types should be generated using `supabase gen types typescript`
// For now, we define them manually based on our schema

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type UserRole = 'student' | 'teacher' | 'admin';
export type LessonStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    name: string;
                    image: string | null;
                    role: UserRole;
                    google_id: string | null;
                    phone: string | null;
                    bio: string | null;
                    is_active: boolean;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    image?: string | null;
                    role?: UserRole;
                    google_id?: string | null;
                    phone?: string | null;
                    bio?: string | null;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    image?: string | null;
                    role?: UserRole;
                    google_id?: string | null;
                    phone?: string | null;
                    bio?: string | null;
                    is_active?: boolean;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            courses: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    description: string | null;
                    price: number;
                    duration_hours: number | null;
                    image_url: string | null;
                    subject: string | null;
                    grade_level: string | null;
                    teacher_id: string | null;
                    is_published: boolean;
                    max_students: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description?: string | null;
                    price?: number;
                    duration_hours?: number | null;
                    image_url?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    teacher_id?: string | null;
                    is_published?: boolean;
                    max_students?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    duration_hours?: number | null;
                    image_url?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    teacher_id?: string | null;
                    is_published?: boolean;
                    max_students?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            lessons: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    start_date_time: string;
                    end_date_time: string;
                    meet_link: string | null;
                    google_event_id: string | null;
                    google_calendar_link: string | null;
                    status: LessonStatus;
                    course_id: string | null;
                    teacher_id: string | null;
                    recording_url: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    start_date_time: string;
                    end_date_time: string;
                    meet_link?: string | null;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: LessonStatus;
                    course_id?: string | null;
                    teacher_id?: string | null;
                    recording_url?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    start_date_time?: string;
                    end_date_time?: string;
                    meet_link?: string | null;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: LessonStatus;
                    course_id?: string | null;
                    teacher_id?: string | null;
                    recording_url?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            attendance: {
                Row: {
                    id: string;
                    lesson_id: string;
                    user_id: string;
                    status: AttendanceStatus;
                    joined_at: string | null;
                    left_at: string | null;
                    duration_minutes: number;
                    is_teacher: boolean;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    lesson_id: string;
                    user_id: string;
                    status?: AttendanceStatus;
                    joined_at?: string | null;
                    left_at?: string | null;
                    duration_minutes?: number;
                    is_teacher?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    lesson_id?: string;
                    user_id?: string;
                    status?: AttendanceStatus;
                    joined_at?: string | null;
                    left_at?: string | null;
                    duration_minutes?: number;
                    is_teacher?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            enrollments: {
                Row: {
                    id: string;
                    student_id: string;
                    course_id: string;
                    enrolled_at: string;
                    status: EnrollmentStatus;
                    progress_percent: number;
                    last_accessed: string | null;
                    completed_at: string | null;
                };
                Insert: {
                    id?: string;
                    student_id: string;
                    course_id: string;
                    enrolled_at?: string;
                    status?: EnrollmentStatus;
                    progress_percent?: number;
                    last_accessed?: string | null;
                    completed_at?: string | null;
                };
                Update: {
                    id?: string;
                    student_id?: string;
                    course_id?: string;
                    enrolled_at?: string;
                    status?: EnrollmentStatus;
                    progress_percent?: number;
                    last_accessed?: string | null;
                    completed_at?: string | null;
                };
            };
            meeting_logs: {
                Row: {
                    id: string;
                    lesson_id: string;
                    event_type: string;
                    user_id: string | null;
                    metadata: Json;
                    ip_address: string | null;
                    user_agent: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    lesson_id: string;
                    event_type: string;
                    user_id?: string | null;
                    metadata?: Json;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    lesson_id?: string;
                    event_type?: string;
                    user_id?: string | null;
                    metadata?: Json;
                    ip_address?: string | null;
                    user_agent?: string | null;
                    created_at?: string;
                };
            };
            audit_logs: {
                Row: {
                    id: string;
                    action: string;
                    table_name: string;
                    record_id: string | null;
                    user_id: string | null;
                    old_data: Json | null;
                    new_data: Json | null;
                    ip_address: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    action: string;
                    table_name: string;
                    record_id?: string | null;
                    user_id?: string | null;
                    old_data?: Json | null;
                    new_data?: Json | null;
                    ip_address?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    action?: string;
                    table_name?: string;
                    record_id?: string | null;
                    user_id?: string | null;
                    old_data?: Json | null;
                    new_data?: Json | null;
                    ip_address?: string | null;
                    created_at?: string;
                };
            };
            notifications: {
                Row: {
                    id: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type: string;
                    is_read: boolean;
                    link: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    title: string;
                    message: string;
                    type?: string;
                    is_read?: boolean;
                    link?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    title?: string;
                    message?: string;
                    type?: string;
                    is_read?: boolean;
                    link?: string | null;
                    created_at?: string;
                };
            };
            posts: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    content: string | null;
                    excerpt: string | null;
                    main_image: string | null;
                    published_at: string;
                    author_id: string | null;
                    is_published: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    content?: string | null;
                    excerpt?: string | null;
                    main_image?: string | null;
                    published_at?: string;
                    author_id?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    content?: string | null;
                    excerpt?: string | null;
                    main_image?: string | null;
                    published_at?: string;
                    author_id?: string | null;
                    is_published?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assignments: {
                Row: {
                    id: string;
                    course_id: string;
                    title: string;
                    description: string | null;
                    due_date: string;
                    max_score: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    course_id: string;
                    title: string;
                    description?: string | null;
                    due_date: string;
                    max_score?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    course_id?: string;
                    title?: string;
                    description?: string | null;
                    due_date?: string;
                    max_score?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assignment_submissions: {
                Row: {
                    id: string;
                    assignment_id: string;
                    student_id: string;
                    submitted_at: string;
                    score: number | null;
                    feedback: string | null;
                    graded_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    assignment_id: string;
                    student_id: string;
                    submitted_at?: string;
                    score?: number | null;
                    feedback?: string | null;
                    graded_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    assignment_id?: string;
                    student_id?: string;
                    submitted_at?: string;
                    score?: number | null;
                    feedback?: string | null;
                    graded_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            exam_simulations: {
                Row: {
                    id: string;
                    course_id: string;
                    title: string;
                    description: string | null;
                    duration_minutes: number;
                    total_score: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    course_id: string;
                    title: string;
                    description?: string | null;
                    duration_minutes: number;
                    total_score?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    course_id?: string;
                    title?: string;
                    description?: string | null;
                    duration_minutes?: number;
                    total_score?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            exam_attempts: {
                Row: {
                    id: string;
                    exam_id: string;
                    student_id: string;
                    score: number;
                    max_score: number;
                    completed_at: string;
                    time_taken_minutes: number | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    exam_id: string;
                    student_id: string;
                    score: number;
                    max_score: number;
                    completed_at?: string;
                    time_taken_minutes?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    exam_id?: string;
                    student_id?: string;
                    score?: number;
                    max_score?: number;
                    completed_at?: string;
                    time_taken_minutes?: number | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            exam_readiness_scores: {
                Row: {
                    id: string;
                    student_id: string;
                    course_id: string | null;
                    overall_score: number;
                    attendance_score: number | null;
                    assignment_score: number | null;
                    exam_score: number | null;
                    weak_areas: Json;
                    recommendations: Json;
                    calculated_at: string;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    student_id: string;
                    course_id?: string | null;
                    overall_score: number;
                    attendance_score?: number | null;
                    assignment_score?: number | null;
                    exam_score?: number | null;
                    weak_areas?: Json;
                    recommendations?: Json;
                    calculated_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    student_id?: string;
                    course_id?: string | null;
                    overall_score?: number;
                    attendance_score?: number | null;
                    assignment_score?: number | null;
                    exam_score?: number | null;
                    weak_areas?: Json;
                    recommendations?: Json;
                    calculated_at?: string;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {
            lesson_stats: {
                Row: {
                    lesson_id: string;
                    title: string;
                    start_date_time: string;
                    end_date_time: string;
                    status: LessonStatus;
                    course_title: string | null;
                    teacher_name: string | null;
                    present_count: number;
                    absent_count: number;
                    late_count: number;
                    total_students: number;
                    avg_duration_minutes: number | null;
                };
            };
            user_attendance_summary: {
                Row: {
                    user_id: string;
                    name: string;
                    email: string;
                    role: UserRole;
                    total_lessons: number;
                    lessons_attended: number;
                    lessons_missed: number;
                    lessons_late: number;
                    attendance_rate: number | null;
                };
            };
            teacher_performance: {
                Row: {
                    teacher_id: string;
                    teacher_name: string;
                    email: string;
                    courses_count: number;
                    total_lessons: number;
                    completed_lessons: number;
                    total_students: number;
                    avg_attendance_rate: number | null;
                };
            };
            dashboard_stats: {
                Row: {
                    total_students: number;
                    total_teachers: number;
                    total_courses: number;
                    total_lessons: number;
                    upcoming_lessons: number;
                    completed_lessons: number;
                    today_lessons: number;
                    this_week_lessons: number;
                    active_enrollments: number;
                };
            };
        };
        Functions: {};
        Enums: {
            user_role: UserRole;
            lesson_status: LessonStatus;
            attendance_status: AttendanceStatus;
            enrollment_status: EnrollmentStatus;
        };
    };
}
