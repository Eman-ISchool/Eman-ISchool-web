import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = '',
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg border border-dashed border-gray-300 min-h-[300px] ${className}`}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                <Icon className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
            <p className="text-slate-500 max-w-sm mb-6">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction} className="mt-2">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}
