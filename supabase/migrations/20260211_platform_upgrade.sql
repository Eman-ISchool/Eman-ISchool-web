-- ============================================
-- EDUVERSE PLATFORM UPGRADE MIGRATION
-- Phase 1: Parent role, Payments, Invoicing, Support, Orders
-- Date: 2026-02-11
-- ============================================

-- ============================================
-- 1. UPDATE ENUMS
-- ============================================

-- Add 'parent' to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'parent';

-- Update enrollment_status to include new statuses
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'payment_pending';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'payment_completed';
ALTER TYPE enrollment_status ADD VALUE IF NOT EXISTS 'rejected';

-- ============================================
-- 2. ALTER EXISTING TABLES
-- ============================================

-- Users: add password_hash, email_verified, stripe_customer_id
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Courses: add currency, grade_id, enrollment_type, subscription_interval, stripe_price_id
ALTER TABLE courses ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS grade_id UUID;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_type TEXT DEFAULT 'one_time';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS subscription_interval TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Lessons: add subject_id, recurrence fields, recording Drive fields, sort_order, image_url
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'none';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recurrence_end_date DATE;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recording_drive_file_id TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recording_drive_view_link TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recording_started_at TIMESTAMPTZ;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS recording_ended_at TIMESTAMPTZ;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Enrollments: add parent_id, approved_at, approved_by, rejection_reason
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS parent_id UUID;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- ============================================
-- 3. NEW TABLES
-- ============================================

-- Grades Table
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    name_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Parent-Student relationship
CREATE TABLE IF NOT EXISTS parent_student (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    relationship TEXT DEFAULT 'parent',
    is_primary BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- Materials Table
CREATE TABLE IF NOT EXISTS materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL,                         -- file, link, book, image, video
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_mime_type TEXT,
    external_url TEXT,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meetings Table (structured Meet tracking)
CREATE TABLE IF NOT EXISTS meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    meet_link TEXT NOT NULL,
    google_event_id TEXT,
    google_calendar_link TEXT,
    status TEXT DEFAULT 'created',              -- created, active, ended
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    recording_drive_file_id TEXT,
    recording_drive_view_link TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT UNIQUE NOT NULL,
    parent_id UUID NOT NULL REFERENCES users(id),
    stripe_invoice_id TEXT UNIQUE,
    status TEXT DEFAULT 'draft',                -- draft, pending, paid, overdue, cancelled, refunded
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    due_date DATE,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    student_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    enrollment_id UUID REFERENCES enrollments(id),
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES invoices(id),
    parent_id UUID NOT NULL REFERENCES users(id),
    stripe_payment_intent_id TEXT UNIQUE,
    stripe_checkout_session_id TEXT UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status TEXT DEFAULT 'pending',              -- pending, succeeded, failed, refunded, partially_refunded
    payment_method TEXT,
    failure_reason TEXT,
    refund_amount DECIMAL(10,2) DEFAULT 0,
    refund_reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Status History
CREATE TABLE IF NOT EXISTS payment_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,                            -- 'system', 'stripe_webhook', user_id
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL,                         -- sibling, coupon, promotional
    discount_type TEXT NOT NULL,                -- percentage, fixed
    value DECIMAL(10,2) NOT NULL,
    min_siblings INTEGER DEFAULT 2,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    valid_from DATE,
    valid_until DATE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders Table (Parent/Student requests)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,                         -- enrollment, invoice_request, support, class_change, refund, general
    status TEXT DEFAULT 'pending',              -- pending, processing, resolved, rejected, cancelled
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    category TEXT NOT NULL,                     -- technical, billing, enrollment, general
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',                 -- open, in_progress, waiting_user, resolved, closed
    priority TEXT DEFAULT 'medium',             -- low, medium, high, urgent
    assigned_to UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Messages Table
CREATE TABLE IF NOT EXISTS ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_internal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. ADD FOREIGN KEY CONSTRAINTS for altered columns
-- ============================================

-- courses.grade_id FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'courses_grade_id_fkey'
    ) THEN
        ALTER TABLE courses ADD CONSTRAINT courses_grade_id_fkey
            FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL;
    END IF;
END $$;

-- lessons.subject_id FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'lessons_subject_id_fkey'
    ) THEN
        ALTER TABLE lessons ADD CONSTRAINT lessons_subject_id_fkey
            FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- enrollments.parent_id FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'enrollments_parent_id_fkey'
    ) THEN
        ALTER TABLE enrollments ADD CONSTRAINT enrollments_parent_id_fkey
            FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- enrollments.approved_by FK
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'enrollments_approved_by_fkey'
    ) THEN
        ALTER TABLE enrollments ADD CONSTRAINT enrollments_approved_by_fkey
            FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================
-- 5. NEW INDEXES
-- ============================================

-- Grades
CREATE INDEX IF NOT EXISTS idx_grades_slug ON grades(slug);
CREATE INDEX IF NOT EXISTS idx_grades_sort ON grades(sort_order);

