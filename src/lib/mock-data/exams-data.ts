/**
 * Exams Mock Data
 * 
 * Contains mock data for exams table with 8 columns:
 * - المعرف (ID)
 * - الاسم (Name)
 * - الوصف (Description)
 * - الجدول الزمني (Schedule)
 * - الاختبارات (Attempts)
 * - الحالة (Status)
 * - تاريخ الإنشاء (Created)
 * - الإجراءات (Actions)
 */

export interface Exam {
  id: string
  name: string
  description: string
  schedule?: Date
  attemptsCount: number
  status: 'active' | 'inactive'
  createdAt: Date
}

/**
 * Mock exams list
 */
export const mockExams: Exam[] = [
  {
    id: 'exam-1',
    name: 'اختبار الرياضيات - الفصل الأول',
    description: 'اختبار شامل لمادة الرياضيات للفصل الدراسي الأول',
    schedule: new Date('2026-04-15T10:00:00'),
    attemptsCount: 45,
    status: 'active',
    createdAt: new Date('2026-03-10'),
  },
  {
    id: 'exam-2',
    name: 'اختبار اللغة العربية - الفصل الأول',
    description: 'اختبار شامل لمادة اللغة العربية للفصل الدراسي الأول',
    schedule: new Date('2026-04-16T10:00:00'),
    attemptsCount: 38,
    status: 'active',
    createdAt: new Date('2026-03-12'),
  },
  {
    id: 'exam-3',
    name: 'اختبار العلوم - الفصل الأول',
    description: 'اختبار شامل لمادة العلوم للفصل الدراسي الأول',
    schedule: new Date('2026-04-17T10:00:00'),
    attemptsCount: 52,
    status: 'active',
    createdAt: new Date('2026-03-15'),
  },
  {
    id: 'exam-4',
    name: 'اختبار اللغة الإنجليزية - الفصل الأول',
    description: 'اختبار شامل لمادة اللغة الإنجليزية للفصل الدراسي الأول',
    schedule: new Date('2026-04-18T10:00:00'),
    attemptsCount: 65,
    status: 'active',
    createdAt: new Date('2026-03-18'),
  },
  {
    id: 'exam-5',
    name: 'اختبار الرياضيات - الفصل الثاني',
    description: 'اختبار شامل لمادة الرياضيات للفصل الدراسي الثاني',
    schedule: new Date('2026-06-15T10:00:00'),
    attemptsCount: 0,
    status: 'inactive',
    createdAt: new Date('2026-05-10'),
  },
  {
    id: 'exam-6',
    name: 'اختبار الدراسات الاجتماعية - الفصل الأول',
    description: 'اختبار شامل لمادة الدراسات الاجتماعية للفصل الدراسي الأول',
    schedule: new Date('2026-04-19T10:00:00'),
    attemptsCount: 30,
    status: 'active',
    createdAt: new Date('2026-03-20'),
  },
  {
    id: 'exam-7',
    name: 'اختبار الدراسات الإسلامية - الفصل الأول',
    description: 'اختبار شامل لمادة الدراسات الإسلامية للفصل الدراسي الأول',
    schedule: new Date('2026-04-20T10:00:00'),
    attemptsCount: 28,
    status: 'active',
    createdAt: new Date('2026-03-22'),
  },
  {
    id: 'exam-8',
    name: 'اختبار الفنون - الفصل الأول',
    description: 'اختبار شامل لمادة الفنون للفصل الدراسي الأول',
    schedule: new Date('2026-04-21T10:00:00'),
    attemptsCount: 15,
    status: 'active',
    createdAt: new Date('2026-03-25'),
  },
]
