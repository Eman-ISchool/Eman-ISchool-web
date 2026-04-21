export interface GradeReport {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  assessmentType: 'quiz' | 'assignment' | 'exam' | 'project';
  score: number;
  maxScore: number;
  feedback?: string;
  gradedBy: string;
  gradedAt: string;
}

export interface GradeSummary {
  courseId: string;
  courseName: string;
  averageScore: number;
  totalAssessments: number;
  highestScore: number;
  lowestScore: number;
}

export interface GradeReportWithSummary {
  grades: GradeReport[];
  summary: GradeSummary[];
  overallAverage: number;
  totalGrades: number;
}

export const mockGrades: GradeReport[] = [
  {
    id: '1',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-1',
    courseName: 'Mathematics',
    assessmentType: 'quiz',
    score: 85,
    maxScore: 100,
    feedback: 'Good work! Keep practicing on word problems.',
    gradedBy: 'أ. محمد أحمد',
    gradedAt: '2024-04-03',
  },
  {
    id: '2',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-1',
    courseName: 'Mathematics',
    assessmentType: 'assignment',
    score: 45,
    maxScore: 50,
    gradedBy: 'أ. محمد أحمد',
    gradedAt: '2024-04-02',
  },
  {
    id: '3',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-2',
    courseName: 'Arabic Language',
    assessmentType: 'quiz',
    score: 92,
    maxScore: 100,
    feedback: 'Excellent! Your writing has improved significantly.',
    gradedBy: 'أ. فاطمة علي',
    gradedAt: '2024-04-01',
  },
  {
    id: '4',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-3',
    courseName: 'Science',
    assessmentType: 'project',
    score: 48,
    maxScore: 50,
    feedback: 'Outstanding project! Very creative approach.',
    gradedBy: 'أ. خالد يوسف',
    gradedAt: '2024-03-28',
  },
  {
    id: '5',
    studentId: 'student-1',
    studentName: 'أحمد محمد',
    courseId: 'course-4',
    courseName: 'English',
    assessmentType: 'exam',
    score: 88,
    maxScore: 100,
    gradedBy: 'Ms. Sarah Johnson',
    gradedAt: '2024-03-25',
  },
];

export const mockGradeSummary: GradeSummary[] = [
  {
    courseId: 'course-1',
    courseName: 'Mathematics',
    averageScore: 85,
    totalAssessments: 2,
    highestScore: 85,
    lowestScore: 90,
  },
  {
    courseId: 'course-2',
    courseName: 'Arabic Language',
    averageScore: 92,
    totalAssessments: 1,
    highestScore: 92,
    lowestScore: 92,
  },
  {
    courseId: 'course-3',
    courseName: 'Science',
    averageScore: 96,
    totalAssessments: 1,
    highestScore: 96,
    lowestScore: 96,
  },
  {
    courseId: 'course-4',
    courseName: 'English',
    averageScore: 88,
    totalAssessments: 1,
    highestScore: 88,
    lowestScore: 88,
  },
];

export const mockGradeReportWithSummary: GradeReportWithSummary = {
  grades: mockGrades,
  summary: mockGradeSummary,
  overallAverage: 90.2,
  totalGrades: 5,
};
