'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    FileText,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    XCircle,
    Clock,
    LogOut,
    ArrowLeft,
    Calendar,
    Users,
    Download,
} from 'lucide-react';

interface AttendanceRecord {
    id: string;
    status: 'present' | 'absent' | 'late' | 'early_exit';
    joined_at: string | null;
    left_at: string | null;
    duration_minutes: number;
    is_teacher: boolean;
    notes: string | null;
    lesson: {
        id: string;
        title: string;
        start_date_time: string;
        end_date_time: string;
        status: string;
    };
    user: {
        id: string;
        name: string;
        email: string;
        image: string | null;
        role: string;
    };
}

export default function AdminAttendancePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const limit = 50;

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || session.user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchAttendance();
    }, [session, status, router, page, statusFilter, startDate, endDate]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                limit: limit.toString(),
                offset: (page * limit).toString(),
            });

            if (statusFilter) params.append('status', statusFilter);
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);

            const res = await fetch(`/api/attendance?${params}`);
            const data = await res.json();

            setAttendance(data.attendance || []);
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await fetch('/api/attendance', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (res.ok) {
                fetchAttendance();
            }
        } catch (error) {
            console.error('Error updating attendance:', error);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'present':
                return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'حاضر' };
            case 'absent':
                return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'غائب' };
            case 'late':
                return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'متأخر' };
            case 'early_exit':
                return { icon: LogOut, color: 'text-orange-500', bg: 'bg-orange-100', label: 'خروج مبكر' };
            default:
                return { icon: XCircle, color: 'text-gray-500', bg: 'bg-gray-100', label: status };
        }
    };

    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const stats = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        earlyExit: attendance.filter(a => a.status === 'early_exit').length,
    };

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            سجلات الحضور
                        </h1>
                        <p className="text-gray-500">{total} سجل حضور</p>
                    </div>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    تصدير التقرير
                </Button>
            </header>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-green-100 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.present}</p>
                            <p className="text-sm text-gray-500">حاضر</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-red-100 rounded-full">
                            <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.absent}</p>
                            <p className="text-sm text-gray-500">غائب</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-yellow-100 rounded-full">
                            <Clock className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.late}</p>
                            <p className="text-sm text-gray-500">متأخر</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-3 bg-orange-100 rounded-full">
                            <LogOut className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.earlyExit}</p>
                            <p className="text-sm text-gray-500">خروج مبكر</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(0);
                            }}
                            className="px-4 py-2 border rounded-lg bg-white"
                        >
                            <option value="">كل الحالات</option>
                            <option value="present">حاضر</option>
                            <option value="absent">غائب</option>
                            <option value="late">متأخر</option>
                            <option value="early_exit">خروج مبكر</option>
                        </select>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    setPage(0);
                                }}
                                className="w-auto"
                            />
                            <span className="text-gray-400">إلى</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    setPage(0);
                                }}
                                className="w-auto"
                            />
                        </div>
                        {(statusFilter || startDate || endDate) && (
                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setStatusFilter('');
                                    setStartDate('');
                                    setEndDate('');
                                    setPage(0);
                                }}
                            >
                                مسح الفلاتر
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Attendance Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                            ))}
                        </div>
                    ) : attendance.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            لا توجد سجلات حضور
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 text-right font-medium">المستخدم</th>
                                        <th className="p-4 text-right font-medium">الدرس</th>
                                        <th className="p-4 text-right font-medium">الحالة</th>
                                        <th className="p-4 text-right font-medium">وقت الدخول</th>
                                        <th className="p-4 text-right font-medium">وقت الخروج</th>
                                        <th className="p-4 text-right font-medium">المدة</th>
                                        <th className="p-4 text-right font-medium">الإجراءات</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record) => {
                                        const statusInfo = getStatusInfo(record.status);
                                        const StatusIcon = statusInfo.icon;

                                        return (
                                            <tr key={record.id} className="border-b hover:bg-gray-50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        {record.user?.image ? (
                                                            <img
                                                                src={record.user.image}
                                                                alt={record.user.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                <Users className="h-4 w-4 text-gray-500" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{record.user?.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {record.is_teacher ? 'معلم' : 'طالب'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div>
                                                        <p className="font-medium">{record.lesson?.title}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {record.lesson?.start_date_time
                                                                ? new Date(record.lesson.start_date_time).toLocaleDateString('ar-EG')
                                                                : '-'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={record.status}
                                                        onChange={(e) => handleUpdateStatus(record.id, e.target.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm ${statusInfo.bg} ${statusInfo.color} border-0`}
                                                    >
                                                        <option value="present">حاضر</option>
                                                        <option value="absent">غائب</option>
                                                        <option value="late">متأخر</option>
                                                        <option value="early_exit">خروج مبكر</option>
                                                    </select>
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {record.joined_at
                                                        ? new Date(record.joined_at).toLocaleTimeString('ar-EG', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {record.left_at
                                                        ? new Date(record.left_at).toLocaleTimeString('ar-EG', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '-'}
                                                </td>
                                                <td className="p-4 text-sm">
                                                    {record.duration_minutes > 0
                                                        ? `${record.duration_minutes} دقيقة`
                                                        : '-'}
                                                </td>
                                                <td className="p-4">
                                                    <Button size="sm" variant="ghost">
                                                        تفاصيل
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t">
                            <p className="text-sm text-gray-500">
                                عرض {page * limit + 1} - {Math.min((page + 1) * limit, total)} من {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                                <span className="text-sm">
                                    صفحة {page + 1} من {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
