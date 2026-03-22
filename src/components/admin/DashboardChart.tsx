'use client';

import { useMemo } from 'react';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
    label: string;
    value: number;
    timestamp?: string;
}

interface DashboardChartProps {
    title: string;
    type: 'bar' | 'line' | 'area';
    data: ChartDataPoint[];
    height?: number;
    className?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    showLegend?: boolean;
}

export default function DashboardChart({
    title,
    type,
    data,
    height = 300,
    className = '',
    xAxisLabel,
    yAxisLabel,
    showLegend = true,
}: DashboardChartProps) {
    const chartData = useMemo(() => {
        return data.map(point => ({
            name: point.label,
            value: point.value,
        }));
    }, [data]);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                    <p className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                        {payload[0].payload.name}
                    </p>
                    <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                        {payload[0].payload.value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderChart = () => {
        const commonProps = {
            data: chartData,
            margin: { top: 5, right: 30, left: 20, bottom: 5 },
        };

        switch (type) {
            case 'bar':
                return (
                    <BarChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                        )}
                        <Bar
                            dataKey="value"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                );

            case 'line':
                return (
                    <LineChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                        )}
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                );

            case 'area':
                return (
                    <AreaChart {...commonProps}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <YAxis
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            stroke="#9ca3af"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {showLegend && (
                            <Legend
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                        )}
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="#3b82f6"
                            fillOpacity={0.3}
                        />
                    </AreaChart>
                );

            default:
                return null;
        }
    };

    return (
        <div className={`rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900 ${className}`}>
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                {title}
            </h3>
            <div style={{ height }}>
                <ResponsiveContainer width="100%" height="100%">
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        </div>
    );
}
