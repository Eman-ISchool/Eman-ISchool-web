import {
  referenceAuthenticatedRouteFamilies,
  referenceDashboardAliasRoutes,
  referencePublicRouteFamilies,
} from '../lib/reference-route-inventory';

describe('reference route inventory', () => {
  it('tracks the confirmed public route families', () => {
    expect(referencePublicRouteFamilies).toEqual(
      expect.arrayContaining([
        '/login',
        '/join',
        '/about',
        '/contact',
        '/services',
        '/forgot-password',
      ]),
    );
  });

  it('covers the discovered authenticated dashboard families', () => {
    expect(referenceAuthenticatedRouteFamilies).toEqual(
      expect.arrayContaining([
        '/dashboard',
        '/dashboard/profile',
        '/dashboard/applications',
        '/dashboard/admin/reports',
        '/dashboard/reports',
        '/dashboard/teacher/courses',
        '/dashboard/upcoming-classes',
      ]),
    );
  });

  it('maps the bundle-discovered alias routes to live admin modules', () => {
    expect(referenceDashboardAliasRoutes['announcements']?.module).toBe('content');
    expect(referenceDashboardAliasRoutes['applications']?.module).toBe('enrollmentApplications');
    expect(referenceDashboardAliasRoutes['teacher/students']?.module).toBe('students');
    expect(Object.keys(referenceDashboardAliasRoutes)).toEqual(
      expect.arrayContaining([
        'admin/reports',
        'announcements',
        'applications',
        'blogs',
        'cms',
        'reports',
        'system-settings',
        'translations',
      ]),
    );
  });
});
