export interface Course {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  teacherName: string;
  thumbnailUrl?: string;
  progress: number;
  enrollmentStatus: 'active' | 'completed' | 'pending';
  startDate: string;
  endDate: string;
  studentsCount?: number;
}

export interface CourseDetail extends Course {
  overview: string;
  lessons: CourseLesson[];
  materials: CourseMaterial[];
  students?: CourseStudent[];
}

export interface CourseLesson {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetLink?: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
  uploadedAt: string;
}

export interface CourseStudent {
  id: string;
  name: string;
  avatarUrl?: string;
  progress: number;
  lastActive: string;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Mathematics - Grade 6',
    description: 'Complete mathematics curriculum for 6th grade covering algebra, geometry, and statistics.',
    subject: 'Mathematics',
    gradeLevel: 'Grade 6',
    teacherName: 'أ. محمد أحمد',
    thumbnailUrl: '/images/courses/math.jpg',
    progress: 75,
    enrollmentStatus: 'active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    studentsCount: 25,
  },
  {
    id: '2',
    title: 'Arabic Language - Grade 6',
    description: 'Comprehensive Arabic language course covering reading, writing, and grammar.',
    subject: 'Arabic',
    gradeLevel: 'Grade 6',
    teacherName: 'أ. فاطمة علي',
    thumbnailUrl: '/images/courses/arabic.jpg',
    progress: 60,
    enrollmentStatus: 'active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    studentsCount: 28,
  },
  {
    id: '3',
    title: 'Science - Grade 6',
    description: 'Explore the wonders of science through experiments and interactive lessons.',
    subject: 'Science',
    gradeLevel: 'Grade 6',
    teacherName: 'أ. خالد يوسف',
    thumbnailUrl: '/images/courses/science.jpg',
    progress: 45,
    enrollmentStatus: 'active',
    startDate: '2024-01-15',
    endDate: '2024-06-30',
    studentsCount: 22,
  },
  {
    id: '4',
    title: 'English Language - Grade 6',
    description: 'Build strong English language skills with focus on communication and grammar.',
    subject: 'English',
    gradeLevel: 'Grade 6',
    teacherName: 'Ms. Sarah Johnson',
    thumbnailUrl: '/images/courses/english.jpg',
    progress: 100,
    enrollmentStatus: 'completed',
    startDate: '2023-09-01',
    endDate: '2024-01-15',
    studentsCount: 30,
  },
];

export const mockCourseDetail: CourseDetail = {
  id: '1',
  title: 'Mathematics - Grade 6',
  description: 'Complete mathematics curriculum for 6th grade covering algebra, geometry, and statistics.',
  subject: 'Mathematics',
  gradeLevel: 'Grade 6',
  teacherName: 'أ. محمد أحمد',
  thumbnailUrl: '/images/courses/math.jpg',
  progress: 75,
  enrollmentStatus: 'active',
  startDate: '2024-01-15',
  endDate: '2024-06-30',
  studentsCount: 25,
  overview: 'This comprehensive mathematics course is designed for 6th-grade students. It covers fundamental concepts in algebra, geometry, and statistics. Students will develop problem-solving skills and mathematical reasoning through interactive lessons and practical exercises.',
  lessons: [
    {
      id: '1',
      title: 'Introduction to Algebra',
      date: '2024-04-05',
      startTime: '10:00',
      endTime: '11:00',
      status: 'scheduled',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Linear Equations',
      date: '2024-04-07',
      startTime: '10:00',
      endTime: '11:00',
      status: 'scheduled',
    },
    {
      id: '3',
      title: 'Geometry Basics',
      date: '2024-04-03',
      startTime: '10:00',
      endTime: '11:00',
      status: 'completed',
      meetLink: 'https://meet.google.com/xyz-uvwx-yz',
    },
  ],
  materials: [
    {
      id: '1',
      title: 'Algebra Fundamentals Guide',
      type: 'pdf',
      url: '/materials/algebra-guide.pdf',
      uploadedAt: '2024-01-20',
    },
    {
      id: '2',
      title: 'Introduction Video',
      type: 'video',
      url: 'https://youtube.com/watch?v=example',
      uploadedAt: '2024-01-22',
    },
    {
      id: '3',
      title: 'Practice Exercises',
      type: 'document',
      url: '/materials/practice-exercises.docx',
      uploadedAt: '2024-02-01',
    },
  ],
  students: [
    {
      id: '1',
      name: 'أحمد محمد',
      progress: 85,
      lastActive: '2024-04-04',
    },
    {
      id: '2',
      name: 'سارة علي',
      progress: 92,
      lastActive: '2024-04-04',
    },
    {
      id: '3',
      name: 'خالد يوسف',
      progress: 78,
      lastActive: '2024-04-03',
    },
  ],
};
