/**
 * Quizzes Mock Data
 * 
 * Contains mock data for quizzes list and quiz manage page.
 */

export interface Question {
  id: string
  quizId: string
  text: string
  type: 'multiple-choice' | 'short-answer' | 'essay'
  options?: string[]
  correctAnswer?: string
  points: number
}

export interface QuizAttempt {
  id: string
  quizId: string
  studentId: string
  studentName: string
  startedAt: Date
  completedAt?: Date
  score?: number
}

export interface QuizStatistics {
  totalResponses: number
  averageScore: number
  completionRate: number
  responsesByScore: Record<number, number>
  attempts: QuizAttempt[]
}

export interface Quiz {
  id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'published'
  responseCount: number
  lastModified: Date
  createdAt: Date
}

/**
 * Mock quizzes list
 */
export const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1',
    name: 'استبيان رضا الطلاب',
    description: 'استبيان لقياس رضا الطلاب عن الدورات الدراسية',
    category: 'رضا الطلاب',
    status: 'published',
    responseCount: 125,
    lastModified: new Date('2026-03-20'),
    createdAt: new Date('2026-03-10'),
  },
  {
    id: 'quiz-2',
    name: 'استبيان جودة التعليم',
    description: 'استبيان لتقييم جودة التعليم والمعلمين',
    category: 'جودة التعليم',
    status: 'published',
    responseCount: 98,
    lastModified: new Date('2026-03-18'),
    createdAt: new Date('2026-03-05'),
  },
  {
    id: 'quiz-3',
    name: 'استبيان المناهج الدراسية',
    description: 'استبيان لجمع آراء الطلاب حول المناهج الدراسية',
    category: 'المناهج',
    status: 'published',
    responseCount: 85,
    lastModified: new Date('2026-03-15'),
    createdAt: new Date('2026-03-01'),
  },
  {
    id: 'quiz-4',
    name: 'استبيان الأنشطة اللاصفية',
    description: 'استبيان لجمع آراء الطلاب حول الأنشطة اللاصفية',
    category: 'الأنشطة',
    status: 'draft',
    responseCount: 0,
    lastModified: new Date('2026-03-22'),
    createdAt: new Date('2026-03-22'),
  },
  {
    id: 'quiz-5',
    name: 'استبيان التغذية الراجعة',
    description: 'استبيان لجمع التغذية الراجعة من الطلاب',
    category: 'التغذية الراجعة',
    status: 'published',
    responseCount: 110,
    lastModified: new Date('2026-03-12'),
    createdAt: new Date('2026-02-28'),
  },
]

/**
 * Mock quiz detail with questions and statistics
 */
export const mockQuizDetail = (id: string): Quiz | null => {
  return mockQuizzes.find(q => q.id === id) || null
}

/**
 * Mock quiz questions
 */
export const mockQuizQuestions = (quizId: string): Question[] => {
  if (quizId === 'quiz-1') {
    return [
      {
        id: 'q-1',
        quizId,
        text: 'كيف تقيم جودة المحتوى التعليمي؟',
        type: 'multiple-choice',
        options: ['ممتاز', 'جيد جداً', 'جيد', 'متوسط', 'ضعيف'],
        correctAnswer: 'ممتاز',
        points: 5,
      },
      {
        id: 'q-2',
        quizId,
        text: 'هل أنت راضٍ عن المعلم؟',
        type: 'multiple-choice',
        options: ['نعم، راضٍ تماماً', 'نعم، راضٍ', 'إلى حد ما', 'لا، غير راضٍ'],
        correctAnswer: 'نعم، راضٍ تماماً',
        points: 5,
      },
      {
        id: 'q-3',
        quizId,
        text: 'ما هي الملاحظات التي ترغب في تقديمها؟',
        type: 'short-answer',
        points: 10,
      },
    ]
  }
  return []
}

/**
 * Mock quiz statistics
 */
export const mockQuizStatistics = (quizId: string): QuizStatistics => {
  return {
    totalResponses: 125,
    averageScore: 4.2,
    completionRate: 85,
    responsesByScore: {
      5: 50,
      4: 35,
      3: 25,
      2: 10,
      1: 5,
    },
    attempts: [
      {
        id: 'attempt-1',
        quizId,
        studentId: 'student-1',
        studentName: 'أحمد سعيد',
        startedAt: new Date('2026-03-15T10:00:00'),
        completedAt: new Date('2026-03-15T10:15:00'),
        score: 5,
      },
      {
        id: 'attempt-2',
        quizId,
        studentId: 'student-2',
        studentName: 'فاطمة حسن',
        startedAt: new Date('2026-03-15T11:00:00'),
        completedAt: new Date('2026-03-15T11:20:00'),
        score: 4,
      },
      {
        id: 'attempt-3',
        quizId,
        studentId: 'student-3',
        studentName: 'محمد علي',
        startedAt: new Date('2026-03-16T09:00:00'),
        completedAt: new Date('2026-03-16T09:25:00'),
        score: 5,
      },
    ],
  }
}
