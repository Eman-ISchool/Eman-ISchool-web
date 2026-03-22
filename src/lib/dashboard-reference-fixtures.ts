export interface CourseListItem {
  id: string;
  title: string;
  subtitle: string;
  teacher: string;
  badge?: string;
}

export interface CourseLessonItem {
  id: string;
  title: string;
  date: string;
  description: string;
  status: 'published' | 'draft';
}

export interface CourseAssignmentItem {
  id: string;
  title: string;
  dueDate: string;
  description: string;
  submissions: number;
}

export interface CourseExamItem {
  id: string;
  title: string;
  dueDate: string;
  attempts: number;
  status: string;
}

export interface CourseLiveSessionItem {
  id: string;
  day: number;
  time: string;
  title: string;
  teacher: string;
}

export interface CourseDetailFixture {
  id: string;
  title: string;
  teacher: string;
  details: string;
  meetingLink: string;
  lessons: CourseLessonItem[];
  assignments: CourseAssignmentItem[];
  exams: CourseExamItem[];
  liveSessions: CourseLiveSessionItem[];
}

export interface CategoryRow {
  id: string;
  name: string;
  description: string;
  courses: string;
  bundles: string;
  createdAt: string;
}

export interface BundleRow {
  id: string;
  name: string;
  description: string;
  category: string;
  teacher: string;
  students: number;
  status: string;
  createdAt: string;
}

export interface BundleSubject {
  id: string;
  name: string;
  teacher: string;
  liveLink: string;
}

export interface BundleScheduleItem {
  id: string;
  day: string;
  time: string;
  subject: string;
}

export interface BundleFeeItem {
  id: string;
  title: string;
  amount: string;
  dueDate: string;
}

export interface BundleStudentItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  joinedAt: string;
  acceptedAt: string;
}

export interface BundleDetailFixture {
  id: string;
  name: string;
  description: string;
  category: string;
  teacher: string;
  startDate: string;
  endDate: string;
  acceptingRequests: boolean;
  active: boolean;
}

export interface ExamGroupRow {
  id: string;
  name: string;
  description: string;
  schedule: string;
  quizzes: number;
  status: string;
  createdAt: string;
}

export interface QuizItem {
  id: number;
  title: string;
  subject: string;
  lesson: string;
  dueDate: string;
  dueTime?: string;
  questions: number;
  maxAttempts: number;
  passingRate: string;
  duration?: string;
  status: string;
}

export interface QuizManageQuestion {
  id: number;
  title: string;
  fileType: string;
}

export interface LessonReferenceMaterial {
  id: string;
  title: string;
  type: string;
}

export interface LessonReferenceAttendance {
  id: string;
  studentName: string;
  status: 'حاضر' | 'غائب' | 'متأخر';
}

export interface LessonDetailFixture {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoLink: string;
  materials: LessonReferenceMaterial[];
  attendance: LessonReferenceAttendance[];
}

export const courseListItems: CourseListItem[] = [
  { id: '1', title: 'Basics', subtitle: 'Program for kids', teacher: 'ابراهيم محمد' },
  { id: '2', title: 'Phonatics', subtitle: 'برنامج التأسيس - أصوات الحروف', teacher: 'ابراهيم محمد' },
  { id: '3', title: 'المعلم الإلكتروني', subtitle: 'برنامج المعلم الإلكتروني', teacher: 'Fadi test', badge: 'جديد' },
  { id: '4', title: 'English(1)', subtitle: 'British Abilities English', teacher: 'ابراهيم محمد' },
  { id: '5', title: 'English(2)', subtitle: 'برنامج المهارات الأساسية', teacher: 'ابراهيم محمد' },
  { id: '6', title: 'اللغة العربية', subtitle: 'Zainab elfadili Ibrahim', teacher: 'ابراهيم محمد' },
  { id: '7', title: 'الرياضيات (1)', subtitle: 'فادي', teacher: 'ابراهيم محمد' },
  { id: '8', title: 'التكنولوجيا', subtitle: 'Fadi test', teacher: 'ابراهيم محمد' },
  { id: '9', title: 'الرياضيات', subtitle: 'عمر حسن', teacher: 'ابراهيم محمد' },
];

