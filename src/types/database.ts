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

export type UserRole = 'student' | 'teacher' | 'admin' | 'parent' | 'supervisor';
export type LessonStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';
export type AssignmentStatus = 'open' | 'closed';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'early_exit';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped' | 'pending' | 'payment_pending' | 'payment_completed' | 'rejected';
export type ApplicationStatus = 'pending' | 'payment_pending' | 'payment_completed' | 'approved' | 'rejected';
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded';
export type OrderType = 'enrollment' | 'invoice_request' | 'support' | 'class_change' | 'refund' | 'general';
export type OrderStatus = 'pending' | 'processing' | 'resolved' | 'rejected' | 'cancelled';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'enrollment' | 'general';
export type MaterialType = 'file' | 'link' | 'book' | 'image' | 'video';
export type DiscountType = 'sibling' | 'coupon' | 'promotional';
export type MeetingStatus = 'created' | 'active' | 'ended';
export type ReelStatus = 'queued' | 'processing' | 'pending_review' | 'approved' | 'rejected' | 'failed' | 'draft' | 'published' | 'unpublished' | 'deleted';

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
                    password_hash: string | null;
                    image: string | null;
                    role: UserRole;
                    google_id: string | null;
                    phone: string | null;
                    bio: string | null;
                    is_active: boolean;
                    email_verified: boolean;
                    stripe_customer_id: string | null;
                    last_login: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    email: string;
                    name: string;
                    password_hash?: string | null;
                    image?: string | null;
                    role?: UserRole;
                    google_id?: string | null;
                    phone?: string | null;
                    bio?: string | null;
                    is_active?: boolean;
                    email_verified?: boolean;
                    stripe_customer_id?: string | null;
                    last_login?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    name?: string;
                    password_hash?: string | null;
                    image?: string | null;
                    role?: UserRole;
                    google_id?: string | null;
                    phone?: string | null;
                    bio?: string | null;
                    is_active?: boolean;
                    email_verified?: boolean;
                    stripe_customer_id?: string | null;
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
                    currency: string;
                    duration_hours: number | null;
                    image_url: string | null;
                    thumbnail_url: string | null;
                    subject_id: string | null;
                    subject: string | null;
                    grade_level: string | null;
                    grade_id: string | null;
                    teacher_id: string | null;
                    is_published: boolean;
                    max_students: number;
                    enrollment_type: string;
                    subscription_interval: string | null;
                    stripe_price_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description?: string | null;
                    price?: number;
                    currency?: string;
                    duration_hours?: number | null;
                    image_url?: string | null;
                    thumbnail_url?: string | null;
                    subject_id?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    grade_id?: string | null;
                    teacher_id?: string | null;
                    is_published?: boolean;
                    max_students?: number;
                    enrollment_type?: string;
                    subscription_interval?: string | null;
                    stripe_price_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string | null;
                    price?: number;
                    currency?: string;
                    duration_hours?: number | null;
                    image_url?: string | null;
                    thumbnail_url?: string | null;
                    subject_id?: string | null;
                    subject?: string | null;
                    grade_level?: string | null;
                    grade_id?: string | null;
                    teacher_id?: string | null;
                    is_published?: boolean;
                    max_students?: number;
                    enrollment_type?: string;
                    subscription_interval?: string | null;
                    stripe_price_id?: string | null;
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
                    recurrence: string;
                    recurrence_end_date: string | null;
                    meet_link: string | null;
                    meeting_title: string | null;
                    meeting_provider: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
                    meeting_duration_min: number | null;
                    google_event_id: string | null;
                    google_calendar_link: string | null;
                    status: LessonStatus;
                    course_id: string | null;
                    teacher_id: string | null;
                    recording_url: string | null;
                    recording_drive_file_id: string | null;
                    recording_drive_view_link: string | null;
                    recording_started_at: string | null;
                    recording_ended_at: string | null;
                    sort_order: number;
                    image_url: string | null;
                    notes: string | null;
                    teacher_notes: string | null;
                    cancellation_reason: string | null;
                    rescheduled_from: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    subject_id?: string | null;
                    start_date_time: string;
                    end_date_time: string;
                    recurrence?: string;
                    recurrence_end_date?: string | null;
                    meet_link?: string | null;
                    meeting_title?: string | null;
                    meeting_provider?: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
                    meeting_duration_min?: number | null;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: LessonStatus;
                    course_id?: string | null;
                    teacher_id?: string | null;
                    recording_url?: string | null;
                    recording_drive_file_id?: string | null;
                    recording_drive_view_link?: string | null;
                    recording_started_at?: string | null;
                    recording_ended_at?: string | null;
                    sort_order?: number;
                    image_url?: string | null;
                    notes?: string | null;
                    teacher_notes?: string | null;
                    cancellation_reason?: string | null;
                    rescheduled_from?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    subject_id?: string | null;
                    start_date_time?: string;
                    end_date_time?: string;
                    recurrence?: string;
                    recurrence_end_date?: string | null;
                    meet_link?: string | null;
                    meeting_title?: string | null;
                    meeting_provider?: 'google_meet' | 'zoom' | 'teams' | 'other' | null;
                    meeting_duration_min?: number | null;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: LessonStatus;
                    course_id?: string | null;
                    teacher_id?: string | null;
                    recording_url?: string | null;
                    recording_drive_file_id?: string | null;
                    recording_drive_view_link?: string | null;
                    recording_started_at?: string | null;
                    recording_ended_at?: string | null;
                    sort_order?: number;
                    image_url?: string | null;
                    notes?: string | null;
                    teacher_notes?: string | null;
                    cancellation_reason?: string | null;
                    rescheduled_from?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            attendance: {
                Row: {
                    id: string;
                    lesson_id: string;
                    student_id: string;
                    status: AttendanceStatus;
                    join_time: string | null;
                    leave_time: string | null;
                    duration_seconds: number | null;
                    attendance_status: AttendanceStatus | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    lesson_id: string;
                    student_id: string;
                    status?: AttendanceStatus;
                    join_time?: string | null;
                    leave_time?: string | null;
                    duration_seconds?: number | null;
                    attendance_status?: AttendanceStatus | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    lesson_id?: string;
                    student_id?: string;
                    status?: AttendanceStatus;
                    join_time?: string | null;
                    leave_time?: string | null;
                    duration_seconds?: number | null;
                    attendance_status?: AttendanceStatus | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assessments: {
                Row: {
                    id: string;
                    teacher_id: string;
                    course_id: string | null;
                    subject_id: string | null;
                    lesson_id: string | null;
                    title: string;
                    short_description: string | null;
                    long_description: string | null;
                    image_url: string | null;
                    duration_minutes: number | null;
                    is_published: boolean;
                    assessment_type: string | null;
                    attempt_limit: number | null;
                    late_submissions_allowed: boolean | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    teacher_id: string;
                    course_id?: string | null;
                    subject_id?: string | null;
                    lesson_id?: string | null;
                    title: string;
                    short_description?: string | null;
                    long_description?: string | null;
                    image_url?: string | null;
                    duration_minutes?: number | null;
                    is_published?: boolean;
                    assessment_type?: string | null;
                    attempt_limit?: number | null;
                    late_submissions_allowed?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    teacher_id?: string;
                    course_id?: string | null;
                    subject_id?: string | null;
                    lesson_id?: string | null;
                    title?: string;
                    short_description?: string | null;
                    long_description?: string | null;
                    image_url?: string | null;
                    duration_minutes?: number | null;
                    is_published?: boolean;
                    assessment_type?: string | null;
                    attempt_limit?: number | null;
                    late_submissions_allowed?: boolean | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            grades: {
                Row: {
                    id: string;
                    name: string;
                    name_en: string | null;
                    slug: string;
                    sort_order: number;
                    is_active: boolean;
                    supervisor_id: string | null;
                    description: string | null;
                    image_url: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    name_en?: string | null;
                    slug: string;
                    sort_order?: number;
                    is_active?: boolean;
                    supervisor_id?: string | null;
                    description?: string | null;
                    image_url?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    name_en?: string | null;
                    slug?: string;
                    sort_order?: number;
                    is_active?: boolean;
                    supervisor_id?: string | null;
                    description?: string | null;
                    image_url?: string | null;
                    created_at?: string;
                };
            };
            subjects: {
                Row: {
                    id: string;
                    title: string;
                    slug: string;
                    description: string | null;
                    teacher_id: string | null;
                    image_url: string | null;
                    sort_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    slug: string;
                    description?: string | null;
                    teacher_id?: string | null;
                    image_url?: string | null;
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    slug?: string;
                    description?: string | null;
                    teacher_id?: string | null;
                    image_url?: string | null;
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            materials: {
                Row: {
                    id: string;
                    title: string;
                    description: string | null;
                    type: MaterialType;
                    file_url: string | null;
                    file_name: string | null;
                    file_size: number | null;
                    file_mime_type: string | null;
                    external_url: string | null;
                    subject_id: string | null;
                    lesson_id: string | null;
                    course_id: string;
                    uploaded_by: string;
                    sort_order: number;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    title: string;
                    description?: string | null;
                    type: MaterialType;
                    file_url?: string | null;
                    file_name?: string | null;
                    file_size?: number | null;
                    file_mime_type?: string | null;
                    external_url?: string | null;
                    subject_id?: string | null;
                    lesson_id?: string | null;
                    course_id: string;
                    uploaded_by: string;
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    title?: string;
                    description?: string | null;
                    type?: MaterialType;
                    file_url?: string | null;
                    file_name?: string | null;
                    file_size?: number | null;
                    file_mime_type?: string | null;
                    external_url?: string | null;
                    subject_id?: string | null;
                    lesson_id?: string | null;
                    course_id?: string;
                    uploaded_by?: string;
                    sort_order?: number;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            meetings: {
                Row: {
                    id: string;
                    lesson_id: string;
                    meet_link: string;
                    google_event_id: string | null;
                    google_calendar_link: string | null;
                    status: MeetingStatus;
                    started_at: string | null;
                    ended_at: string | null;
                    recording_drive_file_id: string | null;
                    recording_drive_view_link: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    lesson_id: string;
                    meet_link: string;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: MeetingStatus;
                    started_at?: string | null;
                    ended_at?: string | null;
                    recording_drive_file_id?: string | null;
                    recording_drive_view_link?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    lesson_id?: string;
                    meet_link?: string;
                    google_event_id?: string | null;
                    google_calendar_link?: string | null;
                    status?: MeetingStatus;
                    started_at?: string | null;
                    ended_at?: string | null;
                    recording_drive_file_id?: string | null;
                    recording_drive_view_link?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            invoices: {
                Row: {
                    id: string;
                    invoice_number: string;
                    parent_id: string;
                    stripe_invoice_id: string | null;
                    status: InvoiceStatus;
                    subtotal: number;
                    discount_amount: number;
                    tax_amount: number;
                    total: number;
                    currency: string;
                    due_date: string | null;
                    paid_at: string | null;
                    notes: string | null;
                    pdf_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    invoice_number: string;
                    parent_id: string;
                    stripe_invoice_id?: string | null;
                    status?: InvoiceStatus;
                    subtotal?: number;
                    discount_amount?: number;
                    tax_amount?: number;
                    total?: number;
                    currency?: string;
                    due_date?: string | null;
                    paid_at?: string | null;
                    notes?: string | null;
                    pdf_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    invoice_number?: string;
                    parent_id?: string;
                    stripe_invoice_id?: string | null;
                    status?: InvoiceStatus;
                    subtotal?: number;
                    discount_amount?: number;
                    tax_amount?: number;
                    total?: number;
                    currency?: string;
                    due_date?: string | null;
                    paid_at?: string | null;
                    notes?: string | null;
                    pdf_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            invoice_items: {
                Row: {
                    id: string;
                    invoice_id: string;
                    description: string;
                    student_id: string | null;
                    course_id: string | null;
                    enrollment_id: string | null;
                    quantity: number;
                    unit_price: number;
                    discount_percent: number;
                    discount_amount: number;
                    total: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    invoice_id: string;
                    description: string;
                    student_id?: string | null;
                    course_id?: string | null;
                    enrollment_id?: string | null;
                    quantity?: number;
                    unit_price: number;
                    discount_percent?: number;
                    discount_amount?: number;
                    total: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    invoice_id?: string;
                    description?: string;
                    student_id?: string | null;
                    course_id?: string | null;
                    enrollment_id?: string | null;
                    quantity?: number;
                    unit_price?: number;
                    discount_percent?: number;
                    discount_amount?: number;
                    total?: number;
                    created_at?: string;
                };
            };
            payments: {
                Row: {
                    id: string;
                    invoice_id: string | null;
                    parent_id: string;
                    stripe_payment_intent_id: string | null;
                    stripe_checkout_session_id: string | null;
                    amount: number;
                    currency: string;
                    status: PaymentStatus;
                    payment_method: string | null;
                    failure_reason: string | null;
                    refund_amount: number;
                    refund_reason: string | null;
                    metadata: Json;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    invoice_id?: string | null;
                    parent_id: string;
                    stripe_payment_intent_id?: string | null;
                    stripe_checkout_session_id?: string | null;
                    amount: number;
                    currency?: string;
                    status?: PaymentStatus;
                    payment_method?: string | null;
                    failure_reason?: string | null;
                    refund_amount?: number;
                    refund_reason?: string | null;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    invoice_id?: string | null;
                    parent_id?: string;
                    stripe_payment_intent_id?: string | null;
                    stripe_checkout_session_id?: string | null;
                    amount?: number;
                    currency?: string;
                    status?: PaymentStatus;
                    payment_method?: string | null;
                    failure_reason?: string | null;
                    refund_amount?: number;
                    refund_reason?: string | null;
                    metadata?: Json;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            payment_status_history: {
                Row: {
                    id: string;
                    payment_id: string;
                    old_status: string | null;
                    new_status: string;
                    changed_by: string | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    payment_id: string;
                    old_status?: string | null;
                    new_status: string;
                    changed_by?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    payment_id?: string;
                    old_status?: string | null;
                    new_status?: string;
                    changed_by?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
            };
            discounts: {
                Row: {
                    id: string;
                    name: string;
                    type: DiscountType;
                    discount_type: string;
                    value: number;
                    min_siblings: number;
                    max_uses: number | null;
                    used_count: number;
                    is_active: boolean;
                    valid_from: string | null;
                    valid_until: string | null;
                    created_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    type: DiscountType;
                    discount_type: string;
                    value: number;
                    min_siblings?: number;
                    max_uses?: number | null;
                    used_count?: number;
                    is_active?: boolean;
                    valid_from?: string | null;
                    valid_until?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    type?: DiscountType;
                    discount_type?: string;
                    value?: number;
                    min_siblings?: number;
                    max_uses?: number | null;
                    used_count?: number;
                    is_active?: boolean;
                    valid_from?: string | null;
                    valid_until?: string | null;
                    created_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            orders: {
                Row: {
                    id: string;
                    order_number: string;
                    user_id: string;
                    type: OrderType;
                    status: OrderStatus;
                    title: string;
                    description: string | null;
                    metadata: Json;
                    resolved_at: string | null;
                    resolved_by: string | null;
                    resolution_notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    order_number: string;
                    user_id: string;
                    type: OrderType;
                    status?: OrderStatus;
                    title: string;
                    description?: string | null;
                    metadata?: Json;
                    resolved_at?: string | null;
                    resolved_by?: string | null;
                    resolution_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    order_number?: string;
                    user_id?: string;
                    type?: OrderType;
                    status?: OrderStatus;
                    title?: string;
                    description?: string | null;
                    metadata?: Json;
                    resolved_at?: string | null;
                    resolved_by?: string | null;
                    resolution_notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            support_tickets: {
                Row: {
                    id: string;
                    ticket_number: string;
                    user_id: string;
                    category: TicketCategory;
                    subject: string;
                    status: TicketStatus;
                    priority: TicketPriority;
                    assigned_to: string | null;
                    resolved_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    ticket_number: string;
                    user_id: string;
                    category: TicketCategory;
                    subject: string;
                    status?: TicketStatus;
                    priority?: TicketPriority;
                    assigned_to?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    ticket_number?: string;
                    user_id?: string;
                    category?: TicketCategory;
                    subject?: string;
                    status?: TicketStatus;
                    priority?: TicketPriority;
                    assigned_to?: string | null;
                    resolved_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assessment_questions: {
                Row: {
                    id: string;
                    assessment_id: string;
                    question_type: string;
                    question_text: string;
                    image_url: string | null;
                    is_mandatory: boolean;
                    options_json: Json | null;
                    points: number;
                    sort_order: number;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    assessment_id: string;
                    question_type: string;
                    question_text: string;
                    image_url?: string | null;
                    is_mandatory?: boolean;
                    options_json?: Json | null;
                    points?: number;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    assessment_id?: string;
                    question_type?: string;
                    question_text?: string;
                    image_url?: string | null;
                    is_mandatory?: boolean;
                    options_json?: Json | null;
                    points?: number;
                    sort_order?: number;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assessment_submissions: {
                Row: {
                    id: string;
                    assessment_id: string;
                    student_id: string;
                    status: string;
                    started_at: string;
                    submitted_at: string | null;
                    time_taken_minutes: number | null;
                    total_score: number | null;
                    max_score: number | null;
                    manual_grading_required: boolean;
                    teacher_feedback: string | null;
                    file_url: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    assessment_id: string;
                    student_id: string;
                    status?: string;
                    started_at?: string;
                    submitted_at?: string | null;
                    time_taken_minutes?: number | null;
                    total_score?: number | null;
                    max_score?: number | null;
                    manual_grading_required?: boolean;
                    teacher_feedback?: string | null;
                    file_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    assessment_id?: string;
                    student_id?: string;
                    status?: string;
                    started_at?: string;
                    submitted_at?: string | null;
                    time_taken_minutes?: number | null;
                    total_score?: number | null;
                    max_score?: number | null;
                    manual_grading_required?: boolean;
                    teacher_feedback?: string | null;
                    file_url?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            assessment_answers: {
                Row: {
                    id: string;
                    submission_id: string;
                    question_id: string;
                    student_id: string;
                    text_answer: string | null;
                    selected_option_index: number | null;
                    file_url: string | null;
                    is_correct: boolean | null;
                    points_awarded: number | null;
                    teacher_feedback: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    submission_id: string;
                    question_id: string;
                    student_id: string;
                    text_answer?: string | null;
                    selected_option_index?: number | null;
                    file_url?: string | null;
                    is_correct?: boolean | null;
                    points_awarded?: number | null;
                    teacher_feedback?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    submission_id?: string;
                    question_id?: string;
                    student_id?: string;
                    text_answer?: string | null;
                    selected_option_index?: number | null;
                    file_url?: string | null;
                    is_correct?: boolean | null;
                    points_awarded?: number | null;
                    teacher_feedback?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            ticket_messages: {
                Row: {
                    id: string;
                    ticket_id: string;
                    sender_id: string;
                    message: string;
                    attachments: Json;
                    is_internal: boolean;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    ticket_id: string;
                    sender_id: string;
                    message: string;
                    attachments?: Json;
                    is_internal?: boolean;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    ticket_id?: string;
                    sender_id?: string;
                    message?: string;
                    attachments?: Json;
                    is_internal?: boolean;
                    created_at?: string;
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
            enrollments: {
                Row: {
                    id: string;
                    student_id: string;
                    course_id: string;
                    status: EnrollmentStatus;
                    enrollment_date: string;
                    start_date: string | null;
                    end_date: string | null;
                    grade_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    student_id: string;
                    course_id: string;
                    status?: EnrollmentStatus;
                    enrollment_date?: string;
                    start_date?: string | null;
                    end_date?: string | null;
                    grade_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    student_id?: string;
                    course_id?: string;
                    status?: EnrollmentStatus;
                    enrollment_date?: string;
                    start_date?: string | null;
                    end_date?: string | null;
                    grade_id?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            enrollment_applications: {
                Row: {
                    id: string;
                    parent_id: string;
                    student_id: string;
                    grade_id: string | null;
                    course_id: string | null;
                    status: ApplicationStatus;
                    submitted_at: string;
                    reviewed_at: string | null;
                    reviewed_by: string | null;
                    notes: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    parent_id: string;
                    student_id: string;
                    grade_id?: string | null;
                    course_id?: string | null;
                    status?: ApplicationStatus;
                    submitted_at?: string;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    parent_id?: string;
                    student_id?: string;
                    grade_id?: string | null;
                    course_id?: string | null;
                    status?: ApplicationStatus;
                    submitted_at?: string;
                    reviewed_at?: string | null;
                    reviewed_by?: string | null;
                    notes?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
            student_performance: {
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
            // ── Enrollment System v2 tables ──────────────────────
            enrollment_applications_v2: {
                Row: {
                    id: string;
                    application_number: string;
                    parent_user_id: string;
                    academic_year: string;
                    status: string;
                    completeness_score: number;
                    current_step: number;
                    steps_completed: Json;
                    submitted_at: string | null;
                    assigned_reviewer_id: string | null;
                    reviewed_at: string | null;
                    review_decision: string | null;
                    activated_at: string | null;
                    linked_student_user_id: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    application_number?: string;
                    parent_user_id: string;
                    academic_year: string;
                    status?: string;
                    completeness_score?: number;
                    current_step?: number;
                    steps_completed?: Json;
                    submitted_at?: string | null;
                    assigned_reviewer_id?: string | null;
                    reviewed_at?: string | null;
                    review_decision?: string | null;
                    activated_at?: string | null;
                    linked_student_user_id?: string | null;
                };
                Update: {
                    status?: string;
                    completeness_score?: number;
                    current_step?: number;
                    steps_completed?: Json;
                    submitted_at?: string | null;
                    assigned_reviewer_id?: string | null;
                    reviewed_at?: string | null;
                    review_decision?: string | null;
                    activated_at?: string | null;
                    linked_student_user_id?: string | null;
                    updated_at?: string;
                };
            };
            enrollment_student_details: {
                Row: { id: string; application_id: string; full_name_en: string | null; full_name_ar: string | null; date_of_birth: string | null; gender: string | null; nationality: string | null; religion: string | null; mother_tongue: string | null; place_of_birth: string | null; secondary_nationality: string | null; preferred_language: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; full_name_en?: string | null; full_name_ar?: string | null; date_of_birth?: string | null; gender?: string | null; nationality?: string | null; religion?: string | null; mother_tongue?: string | null; place_of_birth?: string | null; secondary_nationality?: string | null; preferred_language?: string | null; };
                Update: { full_name_en?: string | null; full_name_ar?: string | null; date_of_birth?: string | null; gender?: string | null; nationality?: string | null; religion?: string | null; mother_tongue?: string | null; place_of_birth?: string | null; secondary_nationality?: string | null; preferred_language?: string | null; };
            };
            enrollment_academic_details: {
                Row: { id: string; application_id: string; enrollment_type: string | null; applying_grade_id: string | null; applying_grade_name: string | null; academic_year: string | null; curriculum: string | null; previous_school_name: string | null; previous_school_country: string | null; previous_school_emirate: string | null; previous_grade_completed: string | null; is_mid_year_transfer: boolean; transfer_source: string | null; last_report_card_year: string | null; transcript_available: boolean; transfer_certificate_available: boolean; transfer_reason: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; enrollment_type?: string | null; applying_grade_id?: string | null; applying_grade_name?: string | null; academic_year?: string | null; curriculum?: string | null; previous_school_name?: string | null; previous_school_country?: string | null; previous_school_emirate?: string | null; previous_grade_completed?: string | null; is_mid_year_transfer?: boolean; transfer_source?: string | null; last_report_card_year?: string | null; transcript_available?: boolean; transfer_certificate_available?: boolean; transfer_reason?: string | null; };
                Update: { enrollment_type?: string | null; applying_grade_id?: string | null; applying_grade_name?: string | null; academic_year?: string | null; curriculum?: string | null; previous_school_name?: string | null; previous_school_country?: string | null; previous_school_emirate?: string | null; previous_grade_completed?: string | null; is_mid_year_transfer?: boolean; transfer_source?: string | null; last_report_card_year?: string | null; transcript_available?: boolean; transfer_certificate_available?: boolean; transfer_reason?: string | null; };
            };
            enrollment_guardian_details: {
                Row: { id: string; application_id: string; contact_type: string; relationship: string | null; full_name_en: string | null; full_name_ar: string | null; mobile: string | null; email: string | null; uae_address: string | null; emirate: string | null; area_city_district: string | null; emirates_id_number: string | null; passport_number: string | null; visa_number: string | null; is_legal_guardian: boolean; custody_case: boolean; guardian_authorization_notes: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; contact_type?: string; relationship?: string | null; full_name_en?: string | null; full_name_ar?: string | null; mobile?: string | null; email?: string | null; uae_address?: string | null; emirate?: string | null; area_city_district?: string | null; emirates_id_number?: string | null; passport_number?: string | null; visa_number?: string | null; is_legal_guardian?: boolean; custody_case?: boolean; guardian_authorization_notes?: string | null; };
                Update: { contact_type?: string; relationship?: string | null; full_name_en?: string | null; full_name_ar?: string | null; mobile?: string | null; email?: string | null; uae_address?: string | null; emirate?: string | null; area_city_district?: string | null; emirates_id_number?: string | null; passport_number?: string | null; visa_number?: string | null; is_legal_guardian?: boolean; custody_case?: boolean; guardian_authorization_notes?: string | null; };
            };
            enrollment_identity_details: {
                Row: { id: string; application_id: string; emirates_id_available: boolean; emirates_id_number: string | null; student_passport_number: string | null; student_passport_expiry: string | null; residence_visa_number: string | null; residence_visa_expiry: string | null; residency_status: string | null; country_of_residence: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; emirates_id_available?: boolean; emirates_id_number?: string | null; student_passport_number?: string | null; student_passport_expiry?: string | null; residence_visa_number?: string | null; residence_visa_expiry?: string | null; residency_status?: string | null; country_of_residence?: string | null; };
                Update: { emirates_id_available?: boolean; emirates_id_number?: string | null; student_passport_number?: string | null; student_passport_expiry?: string | null; residence_visa_number?: string | null; residence_visa_expiry?: string | null; residency_status?: string | null; country_of_residence?: string | null; };
            };
            enrollment_medical_details: {
                Row: { id: string; application_id: string; has_medical_condition: boolean; medical_condition_details: string | null; has_sen: boolean; sen_details: string | null; vaccination_record_available: boolean; allergies: string | null; medication_notes: string | null; health_notes: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; has_medical_condition?: boolean; medical_condition_details?: string | null; has_sen?: boolean; sen_details?: string | null; vaccination_record_available?: boolean; allergies?: string | null; medication_notes?: string | null; health_notes?: string | null; };
                Update: { has_medical_condition?: boolean; medical_condition_details?: string | null; has_sen?: boolean; sen_details?: string | null; vaccination_record_available?: boolean; allergies?: string | null; medication_notes?: string | null; health_notes?: string | null; };
            };
            enrollment_documents: {
                Row: { id: string; application_id: string; document_type: string; label: string | null; is_required: boolean; is_conditional: boolean; condition_rule: string | null; file_url: string | null; file_name: string | null; file_size: number | null; file_mime_type: string | null; storage_path: string | null; status: string; reviewed_by: string | null; reviewed_at: string | null; rejection_reason: string | null; issuing_country: string | null; document_language: string | null; attestation_required: boolean; attestation_status: string; translation_required: boolean; translation_status: string; translation_document_id: string | null; upload_count: number; last_uploaded_at: string | null; expiry_date: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; document_type: string; label?: string | null; is_required?: boolean; is_conditional?: boolean; condition_rule?: string | null; file_url?: string | null; file_name?: string | null; file_size?: number | null; file_mime_type?: string | null; storage_path?: string | null; status?: string; reviewed_by?: string | null; reviewed_at?: string | null; rejection_reason?: string | null; issuing_country?: string | null; document_language?: string | null; attestation_required?: boolean; attestation_status?: string; translation_required?: boolean; translation_status?: string; translation_document_id?: string | null; upload_count?: number; last_uploaded_at?: string | null; expiry_date?: string | null; };
                Update: { status?: string; reviewed_by?: string | null; reviewed_at?: string | null; rejection_reason?: string | null; issuing_country?: string | null; document_language?: string | null; attestation_required?: boolean; attestation_status?: string; translation_required?: boolean; translation_status?: string; translation_document_id?: string | null; file_url?: string | null; file_name?: string | null; file_size?: number | null; file_mime_type?: string | null; storage_path?: string | null; upload_count?: number; last_uploaded_at?: string | null; expiry_date?: string | null; };
            };
            enrollment_status_history: {
                Row: { id: string; application_id: string; previous_status: string | null; new_status: string; changed_by: string | null; reason: string | null; notes: string | null; created_at: string; };
                Insert: { application_id: string; previous_status?: string | null; new_status: string; changed_by?: string | null; reason?: string | null; notes?: string | null; };
                Update: never;
            };
            enrollment_review_notes: {
                Row: { id: string; application_id: string; author_id: string; note_type: string; content: string; is_visible_to_parent: boolean; created_at: string; };
                Insert: { application_id: string; author_id: string; note_type?: string; content: string; is_visible_to_parent?: boolean; };
                Update: never;
            };
            student_onboarding_tasks: {
                Row: { id: string; application_id: string; student_user_id: string | null; task_key: string; title_en: string; title_ar: string; description_en: string | null; description_ar: string | null; is_required: boolean; is_completed: boolean; completed_at: string | null; completed_by: string | null; sort_order: number; due_date: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; student_user_id?: string | null; task_key: string; title_en: string; title_ar: string; description_en?: string | null; description_ar?: string | null; is_required?: boolean; is_completed?: boolean; completed_at?: string | null; completed_by?: string | null; sort_order?: number; due_date?: string | null; };
                Update: { is_completed?: boolean; completed_at?: string | null; completed_by?: string | null; sort_order?: number; due_date?: string | null; };
            };
            enrollment_audit_log: {
                Row: { id: string; application_id: string | null; document_id: string | null; actor_id: string | null; action: string; target_entity: string; target_id: string | null; previous_state: Json | null; new_state: Json | null; reason: string | null; created_at: string; };
                Insert: { application_id?: string | null; document_id?: string | null; actor_id?: string | null; action: string; target_entity: string; target_id?: string | null; previous_state?: Json | null; new_state?: Json | null; reason?: string | null; };
                Update: never;
            };
            enrollment_declarations: {
                Row: { id: string; application_id: string; info_correct: boolean; docs_authentic: boolean; accepts_verification: boolean; acknowledges_attestation: boolean; acknowledges_missing_delays: boolean; privacy_policy_accepted: boolean; medical_emergency_consent: boolean | null; communications_consent: boolean | null; marketing_consent: boolean | null; digital_platform_consent: boolean | null; declared_at: string | null; created_at: string; updated_at: string; };
                Insert: { application_id: string; info_correct?: boolean; docs_authentic?: boolean; accepts_verification?: boolean; acknowledges_attestation?: boolean; acknowledges_missing_delays?: boolean; privacy_policy_accepted?: boolean; medical_emergency_consent?: boolean | null; communications_consent?: boolean | null; marketing_consent?: boolean | null; digital_platform_consent?: boolean | null; declared_at?: string | null; };
                Update: { info_correct?: boolean; docs_authentic?: boolean; accepts_verification?: boolean; acknowledges_attestation?: boolean; acknowledges_missing_delays?: boolean; privacy_policy_accepted?: boolean; medical_emergency_consent?: boolean | null; communications_consent?: boolean | null; marketing_consent?: boolean | null; digital_platform_consent?: boolean | null; declared_at?: string | null; };
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
