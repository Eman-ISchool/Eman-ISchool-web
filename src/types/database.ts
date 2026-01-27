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

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent';
export type LessonStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending';
export type ReelStatus = 'queued' | 'processing' | 'pending_review' | 'approved' | 'rejected' | 'failed' | 'draft' | 'pending_review' | 'published' | 'unpublished' | 'deleted';

// AI Video Reels Pipeline types
export type SourceContentType = 'video' | 'document' | 'recording' | 'external_link';
export type SourceStatus = 'uploaded' | 'processing' | 'transcribing' | 'ready' | 'failed';
export type ProcessingJobStatus = 'pending' | 'processing' | 'paused' | 'completed' | 'failed';
export type ProcessingJobType = 'transcription' | 'segmentation' | 'generation';
export type VisibilityType = 'class' | 'grade_level' | 'group';
export type ExternalVideoProvider = 'youtube' | 'vimeo' | 'other';

// Notification system types
export type NotificationChannel = 'email' | 'push' | 'sms' | 'in_app';
export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
export type DigestFrequency = 'instant' | 'daily' | 'weekly';
export type NotificationType = 'class_reminder' | 'grade_update' | 'announcement' | 'cancellation' | 'assignment_due' | 'exam_reminder';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

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
            parent_children: {
                Row: {
                    id: string;
                    parent_id: string;
                    child_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    parent_id: string;
                    child_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    parent_id?: string;
                    child_id?: string;
                    created_at?: string;
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
            notification_preferences: {
                Row: {
                    id: string;
                    user_id: string;
                    email_enabled: boolean;
                    push_enabled: boolean;
                    sms_enabled: boolean;
                    in_app_enabled: boolean;
                    phone_number: string | null;
                    phone_verified: boolean;
                    digest_frequency: DigestFrequency;
                    quiet_hours_enabled: boolean;
                    quiet_hours_start: string | null;
                    quiet_hours_end: string | null;
                    timezone: string;
                    class_reminders_enabled: boolean;
                    grade_updates_enabled: boolean;
                    announcements_enabled: boolean;
                    cancellations_enabled: boolean;
                    unsubscribed_from_email: boolean;
                    unsubscribe_token: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    email_enabled?: boolean;
                    push_enabled?: boolean;
                    sms_enabled?: boolean;
                    in_app_enabled?: boolean;
                    phone_number?: string | null;
                    phone_verified?: boolean;
                    digest_frequency?: DigestFrequency;
                    quiet_hours_enabled?: boolean;
                    quiet_hours_start?: string | null;
                    quiet_hours_end?: string | null;
                    timezone?: string;
                    class_reminders_enabled?: boolean;
                    grade_updates_enabled?: boolean;
                    announcements_enabled?: boolean;
                    cancellations_enabled?: boolean;
                    unsubscribed_from_email?: boolean;
                    unsubscribe_token?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    email_enabled?: boolean;
                    push_enabled?: boolean;
                    sms_enabled?: boolean;
                    in_app_enabled?: boolean;
                    phone_number?: string | null;
                    phone_verified?: boolean;
                    digest_frequency?: DigestFrequency;
                    quiet_hours_enabled?: boolean;
                    quiet_hours_start?: string | null;
                    quiet_hours_end?: string | null;
                    timezone?: string;
                    class_reminders_enabled?: boolean;
                    grade_updates_enabled?: boolean;
                    announcements_enabled?: boolean;
                    cancellations_enabled?: boolean;
                    unsubscribed_from_email?: boolean;
                    unsubscribe_token?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            notification_queue: {
                Row: {
                    id: string;
                    user_id: string;
                    notification_type: NotificationType;
                    channel: NotificationChannel;
                    priority: NotificationPriority;
                    title: string;
                    body: string;
                    data: Json;
                    scheduled_for: string | null;
                    status: NotificationStatus;
                    sent_at: string | null;
                    delivered_at: string | null;
                    read_at: string | null;
                    error_message: string | null;
                    retry_count: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    user_id: string;
                    notification_type: NotificationType;
                    channel: NotificationChannel;
                    priority?: NotificationPriority;
                    title: string;
                    body: string;
                    data?: Json;
                    scheduled_for?: string | null;
                    status?: NotificationStatus;
                    sent_at?: string | null;
                    delivered_at?: string | null;
                    read_at?: string | null;
                    error_message?: string | null;
                    retry_count?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string;
                    notification_type?: NotificationType;
                    channel?: NotificationChannel;
                    priority?: NotificationPriority;
                    title?: string;
                    body?: string;
                    data?: Json;
                    scheduled_for?: string | null;
                    status?: NotificationStatus;
                    sent_at?: string | null;
                    delivered_at?: string | null;
                    read_at?: string | null;
                    error_message?: string | null;
                    retry_count?: number;
                    created_at?: string;
                    updated_at?: string;
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
            reels: {
                Row: {
                    id: string;
                    title_en: string;
                    title_ar: string;
                    description_en: string | null;
                    description_ar: string | null;
                    video_url: string;
                    thumbnail_url: string | null;
                    duration_seconds: number;
                    status: ReelStatus;
                    teacher_id: string;
                    lesson_id: string | null;
                    lesson_material_id: string | null;
                    subject: string | null;
                    grade_level: string | null;
                    generation_request_id: string | null;
                    is_published: boolean;
                    view_count: number;
                    source_id: string | null;
                    source_type: string | null;
                    segment_index: number | null;
                    segment_of: string | null;
                    storyboard_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title_en: string;
                    title_ar: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    video_url: string;
                    thumbnail_url?: string | null;
                    duration_seconds: number;
                    status?: ReelStatus;
                    teacher_id: string;
                    lesson_id?: string | null;
                    lesson_material_id?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    generation_request_id?: string | null;
                    is_published?: boolean;
                    view_count?: number;
                    source_id?: string | null;
                    source_type?: string | null;
                    segment_index?: number | null;
                    segment_of?: string | null;
                    storyboard_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title_en?: string;
                    title_ar?: string;
                    description_en?: string | null;
                    description_ar?: string | null;
                    video_url?: string;
                    thumbnail_url?: string | null;
                    duration_seconds?: number;
                    status?: ReelStatus;
                    teacher_id?: string;
                    lesson_id?: string | null;
                    lesson_material_id?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    generation_request_id?: string | null;
                    is_published?: boolean;
                    view_count?: number;
                    source_id?: string | null;
                    source_type?: string | null;
                    segment_index?: number | null;
                    segment_of?: string | null;
                    storyboard_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            reel_progress: {
                Row: {
                    id: string;
                    reel_id: string;
                    student_id: string;
                    watched_seconds: number;
                    is_completed: boolean;
                    is_saved: boolean;
                    last_watched_at: string;
                    is_bookmarked: boolean;
                    marked_understood: boolean;
                    understood_at: string | null;
                    replay_count: number;
                    last_position: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    reel_id: string;
                    student_id: string;
                    watched_seconds?: number;
                    is_completed?: boolean;
                    is_saved?: boolean;
                    last_watched_at?: string;
                    is_bookmarked?: boolean;
                    marked_understood?: boolean;
                    understood_at?: string | null;
                    replay_count?: number;
                    last_position?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    reel_id?: string;
                    student_id?: string;
                    watched_seconds?: number;
                    is_completed?: boolean;
                    is_saved?: boolean;
                    last_watched_at?: string;
                    is_bookmarked?: boolean;
                    marked_understood?: boolean;
                    understood_at?: string | null;
                    replay_count?: number;
                    last_position?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            generation_logs: {
                Row: {
                    id: string;
                    reel_id: string | null;
                    teacher_id: string;
                    lesson_id: string | null;
                    lesson_material_id: string | null;
                    action: string;
                    status: string;
                    error_message: string | null;
                    metadata: Json;
                    ip_address: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    reel_id?: string | null;
                    teacher_id: string;
                    lesson_id?: string | null;
                    lesson_material_id?: string | null;
                    action: string;
                    status: string;
                    error_message?: string | null;
                    metadata?: Json;
                    ip_address?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    reel_id?: string | null;
                    teacher_id?: string;
                    lesson_id?: string | null;
                    lesson_material_id?: string | null;
                    action?: string;
                    status?: string;
                    error_message?: string | null;
                    metadata?: Json;
                    ip_address?: string | null;
                    created_at?: string;
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
            source_content: {
                Row: {
                    id: string;
                    teacher_id: string;
                    type: SourceContentType;
                    file_url: string | null;
                    file_hash: string | null;
                    original_filename: string;
                    file_size: number | null;
                    mime_type: string | null;
                    duration_seconds: number | null;
                    page_count: number | null;
                    status: SourceStatus;
                    transcript_id: string | null;
                    metadata: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    teacher_id: string;
                    type: SourceContentType;
                    file_url?: string | null;
                    file_hash?: string | null;
                    original_filename: string;
                    file_size?: number | null;
                    mime_type?: string | null;
                    duration_seconds?: number | null;
                    page_count?: number | null;
                    status?: SourceStatus;
                    transcript_id?: string | null;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    teacher_id?: string;
                    type?: SourceContentType;
                    file_url?: string | null;
                    file_hash?: string | null;
                    original_filename?: string;
                    file_size?: number | null;
                    mime_type?: string | null;
                    duration_seconds?: number | null;
                    page_count?: number | null;
                    status?: SourceStatus;
                    transcript_id?: string | null;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            transcripts: {
                Row: {
                    id: string;
                    source_id: string;
                    text: string;
                    segments: Json;
                    language: string;
                    confidence: number | null;
                    word_count: number;
                    is_manual: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    source_id: string;
                    text: string;
                    segments: Json;
                    language: string;
                    confidence?: number | null;
                    word_count: number;
                    is_manual?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string;
                    text?: string;
                    segments?: Json;
                    language?: string;
                    confidence?: number | null;
                    word_count?: number;
                    is_manual?: boolean;
                    created_at?: string;
                };
            };
            storyboards: {
                Row: {
                    id: string;
                    source_id: string;
                    target_audience: string;
                    scenes: Json;
                    summary: string;
                    estimated_duration: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    source_id: string;
                    target_audience: string;
                    scenes: Json;
                    summary: string;
                    estimated_duration: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string;
                    target_audience?: string;
                    scenes?: Json;
                    summary?: string;
                    estimated_duration?: number;
                    created_at?: string;
                };
            };
            reel_visibility: {
                Row: {
                    id: string;
                    reel_id: string;
                    visibility_type: VisibilityType;
                    class_id: string | null;
                    grade_level: string | null;
                    group_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    reel_id: string;
                    visibility_type: VisibilityType;
                    class_id?: string | null;
                    grade_level?: string | null;
                    group_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    reel_id?: string;
                    visibility_type?: VisibilityType;
                    class_id?: string | null;
                    grade_level?: string | null;
                    group_id?: string | null;
                    created_at?: string;
                };
            };
            external_video_links: {
                Row: {
                    id: string;
                    reel_id: string;
                    provider: ExternalVideoProvider;
                    external_id: string;
                    url: string;
                    title: string | null;
                    thumbnail_url: string | null;
                    duration_seconds: number | null;
                    is_available: boolean;
                    last_checked_at: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    reel_id: string;
                    provider: ExternalVideoProvider;
                    external_id: string;
                    url: string;
                    title?: string | null;
                    thumbnail_url?: string | null;
                    duration_seconds?: number | null;
                    is_available?: boolean;
                    last_checked_at?: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    reel_id?: string;
                    provider?: ExternalVideoProvider;
                    external_id?: string;
                    url?: string;
                    title?: string | null;
                    thumbnail_url?: string | null;
                    duration_seconds?: number | null;
                    is_available?: boolean;
                    last_checked_at?: string;
                    created_at?: string;
                };
            };
            processing_jobs: {
                Row: {
                    id: string;
                    source_id: string;
                    type: ProcessingJobType;
                    status: ProcessingJobStatus;
                    current_step: string | null;
                    progress_percent: number;
                    error_message: string | null;
                    retry_count: number;
                    max_retries: number;
                    started_at: string | null;
                    completed_at: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    source_id: string;
                    type: ProcessingJobType;
                    status?: ProcessingJobStatus;
                    current_step?: string | null;
                    progress_percent?: number;
                    error_message?: string | null;
                    retry_count?: number;
                    max_retries?: number;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    source_id?: string;
                    type?: ProcessingJobType;
                    status?: ProcessingJobStatus;
                    current_step?: string | null;
                    progress_percent?: number;
                    error_message?: string | null;
                    retry_count?: number;
                    max_retries?: number;
                    started_at?: string | null;
                    completed_at?: string | null;
                    created_at?: string;
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
            reel_status: ReelStatus;
            source_content_type: SourceContentType;
            source_status: SourceStatus;
            processing_job_status: ProcessingJobStatus;
            processing_job_type: ProcessingJobType;
            visibility_type: VisibilityType;
            external_video_provider: ExternalVideoProvider;
        };
    };
}
