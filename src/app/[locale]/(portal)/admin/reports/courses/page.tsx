import { BookOpen, BarChart3, TrendingUp, CheckCircle, Download } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getLocale } from 'next-intl/server';

async function getStats() {
    if (!supabaseAdmin) return null;
    const [
        { count: totalCourses },
        { count: publishedCourses },
        { count: completedLessons },
        { count: upcomingLessons },
    ] = await Promise.all([
        supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('courses').select('id', { count: 'exact', head: true }).eq('is_published', true),
        supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabaseAdmin.from('lessons').select('id', { count: 'exact', head: true }).eq('status', 'scheduled').gte('start_date_time', new Date().toISOString()),
    ]);
    return {
        courses: { total: totalCourses || 0, published: publishedCourses || 0 },
        lessons: { completed: completedLessons || 0, upcoming: upcomingLessons || 0 },
    };
}

export default async function CourseReportsPage() {
    const locale = await getLocale();
    const isAr = locale === 'ar';
    const stats = await getStats();

    const kpis = [
        {
            label: isAr ? 'الكورسات النشطة' : 'Active Courses',
            value: stats?.courses?.published || 0,
            icon: BookOpen,
            bg: 'bg-purple-500',
        },
        {
            label: isAr ? 'إجمالي الكورسات' : 'Total Courses',
            value: stats?.courses?.total || 0,
            icon: BarChart3,
            bg: 'bg-blue-500',
        },
        {
            label: isAr ? 'دروس منجزة' : 'Completed Lessons',
            value: stats?.lessons?.completed || 0,
            icon: CheckCircle,
            bg: 'bg-green-500',
        },
        {
            label: isAr ? 'دروس قادمة' : 'Upcoming Lessons',
            value: stats?.lessons?.upcoming || 0,
            icon: TrendingUp,
            bg: 'bg-amber-500',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-purple-600" />
                        {isAr ? 'تقارير الدورات' : 'Course Reports'}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isAr ? 'معدلات إتمام الكورسات، تسليم الدروس، نتائج الاختبارات' : 'Course completion rates, lesson delivery, quiz results'}
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
                    {isAr ? 'أداء الكورسات' : 'Course Performance'}
                </h3>
                <div className="text-center py-12 text-gray-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isAr ? 'سيتم عرض بيانات أداء الكورسات هنا' : 'Course performance data will appear here'}</p>
                </div>
            </div>
        </div>
    );
}
