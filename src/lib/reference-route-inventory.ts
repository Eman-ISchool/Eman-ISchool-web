export interface ReferenceDashboardAliasMeta {
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  module: DashboardModuleKey;
}

export type DashboardModuleKey =
  | 'adminHome'
  | 'calendar'
  | 'content'
  | 'couponsExpenses'
  | 'currencyCompare'
  | 'enrollmentApplications'
  | 'enrollmentReports'
  | 'fees'
  | 'lessons'
  | 'quizzesExams'
  | 'settings'
  | 'students';

export const referencePublicRouteFamilies = [
  '/login',
  '/join',
  '/about',
  '/contact',
  '/services',
  '/forgot-password',
] as const;

export const referenceAuthenticatedRouteFamilies = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/admin/reports',
  '/dashboard/reports',
  '/dashboard/announcements',
  '/dashboard/applications',
  '/dashboard/backup',
  '/dashboard/banks',
  '/dashboard/blogs',
  '/dashboard/bundles',
  '/dashboard/categories',
  '/dashboard/cms',
  '/dashboard/coupons',
  '/dashboard/courses',
  '/dashboard/currencies',
  '/dashboard/exams',
  '/dashboard/expenses',
  '/dashboard/lookups',
  '/dashboard/messages',
  '/dashboard/payments',
  '/dashboard/payslips',
  '/dashboard/quizzes',
  '/dashboard/salaries',
  '/dashboard/stats',
  '/dashboard/system-settings',
  '/dashboard/teacher/courses',
  '/dashboard/teacher/students',
  '/dashboard/translations',
  '/dashboard/upcoming-classes',
  '/dashboard/users',
] as const;

