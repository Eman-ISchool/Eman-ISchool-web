'use client';

import type { EnrollmentAppStatus, EnrollmentDocStatus } from '@/types/enrollment';
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  AlertTriangle,
  Eye,
  Languages,
  Stamp,
  Send,
  RotateCcw,
  Timer,
  CircleDot,
  Shield,
} from 'lucide-react';

// ── Application Status Badge ─────────────────────────────────

const APP_STATUS_CONFIG: Record<
  EnrollmentAppStatus,
  { label: string; labelAr: string; color: string; icon: React.ReactNode }
> = {
  draft: {
    label: 'Draft',
    labelAr: 'مسودة',
    color: 'bg-gray-100 text-gray-700',
    icon: <FileText className="w-3 h-3" />,
  },
  submitted: {
    label: 'Submitted',
    labelAr: 'مقدم',
    color: 'bg-blue-100 text-blue-700',
    icon: <Send className="w-3 h-3" />,
  },
  under_review: {
    label: 'Under Review',
    labelAr: 'قيد المراجعة',
    color: 'bg-indigo-100 text-indigo-700',
    icon: <Eye className="w-3 h-3" />,
  },
  pending_documents: {
    label: 'Pending Documents',
    labelAr: 'بانتظار المستندات',
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className="w-3 h-3" />,
  },
  pending_verification: {
    label: 'Pending Verification',
    labelAr: 'بانتظار التحقق',
    color: 'bg-amber-100 text-amber-700',
    icon: <Shield className="w-3 h-3" />,
  },
  pending_attestation: {
    label: 'Pending Attestation',
    labelAr: 'بانتظار التصديق',
    color: 'bg-orange-100 text-orange-700',
    icon: <Stamp className="w-3 h-3" />,
  },
  pending_translation: {
    label: 'Pending Translation',
    labelAr: 'بانتظار الترجمة',
    color: 'bg-orange-100 text-orange-700',
    icon: <Languages className="w-3 h-3" />,
  },
  awaiting_transfer_certificate: {
    label: 'Awaiting Transfer Certificate',
    labelAr: 'بانتظار شهادة النقل',
    color: 'bg-orange-100 text-orange-700',
    icon: <Timer className="w-3 h-3" />,
  },
  action_required: {
    label: 'Action Required',
    labelAr: 'إجراء مطلوب',
    color: 'bg-red-100 text-red-700',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  provisionally_accepted: {
    label: 'Provisionally Accepted',
    labelAr: 'مقبول مبدئياً',
    color: 'bg-yellow-100 text-yellow-700',
    icon: <CircleDot className="w-3 h-3" />,
  },
  approved: {
    label: 'Approved',
    labelAr: 'معتمد',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    labelAr: 'مرفوض',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-3 h-3" />,
  },
  enrollment_activated: {
    label: 'Enrollment Activated',
    labelAr: 'تم تفعيل التسجيل',
    color: 'bg-teal-100 text-teal-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  incomplete: {
    label: 'Incomplete',
    labelAr: 'غير مكتمل',
    color: 'bg-orange-100 text-orange-700',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

interface AppStatusBadgeProps {
  status: EnrollmentAppStatus;
  size?: 'sm' | 'md';
  locale?: string;
}

export function AppStatusBadge({ status, size = 'sm', locale }: AppStatusBadgeProps) {
  const config = APP_STATUS_CONFIG[status] || {
    label: status,
    labelAr: status,
    color: 'bg-gray-100 text-gray-700',
    icon: null,
  };

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';
  const label = locale === 'ar' ? config.labelAr : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${config.color} ${sizeClass}`}
    >
      {config.icon}
      {label}
    </span>
  );
}

// ── Document Status Badge ────────────────────────────────────

const DOC_STATUS_CONFIG: Record<
  EnrollmentDocStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  missing: {
    label: 'Missing',
    color: 'bg-gray-100 text-gray-600',
    icon: <AlertTriangle className="w-3 h-3" />,
  },
  uploaded: {
    label: 'Uploaded',
    color: 'bg-blue-100 text-blue-700',
    icon: <FileText className="w-3 h-3" />,
  },
  pending_review: {
    label: 'Pending Review',
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className="w-3 h-3" />,
  },
  verified: {
    label: 'Verified',
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className="w-3 h-3" />,
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className="w-3 h-3" />,
  },
  pending_attestation: {
    label: 'Pending Attestation',
    color: 'bg-orange-100 text-orange-700',
    icon: <Stamp className="w-3 h-3" />,
  },
  pending_translation: {
    label: 'Pending Translation',
    color: 'bg-orange-100 text-orange-700',
    icon: <Languages className="w-3 h-3" />,
  },
  re_upload_requested: {
    label: 'Re-upload Requested',
    color: 'bg-amber-100 text-amber-700',
    icon: <RotateCcw className="w-3 h-3" />,
  },
  expired: {
    label: 'Expired',
    color: 'bg-red-100 text-red-600',
    icon: <Timer className="w-3 h-3" />,
  },
};

interface DocStatusBadgeProps {
  status: EnrollmentDocStatus;
  size?: 'sm' | 'md';
}

export function DocStatusBadge({ status, size = 'sm' }: DocStatusBadgeProps) {
  const config = DOC_STATUS_CONFIG[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-700',
    icon: null,
  };

  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap ${config.color} ${sizeClass}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ── Enrollment Type Badge ────────────────────────────────────

interface EnrollmentTypeBadgeProps {
  type: 'new' | 'transfer' | null;
}

export function EnrollmentTypeBadge({ type }: EnrollmentTypeBadgeProps) {
  if (!type) return <span className="text-gray-400 text-xs">--</span>;

  if (type === 'new') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700">
        New
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700">
      Transfer
    </span>
  );
}