-- Subjects
CREATE INDEX IF NOT EXISTS idx_subjects_course ON subjects(course_id);
CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);

-- Parent-Student
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON parent_student(student_id);

-- Materials
CREATE INDEX IF NOT EXISTS idx_materials_subject ON materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_materials_lesson ON materials(lesson_id);
CREATE INDEX IF NOT EXISTS idx_materials_course ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);

-- Meetings
CREATE INDEX IF NOT EXISTS idx_meetings_lesson ON meetings(lesson_id);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_parent ON invoices(parent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON invoices(invoice_number);

-- Invoice Items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_student ON invoice_items(student_id);

-- Payments
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_parent ON payments(parent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_session ON payments(stripe_checkout_session_id);

-- Payment Status History
CREATE INDEX IF NOT EXISTS idx_payment_history_payment ON payment_status_history(payment_id);

-- Discounts
CREATE INDEX IF NOT EXISTS idx_discounts_type ON discounts(type);
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);

-- Orders
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- Support Tickets
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);

-- Ticket Messages
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_id);

-- Lessons new columns
CREATE INDEX IF NOT EXISTS idx_lessons_subject ON lessons(subject_id);
CREATE INDEX IF NOT EXISTS idx_lessons_sort_order ON lessons(sort_order);

-- Courses new columns
CREATE INDEX IF NOT EXISTS idx_courses_grade ON courses(grade_id);
CREATE INDEX IF NOT EXISTS idx_courses_enrollment_type ON courses(enrollment_type);

-- Enrollments new columns
CREATE INDEX IF NOT EXISTS idx_enrollments_parent ON enrollments(parent_id);

-- Users new columns
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);

-- ============================================
-- 6. TRIGGERS for updated_at
-- ============================================

CREATE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
    BEFORE UPDATE ON materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at
    BEFORE UPDATE ON discounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Service role full access (for API operations)
CREATE POLICY "Service role full access to grades" ON grades FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to subjects" ON subjects FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to parent_student" ON parent_student FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to materials" ON materials FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to meetings_table" ON meetings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to invoices" ON invoices FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to invoice_items" ON invoice_items FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to payments" ON payments FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to payment_status_history" ON payment_status_history FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to discounts" ON discounts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to orders" ON orders FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to support_tickets" ON support_tickets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access to ticket_messages" ON ticket_messages FOR ALL USING (auth.role() = 'service_role');

