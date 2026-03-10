export type ApplicationStatus =
  | 'pending'
  | 'payment_pending'
  | 'payment_completed'
  | 'approved'
  | 'rejected'
  | string;

export interface ApplicationRecord {
  id: number;
  created_at: string;
  status: ApplicationStatus;
  total_amount?: number | null;
  currency?: string | null;
  student_details?: {
    name?: string;
    phone?: string;
  } | null;
  parent_details?: {
    name?: string;
    phone?: string;
  } | null;
  users?: {
    name?: string;
    email?: string;
  } | null;
  grades?: {
    name?: string;
  } | null;
}

interface DashboardApplicationFilters {
  query: string;
  status: string;
  grade: string;
  fromDate: string;
  toDate: string;
}

export function getApplicationStatusMeta(status: ApplicationStatus, isArabic: boolean) {
  switch (status) {
    case 'pending':
      return {
        label: isArabic ? 'قيد المراجعة' : 'Pending',
        className: 'bg-amber-100 text-amber-800',
      };
    case 'payment_pending':
      return {
        label: isArabic ? 'بانتظار الدفع' : 'Payment pending',
        className: 'bg-orange-100 text-orange-800',
      };
    case 'payment_completed':
      return {
        label: isArabic ? 'تم الدفع' : 'Payment completed',
        className: 'bg-sky-100 text-sky-800',
      };
    case 'approved':
      return {
        label: isArabic ? 'مقبول' : 'Approved',
        className: 'bg-emerald-100 text-emerald-800',
      };
    case 'rejected':
      return {
        label: isArabic ? 'مرفوض' : 'Rejected',
        className: 'bg-rose-100 text-rose-800',
      };
    default:
      return {
        label: status || (isArabic ? 'غير محدد' : 'Unknown'),
        className: 'bg-slate-100 text-slate-700',
      };
  }
}

export function filterDashboardApplications(
  applications: ApplicationRecord[],
  filters: DashboardApplicationFilters,
) {
  return applications.filter((application) => {
    const haystack = [
      application.student_details?.name,
      application.student_details?.phone,
      application.parent_details?.name,
      application.parent_details?.phone,
      application.users?.email,
      application.grades?.name,
    ]
      .join(' ')
      .toLowerCase();

    const matchesQuery = !filters.query || haystack.includes(filters.query.toLowerCase());
    const matchesStatus = filters.status === 'all' || application.status === filters.status;
    const matchesGrade = filters.grade === 'all' || application.grades?.name === filters.grade;
    const createdAt = application.created_at ? new Date(application.created_at) : null;
    const matchesFrom = !filters.fromDate || (createdAt && createdAt >= new Date(filters.fromDate));
    const matchesTo =
      !filters.toDate || (createdAt && createdAt <= new Date(`${filters.toDate}T23:59:59`));

    return matchesQuery && matchesStatus && matchesGrade && matchesFrom && matchesTo;
  });
}
