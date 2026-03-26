'use client';

import { useState, useEffect } from 'react';
import {
    X,
    User,
    Calendar,
    MessageSquare,
    FileText,
    Award,
    Star,
    Clock,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    lessonsCount: number;
    salaryBase: number;
    lessonPrice: number;
    status: 'active' | 'inactive';
    image?: string;
    bankName?: string;
    bankAccountNumber?: string;
    iban?: string;
    salaryBonus?: number;
    performanceRating: number;
    classesThisMonth: number;
    attendanceRate: number;
    assignedGroups: string[];
    languagesTeaching: string[];
    joinedDate: string;
    nationality?: string;
}

interface TeacherDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: Teacher | null;
}

type TabType = 'overview' | 'attendance' | 'feedback' | 'documents' | 'certifications';

export default function TeacherDetailModal({
    isOpen,
    onClose,
    teacher,
}: TeacherDetailModalProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [feedbackTab, setFeedbackTab] = useState<'parents' | 'students'>('parents');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [feedback] = useState<{ parents: any[]; students: any[] }>({ parents: [], students: [] });
    const [documents] = useState<any[]>([]);
    const [certifications] = useState<any[]>([]);
    const [attendanceSummary, setAttendanceSummary] = useState({ present: 0, absent: 0, totalSessions: 0 });

    useEffect(() => {
        if (!teacher?.id) return;
        let cancelled = false;

        async function fetchTeacherData() {
            try {
                const res = await fetch(`/api/attendance?teacher_id=${teacher!.id}`);
                if (res.ok) {
                    const payload = await res.json();
                    const records = payload.records || payload.data || payload || [];
                    if (!cancelled && Array.isArray(records)) {
                        setAttendanceData(records);
                        const present = records.filter((r: any) => r.status === 'present').length;
                        const absent = records.filter((r: any) => r.status === 'absent').length;
                        setAttendanceSummary({ present, absent, totalSessions: records.length });
                    }
                }
            } catch { /* empty state on error */ }
        }

        fetchTeacherData();
        return () => { cancelled = true; };
    }, [teacher?.id]);

    if (!isOpen || !teacher) return null;

    const tabs = [
        { id: 'overview', label: 'نظرة عامة', icon: User },
        { id: 'attendance', label: 'الحضور', icon: Calendar },
        { id: 'feedback', label: 'التقييمات', icon: MessageSquare },
        { id: 'documents', label: 'المستندات', icon: FileText },
        { id: 'certifications', label: 'الشهادات', icon: Award },
    ] as const;

    const renderStars = (rating: number) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-4 text-white">
                    <p className="text-3xl font-bold">{teacher.classesThisMonth}</p>
                    <p className="text-sm opacity-80">حصة هذا الشهر</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                    <p className="text-3xl font-bold">{teacher.attendanceRate}%</p>
                    <p className="text-sm opacity-80">نسبة الحضور</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-1">
                        <span className="text-3xl font-bold">{teacher.performanceRating}</span>
                        <Star className="w-5 h-5 fill-white" />
                    </div>
                    <p className="text-sm opacity-80">التقييم</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                    <p className="text-3xl font-bold">{teacher.lessonsCount}</p>
                    <p className="text-sm opacity-80">إجمالي الدروس</p>
                </div>
            </div>

            {/* Teacher Info Grid */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="admin-card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">معلومات شخصية</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-500">البريد الإلكتروني</span>
                            <span className="text-gray-800 truncate max-w-[200px]" title={teacher.email}>{teacher.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">الهاتف</span>
                            <span className="text-gray-800 dir-ltr">{teacher.phone}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">الجنسية</span>
                            <span className="text-gray-800">{teacher.nationality || 'غير محدد'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">تاريخ الانضمام</span>
                            <span className="text-gray-800">{new Date(teacher.joinedDate).toLocaleDateString('ar-EG')}</span>
                        </div>
                    </div>
                </div>

                <div className="admin-card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">معلومات التدريس</h3>
                    <div className="space-y-3">
                        <div>
                            <span className="text-gray-500 block mb-1">المواد</span>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map((subject) => (
                                    <span key={subject} className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">الصفوف</span>
                            <div className="flex flex-wrap gap-2">
                                {teacher.assignedGroups.map((group) => (
                                    <span key={group} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                        {group}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Financial Info */}
            <div className="admin-card p-4">
                <h3 className="font-medium text-gray-800 mb-4">المعلومات المالية</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{teacher.salaryBase?.toLocaleString('ar-EG')} د.إ</p>
                        <p className="text-sm text-gray-500">الراتب الأساسي</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-800">{teacher.salaryBonus?.toLocaleString('ar-EG') || 0} د.إ</p>
                        <p className="text-sm text-gray-500">المكافأة</p>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                        <p className="text-2xl font-bold text-teal-600">
                            {((teacher.salaryBase || 0) + (teacher.salaryBonus || 0)).toLocaleString('ar-EG')} د.إ
                        </p>
                        <p className="text-sm text-teal-600">الإجمالي</p>
                    </div>
                </div>
                {teacher.bankName && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500 truncate">
                            البنك: {teacher.bankName} | الحساب: ****{teacher.bankAccountNumber?.slice(-4)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    const renderAttendance = () => {
        const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
        const monthName = currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-10" />);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const attendance = attendanceData.find((a) => a.date === dateStr);
            const isPresent = attendance?.status === 'present';
            const isAbsent = attendance?.status === 'absent';

            days.push(
                <div
                    key={day}
                    className={`h-10 flex items-center justify-center rounded-lg text-sm cursor-pointer transition-all ${isPresent
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : isAbsent
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'hover:bg-gray-100'
                        }`}
                >
                    {day}
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="admin-card p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{attendanceSummary.present}</p>
                        <p className="text-sm text-gray-500">أيام حضور</p>
                    </div>
                    <div className="admin-card p-4 text-center">
                        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{attendanceSummary.absent}</p>
                        <p className="text-sm text-gray-500">أيام غياب</p>
                    </div>
                    <div className="admin-card p-4 text-center">
                        <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-gray-800">{attendanceSummary.totalSessions}</p>
                        <p className="text-sm text-gray-500">إجمالي الحصص</p>
                    </div>
                </div>

                {/* Calendar */}
                <div className="admin-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-medium text-gray-800">{monthName}</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                            <div key={day} className="text-xs text-gray-500 font-medium py-2">
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">{days}</div>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100" />
                            <span className="text-sm text-gray-500">حاضر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-100" />
                            <span className="text-sm text-gray-500">غائب</span>
                        </div>
                    </div>
                </div>

                {/* Recent Attendance */}
                <div className="admin-card p-4">
                    <h3 className="font-medium text-gray-800 mb-4">سجل الحضور الأخير</h3>
                    <div className="space-y-3">
                        {attendanceData.map((record, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div
                                    className={`w-3 h-3 rounded-full mt-1.5 ${record.status === 'present' ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-800">
                                            {new Date(record.date).toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                                        </span>
                                        <span
                                            className={`text-sm ${record.status === 'present' ? 'text-green-600' : 'text-red-600'}`}
                                        >
                                            {record.status === 'present' ? 'حاضر' : 'غائب'}
                                        </span>
                                    </div>
                                    {record.sessions.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {record.sessions.map((session, sIdx) => (
                                                <span key={sIdx} className="text-xs px-2 py-1 bg-white rounded border border-gray-200">
                                                    {session.time} - {session.class}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderFeedback = () => (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFeedbackTab('parents')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${feedbackTab === 'parents' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    تقييمات أولياء الأمور
                </button>
                <button
                    onClick={() => setFeedbackTab('students')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${feedbackTab === 'students' ? 'bg-teal-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    تقييمات الطلاب
                </button>
            </div>

            {/* Overall Rating */}
            <div className="admin-card p-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-4xl font-bold text-gray-800">4.8</span>
                    <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-gray-500">متوسط التقييم من {feedbackTab === 'parents' ? 'أولياء الأمور' : 'الطلاب'}</p>
                <div className="flex justify-center gap-1 mt-2">
                    {renderStars(5)}
                </div>
            </div>

            {/* Feedback List */}
            <div className="space-y-4">
                {(feedbackTab === 'parents' ? feedback.parents : feedback.students).map((feedback) => (
                    <div key={feedback.id} className="admin-card p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-500" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-800">{feedback.name}</span>
                                    <span className="text-sm text-gray-400">{new Date(feedback.date).toLocaleDateString('ar-EG')}</span>
                                </div>
                                <div className="mb-2">{renderStars(feedback.rating)}</div>
                                <p className="text-gray-600 text-sm">{feedback.comment}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-500 text-white">الكل</button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">المحادثات</button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">المواد التعليمية</button>
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">المستندات</button>
            </div>

            {/* Documents List */}
            <div className="space-y-3">
                {documents.map((doc) => (
                    <div key={doc.id} className="admin-card p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${doc.type === 'chat'
                                ? 'bg-blue-100 text-blue-600'
                                : doc.type === 'material'
                                    ? 'bg-green-100 text-green-600'
                                    : 'bg-purple-100 text-purple-600'
                                }`}
                        >
                            {doc.type === 'chat' ? (
                                <MessageSquare className="w-5 h-5" />
                            ) : (
                                <FileText className="w-5 h-5" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-gray-800">{doc.title}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(doc.date).toLocaleDateString('ar-EG')}
                                {doc.size && ` • ${doc.size}`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderCertifications = () => (
        <div className="space-y-6">
            {/* Completed */}
            <div>
                <h3 className="font-medium text-gray-800 mb-4">الشهادات المكتملة</h3>
                <div className="space-y-3">
                    {certifications
                        .filter((c) => c.status === 'completed')
                        .map((cert) => (
                            <div key={cert.id} className="admin-card p-4 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                    <Award className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">{cert.title}</p>
                                    <p className="text-sm text-gray-500">{cert.issuer}</p>
                                </div>
                                <div className="text-left">
                                    <span className="admin-badge admin-badge-success">مكتمل</span>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(cert.date).toLocaleDateString('ar-EG')}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* In Progress */}
            <div>
                <h3 className="font-medium text-gray-800 mb-4">قيد التقدم</h3>
                <div className="space-y-3">
                    {certifications
                        .filter((c) => c.status === 'in-progress')
                        .map((cert) => (
                            <div key={cert.id} className="admin-card p-4">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Award className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{cert.title}</p>
                                        <p className="text-sm text-gray-500">{cert.issuer}</p>
                                    </div>
                                    <span className="admin-badge admin-badge-warning">قيد التقدم</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-500 h-2 rounded-full transition-all"
                                        style={{ width: `${cert.progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{cert.progress}% مكتمل</p>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-teal-100 flex items-center justify-center">
                            {teacher.image ? (
                                <img loading="lazy" decoding="async" src={teacher.image} alt={teacher.name} className="w-full h-full rounded-xl object-cover" />
                            ) : (
                                <span className="text-teal-600 font-bold text-xl">{teacher.name.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{teacher.name}</h2>
                            <p className="text-gray-500">{teacher.subjects.join(' • ')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="admin-btn admin-btn-ghost admin-btn-icon">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-4 border-b border-gray-100 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.id
                                ? 'bg-teal-500 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'attendance' && renderAttendance()}
                    {activeTab === 'feedback' && renderFeedback()}
                    {activeTab === 'documents' && renderDocuments()}
                    {activeTab === 'certifications' && renderCertifications()}
                </div>
            </div>
        </div>
    );
}
