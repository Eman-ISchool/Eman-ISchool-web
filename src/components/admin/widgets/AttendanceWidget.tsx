'use client';

import Link from 'next/link';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface AttendanceData {
    present: number;
    absent: number;
    late: number;
    rate: number;
}

interface AttendanceWidgetProps {
    data: AttendanceData;
    className?: string;
    href?: string;
}

export default function AttendanceWidget({ data, className = '', href }: AttendanceWidgetProps) {
    // Ensure data has default values if undefined
    const safeData = {
        present: data?.present ?? 0,
        absent: data?.absent ?? 0,
        late: data?.late ?? 0,
        rate: data?.rate ?? 0,
    };
    const total = safeData.present + safeData.absent + safeData.late;
    const cardClasses = `admin-card ${className} ${href ? 'transition-transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer' : ''}`;

    const content = (
        <>
            <div className="admin-card-header">
                <h3 className="admin-card-title">ملخص الحضور</h3>
            </div>
            <div className="admin-card-body">
                {/* Progress Ring */}
                <div className="flex items-center justify-center mb-6">
                    <div className="relative w-32 h-32">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#E2E8F0"
                                strokeWidth="8"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="40"
                                fill="none"
                                stroke="#0D9488"
                                strokeWidth="8"
                                strokeLinecap="round"
                                strokeDasharray={`${(safeData.rate / 100) * 251.2} 251.2`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-3xl font-bold text-gray-800">{data.rate}%</span>
                                <p className="text-xs text-gray-500">نسبة الحضور</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-gray-700">حاضر</span>
                        </div>
                        <span className="font-bold text-green-600">{data.present}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-gray-700">غائب</span>
                        </div>
                        <span className="font-bold text-red-600">{data.absent}</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-yellow-500" />
                            <span className="text-gray-700">متأخر</span>
                        </div>
                        <span className="font-bold text-yellow-600">{data.late}</span>
                    </div>
                </div>
            </div>
        </>
    );

    if (href) {
        return (
            <Link href={href} className={cardClasses} aria-label="عرض تفاصيل الحضور">
                {content}
            </Link>
        );
    }

    return <div className={cardClasses}>{content}</div>;
}
