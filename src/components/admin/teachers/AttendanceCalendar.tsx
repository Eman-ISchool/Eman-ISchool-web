'use client';

import { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Users,
    Calendar,
} from 'lucide-react';

interface AttendanceSession {
    time: string;
    className: string;
    status: 'present' | 'absent' | 'late';
}

interface DayAttendance {
    date: string;
    status: 'present' | 'absent' | 'partial' | 'weekend';
    sessions: AttendanceSession[];
}

interface TeacherAttendance {
    teacherId: string;
    teacherName: string;
    month: string;
    attendance: DayAttendance[];
    summary: {
        totalDays: number;
        presentDays: number;
        absentDays: number;
        totalClasses: number;
        attendanceRate: number;
    };
}

interface AttendanceCalendarProps {
    teacherAttendances?: TeacherAttendance[];
    selectedTeacherId?: string;
    onTeacherSelect?: (teacherId: string) => void;
    showSummaryOnly?: boolean;
}

// Generate mock attendance data for demonstration
const generateMockAttendance = (): TeacherAttendance[] => {
    const teachers = [
        { id: '1', name: 'أ. أحمد محمد' },
        { id: '2', name: 'أ. سارة أحمد' },
        { id: '3', name: 'أ. محمد علي' },
    ];

    return teachers.map((teacher) => {
        const attendance: DayAttendance[] = [];
        const today = new Date();
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(today.getFullYear(), today.getMonth(), day);
            const dayOfWeek = date.getDay();
            const dateStr = date.toISOString().split('T')[0];

            // Weekend (Friday & Saturday)
            if (dayOfWeek === 5 || dayOfWeek === 6) {
                attendance.push({ date: dateStr, status: 'weekend', sessions: [] });
                continue;
            }

            // Future dates
            if (date > today) {
                continue;
            }

            // Random attendance status
            const rand = Math.random();
            const isPresent = rand > 0.1;
            const sessions: AttendanceSession[] = isPresent
                ? [
                    { time: '08:00', className: 'الصف السادس', status: 'present' },
                    { time: '10:00', className: 'الصف السابع', status: rand > 0.2 ? 'present' : 'late' },
                    ...(rand > 0.5 ? [{ time: '12:00', className: 'الصف الثامن', status: 'present' as const }] : []),
                ]
                : [];

            attendance.push({
                date: dateStr,
                status: isPresent ? (sessions.some((s) => s.status === 'late') ? 'partial' : 'present') : 'absent',
                sessions,
            });
        }

        const presentDays = attendance.filter((a) => a.status === 'present' || a.status === 'partial').length;
        const absentDays = attendance.filter((a) => a.status === 'absent').length;
        const totalClasses = attendance.reduce((sum, a) => sum + a.sessions.length, 0);

        return {
            teacherId: teacher.id,
            teacherName: teacher.name,
            month: today.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' }),
            attendance,
            summary: {
                totalDays: presentDays + absentDays,
                presentDays,
                absentDays,
                totalClasses,
                attendanceRate: Math.round((presentDays / (presentDays + absentDays)) * 100) || 0,
            },
        };
    });
};

