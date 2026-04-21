export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  lessonId: string;
  lessonTitle: string;
  courseName: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'early_exit';
  markedAt: string;
  markedBy: string;
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
}

export interface AttendanceReport {
  records: AttendanceRecord[];
  summary: AttendanceSummary;
}

export const mockAttendanceRecords: AttendanceRecord[] = [
  {
    id: '1',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    lessonId: 'lesson-1',
    lessonTitle: 'Introduction to Algebra',
    courseName: 'Mathematics',
    date: '2024-04-03',
    status: 'present',
    markedAt: '2024-04-03T10:05:00',
    markedBy: 'أ. محمد أحمد',
  },
  {
    id: '2',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    lessonId: 'lesson-2',
    lessonTitle: 'Reading Comprehension',
    courseName: 'Arabic Language',
    date: '2024-04-03',
    status: 'present',
    markedAt: '2024-04-03T14:02:00',
    markedBy: 'أ. فاطمة علي',
  },
  {
    id: '3',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    lessonId: 'lesson-3',
    lessonTitle: 'Science Experiments',
    courseName: 'Science',
    date: '2024-04-02',
    status: 'late',
    markedAt: '2024-04-02T09:15:00',
    markedBy: 'أ. خالد يوسف',
  },
  {
    id: '4',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    lessonId: 'lesson-4',
    lessonTitle: 'Grammar Basics',
    courseName: 'English',
    date: '2024-04-01',
    status: 'present',
    markedAt: '2024-04-01T11:00:00',
    markedBy: 'Ms. Sarah Johnson',
  },
  {
    id: '5',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    lessonId: 'lesson-5',
    lessonTitle: 'Geometry Introduction',
    courseName: 'Mathematics',
    date: '2024-03-31',
    status: 'absent',
    markedAt: '2024-03-31T10:30:00',
    markedBy: 'أ. محمد أحمد',
  },
];

export const mockAttendanceSummary: AttendanceSummary = {
  totalDays: 20,
  presentDays: 17,
  absentDays: 2,
  lateDays: 1,
  attendanceRate: 95,
};

export const mockAttendanceReport: AttendanceReport = {
  records: mockAttendanceRecords,
  summary: mockAttendanceSummary,
};