export const referenceDashboardAliasRoutes: Record<string, ReferenceDashboardAliasMeta> = {
  announcements: {
    title: { ar: 'الإعلانات', en: 'Announcements' },
    subtitle: { ar: 'مدخل إدارة المحتوى والإعلانات ضمن هيكل المرجع', en: 'Content and announcements mapped into the reference route family' },
    module: 'content',
  },
  'admin/reports': {
    title: { ar: 'التقارير', en: 'Reports' },
    subtitle: { ar: 'مسار التقارير المكتشف عبر المتصفح' , en: 'Reports route confirmed from the live browser session' },
    module: 'enrollmentReports',
  },
  reports: {
    title: { ar: 'التقارير', en: 'Reports' },
    subtitle: { ar: 'مسار التقارير الظاهر في الشريط الجانبي للمرجع', en: 'Reports route surfaced directly in the reference sidebar' },
    module: 'enrollmentReports',
  },
  applications: {
    title: { ar: 'الطلبات', en: 'Applications' },
    subtitle: { ar: 'طلبات التسجيل الحالية ضمن مسار مرجعي موحّد', en: 'Current enrollment applications under the reference-style path' },
    module: 'enrollmentApplications',
  },
  backup: {
    title: { ar: 'النسخ الاحتياطي', en: 'Backup' },
    subtitle: { ar: 'أقرب وحدة حالية لهذا المسار هي الإعدادات الإدارية', en: 'Settings is the closest live module for this reference route' },
    module: 'settings',
  },
  banks: {
    title: { ar: 'البنوك', en: 'Banks' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع وحدة الرسوم والمدفوعات الحالية', en: 'This route is mapped to the current fees and payments surface' },
    module: 'fees',
  },
  blogs: {
    title: { ar: 'المدونات', en: 'Blogs' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إدارة المحتوى الحالية', en: 'This route is mapped to the existing content management module' },
    module: 'content',
  },
  bundles: {
    title: { ar: 'الحزم', en: 'Bundles' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إدارة الدروس والدورات الحالية', en: 'This route is mapped to the current lessons and course management surface' },
    module: 'lessons',
  },
  categories: {
    title: { ar: 'التصنيفات', en: 'Categories' },
    subtitle: { ar: 'التصنيفات الحالية تُدار عبر وحدة المحتوى', en: 'Current category-like management is handled through the content module' },
    module: 'content',
  },
  cms: {
    title: { ar: 'إدارة المحتوى', en: 'CMS' },
    subtitle: { ar: 'إعادة استخدام وحدة المحتوى الحالية ضمن مسار المرجع', en: 'Reusing the current content module inside the reference path family' },
    module: 'content',
  },
  coupons: {
    title: { ar: 'الكوبونات', en: 'Coupons' },
    subtitle: { ar: 'الكوبونات والمصروفات تُدار عبر الصفحة الإدارية الحالية', en: 'Coupons and expense management are handled by the current admin module' },
    module: 'couponsExpenses',
  },
  currencies: {
    title: { ar: 'العملات', en: 'Currencies' },
    subtitle: { ar: 'إعادة استخدام صفحة مقارنة العملات الحالية', en: 'Reusing the current currency comparison surface' },
    module: 'currencyCompare',
  },
  exams: {
    title: { ar: 'الامتحانات', en: 'Exams' },
    subtitle: { ar: 'مسار الاختبارات الحالية ضمن الهيكل المرجعي', en: 'Current exams surface presented inside the reference route family' },
    module: 'quizzesExams',
  },
  expenses: {
    title: { ar: 'المصروفات', en: 'Expenses' },
    subtitle: { ar: 'الكوبونات والمصروفات تُدار عبر الصفحة الإدارية الحالية', en: 'Coupons and expense management are handled by the current admin module' },
    module: 'couponsExpenses',
  },
  lookups: {
    title: { ar: 'البيانات المرجعية', en: 'Lookups' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إعدادات النظام الحالية', en: 'This route is mapped to the current system settings surface' },
    module: 'settings',
  },
  payments: {
    title: { ar: 'المدفوعات', en: 'Payments' },
    subtitle: { ar: 'الرسوم والمدفوعات الحالية ضمن بنية المرجع', en: 'Current fees and payments surfaced inside the reference IA' },
    module: 'fees',
  },
  payslips: {
    title: { ar: 'قسائم الرواتب', en: 'Payslips' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع الوحدة المالية الحالية', en: 'This route is mapped to the current finance-related module' },
    module: 'fees',
  },
  salaries: {
    title: { ar: 'الرواتب', en: 'Salaries' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع الوحدة المالية الحالية', en: 'This route is mapped to the current finance-related module' },
    module: 'fees',
  },
  stats: {
    title: { ar: 'الإحصاءات', en: 'Stats' },
    subtitle: { ar: 'الصفحة الرئيسية الإدارية الحالية هي أقرب مطابقة لهذا المسار', en: 'The current admin overview is the closest live match for this route' },
    module: 'adminHome',
  },
  'system-settings': {
    title: { ar: 'إعدادات النظام', en: 'System settings' },
    subtitle: { ar: 'إعادة استخدام إعدادات الإدارة الحالية', en: 'Reusing the current admin settings surface' },
    module: 'settings',
  },
  'teacher/courses': {
    title: { ar: 'دورات المعلم', en: 'Teacher courses' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إدارة الدروس الحالية', en: 'This route is mapped to the current lessons management surface' },
    module: 'lessons',
  },
  'teacher/students': {
    title: { ar: 'طلاب المعلم', en: 'Teacher students' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إدارة الطلاب الحالية', en: 'This route is mapped to the current student management surface' },
    module: 'students',
  },
  translations: {
    title: { ar: 'الترجمات', en: 'Translations' },
    subtitle: { ar: 'تمت مواءمة هذا المسار مع إعدادات النظام الحالية', en: 'This route is mapped to the current system settings surface' },
    module: 'settings',
  },
  'upcoming-classes': {
    title: { ar: 'الحصص القادمة', en: 'Upcoming classes' },
    subtitle: { ar: 'أقرب مطابقة حالية لهذا المسار هي صفحة التقويم', en: 'The current calendar page is the closest live match for this route' },
    module: 'calendar',
  },
};
