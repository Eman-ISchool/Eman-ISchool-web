/**
 * Sidebar Navigation Mock Data
 * 
 * Contains mock data for the admin sidebar navigation structure.
 */

export interface SidebarItem {
  label: string
  route: string
  icon: string
}

export interface SidebarCategory {
  id: string
  label: string
  icon: string
  items: SidebarItem[]
}

export interface SidebarData {
  categories: SidebarCategory[]
  userProfile: {
    name: string
    avatar?: string
    email?: string
    role: string
  }
}

/**
 * Mock sidebar navigation data
 */
export const mockSidebarData: SidebarData = {
  categories: [
    {
      id: 'academic',
      label: 'الأكاديمي',
      icon: 'BookOpen',
      items: [
        { label: 'المواد الدراسية', route: '/ar/dashboard/courses', icon: 'Book' },
        { label: 'التصنيفات', route: '/ar/dashboard/categories', icon: 'Tags' },
        { label: 'الفصول', route: '/ar/dashboard/bundles', icon: 'Users' },
        { label: 'الاختبارات', route: '/ar/dashboard/exams', icon: 'ClipboardList' },
        { label: 'الاستبيانات', route: '/ar/dashboard/quizzes', icon: 'HelpCircle' },
      ],
    },
    {
      id: 'administration',
      label: 'الإدارة',
      icon: 'Settings',
      items: [
        { label: 'المستخدمون', route: '/ar/dashboard/users', icon: 'User' },
        { label: 'الطلبات', route: '/ar/dashboard/applications', icon: 'FileText' },
        { label: 'البيانات المرجعية', route: '/ar/dashboard/lookups', icon: 'Database' },
      ],
    },
    {
      id: 'finance',
      label: 'المالية',
      icon: 'DollarSign',
      items: [
        { label: 'المدفوعات', route: '/ar/dashboard/payments', icon: 'CreditCard' },
      ],
    },
    {
      id: 'communication',
      label: 'التواصل',
      icon: 'MessageSquare',
      items: [
        { label: 'الرسائل', route: '/ar/dashboard/communications', icon: 'Mail' },
      ],
    },
    {
      id: 'content',
      label: 'المحتوى',
      icon: 'FileText',
      items: [
        { label: 'المحتوى', route: '/ar/dashboard/content', icon: 'File' },
      ],
    },
    {
      id: 'analytics',
      label: 'التحاليل',
      icon: 'BarChart3',
      items: [
        { label: 'التحاليل', route: '/ar/dashboard/analytics', icon: 'PieChart' },
      ],
    },
    {
      id: 'data-management',
      label: 'إدارة البيانات',
      icon: 'Database',
      items: [
        // Future: Add data management items
      ],
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: 'Settings',
      items: [
        { label: 'الإعدادات', route: '/ar/dashboard/settings', icon: 'Settings' },
        { label: 'الملف الشخصي', route: '/ar/dashboard/profile', icon: 'User' },
      ],
    },
  ],
  userProfile: {
    name: 'أحمد محمد',
    avatar: '/avatars/admin-1.jpg',
    email: 'ahmed@eduverse.com',
    role: 'admin',
  },
}