-- Grades: public read
CREATE POLICY "Anyone can view active grades" ON grades
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage grades" ON grades
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Subjects: public read for active
CREATE POLICY "Anyone can view active subjects" ON subjects
    FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Teachers can manage their subjects" ON subjects
    FOR ALL USING (teacher_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all subjects" ON subjects
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Parent-Student: parent sees own children
CREATE POLICY "Parents can view their own children" ON parent_student
    FOR SELECT USING (parent_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Parents can add children" ON parent_student
    FOR INSERT WITH CHECK (parent_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage parent_student" ON parent_student
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Materials: enrolled students & teachers
CREATE POLICY "Enrolled students can view materials" ON materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM enrollments e
            WHERE e.student_id = (SELECT id FROM users WHERE id = auth.uid())
            AND e.course_id = materials.course_id
            AND e.status = 'active'
        )
    );

CREATE POLICY "Teachers can manage their course materials" ON materials
    FOR ALL USING (
        uploaded_by = (SELECT id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage all materials" ON materials
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Invoices: parent sees own
CREATE POLICY "Parents can view their invoices" ON invoices
    FOR SELECT USING (parent_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage invoices" ON invoices
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Invoice Items: via invoice access
CREATE POLICY "Users can view items of their invoices" ON invoice_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices i
            WHERE i.id = invoice_items.invoice_id
            AND i.parent_id = (SELECT id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage invoice items" ON invoice_items
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Payments: parent sees own
CREATE POLICY "Parents can view their payments" ON payments
    FOR SELECT USING (parent_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage payments" ON payments
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Payment Status History: via payment access
CREATE POLICY "Users can view history of their payments" ON payment_status_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM payments p
            WHERE p.id = payment_status_history.payment_id
            AND p.parent_id = (SELECT id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage payment history" ON payment_status_history
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Discounts: admin only
CREATE POLICY "Admins can manage discounts" ON discounts
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Orders: user sees own
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all orders" ON orders
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Support Tickets: user sees own
CREATE POLICY "Users can view their own tickets" ON support_tickets
    FOR SELECT USING (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = (SELECT id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage all tickets" ON support_tickets
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Ticket Messages: via ticket access
CREATE POLICY "Users can view messages on their tickets" ON ticket_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM support_tickets t
            WHERE t.id = ticket_messages.ticket_id
            AND (t.user_id = (SELECT id FROM users WHERE id = auth.uid())
                 OR t.assigned_to = (SELECT id FROM users WHERE id = auth.uid()))
        )
        AND is_internal = FALSE
    );

CREATE POLICY "Users can send messages on their tickets" ON ticket_messages
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM support_tickets t
            WHERE t.id = ticket_messages.ticket_id
            AND t.user_id = (SELECT id FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Admins can manage all ticket messages" ON ticket_messages
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Meetings: enrolled students can view, teachers can manage
CREATE POLICY "Enrolled students can view meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lessons l
            JOIN enrollments e ON e.course_id = l.course_id
            WHERE l.id = meetings.lesson_id
            AND e.student_id = (SELECT id FROM users WHERE id = auth.uid())
            AND e.status = 'active'
        )
    );

CREATE POLICY "Teachers can manage meetings for their lessons" ON meetings
    FOR ALL USING (
        created_by = (SELECT id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "Admins can manage all meetings" ON meetings
    FOR ALL USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 8. HELPER FUNCTIONS
-- ============================================

-- Generate sequential invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'INV-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_str || '-%';
    RETURN 'INV-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate sequential order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'ORD-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM orders
    WHERE order_number LIKE 'ORD-' || year_str || '-%';
    RETURN 'ORD-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Generate sequential ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
    year_str TEXT;
BEGIN
    year_str := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 'TKT-' || year_str || '-(\d+)') AS INTEGER)), 0) + 1
    INTO next_num
    FROM support_tickets
    WHERE ticket_number LIKE 'TKT-' || year_str || '-%';
    RETURN 'TKT-' || year_str || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Calculate sibling discount
CREATE OR REPLACE FUNCTION calculate_sibling_discount(p_parent_id UUID, p_student_order INTEGER)
RETURNS DECIMAL AS $$
BEGIN
    -- First child: no discount
    -- Second child: 10%
    -- Third child+: 15%
    IF p_student_order <= 1 THEN
        RETURN 0;
    ELSIF p_student_order = 2 THEN
        RETURN 10;
    ELSE
        RETURN 15;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. UPDATED VIEWS
-- ============================================

-- Parent billing summary
CREATE OR REPLACE VIEW parent_billing_summary AS
SELECT
    p.id as parent_id,
    p.name as parent_name,
    p.email as parent_email,
    COUNT(DISTINCT ps.student_id) as total_children,
    COUNT(DISTINCT e.id) as total_enrollments,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(CASE WHEN i.status IN ('pending', 'overdue') THEN i.total ELSE 0 END), 0) as total_outstanding,
    COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices
FROM users p
LEFT JOIN parent_student ps ON p.id = ps.parent_id
LEFT JOIN enrollments e ON ps.student_id = e.student_id
LEFT JOIN invoices i ON p.id = i.parent_id
WHERE p.role = 'parent'
GROUP BY p.id, p.name, p.email;

-- Enrollment overview for admin
CREATE OR REPLACE VIEW enrollment_overview AS
SELECT
    e.id as enrollment_id,
    e.status,
    e.enrolled_at,
    s.name as student_name,
    s.email as student_email,
    c.title as course_title,
    c.price as course_price,
    p.name as parent_name,
    p.email as parent_email,
    e.approved_at,
    e.rejection_reason
FROM enrollments e
JOIN users s ON e.student_id = s.id
JOIN courses c ON e.course_id = c.id
LEFT JOIN users p ON e.parent_id = p.id;

-- ============================================
-- 10. SEED DEFAULT SIBLING DISCOUNTS
-- ============================================

INSERT INTO discounts (name, type, discount_type, value, min_siblings, is_active)
VALUES
    ('خصم الإخوة - الطالب الثاني', 'sibling', 'percentage', 10, 2, TRUE),
    ('خصم الإخوة - الطالب الثالث وما بعده', 'sibling', 'percentage', 15, 3, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE grades IS 'Academic grades/levels (e.g., Grade 1, Grade 2)';
COMMENT ON TABLE subjects IS 'Subjects within a course (e.g., Math, Science within Grade 1)';
COMMENT ON TABLE parent_student IS 'Parent-Student relationship mapping';
COMMENT ON TABLE materials IS 'Learning materials (files, links, books) attached to subjects/lessons';
COMMENT ON TABLE meetings IS 'Google Meet sessions linked to lessons';
COMMENT ON TABLE invoices IS 'Billing invoices for parents';
COMMENT ON TABLE invoice_items IS 'Line items within an invoice';
COMMENT ON TABLE payments IS 'Stripe payment records';
COMMENT ON TABLE payment_status_history IS 'Audit trail for payment status changes';
COMMENT ON TABLE discounts IS 'Discount rules (sibling, coupon, promotional)';
COMMENT ON TABLE orders IS 'Parent/Student requests (enrollment, support, refund, etc.)';
COMMENT ON TABLE support_tickets IS 'Support tickets from users';
COMMENT ON TABLE ticket_messages IS 'Messages within support tickets';
