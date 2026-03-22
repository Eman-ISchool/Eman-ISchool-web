/**
 * Dashboard Mock Data
 * 
 * Contains KPI metrics and chart data for the admin dashboard home page.
 */

export interface DashboardMetrics {
  totalStudents: number
  totalTeachers: number
  totalRevenue: number
  pendingPayments: number
  dateRange?: { start: Date; end: Date }
}

export interface ChartDataPoint {
  label: string
  value: number
  timestamp?: Date
}

export interface DashboardChart {
  id: string
  title: string
  type: 'bar' | 'line' | 'pie' | 'area'
  data: ChartDataPoint[]
  xAxisLabel?: string
  yAxisLabel?: string
}

/**
 * Mock KPI metrics for dashboard home
 */
export const mockDashboardMetrics: DashboardMetrics = {
  totalStudents: 1250,
  totalTeachers: 45,
  totalRevenue: 125000,
  pendingPayments: 5000,
  dateRange: {
    start: new Date('2026-01-01'),
    end: new Date('2026-03-22'),
  },
}

/**
 * Mock revenue trend chart (line chart)
 */
export const mockRevenueTrendChart: DashboardChart = {
  id: 'revenue-trend',
  title: 'اتجاه الإيرادات',
  type: 'line',
  data: [
    { label: 'يناير', value: 15000, timestamp: new Date('2026-01-01') },
    { label: 'فبراير', value: 18000, timestamp: new Date('2026-02-01') },
    { label: 'مارس', value: 12000, timestamp: new Date('2026-03-01') },
    { label: 'أبريل', value: 22000, timestamp: new Date('2026-04-01') },
    { label: 'مايو', value: 19000, timestamp: new Date('2026-05-01') },
    { label: 'يونيو', value: 25000, timestamp: new Date('2026-06-01') },
  ],
  xAxisLabel: 'الشهر',
  yAxisLabel: 'الإيرادات (ريال)',
}

/**
 * Mock student activity chart (bar chart)
 */
export const mockStudentActivityChart: DashboardChart = {
  id: 'student-activity',
  title: 'نشاط الطلاب',
  type: 'bar',
  data: [
    { label: 'الأحد', value: 120 },
    { label: 'الاثنين', value: 145 },
    { label: 'الثلاثاء', value: 132 },
    { label: 'الأربعاء', value: 158 },
    { label: 'الخميس', value: 140 },
    { label: 'الجمعة', value: 95 },
    { label: 'السبت', value: 110 },
  ],
  xAxisLabel: 'اليوم',
  yAxisLabel: 'عدد الطلاب',
}

/**
 * Mock enrollment distribution chart (pie chart)
 */
export const mockEnrollmentDistributionChart: DashboardChart = {
  id: 'enrollment-distribution',
  title: 'توزيع التسجيل',
  type: 'pie',
  data: [
    { label: 'الرياضيات', value: 350 },
    { label: 'العلوم', value: 280 },
    { label: 'اللغة العربية', value: 320 },
    { label: 'اللغة الإنجليزية', value: 200 },
    { label: 'الدراسات الاجتماعية', value: 100 },
  ],
}

/**
 * Mock course completion rate chart (area chart)
 */
export const mockCourseCompletionChart: DashboardChart = {
  id: 'course-completion',
  title: 'معدل إكمال الدورات',
  type: 'area',
  data: [
    { label: 'يناير', value: 65 },
    { label: 'فبراير', value: 72 },
    { label: 'مارس', value: 78 },
    { label: 'أبريل', value: 75 },
    { label: 'مايو', value: 82 },
    { label: 'يونيو', value: 85 },
  ],
  xAxisLabel: 'الشهر',
  yAxisLabel: 'نسبة الإكمال (%)',
}

/**
 * All dashboard charts
 */
export const mockDashboardCharts: DashboardChart[] = [
  mockRevenueTrendChart,
  mockStudentActivityChart,
  mockEnrollmentDistributionChart,
  mockCourseCompletionChart,
]
