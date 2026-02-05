'use client';

import { useMemo, useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    content: string;
    time: string;
    link?: { href: string; label: string };
}

const quickPrompts = [
    'كيف أراجع الحضور اليوم؟',
    'أين أجد سجل الرسائل؟',
    'كيف أضيف طالب جديد؟',
    'أين تسجيلات الدروس؟',
];

const botResponses = [
    {
        keywords: ['حضور', 'غياب', 'تأخر'],
        reply: 'تقدر تتابع الحضور من صفحة الحضور، وتشوف تقارير كل طالب حسب التاريخ.',
        link: { href: '/admin/attendance', label: 'صفحة الحضور' },
    },
    {
        keywords: ['جدول', 'مواعيد', 'تقويم', 'موعد'],
        reply: 'كل الجداول موجودة في صفحة التقويم مع إمكانية إرسال نسخة لولي الأمر.',
        link: { href: '/admin/calendar', label: 'التقويم' },
    },
    {
        keywords: ['واجب', 'واجبات', 'تصحيح'],
        reply: 'الواجبات الأسبوعية متاحة داخل صفحة الدروس مع تصحيح وتعليقات مكتوبة وصوتية.',
        link: { href: '/admin/lessons', label: 'الدروس' },
    },
    {
        keywords: ['رسائل', 'محادثات', 'شات', 'سجل'],
        reply: 'سجل الرسائل بالكامل موجود في صفحة الرسائل والسجلات، يمكن البحث باسم الطالب أو المعلم.',
        link: { href: '/admin/messages-audit', label: 'الرسائل والسجلات' },
    },
    {
        keywords: ['زووم', 'meet', 'جلسة', 'مباشر', 'لايف'],
        reply: 'الجلسات المباشرة تُدار من صفحة الجلسات، مع روابط مخصصة لكل طالب.',
        link: { href: '/admin/live', label: 'الجلسات المباشرة' },
    },
    {
        keywords: ['طالب', 'طلاب', 'تسجيل', 'إضافة'],
        reply: 'إدارة الطلاب والتسجيل موجودة في صفحة الطلاب، يمكنك إضافة طالب جديد من هناك.',
        link: { href: '/admin/students', label: 'الطلاب' },
    },
    {
        keywords: ['معلم', 'معلمين', 'مدرس', 'أستاذ'],
        reply: 'قائمة المعلمين وتوزيع الجداول متاحة في صفحة المعلمين.',
        link: { href: '/admin/teachers', label: 'المعلمون' },
    },
    {
        keywords: ['اختبار', 'امتحان', 'كويز', 'درجات', 'نتائج'],
        reply: 'الاختبارات وبنك الأسئلة موجودة في صفحة الاختبارات.',
        link: { href: '/admin/quizzes-exams', label: 'الاختبارات' },
    },
    {
        keywords: ['رسوم', 'دفع', 'فلوس', 'مصاريف', 'فاتورة'],
        reply: 'متابعة الرسوم والمدفوعات من صفحة الرسوم.',
        link: { href: '/admin/fees', label: 'الرسوم' },
    },
    {
        keywords: ['تسجيل', 'فيديو', 'تسجيلات', 'محتوى'],
        reply: 'تسجيلات الدروس متاحة للطلاب من صفحة المحتوى، كل درس له تسجيل يمكن مشاهدته.',
        link: { href: '/admin/content', label: 'المحتوى' },
    },
    {
        keywords: ['ولي', 'أمر', 'parent', 'أولياء'],
        reply: 'حسابات أولياء الأمور تتيح لهم متابعة الدرجات والحضور والغياب من خلال بوابتهم الخاصة.',
        link: { href: '/admin/students', label: 'الطلاب' },
    },
    {
        keywords: ['مجموعة', 'مجموعات', 'فصل', 'فصول', 'صف'],
        reply: 'الدراسة في مجموعات من 15 إلى 20 طالب. يمكنك إدارة الفصول من صفحة الطلاب.',
        link: { href: '/admin/students', label: 'الطلاب' },
    },
];

const getTimeLabel = () =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

export default function InstantChatbotWidget() {
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'welcome',
            role: 'bot',
            content: 'مرحباً! اسألني عن أي شيء يخص Eduverse وسأرد فوراً.',
            time: getTimeLabel(),
        },
    ]);
    const [input, setInput] = useState('');

    const replyMap = useMemo(() => botResponses, []);

    const handleSend = (text: string) => {
        const trimmed = text.trim();
        if (!trimmed) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: trimmed,
            time: getTimeLabel(),
        };

        const matched = replyMap.find((item) =>
            item.keywords.some((keyword) => trimmed.toLowerCase().includes(keyword))
        );

        const botMessage: ChatMessage = {
            id: `bot-${Date.now() + 1}`,
            role: 'bot',
            content: matched
                ? matched.reply
                : 'أكيد! ممكن توضح أكثر سؤالك علشان أساعدك بسرعة؟',
            time: getTimeLabel(),
            link: matched?.link,
        };

        setMessages((prev) => [...prev, userMessage, botMessage]);
        setInput('');
    };

    return (
        <div className="admin-card">
            <div className="admin-card-header flex items-center justify-between">
                <h3 className="admin-card-title">
                    <Bot className="w-5 h-5 text-teal-500" />
                    مساعد Eduverse الفوري
                </h3>
                <span className="admin-badge admin-badge-success flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    رد فوري
                </span>
            </div>
            <div className="admin-card-body space-y-4">
                <div className="h-56 overflow-y-auto space-y-3 pr-1">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${message.role === 'user'
                                    ? 'bg-gray-100 text-gray-800 rounded-bl-md'
                                    : 'bg-teal-500 text-white rounded-br-md'
                                    }`}
                            >
                                <p className="leading-relaxed">{message.content}</p>
                                {message.link && (
                                    <Link
                                        href={withLocalePrefix(message.link.href, locale)}
                                        className="mt-2 inline-flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-lg transition-colors"
                                    >
                                        → {message.link.label}
                                    </Link>
                                )}
                                <span className={`mt-1 block text-xs ${message.role === 'user' ? 'text-gray-500' : 'text-white/70'}`}>
                                    {message.time}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                        <button
                            key={prompt}
                            type="button"
                            onClick={() => handleSend(prompt)}
                            className="px-3 py-1.5 rounded-full text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors"
                        >
                            {prompt}
                        </button>
                    ))}
                </div>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        handleSend(input);
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        placeholder="اكتب سؤالك هنا..."
                        className="admin-input flex-1"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="admin-btn admin-btn-primary flex items-center gap-1 disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                        إرسال
                    </button>
                </form>
            </div>
        </div>
    );
}
