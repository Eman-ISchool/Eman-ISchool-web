import { Users, BookOpen, TrendingUp, Award, Download } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

async function getStats() {
    if (!supabaseAdmin) return null;
    const [
        { count: teacherCount },
        { count: totalLessons },
        { count: completedLessons },
    ] = await Promise.all([
        supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('role', 'teacher'),
        supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    ]);
    return {
        users: { teachers: teacherCount || 0 },
        lessons: { total: totalLessons || 0, completed: completedLessons || 0 },
    };
}

export default async function TeacherReportsPage() {
    const locale = await getLocale();
    const isAr = locale === 'ar';
    const stats = await getStats();

    const kpis = [
        {
            label: isAr ? 'المعلمون النشطون' : 'Active Teachers',
            value: stats?.users?.teachers || 0,
            icon: Users,
            bg: 'bg-orange-500',
        },
        {
            label: isAr ? 'إجمالي الدروس' : 'Total Lessons',
            value: stats?.lessons?.total || 0,
            icon: BookOpen,
            bg: 'bg-blue-500',
        },
        {
            label: isAr ? 'الدروس المنجزة' : 'Completed Lessons',
            value: stats?.lessons?.completed || 0,
            icon: Award,
            bg: 'bg-green-500',
        },
        {
            label: isAr ? 'متوسط الإنجاز' : 'Avg Completion',
            value: stats?.lessons?.total
                ? `${Math.round(((stats.lessons.completed || 0) / stats.lessons.total) * 100)}%`
                : '—',
            icon: TrendingUp,
            bg: 'bg-teal-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-orange-600" />
                        {isAr ? 'تقارير المعلمين' : 'Teacher Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'معدلات تسليم الدروس، تقييمات الطلاب، سجلات النشاط' : 'Lesson delivery rates, student feedback, activity logs'}
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
                    {isAr ? 'أداء المعلمين' : 'Teacher Performance'}
                </h3>
                <div className="text-center py-12 text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isAr ? 'سيتم عرض بيانات أداء المعلمين هنا' : 'Teacher performance data will appear here'}</p>
                </div>
            </div>
        </div>
    );
}
