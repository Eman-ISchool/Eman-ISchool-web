/**
 * Applications Mock Data
 * 
 * Contains mock data for applications/requests list.
 */

export interface Application {
  id: string
  applicantName: string
  applicantEmail: string
  type: string
  status: 'pending' | 'approved' | 'rejected'
  submissionDate: Date
}

/**
 * Mock applications list
 */
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    applicantName: 'أحمد سعيد',
    applicantEmail: 'ahmed.said@example.com',
    type: 'طلب تسجيل',
    status: 'pending',
    submissionDate: new Date('2026-03-20'),
  },
  {
    id: 'app-2',
    applicantName: 'فاطمة حسن',
    applicantEmail: 'fatima.hassan@example.com',
    type: 'طلب انضمام',
    status: 'approved',
    submissionDate: new Date('2026-03-18'),
  },
  {
    id: 'app-3',
    applicantName: 'محمد علي',
    applicantEmail: 'mohammed.ali@example.com',
    type: 'طلب تسجيل',
    status: 'pending',
    submissionDate: new Date('2026-03-22'),
  },
  {
    id: 'app-4',
    applicantName: 'سارة محمد',
    applicantEmail: 'sara.mohammed@example.com',
    type: 'طلب انضمام',
    status: 'rejected',
    submissionDate: new Date('2026-03-15'),
  },
  {
    id: 'app-5',
    applicantName: 'عمر أحمد',
    applicantEmail: 'omar.ahmed@example.com',
    type: 'طلب تسجيل',
    status: 'approved',
    submissionDate: new Date('2026-03-10'),
  },
  {
    id: 'app-6',
    applicantName: 'ليلى حسن',
    applicantEmail: 'layla.hassan@example.com',
    type: 'طلب انضمام',
    status: 'pending',
    submissionDate: new Date('2026-03-21'),
  },
  {
    id: 'app-7',
    applicantName: 'خالد سعيد',
    applicantEmail: 'khaled.said@example.com',
    type: 'طلب تسجيل',
    status: 'approved',
    submissionDate: new Date('2026-03-05'),
  },
  {
    id: 'app-8',
    applicantName: 'نورة محمد',
    applicantEmail: 'noura.mohammed@example.com',
    type: 'طلب انضمام',
    status: 'pending',
    submissionDate: new Date('2026-03-19'),
  },
]
