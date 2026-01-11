'use client';

import { BookOpen, Users, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsData {
    totalLessons: number;
    upcomingLessons: number;
    completedLessons: number;
    totalStudents: number;
    thisWeekLessons: number;
}

interface DashboardStatsProps {
    stats: StatsData | null;
    isLoading: boolean;
}

export function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
    const statCards = [
        {
            title: 'إجمالي الدروس',
            value: stats?.totalLessons ?? 0,
            icon: BookOpen,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'الدروس القادمة',
            value: stats?.upcomingLessons ?? 0,
            icon: Calendar,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'الدروس المكتملة',
            value: stats?.completedLessons ?? 0,
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
        },
        {
            title: 'إجمالي الطلاب',
            value: stats?.totalStudents ?? 0,
            icon: Users,
            color: 'bg-purple-500',
            bgColor: 'bg-purple-50',
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-12 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map((stat) => (
                <Card key={stat.title} className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color.replace('bg-', '')}`} style={{ color: stat.color === 'bg-blue-500' ? '#3b82f6' : stat.color === 'bg-yellow-500' ? '#eab308' : stat.color === 'bg-green-500' ? '#22c55e' : '#a855f7' }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
