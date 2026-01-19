'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Plus,
    CalendarDays,
    List,
    Filter,
    Video,
    Clock,
    Users,
    User,
    BookOpen,
    Layers,
    PlusCircle,
    Trash2,
    Edit2,
    MoreHorizontal,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';

type ViewMode = 'month' | 'week' | 'day';

interface Appointment {
    id: string;
    title: string;
    teacherName: string;
    groupName?: string;
    className: string;
    subject: string;
    startTime: Date;
    endTime: Date;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    meetLink?: string;
    notes?: string;
    type?: 'lesson' | 'meeting' | 'exam';
    platform?: 'zoom' | 'meet' | 'teams' | 'other';
    capacity?: number;
    accessCode?: string;
}

interface AppointmentFormData {
    title: string;
    teacherName: string;
    groupName: string;
    className: string;
    subject: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'lesson' | 'meeting' | 'exam';
    notes: string;
    meetLink: string;
    platform: 'zoom' | 'meet' | 'teams' | 'other';
    capacity: string;
    accessCode: string;
}

const initialFormData: AppointmentFormData = {
    title: '',
    teacherName: '',
    groupName: '',
    className: '',
    subject: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'lesson',
    notes: '',
    meetLink: '',
    platform: 'zoom',
    capacity: '',
    accessCode: '',
};

// Mock data for dropdowns
const teachers = [
    { id: '1', name: 'أ. أحمد محمد' },
    { id: '2', name: 'أ. سارة أحمد' },
    { id: '3', name: 'أ. محمد علي' },
    { id: '4', name: 'أ. فاطمة حسن' },
    { id: '5', name: 'أ. خالد العمري' },
];

const classes = [
    { id: '1', name: 'الصف التاسع أ' },
    { id: '2', name: 'الصف التاسع ب' },
    { id: '3', name: 'الصف العاشر أ' },
    { id: '4', name: 'الصف العاشر ب' },
    { id: '5', name: 'الصف الثامن أ' },
    { id: '6', name: 'الصف الثامن ب' },
];

const groups = [
    { id: 'g1', name: 'المجموعة أ' },
    { id: 'g2', name: 'المجموعة ب' },
    { id: 'g3', name: 'المجموعة ج' },
    { id: 'g4', name: 'المجموعة د' },
];

const subjects = [
    { id: '1', name: 'الرياضيات' },
    { id: '2', name: 'الفيزياء' },
    { id: '3', name: 'الكيمياء' },
    { id: '4', name: 'اللغة العربية' },
    { id: '5', name: 'اللغة الإنجليزية' },
    { id: '6', name: 'العلوم' },
    { id: '7', name: 'التاريخ' },
];

