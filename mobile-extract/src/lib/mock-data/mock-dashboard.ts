export interface DashboardSummary {
  studentCount: number;
  upcomingLessons: UpcomingLesson[];
  recentGrades: RecentGrade[];
  attendanceRate: number;
  activeCoursesCount: number;
  nextLesson: UpcomingLesson | null;
}

export interface UpcomingLesson {
  id: string;
  title: string;
  courseName: string;
  teacherName: string;
  date: string;
  startTime: string;
  endTime: string;
  meetLink?: string;
}

export interface RecentGrade {
  id: string;
  courseName: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  date: string;
}

export interface ParentDashboardData extends DashboardSummary {
  children: ChildSummary[];
}

export interface ChildSummary {
  id: string;
  name: string;
  grade: string;
  avatarUrl?: string;
  attendanceRate: number;
  averageScore: number;
  upcomingLessonsCount: number;
}

export interface StudentDashboardData extends DashboardSummary {
  enrollmentsCount: number;
  completedLessons: number;
  totalLessons: number;
  progressPercentage: number;
}

export interface TeacherDashboardData extends DashboardSummary {
  coursesCount: number;
  studentsCount: number;
  lessonsToday: number;
  pendingGrades: number;
}

export const mockParentDashboard: ParentDashboardData = {
  studentCount: 2,
  attendanceRate: 95,
  activeCoursesCount: 6,
  upcomingLessons: [
    {
      id: '1',
      title: 'Introduction to Algebra',
      courseName: 'Mathematics',
      teacherName: 'أ. محمد أحمد',
      date: '2024-04-05',
      startTime: '10:00',
      endTime: '11:00',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Reading Comprehension',
      courseName: 'Arabic Language',
      teacherName: 'أ. فاطمة علي',
      date: '2024-04-05',
      startTime: '14:00',
      endTime: '15:00',
    },
  ],
  recentGrades: [
    {
      id: '1',
      courseName: 'Mathematics',
      assessmentType: 'Quiz',
      score: 85,
      maxScore: 100,
      date: '2024-04-03',
    },
    {
      id: '2',
      courseName: 'Science',
      assessmentType: 'Assignment',
      score: 45,
      maxScore: 50,
      date: '2024-04-02',
    },
  ],
  nextLesson: {
    id: '1',
    title: 'Introduction to Algebra',
    courseName: 'Mathematics',
    teacherName: 'أ. محمد أحمد',
    date: '2024-04-05',
    startTime: '10:00',
    endTime: '11:00',
    meetLink: 'https://meet.google.com/abc-defg-hij',
  },
  children: [
    {
      id: '1',
      name: 'أحمد محمد',
      grade: 'الصف السادس',
      attendanceRate: 98,
      averageScore: 92,
      upcomingLessonsCount: 3,
    },
    {
      id: '2',
      name: 'سارة محمد',
      grade: 'الصف الرابع',
      attendanceRate: 95,
      averageScore: 88,
      upcomingLessonsCount: 4,
    },
  ],
};

export const mockStudentDashboard: StudentDashboardData = {
  studentCount: 1,
  attendanceRate: 95,
  activeCoursesCount: 5,
  enrollmentsCount: 5,
  completedLessons: 45,
  totalLessons: 60,
  progressPercentage: 75,
  upcomingLessons: [
    {
      id: '1',
      title: 'Introduction to Algebra',
      courseName: 'Mathematics',
      teacherName: 'أ. محمد أحمد',
      date: '2024-04-05',
      startTime: '10:00',
      endTime: '11:00',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Reading Comprehension',
      courseName: 'Arabic Language',
      teacherName: 'أ. فاطمة علي',
      date: '2024-04-05',
      startTime: '14:00',
      endTime: '15:00',
    },
  ],
  recentGrades: [
    {
      id: '1',
      courseName: 'Mathematics',
      assessmentType: 'Quiz',
      score: 85,
      maxScore: 100,
      date: '2024-04-03',
    },
    {
      id: '2',
      courseName: 'Science',
      assessmentType: 'Assignment',
      score: 45,
      maxScore: 50,
      date: '2024-04-02',
    },
  ],
  nextLesson: {
    id: '1',
    title: 'Introduction to Algebra',
    courseName: 'Mathematics',
    teacherName: 'أ. محمد أحمد',
    date: '2024-04-05',
    startTime: '10:00',
    endTime: '11:00',
    meetLink: 'https://meet.google.com/abc-defg-hij',
  },
};

export const mockTeacherDashboard: TeacherDashboardData = {
  studentCount: 45,
  attendanceRate: 92,
  activeCoursesCount: 4,
  coursesCount: 4,
  studentsCount: 45,
  lessonsToday: 3,
  pendingGrades: 12,
  upcomingLessons: [
    {
      id: '1',
      title: 'Introduction to Algebra',
      courseName: 'Mathematics - Grade 6',
      teacherName: 'You',
      date: '2024-04-05',
      startTime: '10:00',
      endTime: '11:00',
      meetLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
      id: '2',
      title: 'Geometry Basics',
      courseName: 'Mathematics - Grade 5',
      teacherName: 'You',
      date: '2024-04-05',
      startTime: '14:00',
      endTime: '15:00',
    },
  ],
  recentGrades: [],
  nextLesson: {
    id: '1',
    title: 'Introduction to Algebra',
    courseName: 'Mathematics - Grade 6',
    teacherName: 'You',
    date: '2024-04-05',
    startTime: '10:00',
    endTime: '11:00',
    meetLink: 'https://meet.google.com/abc-defg-hij',
  },
};
