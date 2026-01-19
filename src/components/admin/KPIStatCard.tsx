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

const variantClasses = {
    default: 'bg-white border border-gray-200',
    blue: 'kpi-card gradient-blue',
    teal: 'kpi-card gradient-teal',
    purple: 'kpi-card gradient-purple',
    orange: 'kpi-card gradient-orange',
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
    const isGradient = variant !== 'default';
    const cardClasses = `kpi-card ${variantClasses[variant]} ${className} ${href
            ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer group'
            : ''
        }`;

    const cardContent = (
        <>
            <div className="flex items-start justify-between">
                <div>
                    <p
                        className={`text-sm ${isGradient ? 'opacity-80' : 'text-gray-500'
                            }`}
                    >
                        {title}
                    </p>
                    <p className="kpi-card-value mt-1">{value}</p>
                    {trend && (
                        <div
                            className={`kpi-card-trend ${trend.isPositive ? 'positive' : 'negative'
                                } ${isGradient ? '!text-white/80' : ''}`}
                        >
                            {trend.isPositive ? (
                                <TrendingUp className="w-3 h-3" />
                            ) : (
                                <TrendingDown className="w-3 h-3" />
                            )}
                            <span>
                                {trend.value > 0 ? '+' : ''}
                                {trend.value}% {trend.label}
                            </span>
                        </div>
                    )}
                </div>
                <div
                    className={`kpi-card-icon transition-transform duration-300 ${isGradient ? '' : 'bg-gray-100'
                        } ${isHovered && href ? 'scale-110' : ''}`}
                >
                    {icon}
                </div>
            </div>
            {/* Click indicator - only shown when card has href */}
            {href && (
                <div className={`flex items-center justify-end gap-1 mt-3 pt-2 border-t transition-all duration-300 ${isGradient ? 'border-white/20' : 'border-gray-100'
                    }`}>
                    <span className={`text-xs font-medium ${isGradient ? 'text-white/70 group-hover:text-white' : 'text-gray-400 group-hover:text-teal-500'
                        } transition-colors`}>
                        اضغط للمزيد
                    </span>
                    <ChevronLeft className={`w-4 h-4 transition-all duration-300 ${isGradient ? 'text-white/70 group-hover:text-white' : 'text-gray-400 group-hover:text-teal-500'
                        } ${isHovered ? '-translate-x-1' : ''}`} />
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