// Calendar component
function CalendarGrid({
    currentDate,
    appointments,
    onDateClick,
    onEventClick,
}: {
    currentDate: Date;
    appointments: Appointment[];
    onDateClick: (date: Date) => void;
    onEventClick: (apt: Appointment) => void;
}) {
    const daysInMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        0
    ).getDate();

    const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    ).getDay();

    const days = [];
    const weekDays = ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = date.toDateString() === new Date().toDateString();
        const dayAppointments = appointments.filter(
            (apt) => apt.startTime.toDateString() === date.toDateString()
        );

        days.push(
            <div
                key={day}
                className={`h-24 border border-gray-100 p-1 cursor-pointer hover:bg-teal-50/50 transition-colors ${isToday ? 'bg-teal-50' : 'bg-white'
                    }`}
                onClick={() => onDateClick(date)}
            >
                <div
                    className={`text-sm font-medium mb-1 ${isToday
                        ? 'w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center'
                        : 'text-gray-700'
                        }`}
                >
                    {day}
                </div>
                <div className="space-y-1 overflow-hidden">
                    {dayAppointments.slice(0, 2).map((apt) => (
                        <div
                            key={apt.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEventClick(apt);
                            }}
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${apt.status === 'live'
                                ? 'bg-red-100 text-red-700'
                                : apt.status === 'completed'
                                    ? 'bg-gray-100 text-gray-600'
                                    : 'bg-teal-100 text-teal-700'
                                }`}
                        >
                            {apt.title}
                        </div>
                    ))}
                    {dayAppointments.length > 2 && (
                        <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 2} أخرى
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="admin-card overflow-hidden">
            <div className="grid grid-cols-7 bg-gray-50 border-b">
                {weekDays.map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7">{days}</div>
        </div>
    );
}

// Appointment list item
function AppointmentListItem({
    appointment,
    onEdit,
    onJoin,
}: {
    appointment: Appointment;
    onEdit: () => void;
    onJoin?: () => void;
}) {
    const statusColors = {
        scheduled: 'admin-badge-upcoming',
        live: 'admin-badge-live',
        completed: 'admin-badge-completed',
        cancelled: 'bg-gray-100 text-gray-500',
    };

    const statusLabels = {
        scheduled: 'مجدول',
        live: 'مباشر',
        completed: 'منتهي',
        cancelled: 'ملغي',
    };

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-teal-100 flex flex-col items-center justify-center">
                    <span className="text-xs text-teal-600">
                        {appointment.startTime.toLocaleDateString('ar-EG', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-teal-700">
                        {appointment.startTime.getDate()}
                    </span>
                </div>
                <div>
                    <h4 className="font-medium text-gray-800">{appointment.title}</h4>
                    <p className="text-sm text-gray-500">
                        {appointment.teacherName} • {appointment.subject}
                        {appointment.groupName ? ` • ${appointment.groupName}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        {appointment.startTime.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}{' '}
                        -{' '}
                        {appointment.endTime.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className={`admin-badge ${statusColors[appointment.status]}`}>
                    {statusLabels[appointment.status]}
                </span>
                {appointment.status === 'live' && appointment.meetLink && (
                    <button
                        onClick={onJoin}
                        className="admin-btn admin-btn-primary text-sm py-1.5 px-3"
                    >
                        <Video className="w-4 h-4" />
                        انضم
                    </button>
                )}
                <button
                    onClick={onEdit}
                    className="admin-btn admin-btn-ghost admin-btn-icon"
                >
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default function CalendarPage() {
    const [modalTab, setModalTab] = useState<'details' | 'sessions'>('details');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [showList, setShowList] = useState(false);
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [showNewModal, setShowNewModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [sessions, setSessions] = useState<Array<{
        id: string;
        date: string;
        startTime: string;
        endTime: string;
        groupName: string;
        className: string;
        teacherName: string;
        subject: string;
        meetLink: string;
        notes: string;
    }>>([]);
    const [newSession, setNewSession] = useState({
        date: '',
        startTime: '',
        endTime: '',
        groupName: '',
        className: '',
        teacherName: '',
        subject: '',
        meetLink: '',
        notes: '',
    });
    const [sessionError, setSessionError] = useState<string | null>(null);
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

    useEffect(() => {
        // Extended mock data with more appointments
        const today = new Date();
        const mockAppointments: Appointment[] = [
            {
                id: '1',
                title: 'درس الرياضيات',
                teacherName: 'أ. أحمد محمد',
                groupName: 'المجموعة أ',
                className: 'الصف التاسع أ',
                subject: 'الرياضيات',
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                status: 'live',
                meetLink: 'https://meet.google.com/abc-defg-hij',
                type: 'lesson',
            },
            {
                id: '2',
                title: 'درس الفيزياء',
                teacherName: 'أ. سارة أحمد',
                groupName: 'المجموعة ب',
                className: 'الصف العاشر ب',
                subject: 'الفيزياء',
                startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
                status: 'scheduled',
                type: 'lesson',
            },
            {
                id: '3',
                title: 'درس اللغة العربية',
                teacherName: 'أ. محمد علي',
                groupName: 'المجموعة أ',
                className: 'الصف الثامن أ',
                subject: 'اللغة العربية',
                startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'completed',
                type: 'lesson',
            },
            {
                id: '4',
                title: 'اجتماع أولياء الأمور',
                teacherName: 'أ. فاطمة حسن',
                groupName: 'المجموعة ج',
                className: 'الصف التاسع أ',
                subject: 'اجتماع',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 15, 0),
                status: 'scheduled',
                type: 'meeting',
            },
            {
                id: '5',
                title: 'اختبار الكيمياء',
                teacherName: 'أ. خالد العمري',
                groupName: 'المجموعة ب',
                className: 'الصف العاشر أ',
                subject: 'الكيمياء',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 11, 30),
                status: 'scheduled',
                type: 'exam',
            },
            {
                id: '6',
                title: 'درس الإنجليزية',
                teacherName: 'أ. سارة أحمد',
                groupName: 'المجموعة د',
                className: 'الصف الثامن ب',
                subject: 'اللغة الإنجليزية',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 9, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 10, 0),
                status: 'scheduled',
                type: 'lesson',
            },
            {
                id: '7',
                title: 'درس التاريخ',
                teacherName: 'أ. محمد علي',
                groupName: 'المجموعة أ',
                className: 'الصف التاسع ب',
                subject: 'التاريخ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 12, 0),
                status: 'scheduled',
                type: 'lesson',
            },
            {
                id: '8',
                title: 'مراجعة الرياضيات',
                teacherName: 'أ. أحمد محمد',
                groupName: 'المجموعة ج',
                className: 'الصف العاشر أ',
                subject: 'الرياضيات',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 13, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 14, 30),
                status: 'scheduled',
                type: 'lesson',
            },
            {
                id: '9',
                title: 'درس العلوم',
                teacherName: 'أ. فاطمة حسن',
                groupName: 'المجموعة د',
                className: 'الصف الثامن أ',
                subject: 'العلوم',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 10, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1, 11, 0),
                status: 'completed',
                type: 'lesson',
            },
            {
                id: '10',
                title: 'اختبار اللغة العربية',
                teacherName: 'أ. محمد علي',
                groupName: 'المجموعة ب',
                className: 'الصف التاسع أ',
                subject: 'اللغة العربية',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 9, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 10, 30),
                status: 'completed',
                type: 'exam',
            },
        ];

        setTimeout(() => {
            setAppointments(mockAppointments);
            setLoading(false);
        }, 500);
    }, []);

    useEffect(() => {
        if (modalTab !== 'sessions') return;
        if (!newSession.date && formData.date) {
            setNewSession((prev) => ({
                ...prev,
                date: formData.date,
                startTime: formData.startTime,
                endTime: formData.endTime,
            }));
        }
    }, [modalTab, formData.date, formData.startTime, formData.endTime, newSession.date]);

    const navigateMonth = (delta: number) => {
        setCurrentDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1)
        );
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    const handleDateClick = (date: Date) => {
        setSelectedDate(date);
        setFormData({
            ...initialFormData,
            date: date.toISOString().split('T')[0],
        });
        setEditingAppointment(null);
        setSessions([]);
        setSessionError(null);
        setEditingSessionId(null);
        setModalTab('details');
        setShowNewModal(true);
    };

    const handleEventClick = (apt: Appointment) => {
        setEditingAppointment(apt);
        setFormData({
            title: apt.title,
            teacherName: apt.teacherName,
            groupName: apt.groupName || '',
            className: apt.className,
            subject: apt.subject,
            date: apt.startTime.toISOString().split('T')[0],
            startTime: apt.startTime.toTimeString().slice(0, 5),
            endTime: apt.endTime.toTimeString().slice(0, 5),
            type: apt.type || 'lesson',
            notes: apt.notes || '',
            meetLink: apt.meetLink || '',
            platform: apt.platform || 'zoom',
            capacity: apt.capacity ? String(apt.capacity) : '',
            accessCode: apt.accessCode || '',
        });
        setSessions([]);
        setSessionError(null);
        setEditingSessionId(null);
        setModalTab('details');
        setShowNewModal(true);
    };

    const handleFormChange = (field: keyof AppointmentFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const [year, month, day] = formData.date.split('-').map(Number);
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);

        const newAppointment: Appointment = {
            id: editingAppointment?.id || Date.now().toString(),
            title: formData.title,
            teacherName: formData.teacherName,
            groupName: formData.groupName || undefined,
            className: formData.className,
            subject: formData.subject,
            startTime: new Date(year, month - 1, day, startHour, startMin),
            endTime: new Date(year, month - 1, day, endHour, endMin),
            status: 'scheduled',
            type: formData.type,
            notes: formData.notes,
            meetLink: formData.meetLink,
            platform: formData.platform,
            capacity: formData.capacity ? Number(formData.capacity) : undefined,
            accessCode: formData.accessCode || undefined,
        };

        // Convert concurrent sessions to appointments
        const sessionAppointments: Appointment[] = sessions.map((session, index) => {
            const [sYear, sMonth, sDay] = session.date.split('-').map(Number);
            const [sStartHour, sStartMin] = session.startTime.split(':').map(Number);
            const [sEndHour, sEndMin] = session.endTime.split(':').map(Number);

            return {
                id: `${Date.now()}-session-${index}`,
                title: formData.title, // Use the main title
                teacherName: session.teacherName || formData.teacherName,
                groupName: session.groupName || undefined,
                className: session.className,
                subject: session.subject || formData.subject,
                startTime: new Date(sYear, sMonth - 1, sDay, sStartHour, sStartMin),
                endTime: new Date(sYear, sMonth - 1, sDay, sEndHour, sEndMin),
                status: 'scheduled' as const,
                type: formData.type,
                notes: session.notes || formData.notes,
                meetLink: session.meetLink || formData.meetLink,
                platform: formData.platform,
                capacity: formData.capacity ? Number(formData.capacity) : undefined,
                accessCode: formData.accessCode || undefined,
            };
        });

        if (editingAppointment) {
            setAppointments(prev => prev.map(apt =>
                apt.id === editingAppointment.id ? newAppointment : apt
            ));
        } else {
            // Add main appointment plus all session appointments
            setAppointments(prev => [...prev, newAppointment, ...sessionAppointments]);
        }

        setShowNewModal(false);
        setFormData(initialFormData);
        setEditingAppointment(null);
        setModalTab('details');
        setSessions([]);
        setEditingSessionId(null);
    };

    const handleAddSession = () => {
        setSessionError(null);

        if (!newSession.date || !newSession.startTime || !newSession.endTime || !newSession.groupName || !newSession.className) {
            setSessionError('يرجى تعبئة التاريخ والوقت والمجموعة والفصل.');
            return;
        }

        const hasDuplicate = sessions.some((session) =>
            session.date === newSession.date &&
            session.startTime === newSession.startTime &&
            session.endTime === newSession.endTime &&
            session.groupName === newSession.groupName &&
            session.className === newSession.className &&
            session.id !== editingSessionId
        );

        if (hasDuplicate) {
            setSessionError('تمت إضافة هذه الجلسة بالفعل لنفس المجموعة والفصل في نفس الوقت.');
            return;
        }

        if (editingSessionId) {
            setSessions((prev) =>
                prev.map((session) =>
                    session.id === editingSessionId
                        ? { ...session, ...newSession }
                        : session
                )
            );
        } else {
            setSessions((prev) => [
                ...prev,
                { ...newSession, id: Date.now().toString() },
            ]);
        }
        setNewSession({
            date: '',
            startTime: '',
            endTime: '',
            groupName: '',
            className: '',
            teacherName: '',
            subject: '',
            meetLink: '',
            notes: '',
        });
        setEditingSessionId(null);
    };

    const closeModal = () => {
        setShowNewModal(false);
        setFormData(initialFormData);
        setEditingAppointment(null);
        setModalTab('details');
        setSessions([]);
        setSessionError(null);
        setEditingSessionId(null);
    };

    if (loading) {
        return <LoadingState message="جاري تحميل التقويم..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">التقويم والمواعيد</h1>
                    <p className="text-gray-500">إدارة جميع المواعيد والجلسات</p>
                </div>
                <button
                    onClick={() => {
                        setSelectedDate(new Date());
                        setFormData({
                            ...initialFormData,
                            date: new Date().toISOString().split('T')[0],
                        });
                        setEditingAppointment(null);
                        setSessions([]);
                        setSessionError(null);
                        setEditingSessionId(null);
                        setModalTab('details');
                        setShowNewModal(true);
                    }}
                    className="admin-btn admin-btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    موعد جديد
                </button>
            </div>

            {/* Controls */}
            <div className="admin-card p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Navigation */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigateMonth(-1)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-800 min-w-[160px] text-center">
                                {currentDate.toLocaleDateString('ar-EG', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </h2>
                            <button
                                onClick={() => navigateMonth(1)}
                                className="admin-btn admin-btn-ghost admin-btn-icon"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                        <button onClick={goToToday} className="admin-btn admin-btn-secondary">
                            اليوم
                        </button>
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setShowList(false)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${!showList ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                                    }`}
                            >
                                <CalendarDays className="w-4 h-4" />
                                تقويم
                            </button>
                            <button
                                onClick={() => setShowList(true)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${showList ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'
                                    }`}
                            >
                                <List className="w-4 h-4" />
                                قائمة
                            </button>
                        </div>
                        <button className="admin-btn admin-btn-ghost admin-btn-icon">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar or List View */}
            {showList ? (
                <div className="admin-card">
                    {appointments.length === 0 ? (
                        <EmptyState
                            title="لا توجد مواعيد"
                            message="قم بإضافة موعد جديد للبدء"
                            action={{
                                label: 'إضافة موعد',
                                onClick: () => {
                                    setFormData({
                                        ...initialFormData,
                                        date: new Date().toISOString().split('T')[0],
                                    });
                                    setEditingAppointment(null);
                                    setSessions([]);
                                    setSessionError(null);
                                    setEditingSessionId(null);
                                    setModalTab('details');
                                    setShowNewModal(true);
                                },
                            }}
                        />
                    ) : (
                        <div>
                            {appointments.map((apt) => (
                                <AppointmentListItem
                                    key={apt.id}
                                    appointment={apt}
                                    onEdit={() => handleEventClick(apt)}
                                    onJoin={() => window.open(apt.meetLink, '_blank')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <CalendarGrid
                    currentDate={currentDate}
                    appointments={appointments}
                    onDateClick={handleDateClick}
                    onEventClick={handleEventClick}
                />
            )}

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span>مباشر</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-teal-500" />
                    <span>مجدول</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-500" />
                    <span>منتهي</span>
                </div>
            </div>

            {/* Appointment Modal */}
            <Modal
                isOpen={showNewModal}
                onClose={closeModal}
                title={editingAppointment ? 'تعديل الموعد' : 'إضافة موعد جديد'}
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="admin-btn admin-btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            form="appointment-form"
                            className="admin-btn admin-btn-primary"
                        >
                            {editingAppointment ? 'حفظ التغييرات' : 'إضافة الموعد'}
                        </button>
                    </>
                }
            >
                <form id="appointment-form" onSubmit={handleSubmit}>
                    <div className="flex gap-2 border-b border-gray-200 pb-2 mb-4">
                        <button
                            type="button"
                            onClick={() => setModalTab('details')}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${modalTab === 'details'
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            تفاصيل الموعد
                        </button>
                        <button
                            type="button"
                            onClick={() => setModalTab('sessions')}
                            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-2 ${modalTab === 'sessions'
                                ? 'bg-teal-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <Layers className="w-4 h-4" />
                            جلسات متزامنة
                        </button>
                    </div>

                    {modalTab === 'details' && (
                        <>
                            <FormGroup>
                                <FormLabel required htmlFor="title">عنوان الموعد</FormLabel>
                                <FormInput
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    placeholder="مثال: درس الرياضيات"
                                    required
                                />
                            </FormGroup>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel required htmlFor="date">التاريخ</FormLabel>
                                    <FormInput
                                        id="date"
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => handleFormChange('date', e.target.value)}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel htmlFor="type">نوع الموعد</FormLabel>
                                    <FormSelect
                                        id="type"
                                        value={formData.type}
                                        onChange={(e) => handleFormChange('type', e.target.value)}
                                    >
                                        <option value="lesson">درس</option>
                                        <option value="meeting">اجتماع</option>
                                        <option value="exam">اختبار</option>
                                    </FormSelect>
                                </FormGroup>
                            </div>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel required htmlFor="startTime">وقت البداية</FormLabel>
                                    <FormInput
                                        id="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={(e) => handleFormChange('startTime', e.target.value)}
                                        required
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel required htmlFor="endTime">وقت النهاية</FormLabel>
                                    <FormInput
                                        id="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={(e) => handleFormChange('endTime', e.target.value)}
                                        required
                                    />
                                </FormGroup>
                            </div>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel required htmlFor="groupName">المجموعة</FormLabel>
                                    <FormSelect
                                        id="groupName"
                                        value={formData.groupName}
                                        onChange={(e) => handleFormChange('groupName', e.target.value)}
                                        required
                                    >
                                        <option value="">اختر المجموعة</option>
                                        {groups.map((group) => (
                                            <option key={group.id} value={group.name}>{group.name}</option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel required htmlFor="className">الفصل</FormLabel>
                                    <FormSelect
                                        id="className"
                                        value={formData.className}
                                        onChange={(e) => handleFormChange('className', e.target.value)}
                                        required
                                    >
                                        <option value="">اختر الفصل</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.name}>{cls.name}</option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                            </div>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel required htmlFor="teacherName">المعلم</FormLabel>
                                    <FormSelect
                                        id="teacherName"
                                        value={formData.teacherName}
                                        onChange={(e) => handleFormChange('teacherName', e.target.value)}
                                        required
                                    >
                                        <option value="">اختر المعلم</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.name}>{t.name}</option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel required htmlFor="subject">المادة / الموضوع</FormLabel>
                                    <FormSelect
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => handleFormChange('subject', e.target.value)}
                                        required
                                    >
                                        <option value="">اختر المادة</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.name}>{s.name}</option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                            </div>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel htmlFor="platform">منصة الجلسة</FormLabel>
                                    <FormSelect
                                        id="platform"
                                        value={formData.platform}
                                        onChange={(e) => handleFormChange('platform', e.target.value)}
                                    >
                                        <option value="zoom">Zoom</option>
                                        <option value="meet">Google Meet</option>
                                        <option value="teams">Microsoft Teams</option>
                                        <option value="other">أخرى</option>
                                    </FormSelect>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel htmlFor="capacity">السعة القصوى</FormLabel>
                                    <FormInput
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity}
                                        onChange={(e) => handleFormChange('capacity', e.target.value)}
                                        placeholder="مثال: 20"
                                        min={1}
                                    />
                                </FormGroup>
                            </div>

                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel htmlFor="accessCode">رمز الدخول (اختياري)</FormLabel>
                                    <FormInput
                                        id="accessCode"
                                        value={formData.accessCode}
                                        onChange={(e) => handleFormChange('accessCode', e.target.value)}
                                        placeholder="مثال: EDU2026"
                                    />
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel htmlFor="meetLink">رابط الاجتماع (اختياري)</FormLabel>
                                    <FormInput
                                        id="meetLink"
                                        type="url"
                                        value={formData.meetLink}
                                        onChange={(e) => handleFormChange('meetLink', e.target.value)}
                                        placeholder="https://meet.google.com/..."
                                    />
                                </FormGroup>
                            </div>

                            <FormGroup className="mb-0">
                                <FormLabel htmlFor="notes">ملاحظات (اختياري)</FormLabel>
                                <FormTextarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => handleFormChange('notes', e.target.value)}
                                    placeholder="أي ملاحظات إضافية..."
                                    rows={3}
                                />
                            </FormGroup>
                        </>
                    )}

                    {modalTab === 'sessions' && (
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                                <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                    <Layers className="w-4 h-4 text-teal-500" />
                                    جلسات متزامنة في نفس اليوم
                                </h4>
                                <p className="text-sm text-gray-500 mt-1">
                                    يمكنك إضافة أكثر من جلسة في نفس اليوم لفصول أو مجموعات مختلفة. مثال: درس رياضيات 1 للمجموعة أ ورياضيات 2 للمجموعة ب في نفس اليوم.
                                </p>
                            </div>

                            {sessionError && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                    {sessionError}
                                </div>
                            )}

                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {sessions.length === 0 && (
                                    <p className="text-sm text-gray-500">لا توجد جلسات متزامنة حالياً.</p>
                                )}
                                {sessions.map((session) => (
                                    <div key={session.id} className="flex items-start justify-between gap-3 p-3 bg-white rounded-lg border border-gray-100">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="text-gray-600">{session.date}</span>
                                                <span className="text-teal-600 font-medium">
                                                    {session.startTime} - {session.endTime}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-500">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{session.groupName}</span>
                                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{session.className}</span>
                                                {session.teacherName && (
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">{session.teacherName}</span>
                                                )}
                                                {session.subject && (
                                                    <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded">{session.subject}</span>
                                                )}
                                            </div>
                                            {session.notes && (
                                                <p className="text-xs text-gray-400 mt-2">{session.notes}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingSessionId(session.id);
                                                    setNewSession({
                                                        date: session.date,
                                                        startTime: session.startTime,
                                                        endTime: session.endTime,
                                                        groupName: session.groupName,
                                                        className: session.className,
                                                        teacherName: session.teacherName,
                                                        subject: session.subject,
                                                        meetLink: session.meetLink,
                                                        notes: session.notes,
                                                    });
                                                }}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSessions((prev) => prev.filter((item) => item.id !== session.id))}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 border border-dashed border-gray-300 rounded-xl">
                                <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <PlusCircle className="w-4 h-4 text-teal-500" />
                                    إضافة جلسة جديدة
                                </h5>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <FormGroup className="mb-0">
                                        <FormLabel>التاريخ</FormLabel>
                                        <FormInput
                                            type="date"
                                            value={newSession.date}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, date: e.target.value }))}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>وقت البداية</FormLabel>
                                        <FormInput
                                            type="time"
                                            value={newSession.startTime}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, startTime: e.target.value }))}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>وقت النهاية</FormLabel>
                                        <FormInput
                                            type="time"
                                            value={newSession.endTime}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, endTime: e.target.value }))}
                                        />
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>المجموعة</FormLabel>
                                        <FormSelect
                                            value={newSession.groupName}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, groupName: e.target.value }))}
                                        >
                                            <option value="">اختر المجموعة</option>
                                            {groups.map((group) => (
                                                <option key={group.id} value={group.name}>{group.name}</option>
                                            ))}
                                        </FormSelect>
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>الفصل</FormLabel>
                                        <FormSelect
                                            value={newSession.className}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, className: e.target.value }))}
                                        >
                                            <option value="">اختر الفصل</option>
                                            {classes.map((cls) => (
                                                <option key={cls.id} value={cls.name}>{cls.name}</option>
                                            ))}
                                        </FormSelect>
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>المعلم</FormLabel>
                                        <FormSelect
                                            value={newSession.teacherName}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, teacherName: e.target.value }))}
                                        >
                                            <option value="">اختر المعلم</option>
                                            {teachers.map((teacher) => (
                                                <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                                            ))}
                                        </FormSelect>
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>المادة</FormLabel>
                                        <FormSelect
                                            value={newSession.subject}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, subject: e.target.value }))}
                                        >
                                            <option value="">اختر المادة</option>
                                            {subjects.map((subject) => (
                                                <option key={subject.id} value={subject.name}>{subject.name}</option>
                                            ))}
                                        </FormSelect>
                                    </FormGroup>
                                    <FormGroup className="mb-0">
                                        <FormLabel>رابط الجلسة</FormLabel>
                                        <FormInput
                                            value={newSession.meetLink}
                                            onChange={(e) => setNewSession((prev) => ({ ...prev, meetLink: e.target.value }))}
                                            placeholder="https://meet.google.com/..."
                                        />
                                    </FormGroup>
                                </div>
                                <FormGroup className="mt-3 mb-0">
                                    <FormLabel>ملاحظات</FormLabel>
                                    <FormInput
                                        value={newSession.notes}
                                        onChange={(e) => setNewSession((prev) => ({ ...prev, notes: e.target.value }))}
                                        placeholder="أي تفاصيل إضافية..."
                                    />
                                </FormGroup>
                                <button
                                    type="button"
                                    onClick={handleAddSession}
                                    className="admin-btn admin-btn-primary w-full mt-4"
                                >
                                    <PlusCircle className="w-4 h-4" />
                                    {editingSessionId ? 'حفظ التعديل' : 'إضافة الجلسة'}
                                </button>
                                {editingSessionId && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingSessionId(null);
                                            setNewSession({
                                                date: '',
                                                startTime: '',
                                                endTime: '',
                                                groupName: '',
                                                className: '',
                                                teacherName: '',
                                                subject: '',
                                                meetLink: '',
                                                notes: '',
                                            });
                                        }}
                                        className="admin-btn admin-btn-secondary w-full mt-2"
                                    >
                                        إلغاء التعديل
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </Modal>
        </div>
    );
}
