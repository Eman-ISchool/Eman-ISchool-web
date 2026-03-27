'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  User,
  GraduationCap,
  Users,
  CreditCard,
  HeartPulse,
  FileText,
  Clock,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  RotateCcw,
  Stamp,
  Languages,
  Shield,
  Eye,
  Send,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { LoadingState, ErrorState } from '@/components/admin/StateComponents';
import ApplicationCard from '@/components/admin/admissions/ApplicationCard';
import { AppStatusBadge, DocStatusBadge, EnrollmentTypeBadge } from '@/components/admin/admissions/StatusBadge';
import Modal, { FormGroup, FormLabel, FormTextarea } from '@/components/admin/Modal';
import { withLocalePrefix } from '@/lib/locale-path';
import type {
  ApplicationDetail,
  EnrollmentAppStatus,
  EnrollmentDocument,
  EnrollmentStatusHistory,
  EnrollmentReviewNote,
} from '@/types/enrollment';

// ── Tab definitions ──────────────────────────────────────────

const TABS = [
  { key: 'summary', label: 'Summary', icon: <Eye className="w-4 h-4" /> },
  { key: 'student', label: 'Student', icon: <User className="w-4 h-4" /> },
  { key: 'academic', label: 'Academic', icon: <GraduationCap className="w-4 h-4" /> },
  { key: 'guardian', label: 'Guardian', icon: <Users className="w-4 h-4" /> },
  { key: 'identity', label: 'Identity', icon: <CreditCard className="w-4 h-4" /> },
  { key: 'medical', label: 'Medical', icon: <HeartPulse className="w-4 h-4" /> },
  { key: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
  { key: 'notes', label: 'Notes', icon: <MessageSquare className="w-4 h-4" /> },
] as const;

type TabKey = (typeof TABS)[number]['key'];

// ── Blocker type (from status-engine) ────────────────────────

interface StatusBlocker {
  type: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

// ── Main Page ────────────────────────────────────────────────

export default function AdmissionsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const applicationId = params.id as string;

  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [actionLoading, setActionLoading] = useState(false);

  // Modal states
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [requestActionModalOpen, setRequestActionModalOpen] = useState(false);
  const [requestActionMessage, setRequestActionMessage] = useState('');
  const [docRejectModalOpen, setDocRejectModalOpen] = useState(false);
  const [docRejectDocId, setDocRejectDocId] = useState('');
  const [docRejectReason, setDocRejectReason] = useState('');
  const [docReuploadModalOpen, setDocReuploadModalOpen] = useState(false);
  const [docReuploadDocId, setDocReuploadDocId] = useState('');
  const [docReuploadReason, setDocReuploadReason] = useState('');
  const [activateConfirmOpen, setActivateConfirmOpen] = useState(false);
  const [statusChangeDropdown, setStatusChangeDropdown] = useState(false);

  // Note form
  const [newNote, setNewNote] = useState('');
  const [noteVisibleToParent, setNoteVisibleToParent] = useState(false);

  // Blockers
  const [blockers, setBlockers] = useState<StatusBlocker[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/enrollment/applications/${applicationId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      const detail: ApplicationDetail = await res.json();
      setData(detail);

      // Compute blockers client-side from the data we have
      computeBlockers(detail);
    } catch (err: any) {
      setError(err.message || 'Failed to load application');
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const computeBlockers = (detail: ApplicationDetail) => {
    const b: StatusBlocker[] = [];
    const docs = detail.documents || [];

    // Missing required documents
    const hasPassport = docs.some(
      (d) => d.document_type === 'student_passport' && d.status !== 'missing' && d.status !== 'rejected',
    );
    const hasBirthCert = docs.some(
      (d) => d.document_type === 'birth_certificate' && d.status !== 'missing' && d.status !== 'rejected',
    );

    if (!hasPassport) {
      b.push({ type: 'missing_identity', message: 'Student passport is required', severity: 'error' });
    }
    if (!hasBirthCert) {
      b.push({ type: 'missing_identity', message: 'Birth certificate is required', severity: 'error' });
    }

    // Transfer cert for grade 2+
    if (detail.academic_details?.enrollment_type === 'transfer') {
      const hasTC = docs.some(
        (d) => d.document_type === 'transfer_certificate' && d.status !== 'missing' && d.status !== 'rejected',
      );
      if (!hasTC) {
        b.push({
          type: 'missing_transfer_certificate',
          message: 'Transfer certificate required for transfers',
          severity: 'error',
        });
      }
    }

    // Pending attestation/translation
    const pendingAttestation = docs.filter((d) => d.attestation_required && d.attestation_status === 'pending');
    if (pendingAttestation.length > 0) {
      b.push({
        type: 'pending_attestation',
        message: `${pendingAttestation.length} document(s) pending attestation`,
        severity: 'error',
      });
    }

    const pendingTranslation = docs.filter((d) => d.translation_required && d.translation_status === 'pending');
    if (pendingTranslation.length > 0) {
      b.push({
        type: 'pending_translation',
        message: `${pendingTranslation.length} document(s) pending translation`,
        severity: 'error',
      });
    }

    // No Emirates ID
    if (!detail.identity_details?.emirates_id_available) {
      b.push({
        type: 'no_emirates_id',
        message: 'No Emirates ID -- only provisional acceptance possible',
        severity: 'warning',
      });
    }

    // Custody case
    const hasCustody = detail.guardians?.some((g) => g.custody_case || g.is_legal_guardian);
    if (hasCustody) {
      const hasCustodyDoc = docs.some(
        (d) => d.document_type === 'custody_guardianship_document' && d.status !== 'missing' && d.status !== 'rejected',
      );
      if (!hasCustodyDoc) {
        b.push({
          type: 'missing_custody_document',
          message: 'Custody/guardianship document required',
          severity: 'error',
        });
      }
    }

    setBlockers(b);
  };

  // ── API Actions ────────────────────────────────────────────

  const callReviewAction = async (action: string, body: Record<string, any> = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/enrollment/applications/${applicationId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...body }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || result.message || 'Action failed');
        return false;
      }
      await fetchData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Action failed');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const callStatusChange = async (newStatus: string, reason?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/enrollment/applications/${applicationId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_status: newStatus, reason }),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || result.message || 'Status change failed');
        return false;
      }
      await fetchData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Status change failed');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = () => callReviewAction('approve');
  const handleProvisionalAccept = () => callReviewAction('provisional_accept');

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    const ok = await callReviewAction('reject', { reason: rejectReason });
    if (ok) {
      setRejectModalOpen(false);
      setRejectReason('');
    }
  };

  const handleRequestAction = async () => {
    if (!requestActionMessage.trim()) return;
    const ok = await callReviewAction('request_action', {
      reason: requestActionMessage,
      notes: requestActionMessage,
    });
    if (ok) {
      setRequestActionModalOpen(false);
      setRequestActionMessage('');
    }
  };

  const handleActivate = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/enrollment/applications/${applicationId}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const result = await res.json();
      if (!res.ok) {
        alert(result.error || 'Activation failed');
        return;
      }
      setActivateConfirmOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Activation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Document actions
  const handleVerifyDoc = (docId: string) => callReviewAction('verify_document', { document_id: docId });

  const handleRejectDoc = async () => {
    if (!docRejectReason.trim()) return;
    const ok = await callReviewAction('reject_document', {
      document_id: docRejectDocId,
      reason: docRejectReason,
    });
    if (ok) {
      setDocRejectModalOpen(false);
      setDocRejectDocId('');
      setDocRejectReason('');
    }
  };

  const handleReuploadDoc = async () => {
    const ok = await callReviewAction('request_reupload', {
      document_id: docReuploadDocId,
      reason: docReuploadReason,
    });
    if (ok) {
      setDocReuploadModalOpen(false);
      setDocReuploadDocId('');
      setDocReuploadReason('');
    }
  };

  const handleFlagAttestation = (docId: string) =>
    callReviewAction('flag_attestation', { document_id: docId });

  const handleFlagTranslation = (docId: string) =>
    callReviewAction('flag_translation', { document_id: docId });

  // Notes
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const ok = await callReviewAction('add_note', {
      notes: newNote,
      is_visible_to_parent: noteVisibleToParent,
    });
    if (ok) {
      setNewNote('');
      setNoteVisibleToParent(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingState message="Loading application..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <ErrorState message={error || 'Application not found'} onRetry={fetchData} />
      </div>
    );
  }

  const app = data.application;
  const hasBlockers = blockers.filter((b) => b.severity === 'error').length > 0;
  const canActivate = ['approved', 'provisionally_accepted'].includes(app.status);

  return (
    <div className="space-y-6 pb-24">
      {/* Back button */}
      <button
        onClick={() => router.push(withLocalePrefix('/admin/admissions', locale))}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admissions
      </button>

      {/* Header Card */}
      <ApplicationCard
        applicationNumber={app.application_number}
        studentName={data.student_details?.full_name_en || data.student_details?.full_name_ar || null}
        grade={data.academic_details?.applying_grade_name || null}
        status={app.status}
        enrollmentType={data.academic_details?.enrollment_type || null}
        completenessScore={app.completeness_score}
        submittedAt={app.submitted_at}
        locale={locale}
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-0 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'summary' && (
          <SummaryTab data={data} blockers={blockers} />
        )}
        {activeTab === 'student' && <StudentTab data={data} />}
        {activeTab === 'academic' && <AcademicTab data={data} />}
        {activeTab === 'guardian' && <GuardianTab data={data} />}
        {activeTab === 'identity' && <IdentityTab data={data} />}
        {activeTab === 'medical' && <MedicalTab data={data} />}
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={data.documents}
            onVerify={handleVerifyDoc}
            onReject={(docId) => {
              setDocRejectDocId(docId);
              setDocRejectModalOpen(true);
            }}
            onReupload={(docId) => {
              setDocReuploadDocId(docId);
              setDocReuploadModalOpen(true);
            }}
            onFlagAttestation={handleFlagAttestation}
            onFlagTranslation={handleFlagTranslation}
            actionLoading={actionLoading}
          />
        )}
        {activeTab === 'timeline' && <TimelineTab history={data.status_history} />}
        {activeTab === 'notes' && (
          <NotesTab
            notes={data.review_notes}
            newNote={newNote}
            setNewNote={setNewNote}
            visibleToParent={noteVisibleToParent}
            setVisibleToParent={setNoteVisibleToParent}
            onAddNote={handleAddNote}
            actionLoading={actionLoading}
          />
        )}
      </div>

      {/* Sticky Action Bar */}
      {app.status !== 'enrollment_activated' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
            {/* Left: Status Change */}
            <div className="relative">
              <button
                onClick={() => setStatusChangeDropdown(!statusChangeDropdown)}
                className="admin-btn admin-btn-ghost flex items-center gap-2 text-sm"
              >
                Change Status
                <ChevronDown className="w-4 h-4" />
              </button>
              {statusChangeDropdown && (
                <div className="absolute bottom-full mb-1 left-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="py-1 max-h-60 overflow-y-auto">
                    {getValidTransitions(app.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          callStatusChange(s, `Manual status change to ${s}`);
                          setStatusChangeDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                        disabled={actionLoading}
                      >
                        <AppStatusBadge status={s} />
                      </button>
                    ))}
                    {getValidTransitions(app.status).length === 0 && (
                      <p className="px-4 py-2 text-sm text-gray-400">No transitions available</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {!hasBlockers && !['approved', 'rejected', 'enrollment_activated'].includes(app.status) && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="admin-btn bg-green-600 text-white hover:bg-green-700 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  Approve
                </button>
              )}

              {!['provisionally_accepted', 'approved', 'rejected', 'enrollment_activated'].includes(app.status) && (
                <button
                  onClick={handleProvisionalAccept}
                  disabled={actionLoading}
                  className="admin-btn bg-amber-500 text-white hover:bg-amber-600 text-sm disabled:opacity-50"
                >
                  <Shield className="w-4 h-4 mr-1.5" />
                  Provisionally Accept
                </button>
              )}

              {!['rejected', 'enrollment_activated'].includes(app.status) && (
                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={actionLoading}
                  className="admin-btn bg-red-600 text-white hover:bg-red-700 text-sm disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Reject
                </button>
              )}

              {!['action_required', 'rejected', 'enrollment_activated'].includes(app.status) && (
                <button
                  onClick={() => setRequestActionModalOpen(true)}
                  disabled={actionLoading}
                  className="admin-btn bg-orange-500 text-white hover:bg-orange-600 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-1.5" />
                  Request Action
                </button>
              )}

              {canActivate && (
                <button
                  onClick={() => setActivateConfirmOpen(true)}
                  disabled={actionLoading}
                  className="admin-btn bg-teal-600 text-white hover:bg-teal-700 text-sm disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 mr-1.5" />
                  Activate Enrollment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Application"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setRejectModalOpen(false)} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading}
              className="admin-btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        }
      >
        <FormGroup>
          <FormLabel required>Rejection Reason</FormLabel>
          <FormTextarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={4}
          />
        </FormGroup>
      </Modal>

      <Modal
        isOpen={requestActionModalOpen}
        onClose={() => setRequestActionModalOpen(false)}
        title="Request Action from Parent"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setRequestActionModalOpen(false)} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleRequestAction}
              disabled={!requestActionMessage.trim() || actionLoading}
              className="admin-btn bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
            >
              Send Request
            </button>
          </div>
        }
      >
        <FormGroup>
          <FormLabel required>Message to Parent</FormLabel>
          <FormTextarea
            value={requestActionMessage}
            onChange={(e) => setRequestActionMessage(e.target.value)}
            placeholder="Describe what action is needed..."
            rows={4}
          />
        </FormGroup>
      </Modal>

      <Modal
        isOpen={docRejectModalOpen}
        onClose={() => setDocRejectModalOpen(false)}
        title="Reject Document"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDocRejectModalOpen(false)} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleRejectDoc}
              disabled={!docRejectReason.trim() || actionLoading}
              className="admin-btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              Reject Document
            </button>
          </div>
        }
      >
        <FormGroup>
          <FormLabel required>Rejection Reason</FormLabel>
          <FormTextarea
            value={docRejectReason}
            onChange={(e) => setDocRejectReason(e.target.value)}
            placeholder="Reason for rejecting this document..."
            rows={3}
          />
        </FormGroup>
      </Modal>

      <Modal
        isOpen={docReuploadModalOpen}
        onClose={() => setDocReuploadModalOpen(false)}
        title="Request Re-upload"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setDocReuploadModalOpen(false)} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleReuploadDoc}
              disabled={actionLoading}
              className="admin-btn bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
            >
              Request Re-upload
            </button>
          </div>
        }
      >
        <FormGroup>
          <FormLabel>Reason (optional)</FormLabel>
          <FormTextarea
            value={docReuploadReason}
            onChange={(e) => setDocReuploadReason(e.target.value)}
            placeholder="Why does this document need to be re-uploaded?"
            rows={3}
          />
        </FormGroup>
      </Modal>

      <Modal
        isOpen={activateConfirmOpen}
        onClose={() => setActivateConfirmOpen(false)}
        title="Activate Enrollment"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={() => setActivateConfirmOpen(false)} className="admin-btn admin-btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleActivate}
              disabled={actionLoading}
              className="admin-btn bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
            >
              Confirm Activation
            </button>
          </div>
        }
      >
        <p className="text-sm text-gray-600">
          This will create a student account, generate onboarding tasks, and mark the enrollment as activated.
          This action cannot be undone.
        </p>
        {app.status === 'provisionally_accepted' && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertTriangle className="w-4 h-4 inline mr-1" />
            This application is only provisionally accepted. Some requirements may still be pending.
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Valid Transitions Helper ─────────────────────────────────

function getValidTransitions(status: EnrollmentAppStatus): EnrollmentAppStatus[] {
  const VALID_TRANSITIONS: Record<EnrollmentAppStatus, EnrollmentAppStatus[]> = {
    draft: ['submitted'],
    submitted: ['under_review', 'incomplete', 'rejected'],
    incomplete: ['submitted'],
    pending_documents: ['under_review', 'action_required', 'rejected'],
    pending_verification: ['under_review', 'pending_documents', 'action_required', 'rejected'],
    under_review: [
      'pending_documents',
      'pending_verification',
      'pending_attestation',
      'pending_translation',
      'awaiting_transfer_certificate',
      'action_required',
      'provisionally_accepted',
      'approved',
      'rejected',
    ],
    pending_attestation: ['under_review', 'action_required', 'provisionally_accepted', 'rejected'],
    pending_translation: ['under_review', 'action_required', 'provisionally_accepted', 'rejected'],
    awaiting_transfer_certificate: ['under_review', 'provisionally_accepted', 'action_required', 'rejected'],
    action_required: ['submitted', 'under_review'],
    provisionally_accepted: ['approved', 'enrollment_activated', 'rejected'],
    approved: ['enrollment_activated', 'rejected'],
    rejected: ['submitted'],
    enrollment_activated: [],
  };
  return VALID_TRANSITIONS[status] || [];
}

// ── Info Field Component ─────────────────────────────────────

function InfoField({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  const displayValue =
    value === null || value === undefined || value === ''
      ? '--'
      : typeof value === 'boolean'
        ? value
          ? 'Yes'
          : 'No'
        : String(value);

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{displayValue}</p>
    </div>
  );
}

// ── Summary Tab ──────────────────────────────────────────────

function SummaryTab({ data, blockers }: { data: ApplicationDetail; blockers: StatusBlocker[] }) {
  const student = data.student_details;
  const academic = data.academic_details;
  const primaryGuardian = data.guardians?.find((g) => g.contact_type === 'primary') || data.guardians?.[0];

  return (
    <div className="space-y-6">
      {/* Blockers */}
      {blockers.length > 0 && (
        <div className="admin-card p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            Blockers ({blockers.length})
          </h3>
          <div className="space-y-2">
            {blockers.map((b, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded-lg text-sm ${
                  b.severity === 'error'
                    ? 'bg-red-50 text-red-700'
                    : b.severity === 'warning'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-blue-50 text-blue-700'
                }`}
              >
                {b.severity === 'error' ? (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{b.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4" />
            Student Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Full Name (EN)" value={student?.full_name_en} />
            <InfoField label="Full Name (AR)" value={student?.full_name_ar} />
            <InfoField label="Date of Birth" value={student?.date_of_birth} />
            <InfoField label="Nationality" value={student?.nationality} />
            <InfoField label="Gender" value={student?.gender} />
            <InfoField label="Religion" value={student?.religion} />
          </div>
        </div>

        {/* Academic Info */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Academic Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Grade" value={academic?.applying_grade_name} />
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment Type</p>
              <div className="mt-1">
                <EnrollmentTypeBadge type={academic?.enrollment_type || null} />
              </div>
            </div>
            <InfoField label="Academic Year" value={academic?.academic_year} />
            <InfoField label="Curriculum" value={academic?.curriculum} />
            {academic?.enrollment_type === 'transfer' && (
              <>
                <InfoField label="Previous School" value={academic?.previous_school_name} />
                <InfoField label="Transfer Source" value={academic?.transfer_source} />
              </>
            )}
          </div>
        </div>

        {/* Guardian Info */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Primary Contact
          </h3>
          {primaryGuardian ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Name" value={primaryGuardian.full_name_en || primaryGuardian.full_name_ar} />
              <InfoField label="Relationship" value={primaryGuardian.relationship} />
              <InfoField label="Mobile" value={primaryGuardian.mobile} />
              <InfoField label="Email" value={primaryGuardian.email} />
            </div>
          ) : (
            <p className="text-sm text-gray-400">No guardian details available</p>
          )}
        </div>

        {/* Identity Summary */}
        <div className="admin-card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Identity Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField label="Emirates ID" value={data.identity_details?.emirates_id_available ? 'Available' : 'Not Available'} />
            <InfoField label="Emirates ID #" value={data.identity_details?.emirates_id_number} />
            <InfoField label="Passport #" value={data.identity_details?.student_passport_number} />
            <InfoField label="Residency Status" value={data.identity_details?.residency_status} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Student Tab ──────────────────────────────────────────────

function StudentTab({ data }: { data: ApplicationDetail }) {
  const s = data.student_details;
  return (
    <div className="admin-card p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Student Personal Information</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField label="Full Name (English)" value={s?.full_name_en} />
        <InfoField label="Full Name (Arabic)" value={s?.full_name_ar} />
        <InfoField label="Date of Birth" value={s?.date_of_birth} />
        <InfoField label="Gender" value={s?.gender} />
        <InfoField label="Nationality" value={s?.nationality} />
        <InfoField label="Secondary Nationality" value={s?.secondary_nationality} />
        <InfoField label="Religion" value={s?.religion} />
        <InfoField label="Mother Tongue" value={s?.mother_tongue} />
        <InfoField label="Place of Birth" value={s?.place_of_birth} />
        <InfoField label="Preferred Language" value={s?.preferred_language} />
      </div>
    </div>
  );
}

// ── Academic Tab ─────────────────────────────────────────────

function AcademicTab({ data }: { data: ApplicationDetail }) {
  const a = data.academic_details;
  const isTransfer = a?.enrollment_type === 'transfer';

  return (
    <div className="space-y-6">
      <div className="admin-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Academic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Enrollment Type</p>
            <div className="mt-1">
              <EnrollmentTypeBadge type={a?.enrollment_type || null} />
            </div>
          </div>
          <InfoField label="Applying Grade" value={a?.applying_grade_name} />
          <InfoField label="Academic Year" value={a?.academic_year} />
          <InfoField label="Curriculum" value={a?.curriculum} />
        </div>
      </div>

      {isTransfer && (
        <div className="admin-card p-6 border-l-4 border-l-purple-500">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            Transfer Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Previous School" value={a?.previous_school_name} />
            <InfoField label="Previous School Country" value={a?.previous_school_country} />
            <InfoField label="Previous School Emirate" value={a?.previous_school_emirate} />
            <InfoField label="Previous Grade" value={a?.previous_grade_completed} />
            <InfoField label="Transfer Source" value={a?.transfer_source} />
            <InfoField label="Mid-Year Transfer" value={a?.is_mid_year_transfer} />
            <InfoField label="Last Report Card Year" value={a?.last_report_card_year} />
            <InfoField label="Transcript Available" value={a?.transcript_available} />
            <InfoField label="Transfer Certificate Available" value={a?.transfer_certificate_available} />
            <InfoField label="Transfer Reason" value={a?.transfer_reason} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Guardian Tab ─────────────────────────────────────────────

function GuardianTab({ data }: { data: ApplicationDetail }) {
  const guardians = data.guardians || [];

  if (guardians.length === 0) {
    return (
      <div className="admin-card p-6">
        <p className="text-sm text-gray-400">No guardian details available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {guardians.map((g, i) => (
        <div
          key={g.id}
          className={`admin-card p-6 ${g.custody_case || g.is_legal_guardian ? 'border-l-4 border-l-amber-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              {g.contact_type === 'primary'
                ? 'Primary Contact'
                : g.contact_type === 'emergency'
                  ? 'Emergency Contact'
                  : `Contact ${i + 1}`}
            </h3>
            <div className="flex gap-2">
              {g.is_legal_guardian && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Legal Guardian
                </span>
              )}
              {g.custody_case && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                  Custody Case
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoField label="Full Name (EN)" value={g.full_name_en} />
            <InfoField label="Full Name (AR)" value={g.full_name_ar} />
            <InfoField label="Relationship" value={g.relationship} />
            <InfoField label="Mobile" value={g.mobile} />
            <InfoField label="Email" value={g.email} />
            <InfoField label="UAE Address" value={g.uae_address} />
            <InfoField label="Emirate" value={g.emirate} />
            <InfoField label="Area/City" value={g.area_city_district} />
            <InfoField label="Emirates ID #" value={g.emirates_id_number} />
            <InfoField label="Passport #" value={g.passport_number} />
            <InfoField label="Visa #" value={g.visa_number} />
            {g.guardian_authorization_notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <InfoField label="Authorization Notes" value={g.guardian_authorization_notes} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Identity Tab ─────────────────────────────────────────────

function IdentityTab({ data }: { data: ApplicationDetail }) {
  const id = data.identity_details;

  return (
    <div className="admin-card p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Identity & Residency Details</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoField label="Emirates ID Available" value={id?.emirates_id_available} />
        <InfoField label="Emirates ID Number" value={id?.emirates_id_number} />
        <InfoField label="Passport Number" value={id?.student_passport_number} />
        <InfoField label="Passport Expiry" value={id?.student_passport_expiry} />
        <InfoField label="Visa Number" value={id?.residence_visa_number} />
        <InfoField label="Visa Expiry" value={id?.residence_visa_expiry} />
        <InfoField label="Residency Status" value={id?.residency_status} />
        <InfoField label="Country of Residence" value={id?.country_of_residence} />
      </div>
    </div>
  );
}

// ── Medical Tab ──────────────────────────────────────────────

function MedicalTab({ data }: { data: ApplicationDetail }) {
  const m = data.medical_details;

  return (
    <div className="space-y-6">
      <div className="admin-card p-4 bg-amber-50 border border-amber-200">
        <p className="text-sm text-amber-700 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Medical information is restricted. Handle with care and follow data protection policies.
        </p>
      </div>

      <div className="admin-card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Medical & Support Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Has Medical Condition" value={m?.has_medical_condition} />
          {m?.has_medical_condition && (
            <div className="sm:col-span-2">
              <InfoField label="Medical Condition Details" value={m?.medical_condition_details} />
            </div>
          )}
          <InfoField label="Has SEN" value={m?.has_sen} />
          {m?.has_sen && (
            <div className="sm:col-span-2">
              <InfoField label="SEN Details" value={m?.sen_details} />
            </div>
          )}
          <InfoField label="Vaccination Record Available" value={m?.vaccination_record_available} />
          <InfoField label="Allergies" value={m?.allergies} />
          <InfoField label="Medication Notes" value={m?.medication_notes} />
          {m?.health_notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InfoField label="Health Notes" value={m?.health_notes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Documents Tab ────────────────────────────────────────────

function DocumentsTab({
  documents,
  onVerify,
  onReject,
  onReupload,
  onFlagAttestation,
  onFlagTranslation,
  actionLoading,
}: {
  documents: EnrollmentDocument[];
  onVerify: (docId: string) => void;
  onReject: (docId: string) => void;
  onReupload: (docId: string) => void;
  onFlagAttestation: (docId: string) => void;
  onFlagTranslation: (docId: string) => void;
  actionLoading: boolean;
}) {
  if (documents.length === 0) {
    return (
      <div className="admin-card p-6">
        <p className="text-sm text-gray-400">No documents uploaded yet</p>
      </div>
    );
  }

  // Separate into uploaded vs missing
  const missingDocs = documents.filter((d) => d.status === 'missing');
  const uploadedDocs = documents.filter((d) => d.status !== 'missing');

  return (
    <div className="space-y-6">
      {/* Missing documents warning */}
      {missingDocs.length > 0 && (
        <div className="admin-card p-4 bg-red-50 border border-red-200">
          <h3 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Missing Documents ({missingDocs.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missingDocs.map((d) => (
              <span key={d.id} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                {d.label || d.document_type.replace(/_/g, ' ')}
                {d.is_required && ' *'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Document cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uploadedDocs.map((doc) => (
          <div key={doc.id} className="admin-card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {doc.label || doc.document_type.replace(/_/g, ' ')}
                </h4>
                {doc.file_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{doc.file_name}</p>
                )}
              </div>
              <DocStatusBadge status={doc.status} />
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
              {doc.last_uploaded_at && (
                <span>Uploaded: {new Date(doc.last_uploaded_at).toLocaleDateString()}</span>
              )}
              {doc.reviewed_at && (
                <span>Reviewed: {new Date(doc.reviewed_at).toLocaleDateString()}</span>
              )}
              {doc.upload_count > 1 && <span>Uploads: {doc.upload_count}</span>}
              {doc.rejection_reason && (
                <span className="col-span-2 text-red-600">Reason: {doc.rejection_reason}</span>
              )}
            </div>

            {/* Attestation/Translation indicators */}
            {(doc.attestation_required || doc.translation_required) && (
              <div className="flex flex-wrap gap-2 mb-3">
                {doc.attestation_required && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      doc.attestation_status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    Attestation: {doc.attestation_status}
                  </span>
                )}
                {doc.translation_required && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      doc.translation_status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    Translation: {doc.translation_status}
                  </span>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              {doc.file_url && (
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-ghost text-xs flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  View/Download
                </a>
              )}
              {doc.status !== 'verified' && (
                <button
                  onClick={() => onVerify(doc.id)}
                  disabled={actionLoading}
                  className="admin-btn admin-btn-ghost text-xs text-green-600 hover:bg-green-50 flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verify
                </button>
              )}
              <button
                onClick={() => onReject(doc.id)}
                disabled={actionLoading}
                className="admin-btn admin-btn-ghost text-xs text-red-600 hover:bg-red-50 flex items-center gap-1 disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" />
                Reject
              </button>
              <button
                onClick={() => onReupload(doc.id)}
                disabled={actionLoading}
                className="admin-btn admin-btn-ghost text-xs text-amber-600 hover:bg-amber-50 flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                Re-upload
              </button>
              <button
                onClick={() => onFlagAttestation(doc.id)}
                disabled={actionLoading}
                className="admin-btn admin-btn-ghost text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-1 disabled:opacity-50"
              >
                <Stamp className="w-3 h-3" />
                Attestation
              </button>
              <button
                onClick={() => onFlagTranslation(doc.id)}
                disabled={actionLoading}
                className="admin-btn admin-btn-ghost text-xs text-orange-600 hover:bg-orange-50 flex items-center gap-1 disabled:opacity-50"
              >
                <Languages className="w-3 h-3" />
                Translation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Timeline Tab ─────────────────────────────────────────────

function TimelineTab({ history }: { history: EnrollmentStatusHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="admin-card p-6">
        <p className="text-sm text-gray-400">No status history available</p>
      </div>
    );
  }

  return (
    <div className="admin-card p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">Status History</h3>
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {history.map((entry, i) => (
            <div key={entry.id} className="relative flex items-start gap-4 pl-2">
              {/* Dot */}
              <div
                className={`relative z-10 w-5 h-5 rounded-full border-2 flex-shrink-0 ${
                  i === 0
                    ? 'bg-blue-600 border-blue-600'
                    : 'bg-white border-gray-300'
                }`}
              />

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {entry.previous_status && (
                    <>
                      <AppStatusBadge status={entry.previous_status} />
                      <span className="text-gray-400 text-xs">-&gt;</span>
                    </>
                  )}
                  <AppStatusBadge status={entry.new_status} />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.created_at).toLocaleString()}
                  {entry.changed_by && (
                    <span className="ml-2">by {entry.changed_by}</span>
                  )}
                </p>
                {entry.reason && (
                  <p className="text-sm text-gray-600 mt-1">{entry.reason}</p>
                )}
                {entry.notes && (
                  <p className="text-sm text-gray-500 mt-0.5 italic">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notes Tab ────────────────────────────────────────────────

function NotesTab({
  notes,
  newNote,
  setNewNote,
  visibleToParent,
  setVisibleToParent,
  onAddNote,
  actionLoading,
}: {
  notes: EnrollmentReviewNote[];
  newNote: string;
  setNewNote: (v: string) => void;
  visibleToParent: boolean;
  setVisibleToParent: (v: boolean) => void;
  onAddNote: () => void;
  actionLoading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Add Note Form */}
      <div className="admin-card p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Note</h3>
        <FormTextarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a review note..."
          rows={3}
        />
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={visibleToParent}
              onChange={(e) => setVisibleToParent(e.target.checked)}
              className="rounded border-gray-300"
            />
            Visible to parent
          </label>
          <button
            onClick={onAddNote}
            disabled={!newNote.trim() || actionLoading}
            className="admin-btn bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-50"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="admin-card p-6">
          <p className="text-sm text-gray-400">No notes yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="admin-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                    {note.note_type}
                  </span>
                  {note.is_visible_to_parent ? (
                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      Parent-visible
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                      Internal
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