export const courseDetails: Record<string, CourseDetailFixture> = {
  '1': {
    id: '1',
    title: 'Basics',
    teacher: 'ابراهيم محمد',
    details: 'التأسيس',
    meetingLink: 'https://meet.google.com/zup-kupx-cln',
    lessons: [
      { id: '1', title: 'الحروف الأساسية', date: '2026-03-12 08:00', description: 'شرح تمهيدي لمخارج الحروف وأنشطتها.', status: 'published' },
      { id: '2', title: 'الأصوات القصيرة', date: '2026-03-14 08:00', description: 'مقاطع صوتية وتمارين نطق عملية.', status: 'published' },
      { id: '3', title: 'التكرار السمعي', date: '2026-03-18 08:00', description: 'جلسة مراجعة تفاعلية للطلاب.', status: 'draft' },
    ],
    assignments: [
      { id: 'a1', title: 'تدريب كتابة الحروف', dueDate: '2026-03-24', description: 'رفع صورة ورقة التدريب بعد إكمال الكتابة.', submissions: 18 },
      { id: 'a2', title: 'واجب مراجعة الأصوات', dueDate: '2026-03-28', description: 'إجابة قصيرة على أصوات الحروف المستهدفة.', submissions: 11 },
    ],
    exams: [
      { id: 'e1', title: 'اختبار الوحدة الأولى', dueDate: '2026-03-27', attempts: 0, status: 'نشط' },
      { id: 'e2', title: 'اختبار مراجعة منتصف الشهر', dueDate: '2026-03-31', attempts: 0, status: 'مسودة' },
    ],
    liveSessions: [
      { id: 's1', day: 21, time: '08:00', title: 'كورس تأسيس اللغة الإنجليزية للأطفال', teacher: 'ابراهيم محمد' },
      { id: 's2', day: 24, time: '08:00', title: 'كورس تأسيس اللغة الإنجليزية للأطفال', teacher: 'ابراهيم محمد' },
      { id: 's3', day: 28, time: '08:00', title: 'كورس تأسيس اللغة الإنجليزية للأطفال', teacher: 'ابراهيم محمد' },
      { id: 's4', day: 31, time: '08:00', title: 'كورس تأسيس اللغة الإنجليزية للأطفال', teacher: 'ابراهيم محمد' },
    ],
  },
};

export const categoryRows: CategoryRow[] = [
  { id: '#1', name: 'اللغات', description: 'لا يوجد وصف', courses: '—', bundles: '—', createdAt: '2025-09-25T11:14:57.564Z' },
  { id: '#2', name: 'second', description: 'لا يوجد وصف', courses: '—', bundles: '—', createdAt: '2026-03-22T02:42:18.471Z' },
];

export const bundleRows: BundleRow[] = [
  {
    id: '#1',
    name: 'الفصل التمهيدي',
    description: 'برنامج تأسيسي للأطفال',
    category: 'اللغات',
    teacher: 'ابراهيم محمد',
    students: 12,
    status: 'نشط',
    createdAt: '2026-03-18',
  },
  {
    id: '#2',
    name: 'الفصل الأول',
    description: 'مسار التهيئة الأكاديمية',
    category: 'second',
    teacher: 'رحمة خليل',
    students: 8,
    status: 'نشط',
    createdAt: '2026-03-20',
  },
];

export const bundleDetails: Record<string, BundleDetailFixture> = {
  '1': {
    id: '1',
    name: 'الفصل التمهيدي',
    description: 'برنامج تأسيسي للأطفال',
    category: 'اللغات',
    teacher: 'ابراهيم محمد',
    startDate: '2026-03-18',
    endDate: '2026-06-18',
    acceptingRequests: true,
    active: true,
  },
  '2': {
    id: '2',
    name: 'الفصل الأول',
    description: 'مسار التهيئة الأكاديمية',
    category: 'second',
    teacher: 'رحمة خليل',
    startDate: '2026-03-20',
    endDate: '2026-06-20',
    acceptingRequests: true,
    active: true,
  },
};

export const bundleSubjects: BundleSubject[] = [
  { id: 'bs1', name: 'Basics', teacher: 'ابراهيم محمد', liveLink: 'https://meet.google.com/zup-kupx-cln' },
  { id: 'bs2', name: 'Phonatics', teacher: 'ابراهيم محمد', liveLink: 'https://meet.google.com/air-phon-kids' },
  { id: 'bs3', name: 'اللغة العربية', teacher: 'Zainab elfadili Ibrahim', liveLink: 'https://meet.google.com/arab-lang-kids' },
];

export const bundleSchedule: BundleScheduleItem[] = [
  { id: 'sch1', day: 'الأحد', time: '08:00', subject: 'Basics' },
  { id: 'sch2', day: 'الثلاثاء', time: '08:00', subject: 'Phonatics' },
  { id: 'sch3', day: 'الخميس', time: '09:00', subject: 'اللغة العربية' },
];

export const bundleFees: BundleFeeItem[] = [
  { id: 'fee1', title: 'رسوم التسجيل', amount: '$75', dueDate: '2026-04-01' },
  { id: 'fee2', title: 'القسط الشهري', amount: '$120', dueDate: '2026-04-10' },
];

