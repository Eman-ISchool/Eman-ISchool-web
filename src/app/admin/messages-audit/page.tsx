'use client';

import { useState, useEffect } from 'react';
import {
    MessageSquare,
    FileText,
    Search,
    User,
    Clock,
    Filter,
    ChevronLeft,
    Calendar,
    Download,
    Users,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';
import DataTable, { Column } from '@/components/admin/DataTable';

interface MessageThread {
    id: string;
    participants: { name: string; role: string }[];
    lastMessage: string;
    lastMessageAt: Date;
    unreadCount: number;
}

interface MessageHistoryEntry {
    id: string;
    fromName: string;
    fromRole: string;
    toName: string;
    toRole: string;
    message: string;
    createdAt: Date;
    searchText: string;
}

interface AuditLogEntry {
    id: string;
    actorName: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityName: string;
    createdAt: Date;
}

export default function MessagesAuditPage() {
    const [activeTab, setActiveTab] = useState<'messages' | 'audit'>('messages');
    const [loading, setLoading] = useState(true);
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [messageHistory, setMessageHistory] = useState<MessageHistoryEntry[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'guardian'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const mockThreads: MessageThread[] = [
            {
                id: '1',
                participants: [
                    { name: 'أ. أحمد محمد', role: 'teacher' },
                    { name: 'ولي أمر أحمد', role: 'guardian' },
                ],
                lastMessage: 'شكراً على المتابعة، سنتواصل معكم قريباً',
                lastMessageAt: new Date(Date.now() - 30 * 60 * 1000),
                unreadCount: 2,
            },
            {
                id: '2',
                participants: [
                    { name: 'أ. سارة أحمد', role: 'teacher' },
                    { name: 'فاطمة علي', role: 'student' },
                ],
                lastMessage: 'هل يمكنكِ إرسال الواجب مرة أخرى؟',
                lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                unreadCount: 0,
            },
            {
                id: '3',
                participants: [
                    { name: 'محمد خالد', role: 'student' },
                    { name: 'أ. علي حسن', role: 'teacher' },
                ],
                lastMessage: 'تم رفع التسجيل الصوتي للقراءة',
                lastMessageAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
                unreadCount: 1,
            },
        ];

        const mockAuditLogs: AuditLogEntry[] = [
            { id: '1', actorName: 'أ. أحمد', actorRole: 'admin', action: 'create', entityType: 'lesson', entityName: 'درس الرياضيات', createdAt: new Date() },
            { id: '2', actorName: 'أ. سارة', actorRole: 'teacher', action: 'update', entityType: 'attendance', entityName: 'حضور الصف التاسع', createdAt: new Date(Date.now() - 60 * 60 * 1000) },
            { id: '3', actorName: 'النظام', actorRole: 'system', action: 'create', entityType: 'invoice', entityName: 'فاتورة #1234', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { id: '4', actorName: 'أ. علي حسن', actorRole: 'teacher', action: 'create', entityType: 'quiz', entityName: 'اختبار الوحدة الأولى', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
            { id: '5', actorName: 'ولي أمر أحمد', actorRole: 'guardian', action: 'update', entityType: 'payment', entityName: 'دفع الرسوم الشهرية', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
        ];

        const mockHistory: MessageHistoryEntry[] = [
            {
                id: 'h1',
                fromName: 'أ. أحمد محمد',
                fromRole: 'teacher',
                toName: 'ولي أمر أحمد',
                toRole: 'guardian',
                message: 'شكراً على المتابعة، سنتواصل معكم قريباً',
                createdAt: new Date(Date.now() - 35 * 60 * 1000),
                searchText: 'أ. أحمد محمد ولي أمر أحمد teacher guardian',
            },
            {
                id: 'h2',
                fromName: 'ولي أمر أحمد',
                fromRole: 'guardian',
                toName: 'أ. أحمد محمد',
                toRole: 'teacher',
                message: 'تم استلام الجدول الأسبوعي، شكراً لكم.',
                createdAt: new Date(Date.now() - 50 * 60 * 1000),
                searchText: 'ولي أمر أحمد أ. أحمد محمد guardian teacher',
            },
            {
                id: 'h3',
                fromName: 'أ. سارة أحمد',
                fromRole: 'teacher',
                toName: 'فاطمة علي',
                toRole: 'student',
                message: 'هل يمكنكِ إرسال الواجب مرة أخرى؟',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
                searchText: 'أ. سارة أحمد فاطمة علي teacher student',
            },
            {
                id: 'h4',
                fromName: 'فاطمة علي',
                fromRole: 'student',
                toName: 'أ. سارة أحمد',
                toRole: 'teacher',
                message: 'تم رفع الواجب مع التسجيل الصوتي.',
                createdAt: new Date(Date.now() - 90 * 60 * 1000),
                searchText: 'فاطمة علي أ. سارة أحمد student teacher',
            },
            {
                id: 'h5',
                fromName: 'محمد خالد',
                fromRole: 'student',
                toName: 'أ. علي حسن',
                toRole: 'teacher',
                message: 'أستاذ، أرجو توضيح نقطة في الدرس الأخير',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
                searchText: 'محمد خالد أ. علي حسن student teacher',
            },
            {
                id: 'h6',
                fromName: 'أ. علي حسن',
                fromRole: 'teacher',
                toName: 'محمد خالد',
                toRole: 'student',
                message: 'بالطبع، سأشرحها في الجلسة القادمة',
                createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
                searchText: 'أ. علي حسن محمد خالد teacher student',
            },
            {
                id: 'h7',
                fromName: 'ولي أمر سارة',
                fromRole: 'guardian',
                toName: 'أ. أحمد محمد',
                toRole: 'teacher',
                message: 'كيف أداء ابنتي في الاختبار الأخير؟',
                createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
                searchText: 'ولي أمر سارة أ. أحمد محمد guardian teacher',
            },
            {
                id: 'h8',
                fromName: 'أ. أحمد محمد',
                fromRole: 'teacher',
                toName: 'ولي أمر سارة',
                toRole: 'guardian',
                message: 'أداؤها ممتاز، حصلت على 95% في الاختبار',
                createdAt: new Date(Date.now() - 5.5 * 60 * 60 * 1000),
                searchText: 'أ. أحمد محمد ولي أمر سارة teacher guardian',
            },
        ];

        setTimeout(() => {
            setThreads(mockThreads);
            setAuditLogs(mockAuditLogs);
            setMessageHistory(mockHistory);
            setLoading(false);
        }, 500);
    }, []);

    const auditColumns: Column<AuditLogEntry>[] = [
        {
            key: 'actorName',
            header: 'المستخدم',
            render: (log) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">{log.actorName}</p>
                        <p className="text-xs text-gray-500">{log.actorRole}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'action',
            header: 'الإجراء',
            render: (log) => {
                const actionColors = {
                    create: 'admin-badge-success',
                    update: 'admin-badge-upcoming',
                    delete: 'admin-badge-error',
                };
                const actionLabels = { create: 'إنشاء', update: 'تحديث', delete: 'حذف' };
                return (
                    <span className={`admin-badge ${actionColors[log.action as keyof typeof actionColors] || 'bg-gray-100'}`}>
                        {actionLabels[log.action as keyof typeof actionLabels] || log.action}
                    </span>
                );
            },
        },
        {
            key: 'entityType',
            header: 'النوع',
            render: (log) => <span className="text-gray-600">{log.entityType}</span>,
        },
        {
            key: 'entityName',
            header: 'العنصر',
            render: (log) => <span className="text-gray-800">{log.entityName}</span>,
        },
        {
            key: 'createdAt',
            header: 'الوقت',
            sortable: true,
            render: (log) => (
                <span className="text-sm text-gray-500">
                    {log.createdAt.toLocaleString('ar-EG')}
                </span>
            ),
        },
    ];

    const historyColumns: Column<MessageHistoryEntry>[] = [
        {
            key: 'fromName',
            header: 'المرسل',
            render: (entry) => (
                <div>
                    <p className="text-sm font-medium text-gray-800">{entry.fromName}</p>
                    <p className="text-xs text-gray-500">{entry.fromRole}</p>
                </div>
            ),
        },
        {
            key: 'toName',
            header: 'المستلم',
            render: (entry) => (
                <div>
                    <p className="text-sm font-medium text-gray-800">{entry.toName}</p>
                    <p className="text-xs text-gray-500">{entry.toRole}</p>
                </div>
            ),
        },
        {
            key: 'message',
            header: 'نص الرسالة',
            render: (entry) => <span className="text-gray-700">{entry.message}</span>,
        },
        {
            key: 'createdAt',
            header: 'الوقت',
            sortable: true,
            render: (entry) => (
                <span className="text-sm text-gray-500">
                    {entry.createdAt.toLocaleString('ar-EG')}
                </span>
            ),
        },
    ];

    const filteredThreads = threads.filter((thread) => {
        if (!searchQuery) return true;
        return thread.participants.some((participant) =>
            participant.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    if (loading) {
        return <LoadingState message="جاري التحميل..." />;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الرسائل والسجلات</h1>
                    <p className="text-gray-500">متابعة المحادثات وسجلات النظام</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`admin-btn ${showFilters ? 'admin-btn-primary' : 'admin-btn-ghost'}`}
                    >
                        <Filter className="w-4 h-4" />
                        فلتر
                    </button>
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="admin-card p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع المستخدم</label>
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as 'all' | 'student' | 'teacher' | 'guardian')}
                                className="admin-input"
                            >
                                <option value="all">الكل</option>
                                <option value="student">طالب</option>
                                <option value="teacher">معلم</option>
                                <option value="guardian">ولي أمر</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">من تاريخ</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="admin-input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">إلى تاريخ</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="admin-input"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => { setRoleFilter('all'); setDateFrom(''); setDateTo(''); }}
                                className="admin-btn admin-btn-secondary w-full"
                            >
                                إعادة ضبط
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card p-1 inline-flex">
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <MessageSquare className="w-4 h-4" />
                    الرسائل
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'audit' ? 'bg-teal-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <FileText className="w-4 h-4" />
                    سجلات النظام
                </button>
            </div>

            {activeTab === 'messages' && (
                <div className="admin-card">
                    <div className="p-4 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="ابحث باسم الطالب أو المعلم..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="admin-input pr-10"
                            />
                        </div>
                    </div>
                    {filteredThreads.length === 0 ? (
                        <EmptyState
                            icon={<MessageSquare className="w-8 h-8 text-gray-400" />}
                            title="لا توجد رسائل"
                            message="لم يتم العثور على محادثات"
                        />
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredThreads.map((thread) => (
                                <div
                                    key={thread.id}
                                    className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
                                                <User className="w-6 h-6 text-teal-600" />
                                            </div>
                                            {thread.unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                                    {thread.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">
                                                {thread.participants.map((p) => p.name).join(' و ')}
                                            </p>
                                            <p className="text-sm text-gray-500 line-clamp-1">{thread.lastMessage}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {thread.lastMessageAt.toLocaleTimeString('ar-EG', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                        <ChevronLeft className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'messages' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">سجل الرسائل الكامل</h2>
                        <span className="text-sm text-gray-500">
                            البحث حسب اسم الطالب أو المعلم
                        </span>
                    </div>
                    <DataTable
                        data={messageHistory}
                        columns={historyColumns}
                        searchKey="searchText"
                        searchPlaceholder="ابحث باسم الطالب أو المعلم..."
                        emptyTitle="لا توجد رسائل"
                        emptyMessage="لم يتم العثور على سجلات رسائل"
                    />
                </div>
            )}

            {activeTab === 'audit' && (
                <DataTable
                    data={auditLogs}
                    columns={auditColumns}
                    emptyTitle="لا توجد سجلات"
                    emptyMessage="لم يتم تسجيل أي إجراءات بعد"
                />
            )}
        </div>
    );
}
