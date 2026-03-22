/**
 * Payments Mock Data
 * 
 * Contains mock data for payments list and payment metrics.
 */

export interface Payment {
  id: string
  userId: string
  userName: string
  amount: number
  method: 'cash' | 'card' | 'bank'
  methodLabel: { ar: string; en: string }
  status: 'confirmed' | 'pending' | 'cancelled' | 'refunded'
  reference: string
  date: string
}

export interface PaymentMetrics {
  totalConfirmed: number
  totalPending: number
  totalAmount: number
  totalCount: number
}

/**
 * Mock payments list
 */
export const mockPayments: Payment[] = [
  {
    id: 'PAY-001',
    userId: 'user-5',
    userName: 'عمر خالد',
    amount: 1500,
    method: 'card',
    methodLabel: { ar: 'بطاقة ائتمان', en: 'Credit card' },
    status: 'confirmed',
    reference: 'REF-20260101-001',
    date: '01/01/2026',
  },
  {
    id: 'PAY-002',
    userId: 'user-6',
    userName: 'ليلى حسن',
    amount: 1500,
    method: 'card',
    methodLabel: { ar: 'بطاقة ائتمان', en: 'Credit card' },
    status: 'confirmed',
    reference: 'REF-20260102-002',
    date: '02/01/2026',
  },
  {
    id: 'PAY-003',
    userId: 'user-7',
    userName: 'خالد سعيد',
    amount: 1500,
    method: 'bank',
    methodLabel: { ar: 'تحويل بنكي', en: 'Bank transfer' },
    status: 'pending',
    reference: 'REF-20260105-003',
    date: '05/01/2026',
  },
  {
    id: 'PAY-004',
    userId: 'user-8',
    userName: 'نورة محمد',
    amount: 1500,
    method: 'cash',
    methodLabel: { ar: 'نقداً', en: 'Cash' },
    status: 'confirmed',
    reference: 'REF-20260108-004',
    date: '08/01/2026',
  },
  {
    id: 'PAY-005',
    userId: 'user-9',
    userName: 'يوسف علي',
    amount: 1500,
    method: 'card',
    methodLabel: { ar: 'بطاقة ائتمان', en: 'Credit card' },
    status: 'cancelled',
    reference: 'REF-20260110-005',
    date: '10/01/2026',
  },
  {
    id: 'PAY-006',
    userId: 'user-10',
    userName: 'ريم أحمد',
    amount: 1500,
    method: 'bank',
    methodLabel: { ar: 'تحويل بنكي', en: 'Bank transfer' },
    status: 'confirmed',
    reference: 'REF-20260112-006',
    date: '12/01/2026',
  },
  {
    id: 'PAY-007',
    userId: 'user-5',
    userName: 'عمر خالد',
    amount: 500,
    method: 'card',
    methodLabel: { ar: 'بطاقة ائتمان', en: 'Credit card' },
    status: 'confirmed',
    reference: 'REF-20260115-007',
    date: '15/01/2026',
  },
  {
    id: 'PAY-008',
    userId: 'user-6',
    userName: 'ليلى حسن',
    amount: 500,
    method: 'cash',
    methodLabel: { ar: 'نقداً', en: 'Cash' },
    status: 'pending',
    reference: 'REF-20260118-008',
    date: '18/01/2026',
  },
  {
    id: 'PAY-009',
    userId: 'user-7',
    userName: 'خالد سعيد',
    amount: 300,
    method: 'card',
    methodLabel: { ar: 'بطاقة ائتمان', en: 'Credit card' },
    status: 'refunded',
    reference: 'REF-20260120-009',
    date: '20/01/2026',
  },
  {
    id: 'PAY-010',
    userId: 'user-8',
    userName: 'نورة محمد',
    amount: 1500,
    method: 'bank',
    methodLabel: { ar: 'تحويل بنكي', en: 'Bank transfer' },
    status: 'confirmed',
    reference: 'REF-20260122-010',
    date: '22/01/2026',
  },
]

/**
 * Mock payment metrics
 */
export const mockPaymentMetrics: PaymentMetrics = {
  totalConfirmed: 7000,
  totalPending: 2000,
  totalAmount: 9800,
  totalCount: 10,
}
