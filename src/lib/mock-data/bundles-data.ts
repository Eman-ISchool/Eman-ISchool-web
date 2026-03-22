/**
 * Bundles (Classes) Mock Data
 * 
 * Contains mock data for bundles list and bundle detail pages with all 5 tabs:
 * - معلومات (Information)
 * - المواد الدراسية (Subjects)
 * - الجدول (Schedule)
 * - الرسوم (Fees)
 * - الطلاب (Students)
 */

export interface User {
  id: string
  name: string
  avatar?: string
  email?: string
}

export interface Subject {
  id: string
  bundleId: string
  name: string
  instructor: User
  meetingLink?: string
  liveCallStartTime?: string
}

export interface ScheduleEntry {
  id: string
  bundleId: string
  dayOfWeek: string
  time: string
  duration: number
}

export interface Fee {
  id: string
  bundleId: string
  amount: number
  dueDate: Date
  description?: string
}

export interface Student {
  id: string
  name: string
  email: string
  phone: string
  enrollmentDate: Date
  joinedDate: Date
  acceptedDate?: Date
  status: 'active' | 'inactive' | 'pending'
}

export interface BundleDetail {
  id: string
  name: string
  description: string
  category: string
  instructor: User
  status: 'active' | 'inactive'
  startDate: Date
  endDate: Date
  // Tab data (all fetched upfront)
  subjects: Subject[]
  schedule: ScheduleEntry[]
  fees: Fee[]
  students: Student[]
  createdAt: Date
  updatedAt: Date
}

/**
 * Mock bundles list
 */
export const mockBundles: BundleDetail[] = [
  {
    id: 'bundle-1',
    name: 'الصف الأول - الفصل الدراسي الأول',
    description: 'فصل دراسي شامل للصف الأول يشمل جميع المواد الأساسية',
    category: 'الابتدائي',
    instructor: {
      id: 'teacher-1',
      name: 'أحمد محمد',
      avatar: '/avatars/teacher-1.jpg',
      email: 'ahmed@eduverse.com',
    },
    status: 'active',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-06-30'),
    subjects: [],
    schedule: [],
    fees: [],
    students: [],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'bundle-2',
    name: 'الصف الثاني - الفصل الدراسي الأول',
    description: 'فصل دراسي شامل للصف الثاني يشمل جميع المواد الأساسية',
    category: 'الابتدائي',
    instructor: {
      id: 'teacher-2',
      name: 'فاطمة علي',
      avatar: '/avatars/teacher-2.jpg',
      email: 'fatima@eduverse.com',
    },
    status: 'active',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-06-30'),
    subjects: [],
    schedule: [],
    fees: [],
    students: [],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-03-12'),
  },
  {
    id: 'bundle-3',
    name: 'الصف الثالث - الفصل الدراسي الأول',
    description: 'فصل دراسي شامل للصف الثالث يشمل جميع المواد الأساسية',
    category: 'الابتدائي',
    instructor: {
      id: 'teacher-3',
      name: 'محمد عبدالله',
      avatar: '/avatars/teacher-3.jpg',
      email: 'mohammed@eduverse.com',
    },
    status: 'active',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-06-30'),
    subjects: [],
    schedule: [],
    fees: [],
    students: [],
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-03-15'),
  },
  {
    id: 'bundle-4',
    name: 'الصف الرابع - الفصل الدراسي الأول',
    description: 'فصل دراسي شامل للصف الرابع يشمل جميع المواد الأساسية',
    category: 'الابتدائي',
    instructor: {
      id: 'teacher-4',
      name: 'سارة أحمد',
      avatar: '/avatars/teacher-4.jpg',
      email: 'sara@eduverse.com',
    },
    status: 'inactive',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2027-01-30'),
    subjects: [],
    schedule: [],
    fees: [],
    students: [],
    createdAt: new Date('2026-08-25'),
    updatedAt: new Date('2026-08-30'),
  },
]

/**
 * Mock bundle detail with all 5 tabs
 */
export const mockBundleDetail = (id: string): BundleDetail | null => {
  const bundle = mockBundles.find(b => b.id === id)
  if (!bundle) return null

  // Add tab data
  return {
    ...bundle,
    subjects: mockSubjects(id),
    schedule: mockSchedule(id),
    fees: mockFees(id),
    students: mockStudents(id),
  }
}

/**
 * Mock subjects for a bundle
 */
