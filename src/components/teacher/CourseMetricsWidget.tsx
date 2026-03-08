import { Users, CalendarClock, FileText, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface CourseMetricsWidgetProps {
    courseId: string;
    enrolledStudents: number;
    upcomingLessons: number;
    materialsCount: number;
    assignmentsCount: number;
}

export default async function CourseMetricsWidget({
    courseId,
    enrolledStudents,
    upcomingLessons,
    materialsCount,
    assignmentsCount,
}: CourseMetricsWidgetProps) {
    const t = await getTranslations('teacher.metrics');

    const metrics = [
        {
            label: t('enrolledStudents'),
            value: enrolledStudents,
            icon: Users,
            color: 'bg-blue-50 text-blue-600',
        },
        {
            label: t('upcomingLessons'),
            value: upcomingLessons,
            icon: CalendarClock,
            color: 'bg-green-50 text-green-600',
        },
        {
            label: t('materials'),
            value: materialsCount,
            icon: FileText,
            color: 'bg-purple-50 text-purple-600',
        },
        {
            label: t('assignments'),
            value: assignmentsCount,
            icon: BookOpen,
            color: 'bg-orange-50 text-orange-600',
        },
    ];

    return (
        <div className="bg-white rounded-lg border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {t('title')}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <div
                            key={metric.label}
                            className="flex flex-col items-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className={`p-3 rounded-full ${metric.color} mb-2`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold text-gray-800">
                                {metric.value}
                            </span>
                            <span className="text-sm text-gray-600 text-center mt-1">
                                {metric.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