export default function AttendanceCalendar({
    teacherAttendances = generateMockAttendance(),
    selectedTeacherId,
    onTeacherSelect,
    showSummaryOnly = false,
}: AttendanceCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTeacher, setSelectedTeacher] = useState(selectedTeacherId || teacherAttendances[0]?.teacherId);
    const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);

    const currentTeacherData = teacherAttendances.find((t) => t.teacherId === selectedTeacher);
    const monthName = currentMonth.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const handleTeacherChange = (teacherId: string) => {
        setSelectedTeacher(teacherId);
        onTeacherSelect?.(teacherId);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present':
                return 'bg-green-100 text-green-700 hover:bg-green-200';
            case 'absent':
                return 'bg-red-100 text-red-700 hover:bg-red-200';
            case 'partial':
                return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
            case 'weekend':
                return 'bg-gray-50 text-gray-400';
            default:
                return 'hover:bg-gray-100';
        }
    };

    const renderCalendarDays = () => {
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="h-12" />);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = currentTeacherData?.attendance.find((a) => a.date === dateStr);
            const status = dayData?.status || '';

            days.push(
                <div
                    key={day}
                    onClick={() => dayData && dayData.status !== 'weekend' && setSelectedDay(dayData)}
                    className={`h-12 flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-all ${getStatusColor(status)} ${dayData?.sessions?.length ? 'ring-2 ring-offset-1 ring-teal-300' : ''
                        }`}
                >
                    <span className="font-medium">{day}</span>
                    {dayData?.sessions?.length > 0 && (
                        <span className="text-[10px] opacity-70">{dayData.sessions.length} حصص</span>
                    )}
                </div>
            );
        }

        return days;
    };

    // Summary Cards for all teachers
    const renderSummaryCards = () => (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teacherAttendances.map((teacher) => (
                <div
                    key={teacher.teacherId}
                    onClick={() => handleTeacherChange(teacher.teacherId)}
                    className={`admin-card p-4 cursor-pointer transition-all ${selectedTeacher === teacher.teacherId ? 'ring-2 ring-teal-500' : ''
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                            <span className="text-teal-600 font-medium">{teacher.teacherName.charAt(0)}</span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{teacher.teacherName}</p>
                            <p className="text-xs text-gray-500">{teacher.month}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-green-600">{teacher.summary.presentDays}</p>
                            <p className="text-[10px] text-green-600">حضور</p>
                        </div>
                        <div className="bg-red-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-red-600">{teacher.summary.absentDays}</p>
                            <p className="text-[10px] text-red-600">غياب</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-lg font-bold text-blue-600">{teacher.summary.totalClasses}</p>
                            <p className="text-[10px] text-blue-600">حصص</p>
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-500">نسبة الحضور</span>
                            <span className="font-medium text-gray-800">{teacher.summary.attendanceRate}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${teacher.summary.attendanceRate >= 90
                                        ? 'bg-green-500'
                                        : teacher.summary.attendanceRate >= 70
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                    }`}
                                style={{ width: `${teacher.summary.attendanceRate}%` }}
                            />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    if (showSummaryOnly) {
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    ملخص الحضور الشهري
                </h3>
                {renderSummaryCards()}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    سجل الحضور والغياب
                </h3>
                <div className="flex items-center gap-2">
                    <select
                        value={selectedTeacher}
                        onChange={(e) => handleTeacherChange(e.target.value)}
                        className="admin-select min-w-[180px]"
                    >
                        {teacherAttendances.map((t) => (
                            <option key={t.teacherId} value={t.teacherId}>
                                {t.teacherName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            {currentTeacherData && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="admin-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{currentTeacherData.summary.presentDays}</p>
                                <p className="text-sm text-gray-500">أيام حضور</p>
                            </div>
                        </div>
                    </div>
                    <div className="admin-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{currentTeacherData.summary.absentDays}</p>
                                <p className="text-sm text-gray-500">أيام غياب</p>
                            </div>
                        </div>
                    </div>
                    <div className="admin-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{currentTeacherData.summary.totalClasses}</p>
                                <p className="text-sm text-gray-500">إجمالي الحصص</p>
                            </div>
                        </div>
                    </div>
                    <div className="admin-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                <AlertCircle className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-800">{currentTeacherData.summary.attendanceRate}%</p>
                                <p className="text-sm text-gray-500">نسبة الحضور</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Calendar and Day Details */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Calendar */}
                <div className="md:col-span-2 admin-card p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">{monthName}</h4>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="admin-btn admin-btn-ghost admin-btn-icon">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button onClick={handleNextMonth} className="admin-btn admin-btn-ghost admin-btn-icon">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 text-center mb-2">
                        {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((day) => (
                            <div key={day} className="text-xs text-gray-500 font-medium py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-100" />
                            <span className="text-sm text-gray-500">حاضر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-100" />
                            <span className="text-sm text-gray-500">غائب</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-100" />
                            <span className="text-sm text-gray-500">متأخر</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-50 border border-gray-200" />
                            <span className="text-sm text-gray-500">عطلة</span>
                        </div>
                    </div>
                </div>

                {/* Selected Day Details */}
                <div className="admin-card p-4">
                    <h4 className="font-medium text-gray-800 mb-4">تفاصيل اليوم</h4>
                    {selectedDay ? (
                        <div className="space-y-4">
                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-lg font-bold text-gray-800">
                                    {new Date(selectedDay.date).toLocaleDateString('ar-EG', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                    })}
                                </p>
                                <span
                                    className={`inline-block mt-2 px-3 py-1 rounded-full text-sm ${selectedDay.status === 'present'
                                            ? 'bg-green-100 text-green-700'
                                            : selectedDay.status === 'absent'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                        }`}
                                >
                                    {selectedDay.status === 'present' ? 'حاضر' : selectedDay.status === 'absent' ? 'غائب' : 'متأخر جزئياً'}
                                </span>
                            </div>

                            {selectedDay.sessions.length > 0 ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500">الحصص ({selectedDay.sessions.length})</p>
                                    {selectedDay.sessions.map((session, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{session.className}</p>
                                                <p className="text-sm text-gray-500">{session.time}</p>
                                            </div>
                                            <span
                                                className={`w-2 h-2 rounded-full ${session.status === 'present' ? 'bg-green-500' : session.status === 'late' ? 'bg-yellow-500' : 'bg-red-500'
                                                    }`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">لا توجد حصص في هذا اليوم</p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <p>اختر يوماً لعرض التفاصيل</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
