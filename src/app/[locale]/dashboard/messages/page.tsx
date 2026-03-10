'use client';

import { useMemo, useState } from 'react';
import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Search, Users, Send } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function DashboardMessagesPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [query, setQuery] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const allConversations = useMemo(
    () => [
      {
        id: '1',
        name: isArabic ? 'ولي أمر أحمد' : 'Ahmed parent',
        preview: isArabic ? 'نحتاج متابعة الرسوم' : 'Need to follow up on fees',
        messages: [
          isArabic ? 'مرحباً، هل تم تأكيد رسوم هذا الشهر؟' : 'Hello, has this month fee been confirmed?',
          isArabic ? 'تمت المراجعة وسيظهر التحديث اليوم.' : 'It has been reviewed and the update will appear today.',
        ],
      },
      {
        id: '2',
        name: isArabic ? 'أ. سارة أحمد' : 'Ms. Sara Ahmed',
        preview: isArabic ? 'تم رفع الواجب' : 'Homework has been uploaded',
        messages: [
          isArabic ? 'تم رفع الواجب الجديد للصف السادس.' : 'The new homework for sixth grade has been uploaded.',
          isArabic ? 'ممتاز، سننشر التنبيه على الفور.' : 'Great, we will publish the alert immediately.',
        ],
      },
      {
        id: '3',
        name: isArabic ? 'محمد خالد' : 'Mohammed Khalid',
        preview: isArabic ? 'أريد توضيحاً للدرس' : 'I need clarification on the lesson',
        messages: [
          isArabic ? 'أحتاج شرحاً إضافياً لنقطة في درس الأمس.' : 'I need extra clarification on a point from yesterday’s lesson.',
          isArabic ? 'سأرسل لك ملخصاً وفيديو قصيراً بعد الحصة.' : 'I will send you a summary and short video after class.',
        ],
      },
    ],
    [isArabic],
  );

  const conversations = useMemo(
    () =>
      allConversations.filter((item) =>
        [item.name, item.preview].join(' ').toLowerCase().includes(query.toLowerCase()),
      ),
    [allConversations, query],
  );

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedConversationId) ||
    allConversations.find((conversation) => conversation.id === selectedConversationId) ||
    null;

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div className="h-[calc(100vh-140px)] min-h-[500px]">
            <div className="flex flex-col lg:flex-row h-full gap-4">

              {/* SIDEBAR */}
              <div className={`lg:w-1/3 w-full h-full ${selectedConversationId ? 'hidden lg:block' : 'block'}`}>
                <div className="space-y-4 h-full flex flex-col">
                  <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800 flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-800">
                      <div className="relative">
                        <div className="relative w-full flex items-center">
                          <div className="absolute ltr:left-3 ltr:right-auto rtl:left-auto rtl:right-3 flex items-center">
                            <Search className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Input
                            className="bg-transparent pl-9 rtl:pl-3 rtl:pr-9"
                            placeholder={isArabic ? 'ابحث في المحادثات...' : 'Search conversations...'}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                      <div className="space-y-1">
                        {conversations.length ? (
                          conversations.map((conversation) => (
                            <button
                              key={conversation.id}
                              type="button"
                              onClick={() => setSelectedConversationId(conversation.id)}
                              className={`flex w-full items-start gap-3 rounded-lg p-3 text-right rtl:text-right ltr:text-left transition-colors ${selectedConversationId === conversation.id
                                  ? 'bg-slate-100 dark:bg-slate-900 shadow-sm'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'
                                }`}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-400">
                                {conversation.name.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1 border-b pb-3 dark:border-gray-800">
                                <p className="truncate font-semibold text-sm text-foreground">{conversation.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">{conversation.preview}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-8 text-center text-sm text-muted-foreground">
                            {isArabic ? 'لا توجد محادثات مطابقة.' : 'No matching conversations.'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAT WINDOW */}
              <div className={`lg:w-2/3 w-full h-full ${!selectedConversationId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedConversation ? (
                  <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800 w-full h-full flex flex-col overflow-hidden">
                    <div className="p-4 border-b dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 text-sm font-bold text-blue-700 dark:text-blue-400">
                        {selectedConversation.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h2 className="text-base font-semibold text-foreground">{selectedConversation.name}</h2>
                        <p className="text-xs text-muted-foreground">{isArabic ? 'متصل الآن' : 'Online now'}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSelectedConversationId(null)}>
                        {isArabic ? 'رجوع' : 'Back'}
                      </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedConversation.messages.map((message, index) => {
                        const isSentByMe = index % 2 !== 0; // Simulate alternating messages
                        return (
                          <div
                            key={`${selectedConversation.id}-${index}`}
                            className={`flex ${isSentByMe ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${isSentByMe
                                  ? 'bg-blue-600 text-white ltr:rounded-bl-sm rtl:rounded-br-sm'
                                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 ltr:rounded-br-sm rtl:rounded-bl-sm'
                                }`}
                            >
                              {message}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
                      <div className="flex items-end gap-3">
                        <Input
                          placeholder={isArabic ? 'اكتب رسالتك...' : 'Write your message...'}
                          className="h-12 bg-slate-50 dark:bg-slate-900 flex-1"
                        />
                        <Button
                          type="button"
                          className="h-12 w-12 rounded-full p-0 flex shrink-0 items-center justify-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        >
                          <Send className="h-5 w-5 rtl:-scale-x-100" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
                    <div className="text-center p-8 max-w-sm">
                      <div className="bg-primary/10 rounded-full p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                      </div>
                      <h3 className="text-xl font-medium mb-2 dark:text-gray-100">
                        {isArabic ? 'لم يتم اختيار محادثة' : 'No conversation selected'}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {isArabic
                          ? 'اختر محادثة من القائمة لعرض الرسائل المتبادلة أو ابدأ رسالة جديدة.'
                          : 'Select a conversation from the list to view your chat or start a new one.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
