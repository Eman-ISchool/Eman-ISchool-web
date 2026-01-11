'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    BookOpen,
    Calendar,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    Shield,
    Activity,
    FileText,
    Settings,
    BarChart3,
} from 'lucide-react';

interface AdminStats {
    users: {
        total: number;
        students: number;
        teachers: number;
        admins: number;
        growth: number;
    };
    courses: {
        total: number;
        published: number;
    };
    lessons: {
        total: number;
        upcoming: number;
        completed: number;
        today: any[];
        thisWeek: number;
    };
    enrollments: {
        active: number;
    };
    attendance: {
        total: number;
        present: number;
        absent: number;
        late: number;
        rate: number;
    };
    recentActivity: any[];
    teacherPerformance: any[];
}

export default function AdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        // @ts-ignore
        if (!session?.user?.role || session.user.role !== 'admin') {
            router.push('/dashboard');
            return;
        }

        fetchStats();
    }, [session, status, router]);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/stats');
            if (!res.ok) {
                throw new Error('Failed to fetch stats');
            }
            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 bg-gray-200 rounded"></div>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8">
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle className="h-5 w-5" />
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-6">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Shield className="h-8 w-8 text-brand-primary" />
                        لوحة تحكم المدير
                    </h1>
                    <p className="text-gray-500">مرحباً، {session?.user?.name}</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/users">
                        <Button variant="outline" className="gap-2">
                            <Users className="h-4 w-4" />
                            إدارة المستخدمين
                        </Button>
                    </Link>
                    <Link href="/admin/attendance">
                        <Button variant="outline" className="gap-2">
                            <FileText className="h-4 w-4" />
                            سجلات الحضور
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">إجمالي المستخدمين</p>
                                <p className="text-3xl font-bold">{stats?.users.total || 0}</p>
                                {stats?.users.growth !== 0 && (
                                    <p className="text-blue-100 text-xs flex items-center gap-1">
                                        <TrendingUp className="h-3 w-3" />
                                        {stats?.users.growth}% هذا الشهر
                                    </p>
                                )}
                            </div>
                            <Users className="h-12 w-12 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">الدورات المنشورة</p>
                                <p className="text-3xl font-bold">{stats?.courses.published || 0}</p>
                                <p className="text-green-100 text-xs">
                                    من {stats?.courses.total || 0} دورة
                                </p>
                            </div>
                            <BookOpen className="h-12 w-12 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">الدروس القادمة</p>
                                <p className="text-3xl font-bold">{stats?.lessons.upcoming || 0}</p>
                                <p className="text-purple-100 text-xs">
                                    {stats?.lessons.thisWeek || 0} هذا الأسبوع
                                </p>
                            </div>
                            <Calendar className="h-12 w-12 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-sm">نسبة الحضور</p>
                                <p className="text-3xl font-bold">{stats?.attendance.rate || 0}%</p>
                                <p className="text-orange-100 text-xs">
                                    {stats?.attendance.present || 0} حاضر
                                </p>
                            </div>
                            <BarChart3 className="h-12 w-12 text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* User Breakdown */}
            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.users.students || 0}</p>
                            <p className="text-gray-500">طالب</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                            <BookOpen className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.users.teachers || 0}</p>
                            <p className="text-gray-500">معلم</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full">
                            <Shield className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats?.users.admins || 0}</p>
                            <p className="text-gray-500">مدير</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Today's Lessons */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-brand-primary" />
                            دروس اليوم
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.lessons.today && stats.lessons.today.length > 0 ? (
                            <div className="space-y-3">
                                {stats.lessons.today.slice(0, 5).map((lesson: any) => (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <p className="font-medium">{lesson.title}</p>
                                            <p className="text-sm text-gray-500">
                                                {lesson.teacher?.name || 'معلم غير محدد'}
                                            </p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-medium">
                                                {new Date(lesson.start_date_time).toLocaleTimeString('ar-EG', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${lesson.status === 'live'
                                                    ? 'bg-green-100 text-green-700'
                                                    : lesson.status === 'completed'
                                                        ? 'bg-gray-100 text-gray-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {lesson.status === 'live' ? 'مباشر' : lesson.status === 'completed' ? 'منتهي' : 'مجدول'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500 py-8">لا توجد دروس اليوم</p>
                        )}
                    </CardContent>
                </Card>

                {/* Attendance Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-brand-primary" />
                            ملخص الحضور
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                    <span>حاضر</span>
                                </div>
                                <span className="font-bold">{stats?.attendance.present || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                    <span>غائب</span>
                                </div>
                                <span className="font-bold">{stats?.attendance.absent || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-500" />
                                    <span>متأخر</span>
                                </div>
                                <span className="font-bold">{stats?.attendance.late || 0}</span>
                            </div>
                            <div className="pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium">نسبة الحضور الإجمالية</span>
                                    <span className="text-2xl font-bold text-brand-primary">
                                        {stats?.attendance.rate || 0}%
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${stats?.attendance.rate || 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-brand-primary" />
                        النشاط الأخير
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                            {stats.recentActivity.slice(0, 5).map((log: any) => (
                                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${log.action === 'create' ? 'bg-green-100' :
                                                log.action === 'update' ? 'bg-blue-100' :
                                                    'bg-red-100'
                                            }`}>
                                            {log.action === 'create' ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : log.action === 'update' ? (
                                                <Settings className="h-4 w-4 text-blue-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {log.action === 'create' ? 'إنشاء' : log.action === 'update' ? 'تحديث' : 'حذف'} في {log.table_name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                بواسطة {log.user?.name || 'مستخدم غير معروف'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {new Date(log.created_at).toLocaleString('ar-EG')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">لا يوجد نشاط حديث</p>
                    )}
                </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/admin/users">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <p className="font-medium">إدارة المستخدمين</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/attendance">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <FileText className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <p className="font-medium">سجلات الحضور</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/meetings">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <p className="font-medium">سجل الاجتماعات</p>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <p className="font-medium">لوحة التحكم</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
