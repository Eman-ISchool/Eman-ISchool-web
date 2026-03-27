'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Upload,
  FileCheck,
  FileWarning,
  RefreshCw,
  Eye,
  Loader2,
  File,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import type { EnrollmentDocStatus } from '@/types/enrollment';

interface DocumentUploadCardProps {
  label: string;
  isRequired: boolean;
  status: EnrollmentDocStatus;
  fileName?: string | null;
  fileSize?: number | null;
  fileUrl?: string | null;
  rejectionReason?: string | null;
  uploadDate?: string | null;
  onUpload: (file: File) => Promise<void>;
  readOnly?: boolean;
  locale: string;
}

const STATUS_CONFIG: Record<
  EnrollmentDocStatus,
  { color: string; bgColor: string; icon: typeof CheckCircle2; label_en: string; label_ar: string }
> = {
  missing: {
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    icon: AlertCircle,
    label_en: 'Missing',
    label_ar: 'مفقود',
  },
  uploaded: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Clock,
    label_en: 'Uploaded',
    label_ar: 'تم الرفع',
  },
  pending_review: {
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Clock,
    label_en: 'Pending Review',
    label_ar: 'بانتظار المراجعة',
  },
  verified: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle2,
    label_en: 'Verified',
    label_ar: 'تم التحقق',
  },
  rejected: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: XCircle,
    label_en: 'Rejected',
    label_ar: 'مرفوض',
  },
  pending_attestation: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    icon: Clock,
    label_en: 'Pending Attestation',
    label_ar: 'بانتظار التصديق',
  },
  pending_translation: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    icon: Clock,
    label_en: 'Pending Translation',
    label_ar: 'بانتظار الترجمة',
  },
  re_upload_requested: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    icon: RefreshCw,
    label_en: 'Re-upload Requested',
    label_ar: 'مطلوب إعادة الرفع',
  },
  expired: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: FileWarning,
    label_en: 'Expired',
    label_ar: 'منتهي الصلاحية',
  },
};

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUploadCard({
  label,
  isRequired,
  status,
  fileName,
  fileSize,
  fileUrl,
  rejectionReason,
  uploadDate,
  onUpload,
  readOnly,
  locale,
}: DocumentUploadCardProps) {
  const isRTL = locale === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.missing;
  const StatusIcon = config.icon;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(
        isRTL
          ? 'نوع الملف غير مدعوم. يرجى رفع PDF أو JPG أو PNG.'
          : 'Unsupported file type. Please upload PDF, JPG, or PNG.',
      );
      return;
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      setError(
        isRTL
          ? 'حجم الملف يتجاوز 20 ميجابايت.'
          : 'File size exceeds 20MB limit.',
      );
      return;
    }

    setUploading(true);
    try {
      await onUpload(file);
    } catch {
      setError(
        isRTL ? 'فشل رفع الملف. حاول مرة أخرى.' : 'Upload failed. Please try again.',
      );
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isRejected = status === 'rejected' || status === 're_upload_requested';
  const hasFile = !!fileName && status !== 'missing';
  const canUpload = !readOnly && (status === 'missing' || isRejected || status === 'expired');
  const canReplace = !readOnly && hasFile && !isRejected;

  return (
    <div
      className={`border-2 rounded-xl p-5 transition-all ${
        status === 'missing' && isRequired
          ? 'border-dashed border-red-200 bg-red-50/30'
          : status === 'missing'
            ? 'border-dashed border-gray-200 hover:bg-gray-50'
            : isRejected
              ? 'border-red-200 bg-red-50/30'
              : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-semibold text-gray-900 text-sm">{label}</h4>
            {/* Required/Optional badge */}
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isRequired
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isRequired
                ? isRTL
                  ? 'مطلوب'
                  : 'Required'
                : isRTL
                  ? 'اختياري'
                  : 'Optional'}
            </span>
          </div>

          {/* File info */}
          {hasFile && (
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <File className="w-3 h-3 shrink-0" />
              <span className="truncate">{fileName}</span>
              {fileSize && <span>({formatFileSize(fileSize)})</span>}
              {uploadDate && (
                <span className="hidden sm:inline">
                  {new Date(uploadDate).toLocaleDateString()}
                </span>
              )}
            </div>
          )}

          {!hasFile && (
            <p className="text-xs text-gray-400 mt-1">
              {isRTL ? 'لم يتم اختيار ملف' : 'No file selected'}
            </p>
          )}

          {/* Status badge */}
          <div className="mt-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}
            >
              <StatusIcon className="w-3 h-3" />
              {isRTL ? config.label_ar : config.label_en}
            </span>
          </div>

          {/* Rejection reason */}
          {isRejected && rejectionReason && (
            <div className="mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-xs text-red-700 font-medium">
                {isRTL ? 'سبب الرفض:' : 'Reason:'}{' '}
                <span className="font-normal">{rejectionReason}</span>
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Preview button */}
          {hasFile && fileUrl && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(fileUrl, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
          )}

          {/* Upload / Re-upload */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileSelect}
          />

          {canUpload && (
            <Button
              variant={isRejected ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRejected ? (
                <>
                  <RefreshCw className="w-4 h-4 me-1" />
                  {isRTL ? 'إعادة الرفع' : 'Re-upload'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 me-1" />
                  {isRTL ? 'رفع' : 'Upload'}
                </>
              )}
            </Button>
          )}

          {canReplace && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <FileCheck className="w-4 h-4 me-1 text-green-600" />
                  {isRTL ? 'تغيير' : 'Change'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* File rules */}
      {(canUpload || canReplace) && (
        <p className="text-[10px] text-gray-400 mt-3 border-t border-gray-100 pt-2">
          {isRTL
            ? 'PDF, JPG, JPEG, PNG - الحد الأقصى 20 ميجابايت'
            : 'PDF, JPG, JPEG, PNG - Max 20MB'}
        </p>
      )}
    </div>
  );
}
