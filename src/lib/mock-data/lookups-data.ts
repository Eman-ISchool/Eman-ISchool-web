/**
 * Lookups Mock Data
 * 
 * Contains mock data for reference data categories and items.
 */

export interface LookupItem {
  id: string
  categoryId: string
  name: string
  value: string
  active: boolean
}

export interface LookupCategory {
  id: string
  name: string
  itemsCount: number
  items: LookupItem[]
}

/**
 * Mock lookup categories
 */
export const mockLookups: LookupCategory[] = [
  {
    id: 'lookup-1',
    name: 'الجنس',
    itemsCount: 2,
    items: [
      {
        id: 'item-1',
        categoryId: 'lookup-1',
        name: 'ذكر',
        value: 'male',
        active: true,
      },
      {
        id: 'item-2',
        categoryId: 'lookup-1',
        name: 'أنثى',
        value: 'female',
        active: true,
      },
    ],
  },
  {
    id: 'lookup-2',
    name: 'الحالة الاجتماعية',
    itemsCount: 3,
    items: [
      {
        id: 'item-3',
        categoryId: 'lookup-2',
        name: 'أعزب',
        value: 'single',
        active: true,
      },
      {
        id: 'item-4',
        categoryId: 'lookup-2',
        name: 'متزوج',
        value: 'married',
        active: true,
      },
      {
        id: 'item-5',
        categoryId: 'lookup-2',
        name: 'مطلق',
        value: 'divorced',
        active: true,
      },
    ],
  },
  {
    id: 'lookup-3',
    name: 'الجنسية',
    itemsCount: 5,
    items: [
      {
        id: 'item-6',
        categoryId: 'lookup-3',
        name: 'سعودي',
        value: 'saudi',
        active: true,
      },
      {
        id: 'item-7',
        categoryId: 'lookup-3',
        name: 'مصري',
        value: 'egyptian',
        active: true,
      },
      {
        id: 'item-8',
        categoryId: 'lookup-3',
        name: 'أردني',
        value: 'jordanian',
        active: true,
      },
      {
        id: 'item-9',
        categoryId: 'lookup-3',
        name: 'سوري',
        value: 'syrian',
        active: true,
      },
      {
        id: 'item-10',
        categoryId: 'lookup-3',
        name: 'لبناني',
        value: 'lebanese',
        active: true,
      },
    ],
  },
  {
    id: 'lookup-4',
    name: 'المدينة',
    itemsCount: 4,
    items: [
      {
        id: 'item-11',
        categoryId: 'lookup-4',
        name: 'الرياض',
        value: 'riyadh',
        active: true,
      },
      {
        id: 'item-12',
        categoryId: 'lookup-4',
        name: 'جدة',
        value: 'jeddah',
        active: true,
      },
      {
        id: 'item-13',
        categoryId: 'lookup-4',
        name: 'الدمام',
        value: 'dammam',
        active: true,
      },
      {
        id: 'item-14',
        categoryId: 'lookup-4',
        name: 'مكة المكرمة',
        value: 'makkah',
        active: true,
      },
    ],
  },
  {
    id: 'lookup-5',
    name: 'طريقة الدفع',
    itemsCount: 3,
    items: [
      {
        id: 'item-15',
        categoryId: 'lookup-5',
        name: 'بطاقة ائتمان',
        value: 'card',
        active: true,
      },
      {
        id: 'item-16',
        categoryId: 'lookup-5',
        name: 'تحويل بنكي',
        value: 'bank_transfer',
        active: true,
      },
      {
        id: 'item-17',
        categoryId: 'lookup-5',
        name: 'نقداً',
        value: 'cash',
        active: true,
      },
    ],
  },
]

/**
 * Mock lookup items for a specific category
 */
export const mockLookupItems = (categoryId: string): LookupItem[] => {
  const category = mockLookups.find(c => c.id === categoryId)
  return category?.items || []
}
