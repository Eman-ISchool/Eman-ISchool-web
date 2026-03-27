import { GraduationCap, Users, TrendingUp, UserCheck, Clock, Download } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

async function getStats() {
    if (!supabaseAdmin) return null;
    const [
        { count: studentCount },
        { count: activeEnrollments },
        { count: pendingEnrollments },
        { count: presentCount },
        { count: totalAttendance },
    ] = await Promise.all([
        supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }).eq('status', 'present'),
        supabaseAdmin.from('attendance').select('id', { count: 'exact', head: true }),
    ]);
    const rate = totalAttendance && presentCount ? Math.round((presentCount / totalAttendance) * 100) : 0;
    return {
        users: { students: studentCount || 0 },
        enrollments: { active: activeEnrollments || 0, pending: pendingEnrollments || 0 },
        attendance: { rate },
    };
}

export default async function StudentReportsPage() {
    const locale = await getLocale();
    const isAr = locale === 'ar';
    const stats = await getStats();

    const kpis = [
        {
            label: isAr ? 'إجمالي الطلاب' : 'Total Students',
            value: stats?.users?.students || 0,
            icon: Users,
            bg: 'bg-blue-500',
        },
        {
            label: isAr ? 'التسجيلات النشطة' : 'Active Enrollments',
            value: stats?.enrollments?.active || 0,
            icon: UserCheck,
            bg: 'bg-green-500',
        },
        {
            label: isAr ? 'في انتظار الموافقة' : 'Pending Approval',
            value: stats?.enrollments?.pending || 0,
            icon: Clock,
            bg: 'bg-amber-500',
        },
        {
            label: isAr ? 'نسبة الحضور' : 'Attendance Rate',
            value: `${stats?.attendance?.rate || 0}%`,
            icon: TrendingUp,
            bg: 'bg-teal-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                        {isAr ? 'تقارير الطلاب' : 'Student Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'اتجاهات التسجيل، نسب الحضور، تحليل الأداء' : 'Enrollment trends, attendance rates, performance analytics'}
                    </p>
                </div>
                <button className="admin-btn admin-btn-ghost">
                    <Download className="w-4 h-4" />
                    {isAr ? 'تصدير' : 'Export'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(kpi => {
                    const Icon = kpi.icon;
                    return (
                        <div key={kpi.label} className="admin-card p-4">
                            <div className={`w-10 h-10 rounded-xl ${kpi.bg} flex items-center justify-center mb-3`}>
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-xl font-bold text-gray-800">{kpi.value}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                        </div>
                    );
                })}
            </div>

            <div className="admin-card p-6">
                <h3 className="font-semibold text-gray-700 mb-4">
                    {isAr ? 'تفاصيل التسجيل' : 'Enrollment Details'}
                </h3>
                <div className="text-center py-12 text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isAr ? 'سيتم عرض بيانات الطلاب التفصيلية هنا' : 'Detailed student data will appear here'}</p>
                </div>
            </div>
        </div>
    );
}
