'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

interface AttendanceRecord {
    id: string;
    student_id: string;
    student_name: string;
    student_email?: string;
    student_image?: string;
    join_time: string;
    leave_time?: string;
    duration_seconds?: number;
    attendance_status: 'present' | 'absent' | 'late' | 'early_exit';
    last_heartbeat?: string;
}

interface AttendanceRosterProps {
    lessonId: string;
    initialAttendance?: AttendanceRecord[];
}

export function AttendanceRoster({ lessonId, initialAttendance = [] }: AttendanceRosterProps) {
    const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance);
    const [isLoading, setIsLoading] = useState(false);

    const statusColors: Record<string, string> = {
        present: 'bg-green-100 text-green-700',
        absent: 'bg-red-100 text-red-700',
        late: 'bg-yellow-100 text-yellow-700',
        early_exit: 'bg-orange-100 text-orange-700'
    };

    const statusIcons: Record<string, any> = {
        present: CheckCircle,
        absent: XCircle,
        late: Clock,
        early_exit: Clock
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return '-';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const fetchAttendance = async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/lessons/${lessonId}/attendance`);
            if (res.ok) {
                const data = await res.json();
                setAttendance(data.attendance || []);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (initialAttendance.length === 0) {
            fetchAttendance();
        }
    }, [lessonId]);

    const stats = {
        total: attendance.length,
        present: attendance.filter(a => a.attendance_status === 'present').length,
        absent: attendance.filter(a => a.attendance_status === 'absent').length,
        late: attendance.filter(a => a.attendance_status === 'late').length,
        earlyExit: attendance.filter(a => a.attendance_status === 'early_exit').length
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Attendance Roster</CardTitle>
                    <div className="flex gap-2 text-sm">
                        <Badge variant="outline">Total: {stats.total}</Badge>
                        <Badge className="bg-green-100 text-green-700">Present: {stats.present}</Badge>
                        <Badge className="bg-red-100 text-red-700">Absent: {stats.absent}</Badge>
                        <Badge className="bg-yellow-100 text-yellow-700">Late: {stats.late}</Badge>
                        <Badge className="bg-orange-100 text-orange-700">Early Exit: {stats.earlyExit}</Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading attendance...</div>
                ) : attendance.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No attendance records yet</div>
                ) : (
                    <div className="space-y-2">
                        {attendance.map((record) => {
                            const StatusIcon = statusIcons[record.attendance_status];
                            return (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {record.student_image ? (
                                            <img
                                                src={record.student_image}
                                                alt={record.student_name}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-500" />
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium">{record.student_name}</div>
                                            {record.student_email && (
                                                <div className="text-sm text-gray-500">{record.student_email}</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge className={statusColors[record.attendance_status]}>
                                            <StatusIcon className="h-3 w-3 mr-1" />
                                            {record.attendance_status}
                                        </Badge>
                                        <div className="text-sm text-gray-600">
                                            <div>Join: {formatTime(record.join_time)}</div>
                                            {record.leave_time && (
                                                <div>Leave: {formatTime(record.leave_time)}</div>
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600 min-w-[80px]">
                                            {formatDuration(record.duration_seconds)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
