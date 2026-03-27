'use client';

import { AppStatusBadge, EnrollmentTypeBadge } from './StatusBadge';
import type { EnrollmentAppStatus, EnrollmentType } from '@/types/enrollment';
import { FileText, User, GraduationCap } from 'lucide-react';

interface ApplicationCardProps {
  applicationNumber: string;
  studentName: string | null;
  grade: string | null;
  status: EnrollmentAppStatus;
  enrollmentType: EnrollmentType | null;
  completenessScore: number;
  submittedAt: string | null;
  locale?: string;
}

export default function ApplicationCard({
  applicationNumber,
  studentName,
  grade,
  status,
  enrollmentType,
  completenessScore,
  submittedAt,
  locale,
}: ApplicationCardProps) {
  const completenessColor =
    completenessScore >= 80
      ? 'bg-green-500'
      : completenessScore >= 50
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div className="admin-card p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: App info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-semibold text-gray-900">
                {applicationNumber}
              </h2>
              <AppStatusBadge status={status} size="md" locale={locale} />
              <EnrollmentTypeBadge type={enrollmentType} />
            </div>

            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-600">
              {studentName && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {studentName}
                </span>
              )}
              {grade && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {grade}
                </span>
              )}
              {submittedAt && (
                <span>
                  Submitted: {new Date(submittedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Completeness */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-sm font-medium text-gray-700">
            {completenessScore}% Complete
          </span>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${completenessColor}`}
              style={{ width: `${completenessScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
