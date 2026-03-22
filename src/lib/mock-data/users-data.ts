/**
 * Users Mock Data
 * 
 * Contains mock data for admin users list.
 */

export interface User {
  id: string
  avatar?: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'teacher' | 'student' | 'parent'
  status: 'active' | 'inactive'
  registrationDate: Date
}

/**
 * Mock users list
 */
export const mockUsers: User[] = [
  {
    id: 'user-1',
    avatar: '/avatars/admin-1.jpg',
    name: 'أحمد محمد',
    email: 'ahmed@eduverse.com',
    phone: '+966 50 123 4567',
    role: 'admin',
    status: 'active',
    registrationDate: new Date('2025-01-01'),
  },
  {
    id: 'user-2',
    avatar: '/avatars/teacher-1.jpg',
    name: 'فاطمة علي',
    email: 'fatima@eduverse.com',
    phone: '+966 50 234 5678',
    role: 'teacher',
    status: 'active',
    registrationDate: new Date('2025-02-15'),
  },
  {
    id: 'user-3',
    avatar: '/avatars/teacher-2.jpg',
    name: 'محمد عبدالله',
    email: 'mohammed@eduverse.com',
    phone: '+966 50 345 6789',
    role: 'teacher',
    status: 'active',
    registrationDate: new Date('2025-03-01'),
  },
  {
    id: 'user-4',
    avatar: '/avatars/teacher-3.jpg',
    name: 'سارة أحمد',
    email: 'sara@eduverse.com',
    phone: '+966 50 456 7890',
    role: 'teacher',
    status: 'active',
    registrationDate: new Date('2025-03-15'),
  },
  {
    id: 'user-5',
    avatar: '/avatars/student-1.jpg',
    name: 'عمر خالد',
    email: 'omar@eduverse.com',
    phone: '+966 50 567 8901',
    role: 'student',
    status: 'active',
    registrationDate: new Date('2025-09-01'),
  },
  {
    id: 'user-6',
    avatar: '/avatars/student-2.jpg',
    name: 'ليلى حسن',
    email: 'layla@eduverse.com',
    phone: '+966 50 678 9012',
    role: 'student',
    status: 'active',
    registrationDate: new Date('2025-09-05'),
  },
  {
    id: 'user-7',
    avatar: '/avatars/parent-1.jpg',
    name: 'خالد سعيد',
    email: 'khaled@eduverse.com',
    phone: '+966 50 789 0123',
    role: 'parent',
    status: 'active',
    registrationDate: new Date('2025-08-20'),
  },
  {
    id: 'user-8',
    avatar: '/avatars/parent-2.jpg',
    name: 'نورة محمد',
    email: 'noura@eduverse.com',
    phone: '+966 50 890 1234',
    role: 'parent',
    status: 'inactive',
    registrationDate: new Date('2025-08-25'),
  },
  {
    id: 'user-9',
    avatar: '/avatars/teacher-4.jpg',
    name: 'يوسف علي',
    email: 'youssef@eduverse.com',
    phone: '+966 50 901 2345',
    role: 'teacher',
    status: 'inactive',
    registrationDate: new Date('2025-04-01'),
  },
  {
    id: 'user-10',
    avatar: '/avatars/admin-2.jpg',
    name: 'ريم أحمد',
    email: 'reem@eduverse.com',
    phone: '+966 50 012 3456',
    role: 'admin',
    status: 'active',
    registrationDate: new Date('2025-01-15'),
  },
]
