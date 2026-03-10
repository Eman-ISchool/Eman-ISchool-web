import {
  ApplicationRecord,
  filterDashboardApplications,
  getApplicationStatusMeta,
} from '../lib/dashboard-applications';

const applications: ApplicationRecord[] = [
  {
    id: 1,
    created_at: '2026-03-01T10:00:00Z',
    status: 'pending',
    student_details: { name: 'Ahmed Ali', phone: '790320149' },
    parent_details: { name: 'Mona Ali', phone: '790000000' },
    users: { email: 'mona@example.com' },
    grades: { name: 'Grade 4' },
  },
  {
    id: 2,
    created_at: '2026-03-05T10:00:00Z',
    status: 'approved',
    student_details: { name: 'Sara Hassan', phone: '790888888' },
    parent_details: { name: 'Hassan Omar', phone: '791111111' },
    users: { email: 'hassan@example.com' },
    grades: { name: 'Grade 5' },
  },
];

describe('dashboard applications helpers', () => {
  it('filters by query across student and guardian fields', () => {
    const results = filterDashboardApplications(applications, {
      query: 'mona',
      status: 'all',
      grade: 'all',
      fromDate: '',
      toDate: '',
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  it('combines status, grade, and date filters', () => {
    const results = filterDashboardApplications(applications, {
      query: '',
      status: 'approved',
      grade: 'Grade 5',
      fromDate: '2026-03-04',
      toDate: '2026-03-06',
    });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(2);
  });

  it('returns localized status metadata', () => {
    expect(getApplicationStatusMeta('pending', true).label).toBe('قيد المراجعة');
    expect(getApplicationStatusMeta('approved', false).label).toBe('Approved');
  });
});