const mockSubjects = (bundleId: string): Subject[] => [
  {
    id: 'subject-1',
    bundleId,
    name: 'الرياضيات',
    instructor: {
      id: 'teacher-1',
      name: 'أحمد محمد',
      avatar: '/avatars/teacher-1.jpg',
      email: 'ahmed@eduverse.com',
    },
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    liveCallStartTime: '14:00',
  },
  {
    id: 'subject-2',
    bundleId,
    name: 'اللغة العربية',
    instructor: {
      id: 'teacher-2',
      name: 'فاطمة علي',
      avatar: '/avatars/teacher-2.jpg',
      email: 'fatima@eduverse.com',
    },
    meetingLink: 'https://meet.google.com/xyz-uvwx-yz',
    liveCallStartTime: '10:00',
  },
  {
    id: 'subject-3',
    bundleId,
    name: 'العلوم',
    instructor: {
      id: 'teacher-3',
      name: 'محمد عبدالله',
      avatar: '/avatars/teacher-3.jpg',
      email: 'mohammed@eduverse.com',
    },
    meetingLink: 'https://meet.google.com/123-456-789',
    liveCallStartTime: '11:30',
  },
  {
    id: 'subject-4',
    bundleId,
    name: 'الدراسات الاجتماعية',
    instructor: {
      id: 'teacher-4',
      name: 'سارة أحمد',
      avatar: '/avatars/teacher-4.jpg',
      email: 'sara@eduverse.com',
    },
    meetingLink: 'https://meet.google.com/987-654-321',
    liveCallStartTime: '09:00',
  },
]

/**
 * Mock schedule for a bundle
 */
const mockSchedule = (bundleId: string): ScheduleEntry[] => [
  {
    id: 'schedule-1',
    bundleId,
    dayOfWeek: 'الأحد',
    time: '08:00',
    duration: 45,
  },
  {
    id: 'schedule-2',
    bundleId,
    dayOfWeek: 'الأحد',
    time: '09:00',
    duration: 45,
  },
  {
    id: 'schedule-3',
    bundleId,
    dayOfWeek: 'الأحد',
    time: '10:00',
    duration: 45,
  },
  {
    id: 'schedule-4',
    bundleId,
    dayOfWeek: 'الاثنين',
    time: '08:00',
    duration: 45,
  },
  {
    id: 'schedule-5',
    bundleId,
    dayOfWeek: 'الاثنين',
    time: '09:00',
    duration: 45,
  },
  {
    id: 'schedule-6',
    bundleId,
    dayOfWeek: 'الثلاثاء',
    time: '08:00',
    duration: 45,
  },
  {
    id: 'schedule-7',
    bundleId,
    dayOfWeek: 'الأربعاء',
    time: '08:00',
    duration: 45,
  },
  {
    id: 'schedule-8',
    bundleId,
    dayOfWeek: 'الخميس',
    time: '08:00',
    duration: 45,
  },
]

/**
 * Mock fees for a bundle
 */
const mockFees = (bundleId: string): Fee[] => [
  {
    id: 'fee-1',
    bundleId,
    amount: 1500,
    dueDate: new Date('2026-01-31'),
    description: 'رسوم التسجيل',
  },
  {
    id: 'fee-2',
    bundleId,
    amount: 500,
    dueDate: new Date('2026-03-31'),
    description: 'رسوم الكتب والمواد',
  },
  {
    id: 'fee-3',
    bundleId,
    amount: 300,
    dueDate: new Date('2026-05-31'),
    description: 'رسوم الأنشطة',
  },
]

/**
 * Mock students for a bundle
 */
const mockStudents = (bundleId: string): Student[] => [
  {
    id: 'student-1',
    name: 'أحمد سعيد',
    email: 'ahmed.said@example.com',
    phone: '+966 50 123 4567',
    enrollmentDate: new Date('2026-01-15'),
    joinedDate: new Date('2026-01-16'),
    acceptedDate: new Date('2026-01-17'),
    status: 'active',
  },
  {
    id: 'student-2',
    name: 'فاطمة حسن',
    email: 'fatima.hassan@example.com',
    phone: '+966 50 234 5678',
    enrollmentDate: new Date('2026-01-18'),
    joinedDate: new Date('2026-01-19'),
    acceptedDate: new Date('2026-01-20'),
    status: 'active',
  },
  {
    id: 'student-3',
    name: 'محمد علي',
    email: 'mohammed.ali@example.com',
    phone: '+966 50 345 6789',
    enrollmentDate: new Date('2026-01-20'),
    joinedDate: new Date('2026-01-21'),
    status: 'pending',
  },
  {
    id: 'student-4',
    name: 'سارة محمد',
    email: 'sara.mohammed@example.com',
    phone: '+966 50 456 7890',
    enrollmentDate: new Date('2026-01-22'),
    joinedDate: new Date('2026-01-23'),
    acceptedDate: new Date('2026-01-24'),
    status: 'active',
  },
  {
    id: 'student-5',
    name: 'عمر أحمد',
    email: 'omar.ahmed@example.com',
    phone: '+966 50 567 8901',
    enrollmentDate: new Date('2026-02-01'),
    joinedDate: new Date('2026-02-02'),
    status: 'inactive',
  },
]
