/**
 * Comprehensive Business Data Seed Script
 *
 * Safely populates all business-safe tables with realistic Arabic/English
 * educational platform data. Idempotent - safe to run multiple times.
 *
 * EXCLUDED (risky): payments, invoices, orders, tickets, notifications,
 *   password_resets, audit_logs, email_logs, AI pipeline tables,
 *   assessment_submissions, meetings, parent_student
 *
 * Usage: npx tsx scripts/seed-business-data.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Fixed UUIDs for deterministic seeding ────────────────────────────────────
const IDS = {
  // Users
  admin:    '10000000-0000-0000-0000-000000000001',
  teacher1: '10000000-0000-0000-0000-000000000010',
  teacher2: '10000000-0000-0000-0000-000000000011',
  student1: '10000000-0000-0000-0000-000000000020',
  student2: '10000000-0000-0000-0000-000000000021',
  student3: '10000000-0000-0000-0000-000000000022',
  student4: '10000000-0000-0000-0000-000000000023',
  parent1:  '10000000-0000-0000-0000-000000000030',

  // Grades (KG1, KG2, G1-G12)
  gradeKG1: '20000000-0000-0000-0000-000000000001',
  gradeKG2: '20000000-0000-0000-0000-000000000002',
  gradeG1:  '20000000-0000-0000-0000-000000000003',
  gradeG2:  '20000000-0000-0000-0000-000000000004',
  gradeG3:  '20000000-0000-0000-0000-000000000005',
  gradeG4:  '20000000-0000-0000-0000-000000000006',
  gradeG5:  '20000000-0000-0000-0000-000000000007',
  gradeG6:  '20000000-0000-0000-0000-000000000008',
  gradeG7:  '20000000-0000-0000-0000-000000000009',
  gradeG8:  '20000000-0000-0000-0000-000000000010',
  gradeG9:  '20000000-0000-0000-0000-000000000011',
  gradeG10: '20000000-0000-0000-0000-000000000012',
  gradeG11: '20000000-0000-0000-0000-000000000013',
  gradeG12: '20000000-0000-0000-0000-000000000014',

  // Subjects
  subMath:      '30000000-0000-0000-0000-000000000001',
  subScience:   '30000000-0000-0000-0000-000000000002',
  subArabic:    '30000000-0000-0000-0000-000000000003',
  subEnglish:   '30000000-0000-0000-0000-000000000004',
  subPhysics:   '30000000-0000-0000-0000-000000000005',
  subChemistry: '30000000-0000-0000-0000-000000000006',
  subBiology:   '30000000-0000-0000-0000-000000000007',
  subHistory:   '30000000-0000-0000-0000-000000000008',

  // Courses
  course1: '40000000-0000-0000-0000-000000000001',
  course2: '40000000-0000-0000-0000-000000000002',
  course3: '40000000-0000-0000-0000-000000000003',
  course4: '40000000-0000-0000-0000-000000000004',
  course5: '40000000-0000-0000-0000-000000000005',
  course6: '40000000-0000-0000-0000-000000000006',

  // Course Modules
  mod1a: '50000000-0000-0000-0000-000000000001',
  mod1b: '50000000-0000-0000-0000-000000000002',
  mod2a: '50000000-0000-0000-0000-000000000003',
  mod2b: '50000000-0000-0000-0000-000000000004',
  mod3a: '50000000-0000-0000-0000-000000000005',
  mod4a: '50000000-0000-0000-0000-000000000006',
  mod5a: '50000000-0000-0000-0000-000000000007',
  mod6a: '50000000-0000-0000-0000-000000000008',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

let successCount = 0;
let skipCount = 0;
let errorCount = 0;

async function upsertRows(table: string, rows: Record<string, any>[], uniqueKey: string = 'id') {
  for (const row of rows) {
    const checkCol = uniqueKey;
    const checkVal = row[checkCol];

    const { data: existing } = await supabase
      .from(table)
      .select('id')
      .eq(checkCol, checkVal)
      .maybeSingle();

    if (existing) {
      skipCount++;
      continue;
    }

    const { error } = await supabase.from(table).insert(row);
    if (error) {
      console.error(`  ERROR [${table}] ${JSON.stringify(row).slice(0, 80)}: ${error.message}`);
      errorCount++;
    } else {
      successCount++;
    }
  }
}

function futureDate(daysFromNow: number, hour: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function pastDate(daysAgo: number, hour: number = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

// ─── Seed Functions ───────────────────────────────────────────────────────────

async function seedUsers() {
  console.log('\n[1/15] Seeding users...');
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    { id: IDS.admin,    email: 'admin@eduverse.com',     name: 'مدير النظام',     role: 'admin',   password_hash: passwordHash, is_active: true, phone: '+201000000001' },
    { id: IDS.teacher1, email: 'teacher1@eduverse.com',  name: 'أحمد محمد',       role: 'teacher', password_hash: passwordHash, is_active: true, phone: '+201000000010', bio: 'معلم رياضيات وفيزياء - خبرة 10 سنوات' },
    { id: IDS.teacher2, email: 'teacher2@eduverse.com',  name: 'فاطمة علي',       role: 'teacher', password_hash: passwordHash, is_active: true, phone: '+201000000011', bio: 'معلمة لغة عربية وعلوم - خبرة 8 سنوات' },
    { id: IDS.student1, email: 'student1@eduverse.com',  name: 'يوسف خالد',       role: 'student', password_hash: passwordHash, is_active: true, phone: '+201000000020' },
    { id: IDS.student2, email: 'student2@eduverse.com',  name: 'مريم حسن',        role: 'student', password_hash: passwordHash, is_active: true, phone: '+201000000021' },
    { id: IDS.student3, email: 'student3@eduverse.com',  name: 'عمر سعيد',        role: 'student', password_hash: passwordHash, is_active: true, phone: '+201000000022' },
    { id: IDS.student4, email: 'student4@eduverse.com',  name: 'نور الدين',       role: 'student', password_hash: passwordHash, is_active: true, phone: '+201000000023' },
    { id: IDS.parent1,  email: 'parent1@eduverse.com',   name: 'خالد يوسف',       role: 'parent',  password_hash: passwordHash, is_active: true, phone: '+201000000030' },
  ];

  await upsertRows('users', users, 'id');
}

async function seedGrades() {
  console.log('[2/15] Seeding grades...');
  const grades = [
    { id: IDS.gradeKG1, name: 'KG 1',          name_en: 'KG 1',     slug: 'kg-1',     sort_order: 1,  is_active: true },
    { id: IDS.gradeKG2, name: 'KG 2',          name_en: 'KG 2',     slug: 'kg-2',     sort_order: 2,  is_active: true },
    { id: IDS.gradeG1,  name: 'الصف الأول',     name_en: 'Grade 1',  slug: 'grade-1',  sort_order: 3,  is_active: true },
    { id: IDS.gradeG2,  name: 'الصف الثاني',    name_en: 'Grade 2',  slug: 'grade-2',  sort_order: 4,  is_active: true },
    { id: IDS.gradeG3,  name: 'الصف الثالث',    name_en: 'Grade 3',  slug: 'grade-3',  sort_order: 5,  is_active: true },
    { id: IDS.gradeG4,  name: 'الصف الرابع',    name_en: 'Grade 4',  slug: 'grade-4',  sort_order: 6,  is_active: true },
    { id: IDS.gradeG5,  name: 'الصف الخامس',    name_en: 'Grade 5',  slug: 'grade-5',  sort_order: 7,  is_active: true },
    { id: IDS.gradeG6,  name: 'الصف السادس',    name_en: 'Grade 6',  slug: 'grade-6',  sort_order: 8,  is_active: true },
    { id: IDS.gradeG7,  name: 'الصف السابع',    name_en: 'Grade 7',  slug: 'grade-7',  sort_order: 9,  is_active: true },
    { id: IDS.gradeG8,  name: 'الصف الثامن',    name_en: 'Grade 8',  slug: 'grade-8',  sort_order: 10, is_active: true },
    { id: IDS.gradeG9,  name: 'الصف التاسع',    name_en: 'Grade 9',  slug: 'grade-9',  sort_order: 11, is_active: true },
    { id: IDS.gradeG10, name: 'الصف العاشر',    name_en: 'Grade 10', slug: 'grade-10', sort_order: 12, is_active: true },
    { id: IDS.gradeG11, name: 'الصف الحادي عشر', name_en: 'Grade 11', slug: 'grade-11', sort_order: 13, is_active: true },
    { id: IDS.gradeG12, name: 'الصف الثاني عشر', name_en: 'Grade 12', slug: 'grade-12', sort_order: 14, is_active: true },
  ];

  await upsertRows('grades', grades, 'id');
}

async function seedSubjects() {
  console.log('[3/15] Seeding subjects...');
  const subjects = [
    { id: IDS.subMath,      title: 'الرياضيات',        slug: 'mathematics',  description: 'Mathematics - الرياضيات',             teacher_id: IDS.teacher1, sort_order: 1, is_active: true },
    { id: IDS.subScience,   title: 'العلوم',           slug: 'science',      description: 'General Science - العلوم العامة',      teacher_id: IDS.teacher2, sort_order: 2, is_active: true },
    { id: IDS.subArabic,    title: 'اللغة العربية',     slug: 'arabic',       description: 'Arabic Language - اللغة العربية',      teacher_id: IDS.teacher2, sort_order: 3, is_active: true },
    { id: IDS.subEnglish,   title: 'اللغة الإنجليزية',  slug: 'english',      description: 'English Language - اللغة الإنجليزية',  teacher_id: IDS.teacher1, sort_order: 4, is_active: true },
    { id: IDS.subPhysics,   title: 'الفيزياء',         slug: 'physics',      description: 'Physics - الفيزياء',                   teacher_id: IDS.teacher1, sort_order: 5, is_active: true },
    { id: IDS.subChemistry, title: 'الكيمياء',         slug: 'chemistry',    description: 'Chemistry - الكيمياء',                 teacher_id: IDS.teacher1, sort_order: 6, is_active: true },
    { id: IDS.subBiology,   title: 'الأحياء',          slug: 'biology',      description: 'Biology - الأحياء',                    teacher_id: IDS.teacher2, sort_order: 7, is_active: true },
    { id: IDS.subHistory,   title: 'التاريخ',          slug: 'history',      description: 'History - التاريخ',                    teacher_id: IDS.teacher2, sort_order: 8, is_active: true },
  ];

  await upsertRows('subjects', subjects, 'id');
}

async function seedCourses() {
  console.log('[4/15] Seeding courses...');
  const courses = [
    {
      id: IDS.course1, title: 'رياضيات - الصف السادس', slug: 'math-grade-6',
      description: 'منهج الرياضيات الكامل للصف السادس الابتدائي',
      price: 150, currency: 'EGP', grade_id: IDS.gradeG6, grade_level: 'Grade 6',
      subject_id: IDS.subMath, subject: 'Mathematics', teacher_id: IDS.teacher1,
      is_published: true, max_students: 30, enrollment_type: 'open', duration_hours: 60,
    },
    {
      id: IDS.course2, title: 'علوم - الصف السادس', slug: 'science-grade-6',
      description: 'منهج العلوم الكامل للصف السادس الابتدائي',
      price: 150, currency: 'EGP', grade_id: IDS.gradeG6, grade_level: 'Grade 6',
      subject_id: IDS.subScience, subject: 'Science', teacher_id: IDS.teacher2,
      is_published: true, max_students: 30, enrollment_type: 'open', duration_hours: 48,
    },
    {
      id: IDS.course3, title: 'فيزياء - الصف العاشر', slug: 'physics-grade-10',
      description: 'منهج الفيزياء الكامل للصف العاشر - الميكانيكا والديناميكا الحرارية',
      price: 250, currency: 'EGP', grade_id: IDS.gradeG10, grade_level: 'Grade 10',
      subject_id: IDS.subPhysics, subject: 'Physics', teacher_id: IDS.teacher1,
      is_published: true, max_students: 25, enrollment_type: 'open', duration_hours: 72,
    },
    {
      id: IDS.course4, title: 'لغة عربية - الصف الثامن', slug: 'arabic-grade-8',
      description: 'منهج اللغة العربية للصف الثامن - نحو وبلاغة',
      price: 120, currency: 'EGP', grade_id: IDS.gradeG8, grade_level: 'Grade 8',
      subject_id: IDS.subArabic, subject: 'Arabic', teacher_id: IDS.teacher2,
      is_published: true, max_students: 35, enrollment_type: 'open', duration_hours: 54,
    },
    {
      id: IDS.course5, title: 'كيمياء - الصف الحادي عشر', slug: 'chemistry-grade-11',
      description: 'منهج الكيمياء العضوية وغير العضوية',
      price: 280, currency: 'EGP', grade_id: IDS.gradeG11, grade_level: 'Grade 11',
      subject_id: IDS.subChemistry, subject: 'Chemistry', teacher_id: IDS.teacher1,
      is_published: true, max_students: 20, enrollment_type: 'open', duration_hours: 64,
    },
    {
      id: IDS.course6, title: 'أحياء - الصف التاسع', slug: 'biology-grade-9',
      description: 'أساسيات علم الأحياء - الخلية والوراثة',
      price: 180, currency: 'EGP', grade_id: IDS.gradeG9, grade_level: 'Grade 9',
      subject_id: IDS.subBiology, subject: 'Biology', teacher_id: IDS.teacher2,
      is_published: true, max_students: 30, enrollment_type: 'open', duration_hours: 56,
    },
  ];

  await upsertRows('courses', courses, 'id');
}

async function seedCourseModules() {
  console.log('[5/15] Seeding course modules...');
  const modules = [
    { id: IDS.mod1a, course_id: IDS.course1, title: 'الوحدة الأولى: الأعداد والعمليات',  description: 'الأعداد الصحيحة والكسور والعمليات عليها', display_order: 1 },
    { id: IDS.mod1b, course_id: IDS.course1, title: 'الوحدة الثانية: الهندسة',           description: 'الأشكال الهندسية والمساحات والحجوم',       display_order: 2 },
    { id: IDS.mod2a, course_id: IDS.course2, title: 'الوحدة الأولى: المادة وخواصها',     description: 'حالات المادة والتغيرات الفيزيائية والكيميائية', display_order: 1 },
    { id: IDS.mod2b, course_id: IDS.course2, title: 'الوحدة الثانية: الطاقة',            description: 'أشكال الطاقة وتحولاتها',                   display_order: 2 },
    { id: IDS.mod3a, course_id: IDS.course3, title: 'الميكانيكا الكلاسيكية',              description: 'قوانين نيوتن والحركة والقوى',              display_order: 1 },
    { id: IDS.mod4a, course_id: IDS.course4, title: 'النحو والصرف',                      description: 'قواعد النحو والإعراب والصرف',              display_order: 1 },
    { id: IDS.mod5a, course_id: IDS.course5, title: 'الكيمياء العضوية',                   description: 'المركبات العضوية والتفاعلات',              display_order: 1 },
    { id: IDS.mod6a, course_id: IDS.course6, title: 'بيولوجيا الخلية',                    description: 'تركيب الخلية ووظائفها',                    display_order: 1 },
  ];

  await upsertRows('course_modules', modules, 'id');
}

async function seedLessons() {
  console.log('[6/15] Seeding lessons...');

  // Mix of past (completed) and future (scheduled) lessons
  const lessons = [
    // Course 1 (Math G6) - 4 lessons
    { id: '60000000-0000-0000-0000-000000000001', title: 'مراجعة الأعداد الصحيحة',            course_id: IDS.course1, teacher_id: IDS.teacher1, subject_id: IDS.subMath,    start_date_time: pastDate(14, 10),   end_date_time: pastDate(14, 11),   status: 'completed', recurrence: 'none', sort_order: 1, notes: 'تم تغطية الأعداد الصحيحة والعمليات الأساسية' },
    { id: '60000000-0000-0000-0000-000000000002', title: 'الكسور العادية والعشرية',            course_id: IDS.course1, teacher_id: IDS.teacher1, subject_id: IDS.subMath,    start_date_time: pastDate(7, 10),    end_date_time: pastDate(7, 11),    status: 'completed', recurrence: 'none', sort_order: 2, notes: 'تم شرح الكسور والتحويل بينها' },
    { id: '60000000-0000-0000-0000-000000000003', title: 'النسبة والتناسب',                    course_id: IDS.course1, teacher_id: IDS.teacher1, subject_id: IDS.subMath,    start_date_time: futureDate(3, 10),  end_date_time: futureDate(3, 11),  status: 'scheduled', recurrence: 'none', sort_order: 3 },
    { id: '60000000-0000-0000-0000-000000000004', title: 'المعادلات الجبرية البسيطة',           course_id: IDS.course1, teacher_id: IDS.teacher1, subject_id: IDS.subMath,    start_date_time: futureDate(10, 10), end_date_time: futureDate(10, 11), status: 'scheduled', recurrence: 'none', sort_order: 4 },

    // Course 2 (Science G6) - 4 lessons
    { id: '60000000-0000-0000-0000-000000000005', title: 'حالات المادة الثلاث',               course_id: IDS.course2, teacher_id: IDS.teacher2, subject_id: IDS.subScience, start_date_time: pastDate(12, 14),   end_date_time: pastDate(12, 15),   status: 'completed', recurrence: 'none', sort_order: 1 },
    { id: '60000000-0000-0000-0000-000000000006', title: 'التغيرات الفيزيائية والكيميائية',     course_id: IDS.course2, teacher_id: IDS.teacher2, subject_id: IDS.subScience, start_date_time: pastDate(5, 14),    end_date_time: pastDate(5, 15),    status: 'completed', recurrence: 'none', sort_order: 2 },
    { id: '60000000-0000-0000-0000-000000000007', title: 'المحاليل والمخاليط',                 course_id: IDS.course2, teacher_id: IDS.teacher2, subject_id: IDS.subScience, start_date_time: futureDate(5, 14),  end_date_time: futureDate(5, 15),  status: 'scheduled', recurrence: 'none', sort_order: 3 },
    { id: '60000000-0000-0000-0000-000000000008', title: 'الأحماض والقواعد',                   course_id: IDS.course2, teacher_id: IDS.teacher2, subject_id: IDS.subScience, start_date_time: futureDate(12, 14), end_date_time: futureDate(12, 15), status: 'scheduled', recurrence: 'none', sort_order: 4 },

    // Course 3 (Physics G10) - 3 lessons
    { id: '60000000-0000-0000-0000-000000000009', title: 'قوانين نيوتن للحركة',               course_id: IDS.course3, teacher_id: IDS.teacher1, subject_id: IDS.subPhysics, start_date_time: pastDate(10, 16),   end_date_time: pastDate(10, 17),   status: 'completed', recurrence: 'none', sort_order: 1 },
    { id: '60000000-0000-0000-0000-000000000010', title: 'الشغل والطاقة',                     course_id: IDS.course3, teacher_id: IDS.teacher1, subject_id: IDS.subPhysics, start_date_time: futureDate(4, 16),  end_date_time: futureDate(4, 17),  status: 'scheduled', recurrence: 'none', sort_order: 2 },
    { id: '60000000-0000-0000-0000-000000000011', title: 'كمية الحركة والتصادمات',             course_id: IDS.course3, teacher_id: IDS.teacher1, subject_id: IDS.subPhysics, start_date_time: futureDate(11, 16), end_date_time: futureDate(11, 17), status: 'scheduled', recurrence: 'none', sort_order: 3 },

    // Course 4 (Arabic G8) - 3 lessons
    { id: '60000000-0000-0000-0000-000000000012', title: 'المبتدأ والخبر',                    course_id: IDS.course4, teacher_id: IDS.teacher2, subject_id: IDS.subArabic,  start_date_time: pastDate(8, 12),    end_date_time: pastDate(8, 13),    status: 'completed', recurrence: 'none', sort_order: 1 },
    { id: '60000000-0000-0000-0000-000000000013', title: 'الفعل المضارع وإعرابه',              course_id: IDS.course4, teacher_id: IDS.teacher2, subject_id: IDS.subArabic,  start_date_time: futureDate(2, 12),  end_date_time: futureDate(2, 13),  status: 'scheduled', recurrence: 'none', sort_order: 2 },
    { id: '60000000-0000-0000-0000-000000000014', title: 'البلاغة: التشبيه والاستعارة',         course_id: IDS.course4, teacher_id: IDS.teacher2, subject_id: IDS.subArabic,  start_date_time: futureDate(9, 12),  end_date_time: futureDate(9, 13),  status: 'scheduled', recurrence: 'none', sort_order: 3 },

    // Course 5 (Chemistry G11) - 3 lessons
    { id: '60000000-0000-0000-0000-000000000015', title: 'مقدمة في الكيمياء العضوية',          course_id: IDS.course5, teacher_id: IDS.teacher1, subject_id: IDS.subChemistry, start_date_time: pastDate(6, 18),   end_date_time: pastDate(6, 19),    status: 'completed', recurrence: 'none', sort_order: 1 },
    { id: '60000000-0000-0000-0000-000000000016', title: 'الهيدروكربونات',                     course_id: IDS.course5, teacher_id: IDS.teacher1, subject_id: IDS.subChemistry, start_date_time: futureDate(6, 18),  end_date_time: futureDate(6, 19),  status: 'scheduled', recurrence: 'none', sort_order: 2 },
    { id: '60000000-0000-0000-0000-000000000017', title: 'التفاعلات العضوية',                  course_id: IDS.course5, teacher_id: IDS.teacher1, subject_id: IDS.subChemistry, start_date_time: futureDate(13, 18), end_date_time: futureDate(13, 19), status: 'scheduled', recurrence: 'none', sort_order: 3 },

    // Course 6 (Biology G9) - 3 lessons
    { id: '60000000-0000-0000-0000-000000000018', title: 'تركيب الخلية',                      course_id: IDS.course6, teacher_id: IDS.teacher2, subject_id: IDS.subBiology,  start_date_time: pastDate(9, 11),    end_date_time: pastDate(9, 12),    status: 'completed', recurrence: 'none', sort_order: 1 },
    { id: '60000000-0000-0000-0000-000000000019', title: 'الانقسام الخلوي',                    course_id: IDS.course6, teacher_id: IDS.teacher2, subject_id: IDS.subBiology,  start_date_time: futureDate(7, 11),  end_date_time: futureDate(7, 12),  status: 'scheduled', recurrence: 'none', sort_order: 2 },
    { id: '60000000-0000-0000-0000-000000000020', title: 'الوراثة والجينات',                   course_id: IDS.course6, teacher_id: IDS.teacher2, subject_id: IDS.subBiology,  start_date_time: futureDate(14, 11), end_date_time: futureDate(14, 12), status: 'scheduled', recurrence: 'none', sort_order: 3 },
  ];

  await upsertRows('lessons', lessons, 'id');
}

async function seedMaterials() {
  console.log('[7/15] Seeding materials (link type only)...');
  const materials = [
    // Course 1 materials
    { id: '70000000-0000-0000-0000-000000000001', title: 'شرح الأعداد الصحيحة - فيديو',    type: 'link', external_url: 'https://www.khanacademy.org/math/arithmetic', course_id: IDS.course1, uploaded_by: IDS.teacher1, sort_order: 1, is_active: true },
    { id: '70000000-0000-0000-0000-000000000002', title: 'تمارين الكسور - ورقة عمل',       type: 'link', external_url: 'https://www.mathsisfun.com/fractions.html',   course_id: IDS.course1, uploaded_by: IDS.teacher1, sort_order: 2, is_active: true },

    // Course 2 materials
    { id: '70000000-0000-0000-0000-000000000003', title: 'حالات المادة - محاكاة تفاعلية',   type: 'link', external_url: 'https://phet.colorado.edu/en/simulations/states-of-matter', course_id: IDS.course2, uploaded_by: IDS.teacher2, sort_order: 1, is_active: true },
    { id: '70000000-0000-0000-0000-000000000004', title: 'فيديو التغيرات الكيميائية',        type: 'link', external_url: 'https://www.youtube.com/watch?v=example',               course_id: IDS.course2, uploaded_by: IDS.teacher2, sort_order: 2, is_active: true },

    // Course 3 materials
    { id: '70000000-0000-0000-0000-000000000005', title: 'محاكاة قوانين نيوتن',             type: 'link', external_url: 'https://phet.colorado.edu/en/simulations/forces-and-motion-basics', course_id: IDS.course3, uploaded_by: IDS.teacher1, sort_order: 1, is_active: true },
    { id: '70000000-0000-0000-0000-000000000006', title: 'مسائل محلولة - الشغل والطاقة',    type: 'link', external_url: 'https://www.physicsclassroom.com/class/energy',                     course_id: IDS.course3, uploaded_by: IDS.teacher1, sort_order: 2, is_active: true },

    // Course 4 materials
    { id: '70000000-0000-0000-0000-000000000007', title: 'قواعد النحو العربي - مرجع',       type: 'link', external_url: 'https://www.arabic-grammar.com', course_id: IDS.course4, uploaded_by: IDS.teacher2, sort_order: 1, is_active: true },

    // Course 5 materials
    { id: '70000000-0000-0000-0000-000000000008', title: 'جدول العناصر التفاعلي',           type: 'link', external_url: 'https://ptable.com',               course_id: IDS.course5, uploaded_by: IDS.teacher1, sort_order: 1, is_active: true },

    // Course 6 materials
    { id: '70000000-0000-0000-0000-000000000009', title: 'محاكاة الخلية الحية',             type: 'link', external_url: 'https://learn.genetics.utah.edu/content/cells/', course_id: IDS.course6, uploaded_by: IDS.teacher2, sort_order: 1, is_active: true },
  ];

  await upsertRows('materials', materials, 'id');
}

async function seedEnrollments() {
  console.log('[8/15] Seeding enrollments...');
  const now = new Date().toISOString();
  const enrollments = [
    // Student 1 enrolled in courses 1, 3, 5
    { id: '80000000-0000-0000-0000-000000000001', student_id: IDS.student1, course_id: IDS.course1, status: 'active', enrollment_date: now, grade_id: IDS.gradeG6 },
    { id: '80000000-0000-0000-0000-000000000002', student_id: IDS.student1, course_id: IDS.course3, status: 'active', enrollment_date: now, grade_id: IDS.gradeG10 },
    { id: '80000000-0000-0000-0000-000000000003', student_id: IDS.student1, course_id: IDS.course5, status: 'active', enrollment_date: now, grade_id: IDS.gradeG11 },

    // Student 2 enrolled in courses 1, 2, 4
    { id: '80000000-0000-0000-0000-000000000004', student_id: IDS.student2, course_id: IDS.course1, status: 'active', enrollment_date: now, grade_id: IDS.gradeG6 },
    { id: '80000000-0000-0000-0000-000000000005', student_id: IDS.student2, course_id: IDS.course2, status: 'active', enrollment_date: now, grade_id: IDS.gradeG6 },
    { id: '80000000-0000-0000-0000-000000000006', student_id: IDS.student2, course_id: IDS.course4, status: 'active', enrollment_date: now, grade_id: IDS.gradeG8 },

    // Student 3 enrolled in courses 2, 6
    { id: '80000000-0000-0000-0000-000000000007', student_id: IDS.student3, course_id: IDS.course2, status: 'active', enrollment_date: now, grade_id: IDS.gradeG6 },
    { id: '80000000-0000-0000-0000-000000000008', student_id: IDS.student3, course_id: IDS.course6, status: 'active', enrollment_date: now, grade_id: IDS.gradeG9 },

    // Student 4 enrolled in courses 3, 4, 6
    { id: '80000000-0000-0000-0000-000000000009', student_id: IDS.student4, course_id: IDS.course3, status: 'active', enrollment_date: now, grade_id: IDS.gradeG10 },
    { id: '80000000-0000-0000-0000-000000000010', student_id: IDS.student4, course_id: IDS.course4, status: 'active', enrollment_date: now, grade_id: IDS.gradeG8 },
    { id: '80000000-0000-0000-0000-000000000011', student_id: IDS.student4, course_id: IDS.course6, status: 'active', enrollment_date: now, grade_id: IDS.gradeG9 },
  ];

  await upsertRows('enrollments', enrollments, 'id');
}

async function seedAttendance() {
  console.log('[9/15] Seeding attendance (past lessons only)...');

  // Only for completed lessons
  const completedLessonIds = [
    '60000000-0000-0000-0000-000000000001', // Math G6 lesson 1
    '60000000-0000-0000-0000-000000000002', // Math G6 lesson 2
    '60000000-0000-0000-0000-000000000005', // Science G6 lesson 1
    '60000000-0000-0000-0000-000000000006', // Science G6 lesson 2
    '60000000-0000-0000-0000-000000000009', // Physics G10 lesson 1
    '60000000-0000-0000-0000-000000000012', // Arabic G8 lesson 1
    '60000000-0000-0000-0000-000000000015', // Chemistry G11 lesson 1
    '60000000-0000-0000-0000-000000000018', // Biology G9 lesson 1
  ];

  // Map: lesson -> enrolled students
  const lessonStudents: Record<string, string[]> = {
    '60000000-0000-0000-0000-000000000001': [IDS.student1, IDS.student2],           // Math G6
    '60000000-0000-0000-0000-000000000002': [IDS.student1, IDS.student2],
    '60000000-0000-0000-0000-000000000005': [IDS.student2, IDS.student3],           // Science G6
    '60000000-0000-0000-0000-000000000006': [IDS.student2, IDS.student3],
    '60000000-0000-0000-0000-000000000009': [IDS.student1, IDS.student4],           // Physics G10
    '60000000-0000-0000-0000-000000000012': [IDS.student2, IDS.student4],           // Arabic G8
    '60000000-0000-0000-0000-000000000015': [IDS.student1],                         // Chemistry G11
    '60000000-0000-0000-0000-000000000018': [IDS.student3, IDS.student4],           // Biology G9
  };

  const statuses: Array<'present' | 'absent' | 'late'> = ['present', 'present', 'present', 'late', 'absent'];
  const attendance: Record<string, any>[] = [];
  let counter = 1;

  for (const lessonId of completedLessonIds) {
    const students = lessonStudents[lessonId] || [];
    for (let i = 0; i < students.length; i++) {
      const status = statuses[(counter + i) % statuses.length];
      attendance.push({
        id: `90000000-0000-0000-0000-${String(counter).padStart(12, '0')}`,
        lesson_id: lessonId,
        student_id: students[i],
        status,
        duration_seconds: status === 'absent' ? 0 : status === 'late' ? 2400 : 3600,
      });
      counter++;
    }
  }

  await upsertRows('attendance', attendance, 'id');
}

async function seedAssessments() {
  console.log('[10/15] Seeding assessments...');
  const assessments = [
    { id: 'A0000000-0000-0000-0000-000000000001', teacher_id: IDS.teacher1, course_id: IDS.course1, subject_id: IDS.subMath,    title: 'اختبار الوحدة الأولى - الأعداد',     assessment_type: 'quiz', duration_minutes: 30, is_published: true, short_description: 'اختبار قصير على الأعداد الصحيحة والكسور' },
    { id: 'A0000000-0000-0000-0000-000000000002', teacher_id: IDS.teacher2, course_id: IDS.course2, subject_id: IDS.subScience,  title: 'اختبار حالات المادة',                 assessment_type: 'quiz', duration_minutes: 25, is_published: true, short_description: 'اختبار على خواص المادة وحالاتها' },
    { id: 'A0000000-0000-0000-0000-000000000003', teacher_id: IDS.teacher1, course_id: IDS.course3, subject_id: IDS.subPhysics,  title: 'امتحان نصف الفصل - الميكانيكا',       assessment_type: 'exam', duration_minutes: 60, is_published: true, short_description: 'امتحان شامل على قوانين نيوتن والشغل والطاقة' },
    { id: 'A0000000-0000-0000-0000-000000000004', teacher_id: IDS.teacher2, course_id: IDS.course4, subject_id: IDS.subArabic,   title: 'اختبار النحو - المبتدأ والخبر',       assessment_type: 'quiz', duration_minutes: 20, is_published: true, short_description: 'اختبار على أحكام المبتدأ والخبر' },
    { id: 'A0000000-0000-0000-0000-000000000005', teacher_id: IDS.teacher1, course_id: IDS.course5, subject_id: IDS.subChemistry, title: 'اختبار الكيمياء العضوية',             assessment_type: 'quiz', duration_minutes: 40, is_published: true, short_description: 'اختبار على الهيدروكربونات والمجموعات الوظيفية' },
    { id: 'A0000000-0000-0000-0000-000000000006', teacher_id: IDS.teacher2, course_id: IDS.course6, subject_id: IDS.subBiology,  title: 'اختبار بيولوجيا الخلية',              assessment_type: 'quiz', duration_minutes: 30, is_published: true, short_description: 'اختبار على تركيب الخلية ووظائف العضيات' },
  ];

  await upsertRows('assessments', assessments, 'id');
}

async function seedAssessmentQuestions() {
  console.log('[11/15] Seeding assessment questions...');
  const questions = [
    // Assessment 1 - Math numbers quiz
    { id: 'AQ000000-0000-0000-0000-000000000001', assessment_id: 'A0000000-0000-0000-0000-000000000001', question_type: 'multiple_choice', question_text: 'ما ناتج 15 × 8؟',                                  points: 5, sort_order: 1, is_mandatory: true, options_json: JSON.stringify([{ text: '120', is_correct: true }, { text: '115', is_correct: false }, { text: '130', is_correct: false }, { text: '125', is_correct: false }]) },
    { id: 'AQ000000-0000-0000-0000-000000000002', assessment_id: 'A0000000-0000-0000-0000-000000000001', question_type: 'multiple_choice', question_text: 'ما هو العدد الأولي من بين: 9, 11, 15, 21؟',         points: 5, sort_order: 2, is_mandatory: true, options_json: JSON.stringify([{ text: '9', is_correct: false }, { text: '11', is_correct: true }, { text: '15', is_correct: false }, { text: '21', is_correct: false }]) },
    { id: 'AQ000000-0000-0000-0000-000000000003', assessment_id: 'A0000000-0000-0000-0000-000000000001', question_type: 'short_answer',    question_text: 'حول الكسر 3/4 إلى كسر عشري',                        points: 10, sort_order: 3, is_mandatory: true },

    // Assessment 2 - Science states of matter
    { id: 'AQ000000-0000-0000-0000-000000000004', assessment_id: 'A0000000-0000-0000-0000-000000000002', question_type: 'multiple_choice', question_text: 'أي حالة من حالات المادة لها شكل وحجم ثابتان؟',     points: 5, sort_order: 1, is_mandatory: true, options_json: JSON.stringify([{ text: 'الصلبة', is_correct: true }, { text: 'السائلة', is_correct: false }, { text: 'الغازية', is_correct: false }]) },
    { id: 'AQ000000-0000-0000-0000-000000000005', assessment_id: 'A0000000-0000-0000-0000-000000000002', question_type: 'true_false',      question_text: 'التبخر هو تغير كيميائي',                            points: 5, sort_order: 2, is_mandatory: true, options_json: JSON.stringify([{ text: 'صح', is_correct: false }, { text: 'خطأ', is_correct: true }]) },
    { id: 'AQ000000-0000-0000-0000-000000000006', assessment_id: 'A0000000-0000-0000-0000-000000000002', question_type: 'short_answer',    question_text: 'اذكر مثالين على تغير كيميائي في الحياة اليومية',     points: 10, sort_order: 3, is_mandatory: true },

    // Assessment 3 - Physics mechanics exam
    { id: 'AQ000000-0000-0000-0000-000000000007', assessment_id: 'A0000000-0000-0000-0000-000000000003', question_type: 'multiple_choice', question_text: 'ينص قانون نيوتن الثاني على أن: F = ...',            points: 10, sort_order: 1, is_mandatory: true, options_json: JSON.stringify([{ text: 'ma', is_correct: true }, { text: 'mv', is_correct: false }, { text: 'mg', is_correct: false }, { text: 'mΔv', is_correct: false }]) },
    { id: 'AQ000000-0000-0000-0000-000000000008', assessment_id: 'A0000000-0000-0000-0000-000000000003', question_type: 'short_answer',    question_text: 'احسب الشغل المبذول لنقل جسم كتلته 10 kg مسافة 5 m', points: 15, sort_order: 2, is_mandatory: true },
    { id: 'AQ000000-0000-0000-0000-000000000009', assessment_id: 'A0000000-0000-0000-0000-000000000003', question_type: 'essay',           question_text: 'اشرح الفرق بين الطاقة الحركية وطاقة الوضع مع أمثلة', points: 20, sort_order: 3, is_mandatory: true },

    // Assessment 4 - Arabic grammar
    { id: 'AQ000000-0000-0000-0000-000000000010', assessment_id: 'A0000000-0000-0000-0000-000000000004', question_type: 'multiple_choice', question_text: 'المبتدأ يكون دائماً...',                            points: 5, sort_order: 1, is_mandatory: true, options_json: JSON.stringify([{ text: 'مرفوعاً', is_correct: true }, { text: 'منصوباً', is_correct: false }, { text: 'مجروراً', is_correct: false }]) },
    { id: 'AQ000000-0000-0000-0000-000000000011', assessment_id: 'A0000000-0000-0000-0000-000000000004', question_type: 'short_answer',    question_text: 'أعرب: "العلم نور"',                                 points: 10, sort_order: 2, is_mandatory: true },
  ];

  await upsertRows('assessment_questions', questions, 'id');
}

async function seedDiscounts() {
  console.log('[12/15] Seeding discounts...');
  const discounts = [
    { id: 'D0000000-0000-0000-0000-000000000001', name: 'خصم الإخوة - الطالب الثاني',          type: 'sibling',      discount_type: 'percentage', value: 10, min_siblings: 2, is_active: true },
    { id: 'D0000000-0000-0000-0000-000000000002', name: 'خصم الإخوة - الطالب الثالث وما بعده',  type: 'sibling',      discount_type: 'percentage', value: 15, min_siblings: 3, is_active: true },
    { id: 'D0000000-0000-0000-0000-000000000003', name: 'كوبون ترحيبي - WELCOME2026',           type: 'coupon',       discount_type: 'percentage', value: 20, min_siblings: 0, max_uses: 100, is_active: true, valid_from: '2026-01-01', valid_until: '2026-12-31' },
    { id: 'D0000000-0000-0000-0000-000000000004', name: 'خصم بداية العام الدراسي',              type: 'promotional',  discount_type: 'percentage', value: 25, min_siblings: 0, max_uses: 50,  is_active: true, valid_from: '2026-09-01', valid_until: '2026-10-15' },
  ];

  await upsertRows('discounts', discounts, 'id');
}

async function seedGradeFeeItems() {
  console.log('[13/15] Seeding grade fee items...');
  const feeItems = [
    { id: 'GF000000-0000-0000-0000-000000000001', grade_id: IDS.gradeG6,  item_name: 'رسوم الفصل الدراسي الأول',  amount: 1500, due_date: '2026-09-15', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000002', grade_id: IDS.gradeG6,  item_name: 'رسوم الفصل الدراسي الثاني', amount: 1500, due_date: '2027-02-01', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000003', grade_id: IDS.gradeG8,  item_name: 'رسوم الفصل الدراسي الأول',  amount: 1800, due_date: '2026-09-15', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000004', grade_id: IDS.gradeG9,  item_name: 'رسوم الفصل الدراسي الأول',  amount: 2000, due_date: '2026-09-15', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000005', grade_id: IDS.gradeG10, item_name: 'رسوم الفصل الدراسي الأول',  amount: 2200, due_date: '2026-09-15', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000006', grade_id: IDS.gradeG11, item_name: 'رسوم الفصل الدراسي الأول',  amount: 2500, due_date: '2026-09-15', created_by: IDS.admin },
    { id: 'GF000000-0000-0000-0000-000000000007', grade_id: IDS.gradeG12, item_name: 'رسوم الفصل الدراسي الأول',  amount: 3000, due_date: '2026-09-15', created_by: IDS.admin },
  ];

  await upsertRows('grade_fee_items', feeItems, 'id');
}

async function seedBundles() {
  console.log('[14/15] Seeding bundles...');
  const bundles = [
    { id: 'B0000000-0000-0000-0000-000000000001', name: 'باقة الصف السادس الشاملة',     description: 'تشمل جميع المواد الدراسية للصف السادس الابتدائي', price: 250, status: 'active' },
    { id: 'B0000000-0000-0000-0000-000000000002', name: 'باقة العلوم المتقدمة',          description: 'فيزياء + كيمياء + أحياء للمرحلة الثانوية',       price: 600, status: 'active' },
  ];

  await upsertRows('bundles', bundles, 'id');
}

async function seedReels() {
  console.log('[15/15] Seeding reels...');
  const reels = [
    { id: 'R0000000-0000-0000-0000-000000000001', title_en: 'Introduction to Algebra',      title_ar: 'مقدمة في الجبر',                 description_en: 'Learn the basics of algebraic expressions', description_ar: 'تعلم أساسيات التعبيرات الجبرية',          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',       thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',       duration_seconds: 90,  subject: 'Mathematics', grade_level: 'Grade 8',  teacher_id: IDS.teacher1, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000002', title_en: 'The Water Cycle',              title_ar: 'دورة الماء',                      description_en: 'Understanding water movement in environment', description_ar: 'فهم كيفية تحرك الماء في بيئتنا',         video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',     thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',     duration_seconds: 75,  subject: 'Science',     grade_level: 'Grade 6',  teacher_id: IDS.teacher2, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000003', title_en: 'Present Perfect Tense',        title_ar: 'زمن المضارع التام',               description_en: 'Master the present perfect tense',           description_ar: 'إتقان زمن المضارع التام مع الأمثلة',       video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',    thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',    duration_seconds: 60,  subject: 'English',     grade_level: 'Grade 7',  teacher_id: IDS.teacher1, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000004', title_en: 'Photosynthesis Explained',     title_ar: 'شرح عملية التمثيل الضوئي',         description_en: 'How plants convert sunlight into energy',     description_ar: 'كيف تحول النباتات ضوء الشمس إلى طاقة',     video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',   thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',   duration_seconds: 85,  subject: 'Biology',     grade_level: 'Grade 9',  teacher_id: IDS.teacher2, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000005', title_en: 'Geometry: Triangles',          title_ar: 'الهندسة: المثلثات',                description_en: 'Types of triangles and their properties',     description_ar: 'أنواع المثلثات وخصائصها',                  video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',       thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',       duration_seconds: 70,  subject: 'Mathematics', grade_level: 'Grade 7',  teacher_id: IDS.teacher1, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000006', title_en: "Newton's Laws of Motion",      title_ar: 'قوانين نيوتن للحركة',              description_en: 'Three fundamental laws of motion',            description_ar: 'فهم القوانين الثلاثة الأساسية للحركة',       video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',  thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',  duration_seconds: 65,  subject: 'Physics',     grade_level: 'Grade 10', teacher_id: IDS.teacher1, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000007', title_en: 'The Periodic Table',           title_ar: 'الجدول الدوري',                    description_en: 'Exploring elements and their organization',   description_ar: 'استكشاف العناصر وتنظيمها',                  video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4', thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg', duration_seconds: 80,  subject: 'Chemistry',   grade_level: 'Grade 9',  teacher_id: IDS.teacher1, status: 'approved', is_published: true },
    { id: 'R0000000-0000-0000-0000-000000000008', title_en: 'Ancient Civilizations',        title_ar: 'الحضارات القديمة',                 description_en: 'Journey through early human civilizations',   description_ar: 'رحلة عبر الحضارات الإنسانية المبكرة',       video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',             thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',             duration_seconds: 95,  subject: 'History',     grade_level: 'Grade 8',  teacher_id: IDS.teacher2, status: 'approved', is_published: true },
  ];

  await upsertRows('reels', reels, 'id');
}

// ─── Validation ───────────────────────────────────────────────────────────────

async function validate() {
  console.log('\n=== VALIDATION REPORT ===\n');

  const tables = [
    'users', 'grades', 'subjects', 'courses', 'course_modules',
    'lessons', 'materials', 'enrollments', 'attendance',
    'assessments', 'assessment_questions', 'discounts',
    'grade_fee_items', 'bundles', 'reels',
  ];

  let allGood = true;

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ${table}: ERROR - ${error.message}`);
      allGood = false;
    } else {
      const padded = table.padEnd(24);
      console.log(`  ${padded} ${count} rows`);
      if (count === 0) allGood = false;
    }
  }

  // FK integrity check: verify enrollments reference valid students and courses
  console.log('\n--- FK Integrity Checks ---');

  const { data: orphanEnrollments } = await supabase
    .from('enrollments')
    .select('id, student_id, course_id')
    .not('student_id', 'in', `(${[IDS.student1, IDS.student2, IDS.student3, IDS.student4].join(',')})`);

  if (orphanEnrollments && orphanEnrollments.length > 0) {
    console.log(`  WARNING: ${orphanEnrollments.length} enrollments with unknown student IDs`);
  } else {
    console.log('  Enrollment FK integrity: OK');
  }

  const { data: orphanLessons } = await supabase
    .from('lessons')
    .select('id, course_id')
    .is('course_id', null);

  if (orphanLessons && orphanLessons.length > 0) {
    console.log(`  WARNING: ${orphanLessons.length} lessons without course_id`);
  } else {
    console.log('  Lesson FK integrity: OK');
  }

  console.log(`\n  Status: ${allGood ? 'ALL TABLES POPULATED' : 'SOME TABLES MAY NEED ATTENTION'}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('================================================================');
  console.log('  EDUVERSE BUSINESS DATA SEED');
  console.log('  Target: ' + SUPABASE_URL);
  console.log('  Mode: Idempotent upsert (skip existing, insert new)');
  console.log('================================================================');

  const start = Date.now();

  try {
    // Test connection
    const { error: connError } = await supabase.from('users').select('id').limit(1);
    if (connError) {
      console.error('Connection failed:', connError.message);
      process.exit(1);
    }
    console.log('Connection: OK\n');

    // Execute in dependency order
    await seedUsers();
    await seedGrades();
    await seedSubjects();
    await seedCourses();
    await seedCourseModules();
    await seedLessons();
    await seedMaterials();
    await seedEnrollments();
    await seedAttendance();
    await seedAssessments();
    await seedAssessmentQuestions();
    await seedDiscounts();
    await seedGradeFeeItems();
    await seedBundles();
    await seedReels();

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`\n--- Seed Summary ---`);
    console.log(`  Inserted: ${successCount}`);
    console.log(`  Skipped:  ${skipCount} (already existed)`);
    console.log(`  Errors:   ${errorCount}`);
    console.log(`  Time:     ${elapsed}s`);

    await validate();

    process.exit(errorCount > 0 ? 1 : 0);
  } catch (err: any) {
    console.error('\nFATAL:', err.message);
    process.exit(1);
  }
}

main();
