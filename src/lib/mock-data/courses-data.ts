/**
 * Courses Mock Data
 * 
 * Contains mock data for courses list and course detail pages with all 4 tabs:
 * - المعلومات (Information)
 * - الدروس (Lessons)
 * - الواجبات (Assignments)
 * - الامتحانات (Exams)
 */

export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  content: string
  videoLink?: string
  materials: Material[]
  createdAt: Date
}

export interface Material {
  id: string
  name: string
  type: 'pdf' | 'video' | 'document' | 'image'
  url: string
}

export interface Assignment {
  id: string
  courseId: string
  title: string
  description: string
  dueDate: Date
  rubric?: string
  submissions: number
  createdAt: Date
}

export interface CourseExam {
  id: string
  courseId: string
  name: string
  schedule?: Date
  attempts: number
  status: 'active' | 'inactive'
}

export interface LiveClass {
  id: string
  courseId: string
  date: Date
  time: string
  duration: number
  meetingLink?: string
}

export interface CourseDetail {
  id: string
  title: string
  description: string
  category: string
  instructor: User
  enrollmentCount: number
  status: 'active' | 'inactive' | 'draft'
  thumbnail?: string
  meetingLink?: string
  // Tab data (all fetched upfront)
  lessons: Lesson[]
  assignments: Assignment[]
  exams: CourseExam[]
  liveClasses: LiveClass[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Mock courses list
 */
export const mockCourses: CourseDetail[] = [
  {
    id: 'course-1',
    title: 'الرياضيات للصف الأول',
    description: 'دورة شاملة في الرياضيات الأساسية للصف الأول الابتدائي',
    category: 'الرياضيات',
    instructor: {
      id: 'teacher-1',
      name: 'أحمد محمد',
      avatar: '/avatars/teacher-1.jpg',
      email: 'ahmed@eduverse.com',
    },
    enrollmentCount: 45,
    status: 'active',
    thumbnail: '/courses/math-grade1.jpg',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    lessons: [],
    assignments: [],
    exams: [],
    liveClasses: [],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'course-2',
    title: 'اللغة العربية المتقدمة',
    description: 'تطوير مهارات القراءة والكتابة والنحو في اللغة العربية',
    category: 'اللغة العربية',
    instructor: {
      id: 'teacher-2',
      name: 'فاطمة علي',
      avatar: '/avatars/teacher-2.jpg',
      email: 'fatima@eduverse.com',
    },
    enrollmentCount: 38,
    status: 'active',
    thumbnail: '/courses/arabic-advanced.jpg',
    lessons: [],
    assignments: [],
    exams: [],
    liveClasses: [],
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-03-15'),
  },
  {
    id: 'course-3',
    title: 'العلوم الطبيعية',
    description: 'مقدمة في العلوم الطبيعية والتجارب العملية',
    category: 'العلوم',
    instructor: {
      id: 'teacher-3',
      name: 'محمد عبدالله',
      avatar: '/avatars/teacher-3.jpg',
      email: 'mohammed@eduverse.com',
    },
    enrollmentCount: 52,
    status: 'active',
    thumbnail: '/courses/science-natural.jpg',
    lessons: [],
    assignments: [],
    exams: [],
    liveClasses: [],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'course-4',
    title: 'اللغة الإنجليزية للمبتدئين',
    description: 'أساسيات اللغة الإنجليزية للطلاب الجدد',
    category: 'اللغة الإنجليزية',
    instructor: {
      id: 'teacher-4',
      name: 'سارة أحمد',
      avatar: '/avatars/teacher-4.jpg',
      email: 'sara@eduverse.com',
    },
    enrollmentCount: 65,
    status: 'active',
    thumbnail: '/courses/english-beginner.jpg',
    lessons: [],
    assignments: [],
    exams: [],
    liveClasses: [],
    createdAt: new Date('2026-02-10'),
    updatedAt: new Date('2026-03-18'),
  },
  {
    id: 'course-5',
    title: 'التاريخ الإسلامي',
    description: 'دراسة تاريخ الإسلام من البداية إلى العصور الحديثة',
    category: 'الدراسات الإسلامية',
    instructor: {
      id: 'teacher-5',
      name: 'عمر خالد',
      avatar: '/avatars/teacher-5.jpg',
      email: 'omar@eduverse.com',
    },
    enrollmentCount: 30,
    status: 'inactive',
    thumbnail: '/courses/islamic-history.jpg',
    lessons: [],
    assignments: [],
    exams: [],
    liveClasses: [],
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-28'),
  },
]

/**
 * Mock course detail with all 4 tabs
 */
export const mockCourseDetail = (id: string): CourseDetail | null => {
  const course = mockCourses.find(c => c.id === id)
  if (!course) return null

  // Add tab data
  return {
    ...course,
    lessons: mockLessons(id),
    assignments: mockAssignments(id),
    exams: mockCourseExams(id),
    liveClasses: mockLiveClasses(id),
  }
}

/**
 * Mock lessons for a course
 */
const mockLessons = (courseId: string): Lesson[] => [
  {
    id: 'lesson-1',
    courseId,
    title: 'مقدمة في الرياضيات',
    content: 'في هذا الدرس سنتعلم أساسيات الأرقام والعمليات الحسابية...',
    videoLink: 'https://example.com/videos/lesson-1.mp4',
    materials: [
      {
        id: 'mat-1',
        name: 'ملخص الدرس',
        type: 'pdf',
        url: '/materials/lesson-1-summary.pdf',
      },
      {
        id: 'mat-2',
        name: 'تمارين إضافية',
        type: 'document',
        url: '/materials/lesson-1-exercises.docx',
      },
    ],
    createdAt: new Date('2026-02-01'),
  },
  {
    id: 'lesson-2',
    courseId,
    title: 'الجمع والطرح',
    content: 'شرح مفصل لعمليات الجمع والطرح مع أمثلة عملية...',
    videoLink: 'https://example.com/videos/lesson-2.mp4',
    materials: [
      {
        id: 'mat-3',
        name: 'فيديو توضيحي',
        type: 'video',
        url: '/materials/lesson-2-video.mp4',
      },
    ],
    createdAt: new Date('2026-02-08'),
  },
  {
    id: 'lesson-3',
    courseId,
    title: 'الضرب والقسمة',
    content: 'تعلم أساسيات الضرب والقسمة...',
    videoLink: 'https://example.com/videos/lesson-3.mp4',
    materials: [],
    createdAt: new Date('2026-02-15'),
  },
]

/**
 * Mock assignments for a course
 */
const mockAssignments = (courseId: string): Assignment[] => [
  {
    id: 'assign-1',
    courseId,
    title: 'واجب الأسبوع الأول',
    description: 'حل التمارين من صفحة 10 إلى 15',
    dueDate: new Date('2026-03-25'),
    rubric: 'الإجابة الصحيحة: 5 نقاط، الإجابة الجزئية: 2-3 نقاط',
    submissions: 38,
    createdAt: new Date('2026-03-18'),
  },
  {
    id: 'assign-2',
    courseId,
    title: 'مشروع البحث',
    description: 'بحث عن تاريخ الرياضيات',
    dueDate: new Date('2026-04-01'),
    rubric: 'الجودة: 40%، المحتوى: 40%، التنظيم: 20%',
    submissions: 25,
    createdAt: new Date('2026-03-20'),
  },
]

/**
 * Mock exams for a course
 */
const mockCourseExams = (courseId: string): CourseExam[] => [
  {
    id: 'exam-1',
    courseId,
    name: 'اختبار الفصل الأول',
    schedule: new Date('2026-04-15T10:00:00'),
    attempts: 1,
    status: 'active',
  },
  {
    id: 'exam-2',
    courseId,
    name: 'اختبار الفصل الثاني',
    schedule: new Date('2026-06-15T10:00:00'),
    attempts: 0,
    status: 'inactive',
  },
]

/**
 * Mock live classes for a course
 */
const mockLiveClasses = (courseId: string): LiveClass[] => [
  {
    id: 'live-1',
    courseId,
    date: new Date('2026-03-25'),
    time: '14:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
  },
  {
    id: 'live-2',
    courseId,
    date: new Date('2026-04-01'),
    time: '14:00',
    duration: 60,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
]
