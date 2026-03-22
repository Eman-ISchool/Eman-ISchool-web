'use client';

import { useState, useEffect } from 'react';
import { useDashboardMetrics } from '@/lib/api/dashboard';
import KPIStatCard from '@/components/admin/KPIStatCard';
import { Users, GraduationCap, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import DateRangeFilter from '@/components/admin/DateRangeFilter';
import DashboardChart from '@/components/admin/DashboardChart';
import { LoadingState, ErrorState } from '@/components/admin/StateComponents';

export default function AdminDashboardPage() {
    const [dateRange, setDateRange] = useState<{ start: Date; end: Date } | undefined>(undefined);
    const { data: metrics, isLoading, error, refetch } = useDashboardMetrics(dateRange);

    const handleDateRangeChange = (start: Date, end: Date) => {
        setDateRange({ start, end });
    };

    if (isLoading) {
        return <LoadingState message="جاري تحميل البيانات..." />;
    }

    if (error) {
        return (
            <ErrorState
                title="حدث خطأ"
                message="تعذر تحميل بيانات لوحة التحكم. يرجى المحاولة مرة أخرى."
                onRetry={() => refetch()}
            />
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    لوحة التحكم
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    نظرة عامة على أداء النظام
                </p>
            </div>

            {/* Date Range Filter */}
            <DateRangeFilter
                onDateRangeChange={handleDateRangeChange}
            />

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPIStatCard
                    title="إجمالي الطلاب"
                    value={metrics?.totalStudents || 0}
                    icon={<Users className="h-6 w-6" />}
                    variant="blue"
                    trend={metrics?.studentsTrend ? {
                        value: metrics.studentsTrend.value,
                        label: metrics.studentsTrend.label,
                        isPositive: metrics.studentsTrend.isPositive
                    } : undefined}
                />
                <KPIStatCard
                    title="إجمالي المعلمين"
                    value={metrics?.totalTeachers || 0}
                    icon={<GraduationCap className="h-6 w-6" />}
                    variant="teal"
                    trend={metrics?.teachersTrend ? {
                        value: metrics.teachersTrend.value,
                        label: metrics.teachersTrend.label,
                        isPositive: metrics.teachersTrend.isPositive
                    } : undefined}
                />
                <KPIStatCard
                    title="إجمالي الإيرادات"
                    value={`SAR ${metrics?.totalRevenue?.toLocaleString() || '0'}`}
                    icon={<DollarSign className="h-6 w-6" />}
                    variant="purple"
                    trend={metrics?.revenueTrend ? {
                        value: metrics.revenueTrend.value,
                        label: metrics.revenueTrend.label,
                        isPositive: metrics.revenueTrend.isPositive
                    } : undefined}
                />
                <KPIStatCard
                    title="المدفوعات المعلقة"
                    value={`SAR ${metrics?.pendingPayments?.toLocaleString() || '0'}`}
                    icon={<Clock className="h-6 w-6" />}
                    variant="orange"
                    trend={metrics?.pendingPaymentsTrend ? {
                        value: metrics.pendingPaymentsTrend.value,
                        label: metrics.pendingPaymentsTrend.label,
                        isPositive: !metrics.pendingPaymentsTrend.isPositive // For pending payments, lower is better
                    } : undefined}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
                <DashboardChart
                    title="اتجاه الإيرادات"
                    type="line"
                    data={metrics?.revenueChart || []}
                    height={300}
                />
                <DashboardChart
                    title="نشاط الطلاب"
                    type="bar"
                    data={metrics?.studentActivityChart || []}
                    height={300}
                />
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                    النشاط الأخير
                </h2>
                <div className="space-y-4">
                    {metrics?.recentActivity?.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 border-b border-gray-100 pb-4 last:border-0 dark:border-gray-800 last:pb-0">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                activity.type === 'student' ? 'bg-blue-100 text-blue-600' :
                                activity.type === 'teacher' ? 'bg-teal-100 text-teal-600' :
                                activity.type === 'payment' ? 'bg-purple-100 text-purple-600' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {activity.type === 'student' && <Users className="h-5 w-5" />}
                                {activity.type === 'teacher' && <GraduationCap className="h-5 w-5" />}
                                {activity.type === 'payment' && <DollarSign className="h-5 w-5" />}
                                {activity.type === 'system' && <Clock className="h-5 w-5" />}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {activity.title}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {activity.description}
                                </p>
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                    {activity.timestamp}
                                </p>
                            </div>
                        </div>
                    )) || (
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            لا يوجد نشاط حديث
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
