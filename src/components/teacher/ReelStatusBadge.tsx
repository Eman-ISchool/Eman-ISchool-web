/**
 * Reel Status Badge Component
 * Displays status badge with appropriate color coding
 */

'use client';

interface ReelStatusBadgeProps {
    status: 'queued' | 'processing' | 'pending_review' | 'approved' | 'rejected' | 'failed';
    className?: string;
}

export default function ReelStatusBadge({
    status,
    className = '',
}: ReelStatusBadgeProps) {
    const statusConfig = {
        queued: {
            label: 'Queued',
            bgColor: 'bg-yellow-100',
            textColor: 'text-yellow-800',
        },
        processing: {
            label: 'Processing',
            bgColor: 'bg-blue-100',
            textColor: 'text-blue-800',
        },
        pending_review: {
            label: 'Pending Review',
            bgColor: 'bg-orange-100',
            textColor: 'text-orange-800',
        },
        approved: {
            label: 'Approved',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
        },
        rejected: {
            label: 'Rejected',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
        },
        failed: {
            label: 'Failed',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}
            title={config.label}
        >
            {config.label}
        </span>
    );
}
