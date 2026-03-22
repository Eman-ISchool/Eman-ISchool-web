/**
 * Categories Mock Data
 * 
 * Contains mock data for course categories.
 */

export interface Category {
  id: string
  name: string
  itemsCount: number
  createdAt: Date
  updatedAt: Date
}

/**
 * Mock categories list
 */
export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'الرياضيات',
    itemsCount: 3,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-2',
    name: 'العلوم',
    itemsCount: 2,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-3',
    name: 'اللغة العربية',
    itemsCount: 4,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-4',
    name: 'اللغة الإنجليزية',
    itemsCount: 3,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-5',
    name: 'الدراسات الاجتماعية',
    itemsCount: 2,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-6',
    name: 'الدراسات الإسلامية',
    itemsCount: 2,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-7',
    name: 'الفنون والموسيقى',
    itemsCount: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
  {
    id: 'cat-8',
    name: 'التربية البدنية',
    itemsCount: 1,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-03-10'),
  },
]
