'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, ChevronLeft } from 'lucide-react';

interface KPIStatCardProps {
    title: string;
    value: string | number;
    icon: ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
    variant?: 'default' | 'blue' | 'teal' | 'purple' | 'orange';
    className?: string;
    href?: string;
}

const variants = {
    default: {
        bg: 'bg-white border-slate-100',
        text: 'text-slate-900',
        label: 'text-slate-500',
        iconBg: 'bg-slate-100',
        trendPos: 'text-emerald-600 bg-emerald-50',
        trendNeg: 'text-rose-600 bg-rose-50',
    },
    blue: {
        bg: 'bg-blue-50 border-blue-100/50',
        text: 'text-blue-950',
        label: 'text-blue-600/80',
        iconBg: 'bg-blue-100',
        trendPos: 'text-emerald-600 bg-white/60',
        trendNeg: 'text-rose-600 bg-white/60',
    },
    teal: {
        bg: 'bg-teal-50 border-teal-100/50',
        text: 'text-teal-950',
        label: 'text-teal-600/80',
        iconBg: 'bg-teal-100',
        trendPos: 'text-emerald-600 bg-white/60',
        trendNeg: 'text-rose-600 bg-white/60',
    },
    purple: {
        bg: 'bg-purple-50 border-purple-100/50',
        text: 'text-purple-950',
        label: 'text-purple-600/80',
        iconBg: 'bg-purple-100',
        trendPos: 'text-emerald-600 bg-white/60',
        trendNeg: 'text-rose-600 bg-white/60',
    },
    orange: {
        bg: 'bg-orange-50 border-orange-100/50',
        text: 'text-orange-950',
        label: 'text-orange-600/80',
        iconBg: 'bg-orange-100',
        trendPos: 'text-emerald-600 bg-white/60',
        trendNeg: 'text-rose-600 bg-white/60',
    },
};

export default function KPIStatCard({
    title,
    value,
    icon,
    trend,
    variant = 'default',
    className = '',
    href,
}: KPIStatCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const theme = variants[variant];

    // Base classes for the card outer container
    const cardClasses = `relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${theme.bg} ${className} ${href ? 'hover:-translate-y-1 hover:shadow-lg cursor-pointer group' : ''
        }`;

    const cardContent = (
        <>
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme.label} truncate`}>
                        {title}
                    </p>
                    <p className={`mt-2 text-3xl font-bold tracking-tight ${theme.text} truncate`}>
                        {value}
                    </p>

                    {trend && (
                        <div className="mt-3 flex items-center gap-1.5">
                            <div className={`flex items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${trend.isPositive ? theme.trendPos : theme.trendNeg}`}>
                                {trend.isPositive ? (
                                    <TrendingUp className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />
                                ) : (
                                    <TrendingDown className="mr-1 h-3 w-3 rtl:ml-1 rtl:mr-0" />
                                )}
                                <span>
                                    {trend.value > 0 ? '+' : ''}
                                    {trend.value}%
                                </span>
                            </div>
                            <span className={`text-xs ${theme.label} opacity-80`}>
                                {trend.label}
                            </span>
                        </div>
                    )}
                </div>

                {/* Icon Container with specific styling for pastel cards */}
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 ${theme.iconBg} [&>svg]:text-${variant === 'default' ? 'slate' : variant}-600 [&>svg]:w-6 [&>svg]:h-6 ${isHovered && href ? 'scale-110 shadow-sm' : ''
                        }`}
                >
                    {icon}
                </div>
            </div>

            {/* Click indicator - only shown when card has href */}
            {href && (
                <div className="mt-4 flex items-center justify-end gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <span className={`text-xs font-medium ${theme.label}`}>
                        عرض التفاصيل
                    </span>
                    <ChevronLeft className={`h-4 w-4 ${theme.label} ${isHovered ? '-translate-x-1' : ''} rtl:rotate-180 rtl:group-hover:translate-x-1`} />
                </div>
            )}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={cardClasses}
                aria-label={`عرض ${title}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {cardContent}
            </Link>
        );
    }

    return <div className={cardClasses}>{cardContent}</div>;
}