export const bundleStudents: BundleStudentItem[] = [
  {
    id: 'st1',
    name: 'سارة محمد',
    email: 'sara@example.com',
    phone: '+971 50 123 4567',
    status: 'نشط',
    joinedAt: '2026-03-18',
    acceptedAt: '2026-03-19',
  },
  {
    id: 'st2',
    name: 'أحمد علي',
    email: 'ahmed@example.com',
    phone: '+971 50 234 5678',
    status: 'نشط',
    joinedAt: '2026-03-19',
    acceptedAt: '2026-03-20',
  },
  {
    id: 'st3',
    name: 'ريم خالد',
    email: 'reem@example.com',
    phone: '+971 50 345 6789',
    status: 'قيد المراجعة',
    joinedAt: '2026-03-20',
    acceptedAt: 'بانتظار الاعتماد',
  },
];

export const examGroupRows: ExamGroupRow[] = [
  { id: '#1', name: 'test', description: '-', schedule: '-', quizzes: 0, status: 'نشط', createdAt: '3/22/2026' },
];

export const quizItems: QuizItem[] = [
  {
    id: 9,
    title: 'تمرين كهربية ساكنة',
    subject: 'الفيزياء',
    lesson: 'الكهربية الساكنة',
    dueDate: '10/31/2025',
    dueTime: 'PM 07:47',
    questions: 2,
    maxAttempts: 3,
    passingRate: '50%',
    status: 'مسودة',
  },
  {
    id: 8,
    title: 'اختبار رقم (1)',
    subject: 'اللغة العربية (3)',
    lesson: 'المبتدأ والخبر',
    dueDate: '10/27/2025',
    dueTime: 'PM 08:32',
    questions: 3,
    maxAttempts: 3,
    passingRate: '50%',
    duration: '121 دقيقة',
    status: 'مسودة',
  },
  {
    id: 7,
    title: 'تاسك (3)',
    subject: 'المعلم الإلكتروني',
    lesson: 'المحاضرة الثالثة الاختبارات والواجبات',
    dueDate: '10/28/2025',
    dueTime: 'AM 12:00',
    questions: 2,
    maxAttempts: 3,
    passingRate: '50%',
    status: 'مسودة',
  },
  {
    id: 6,
    title: 'التاسك (1)',
    subject: 'المعلم الإلكتروني',
    lesson: 'المحاضرة الأولى',
    dueDate: '10/21/2025',
    dueTime: 'PM 11:00',
    questions: 5,
    maxAttempts: 10,
    passingRate: '10%',
    status: 'مسودة',
  },
  {
    id: 5,
    title: 'التاسك (2)',
    subject: 'المعلم الإلكتروني',
    lesson: 'المحاضرة الثانية العمل على المنصة',
    dueDate: '10/25/2025',
    dueTime: 'PM 06:00',
    questions: 4,
    maxAttempts: 10,
    passingRate: '50%',
    status: 'مطلوب',
  },
];

export const quizManageQuestions: QuizManageQuestion[] = [
  { id: 1, title: 'ارفق اجابة السؤال الاول هنا', fileType: 'تحميل ملف' },
  { id: 2, title: 'ارفق اجابة السؤال الثاني هنا', fileType: 'تحميل ملف' },
];

export const lessonDetails: Record<string, LessonDetailFixture> = {
  '1': {
    id: '1',
    courseId: '1',
    title: 'الحروف الأساسية',
    content: 'شرح تمهيدي لمخارج الحروف وأنشطتها مع تمارين عملية للطلاب داخل الصف.',
    videoLink: 'https://meet.google.com/zup-kupx-cln',
    materials: [
      { id: 'lm1', title: 'ورقة عمل الحروف', type: 'PDF' },
      { id: 'lm2', title: 'بطاقات الأصوات', type: 'PPT' },
    ],
    attendance: [
      { id: 'la1', studentName: 'سارة محمد', status: 'حاضر' },
      { id: 'la2', studentName: 'أحمد علي', status: 'حاضر' },
      { id: 'la3', studentName: 'ريم خالد', status: 'متأخر' },
    ],
  },
  '2': {
    id: '2',
    courseId: '1',
    title: 'الأصوات القصيرة',
    content: 'مقاطع صوتية وتمارين نطق عملية مع نشاط تفاعلي لتثبيت الأصوات القصيرة.',
    videoLink: 'https://meet.google.com/zup-kupx-cln',
    materials: [{ id: 'lm3', title: 'بطاقة مراجعة الأصوات القصيرة', type: 'PDF' }],
    attendance: [
      { id: 'la4', studentName: 'سارة محمد', status: 'حاضر' },
      { id: 'la5', studentName: 'أحمد علي', status: 'غائب' },
    ],
  },
  '3': {
    id: '3',
    courseId: '1',
    title: 'التكرار السمعي',
    content: 'جلسة مراجعة تفاعلية للطلاب مع أنشطة تكرار واستماع.',
    videoLink: 'https://meet.google.com/zup-kupx-cln',
    materials: [],
    attendance: [],
  },
};

lessonDetails.l1 = lessonDetails['1'];
lessonDetails.l2 = lessonDetails['2'];
lessonDetails.l3 = lessonDetails['3'];
