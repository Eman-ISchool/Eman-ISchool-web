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
    AlertCircle,
    RefreshCw,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';
import { createSession, fetchSessions, Session, CreateSessionInput } from '@/lib/session-api';

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

// T039: Get styling for cancelled sessions (FR-012a)
const getAppointmentStyle = (status: string) => ({
    cancelled: 'line-through opacity-50 text-gray-400',
    completed: 'opacity-70',
    live: 'bg-red-100 border-red-500',
    scheduled: 'bg-teal-100 border-teal-500'
}[status] || 'bg-teal-100 border-teal-500');

interface SessionCreationError {
    message: string;
    requiresGoogleAuth?: boolean;
    code?: string;
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

    // Days of month
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
                            className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${getAppointmentStyle(apt.status)}`}
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
        <div className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${getAppointmentStyle(appointment.status)}`}>
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
                    <h4 className={`font-medium text-gray-800 ${appointment.status === 'cancelled' ? 'line-through' : ''}`}>{appointment.title}</h4>
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
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<SessionCreationError | null>(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [conflictWarning, setConflictWarning] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
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

    // T019: Fetch real sessions from API
    useEffect(() => {
        const loadSessions = async () => {
            setLoading(true);
            try {
                const result = await fetchSessions();
                if (result.success && result.data) {
                    // Transform API data to Appointment format
                    const transformedAppointments: Appointment[] = result.data.map(session => ({
                        id: session._id,
                        title: session.title,
                        teacherName: session.teacher?.name || 'غير محدد',
                        groupName: undefined, // Not in API response
                        className: 'غير محدد', // Not in API response
                        subject: session.course?.title || 'غير محدد',
                        startTime: new Date(session.startDateTime),
                        endTime: new Date(session.endDateTime),
                        status: session.status,
                        meetLink: session.meetLink || undefined,
                        notes: session.notes || undefined,
                        type: 'lesson',
                        platform: 'meet',
                    }));
                    setAppointments(transformedAppointments);
                }
            } catch (error) {
                console.error('Error loading sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
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

    // T034: Validate end time is after start time
    const validateForm = (): { isValid: boolean; error?: string } => {
        if (!formData.date || !formData.startTime || !formData.endTime) {
            return { isValid: false, error: 'يرجى تعبئة جميع الحقول المطلوبة' };
        }

        const [year, month, day] = formData.date.split('-').map(Number);
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);

        const startDateTime = new Date(year, month - 1, day, startHour, startMin);
        const endDateTime = new Date(year, month - 1, day, endHour, endMin);

        if (endDateTime <= startDateTime) {
            return { isValid: false, error: 'يجب أن يكون وقت النهاية بعد وقت البداية' };
        }

        return { isValid: true };
    };

    // T009-T017: Update handleSubmit to call API with loading, error handling, and refetch
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError(null);
        setValidationError(null);
        setConflictWarning(null);

        // T034: Validate form before submission
        const validation = validateForm();
        if (!validation.isValid) {
            setValidationError(validation.error || 'فشل التحقق من صحة النموذج');
            setSubmitting(false);
            return;
        }

        // T035: Check for past date and show warning
        const [year, month, day] = formData.date.split('-').map(Number);
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const startDateTime = new Date(year, month - 1, day, startHour, startMin);
        const isPast = startDateTime < new Date();

        if (isPast) {
            // Show warning toast for past date (FR-018)
            console.warn('Creating session with past date');
            // Note: FR-019 (skipMeetGeneration) will be handled by API
        }

        try {
            const [year, month, day] = formData.date.split('-').map(Number);
            const [startHour, startMin] = formData.startTime.split(':').map(Number);
            const [endHour, endMin] = formData.endTime.split(':').map(Number);

            const startDateTime = new Date(year, month - 1, day, startHour, startMin).toISOString();
            const endDateTime = new Date(year, month - 1, day, endHour, endMin).toISOString();

            // Create main session via API
            const createInput: CreateSessionInput = {
                title: formData.title,
                description: formData.notes,
                startDateTime,
                endDateTime,
                status: 'scheduled',
                notes: formData.notes,
            };

            const mainResult = await createSession(createInput);

            if (!mainResult.success) {
                // T011: Handle error for Meet link generation failure (FR-013)
                // T015: Handle Google auth required response - show connect prompt (FR-005b)
                if (mainResult.requiresGoogleAuth) {
                    setSubmitError({
                        message: mainResult.error || 'يجب ربط حساب Google لإنشاء رابط Meet. يرجى تسجيل الدخول باستخدام Google.',
                        requiresGoogleAuth: true,
                        code: mainResult.code,
                    });
                } else {
                    setSubmitError({
                        message: mainResult.error || 'فشل إنشاء الجلسة. يرجى المحاولة مرة أخرى.',
                    });
                }
                setSubmitting(false);
                return;
            }

            // T028: Implement sequential session creation loop for concurrent sessions (FR-008 - unique links)
            let concurrentResults: Array<{ success: boolean; session?: any; error?: string }> = [];
            if (sessions.length > 0) {
                for (const session of sessions) {
                    const [sYear, sMonth, sDay] = session.date.split('-').map(Number);
                    const [sStartHour, sStartMin] = session.startTime.split(':').map(Number);
                    const [sEndHour, sEndMin] = session.endTime.split(':').map(Number);

                    const sStartDateTime = new Date(sYear, sMonth - 1, sDay, sStartHour, sStartMin).toISOString();
                    const sEndDateTime = new Date(sYear, sMonth - 1, sDay, sEndHour, sEndMin).toISOString();

                    const concurrentInput: CreateSessionInput = {
                        title: `${formData.title} - ${session.groupName} (${session.className})`,
                        description: session.notes,
                        startDateTime: sStartDateTime,
                        endDateTime: sEndDateTime,
                        status: 'scheduled',
                        notes: session.notes,
                    };

                    const result = await createSession(concurrentInput);
                    concurrentResults.push({
                        success: result.success,
                        session: result.data,
                        error: result.error,
                    });
                }
            }

            // T030: Handle partial success scenario (some sessions created, some failed)
            const failedSessions = concurrentResults.filter(r => !r.success);
            if (failedSessions.length > 0) {
                const successCount = concurrentResults.length - failedSessions.length;
                setSubmitError({
                    message: `تم إنشاء ${successCount} من ${concurrentResults.length + 1} جلسة. فشل ${failedSessions.length} جلسة.`,
                });
            }

            // T017: Refetch lessons from API after successful session creation
            const loadResult = await fetchSessions();
            if (loadResult.success && loadResult.data) {
                const transformedAppointments: Appointment[] = loadResult.data.map(session => ({
                    id: session._id,
                    title: session.title,
                    teacherName: session.teacher?.name || 'غير محدد',
                    groupName: undefined,
                    className: 'غير محدد',
                    subject: session.course?.title || 'غير محدد',
                    startTime: new Date(session.startDateTime),
                    endTime: new Date(session.endDateTime),
                    status: session.status,
                    meetLink: session.meetLink || undefined,
                    notes: session.notes || undefined,
                    type: 'lesson',
                    platform: 'meet',
                }));
                setAppointments(transformedAppointments);
            }

            // Close modal and reset form
            setShowNewModal(false);
            setFormData(initialFormData);
            setEditingAppointment(null);
            setModalTab('details');
            setSessions([]);
            setSubmitError(null);
        } catch (error) {
            console.error('Error creating session:', error);
            setSubmitError({
                message: 'حدث خطأ أثناء إنشاء الجلسة. يرجى المحاولة مرة أخرى.',
            });
        } finally {
            setSubmitting(false);
        }
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
            <h1 className="text-2xl font-bold">Fixed Calendar Stub</h1>
            <p className="text-gray-500">This page is temporarily disabled for maintenance.</p>
        </div>
    );
}
