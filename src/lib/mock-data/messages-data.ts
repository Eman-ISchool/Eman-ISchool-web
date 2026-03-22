/**
 * Messages Mock Data
 * 
 * Contains mock data for messages (inbox, sent, drafts).
 */

export interface Message {
  id: string
  subject: string
  senderName: string
  senderRole: string
  recipientCount?: number
  recipientName?: string
  status: 'read' | 'unread' | 'draft'
  tab: 'inbox' | 'sent' | 'drafts'
  body: string
  createdAt: string
}

/**
 * Mock messages list
 */
export const mockMessages: Message[] = [
  // Inbox messages
  {
    id: 'msg-1',
    subject: 'تنبيه بموعد الاختبار',
    senderName: 'أحمد محمد',
    senderRole: 'teacher',
    recipientCount: 45,
    status: 'unread',
    tab: 'inbox',
    body: 'يُرجى التنبه لموعد الاختبار القادم في مادة الرياضيات يوم الأحد القادم الساعة 10 صباحاً.',
    createdAt: '10/03/2026',
  },
  {
    id: 'msg-2',
    subject: 'تذكير بتسليم الواجبات',
    senderName: 'فاطمة علي',
    senderRole: 'teacher',
    recipientCount: 38,
    status: 'read',
    tab: 'inbox',
    body: 'تذكير لجميع الطلاب بموعد تسليم الواجبات المقررة يوم الخميس القادم.',
    createdAt: '08/03/2026',
  },
  {
    id: 'msg-3',
    subject: 'إعلان عن بدء التسجيل',
    senderName: 'إدارة المدرسة',
    senderRole: 'admin',
    recipientCount: 120,
    status: 'unread',
    tab: 'inbox',
    body: 'نعلن عن بدء التسجيل للفصل الدراسي القادم ابتداءً من يوم الأحد 1 أبريل.',
    createdAt: '15/03/2026',
  },
  // Sent messages
  {
    id: 'msg-4',
    subject: 'رد على استفسار الطالب',
    senderName: 'أحمد محمد',
    senderRole: 'teacher',
    recipientName: 'عمر خالد',
    status: 'read',
    tab: 'sent',
    body: 'شكراً على استفسارك. موعد الدرس القادم سيكون يوم الثلاثاء الساعة 2 ظهراً.',
    createdAt: '12/03/2026',
  },
  {
    id: 'msg-5',
    subject: 'تأكيد الحضور',
    senderName: 'فاطمة علي',
    senderRole: 'teacher',
    recipientName: 'ليلى حسن',
    status: 'read',
    tab: 'sent',
    body: 'تم تأكيد حضورك للدرس يوم الأحد الماضي. يرجى الاستمرار في الحضور المنتظم.',
    createdAt: '10/03/2026',
  },
  // Draft messages
  {
    id: 'msg-6',
    subject: 'إعلان عن نشاط رياضي',
    senderName: 'إدارة المدرسة',
    senderRole: 'admin',
    status: 'draft',
    tab: 'drafts',
    body: 'نود إعلامكم بوجود نشاط رياضي يوم الجمعة القادم...',
    createdAt: '20/03/2026',
  },
  {
    id: 'msg-7',
    subject: 'دعوة لحفل التخرج',
    senderName: 'إدارة المدرسة',
    senderRole: 'admin',
    status: 'draft',
    tab: 'drafts',
    body: 'نتشرف بدعوتكم لحضور حفل التخرج السنوي...',
    createdAt: '18/03/2026',
  },
]

/**
 * Get messages by tab
 */
export const getMessagesByTab = (tab: 'inbox' | 'sent' | 'drafts'): Message[] => {
  return mockMessages.filter(msg => msg.tab === tab)
}
