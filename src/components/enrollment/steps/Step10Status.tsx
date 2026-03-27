'use client';

import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type {
  EnrollmentAppStatus,
  EnrollmentStatusHistory,
  EnrollmentDocument,
} from '@/types/enrollment';
import { APPLICATION_STATUS_LABELS, DOCUMENT_STATUS_LABELS } from '@/types/enrollment';

interface Step10StatusProps {
  locale: string;
  applicationId?: string;
  applicationNumber: string;
  applicationStatus: EnrollmentAppStatus;
  statusHistory: EnrollmentStatusHistory[];
  documents: EnrollmentDocument[];
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  submitted: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  incomplete: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  pending_documents: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  pending_verification: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  under_review: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  pending_attestation: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  pending_translation: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  awaiting_transfer_certificate: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  action_required: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  provisionally_accepted: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },
  approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  enrollment_activated: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
};

const STATUS_ICONS: Record<string, typeof CheckCircle2> = {
  draft: Clock,
  submitted: Clock,
  incomplete: AlertCircle,
  pending_documents: FileText,
  pending_verification: Clock,
  under_review: Clock,
  pending_attestation: Clock,
  pending_translation: Clock,
  awaiting_transfer_certificate: FileText,
  action_required: AlertCircle,
  provisionally_accepted: CheckCircle2,
  approved: CheckCircle2,
  rejected: XCircle,
  enrollment_activated: CheckCircle2,
};

export default function Step10Status({
  locale,
  applicationId,
  applicationNumber,
  applicationStatus,
  statusHistory,
  documents,
}: Step10StatusProps) {
  const isRTL = locale === 'ar';

  const statusColor = STATUS_COLORS[applicationStatus] || STATUS_COLORS.draft;
  const StatusIcon = STATUS_ICONS[applicationStatus] || Clock;

  // Action items
  const actionItems: string[] = [];
  const rejectedDocs = documents.filter(
    (d) => d.status === 'rejected' || d.status === 're_upload_requested',
  );
  if (rejectedDocs.length > 0) {
    rejectedDocs.forEach((d) => {
      actionItems.push(
        isRTL
          ? `إعادة رفع: ${d.label || d.document_type}`
          : `Re-upload: ${d.label || d.document_type}`,
      );
    });
  }

  const pendingAttestationDocs = documents.filter(
    (d) => d.status === 'pending_attestation',
  );
  if (pendingAttestationDocs.length > 0) {
    actionItems.push(
      isRTL
        ? `${pendingAttestationDocs.length} مستند(ات) بانتظار التصديق`
        : `${pendingAttestationDocs.length} document(s) pending attestation`,
    );
  }

  const pendingTranslationDocs = documents.filter(
    (d) => d.status === 'pending_translation',
  );
  if (pendingTranslationDocs.length > 0) {
    actionItems.push(
      isRTL
        ? `${pendingTranslationDocs.length} مستند(ات) بانتظار الترجمة`
        : `${pendingTranslationDocs.length} document(s) pending translation`,
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${statusColor.bg}`}
        >
          <StatusIcon className={`w-8 h-8 ${statusColor.text}`} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isRTL ? 'حالة الطلب' : 'Application Status'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL ? 'تتبع حالة طلب التسجيل الخاص بك.' : 'Track the status of your enrollment application.'}
        </p>
      </div>

      {/* Application number & status */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 text-center space-y-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">
            {isRTL ? 'رقم الطلب' : 'Application Number'}
          </p>
          <p className="text-2xl font-mono font-bold text-gray-900 mt-1">
            {applicationNumber || applicationId?.slice(0, 8) || '-'}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
            {isRTL ? 'الحالة الحالية' : 'Current Status'}
          </p>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}
          >
            <StatusIcon className="w-4 h-4" />
            {APPLICATION_STATUS_LABELS[applicationStatus]}
          </span>
        </div>
      </div>

      {/* Status timeline */}
      {statusHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">
            {isRTL ? 'سجل الحالة' : 'Status Timeline'}
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-0 bottom-0 start-4 w-0.5 bg-gray-200" />

            <div className="space-y-6">
              {[...statusHistory]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime(),
                )
                .map((entry, i) => {
                  const entryColor =
                    STATUS_COLORS[entry.new_status] || STATUS_COLORS.draft;
                  const EntryIcon =
                    STATUS_ICONS[entry.new_status] || Clock;
                  return (
                    <div key={entry.id || i} className="relative flex items-start gap-4 ps-10">
                      {/* Timeline dot */}
                      <div
                        className={`absolute start-2 top-1 w-5 h-5 rounded-full flex items-center justify-center ${entryColor.bg} border-2 border-white shadow-sm`}
                      >
                        <EntryIcon className={`w-3 h-3 ${entryColor.text}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${entryColor.bg} ${entryColor.text}`}
                          >
                            {APPLICATION_STATUS_LABELS[entry.new_status]}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(entry.created_at).toLocaleDateString()}{' '}
                            {new Date(entry.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {entry.reason && (
                          <p className="text-sm text-gray-600 mt-1">
                            {entry.reason}
                          </p>
                        )}
                        {entry.notes && (
                          <p className="text-xs text-gray-500 mt-1">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Document statuses */}
      {documents.length > 0 && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4">
            {isRTL ? 'حالة المستندات' : 'Document Status'}
          </h3>
          <div className="space-y-3">
            {documents.map((doc) => {
              const docStatusColor =
                doc.status === 'verified'
                  ? 'bg-green-50 text-green-700'
                  : doc.status === 'rejected' || doc.status === 're_upload_requested'
                    ? 'bg-red-50 text-red-700'
                    : doc.status === 'missing'
                      ? 'bg-gray-50 text-gray-500'
                      : 'bg-blue-50 text-blue-700';

              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">
                      {doc.label || doc.document_type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${docStatusColor}`}
                  >
                    {DOCUMENT_STATUS_LABELS[doc.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action items */}
      {actionItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" />
            {isRTL ? 'الإجراءات المطلوبة' : 'Action Items'}
          </h3>
          <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
            {actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-4 h-4 me-1" />
            {isRTL ? 'تحديث الحالة' : 'Refresh Status'}
          </Button>
        </div>
      )}

      {/* Contact admissions */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 text-center">
        <h3 className="font-bold text-blue-900 mb-2">
          {isRTL ? 'هل تحتاج مساعدة؟' : 'Need Help?'}
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          {isRTL
            ? 'تواصل مع فريق القبول للاستفسار عن طلبك.'
            : 'Contact the admissions team for inquiries about your application.'}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:admissions@eduverse.school"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            <Mail className="w-4 h-4" />
            admissions@eduverse.school
          </a>
          <a
            href="tel:+97100000000"
            className="inline-flex items-center gap-2 text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            <Phone className="w-4 h-4" />
            +971 0000 0000
          </a>
        </div>
      </div>
    </div>
  );
}
