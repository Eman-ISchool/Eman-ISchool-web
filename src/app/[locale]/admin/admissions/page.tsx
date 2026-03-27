'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import {
  Search,
  Eye,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/admin/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '@/components/admin/StateComponents';
import { AppStatusBadge, EnrollmentTypeBadge } from '@/components/admin/admissions/StatusBadge';
import { withLocalePrefix } from '@/lib/locale-path';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import type { ApplicationSummary } from '@/types/enrollment';

// ── Status filter options ────────────────────────────────────

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'pending_documents', label: 'Pending Documents' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'pending_attestation', label: 'Pending Attestation' },
  { value: 'pending_translation', label: 'Pending Translation' },
  { value: 'awaiting_transfer_certificate', label: 'Awaiting Transfer Certificate' },
  { value: 'action_required', label: 'Action Required' },
  { value: 'provisionally_accepted', label: 'Provisionally Accepted' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'enrollment_activated', label: 'Enrollment Activated' },
];

const TRANSFER_SOURCE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'egypt', label: 'Egypt' },
  { value: 'another_uae_emirate', label: 'Another UAE Emirate' },
  { value: 'gcc_country', label: 'GCC Country' },
  { value: 'outside_uae_gcc', label: 'Outside UAE/GCC' },
  { value: 'same_emirate', label: 'Same Emirate' },
];

const PAGE_SIZE = 15;

// ── Stats Card ───────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="admin-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdmissionsPage() {
  const router = useRouter();
  const locale = useLocale();

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [transferSourceFilter, setTransferSourceFilter] = useState('');
  const [academicYearFilter, setAcademicYearFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProvisionalOnly, setShowProvisionalOnly] = useState(false);
  const [showPendingAttestation, setShowPendingAttestation] = useState(false);
  const [showPendingTranslation, setShowPendingTranslation] = useState(false);
  const [showMissingDocs, setShowMissingDocs] = useState(false);

  // Data
  const [applications, setApplications] = useState<ApplicationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Stats (computed from all data or separate fetch)
  const [stats, setStats] = useState({
    total: 0,
    pending_review: 0,
    provisionally_accepted: 0,
    approved: 0,
    rejected: 0,
  });

  // Grades list for filter (fetch once)
  const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);

  const fetchGrades = useCallback(async () => {
    try {
      const res = await fetch('/api/grades');
      const data = await res.json();
      if (data.grades) {
        setGrades(data.grades);
      }
    } catch {
      // Non-critical
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (gradeFilter) params.set('grade', gradeFilter);
      if (transferSourceFilter) params.set('transfer_source', transferSourceFilter);
      if (academicYearFilter) params.set('academic_year', academicYearFilter);
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));

      const res = await fetch(`/api/enrollment/applications?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      let apps: ApplicationSummary[] = data.applications || [];

      // Client-side filters for toggles and search
      if (showProvisionalOnly) {
        apps = apps.filter((a) => a.status === 'provisionally_accepted');
      }
      if (showPendingAttestation) {
        apps = apps.filter((a) => a.status === 'pending_attestation');
      }
      if (showPendingTranslation) {
        apps = apps.filter((a) => a.status === 'pending_translation');
      }
      if (showMissingDocs) {
        apps = apps.filter((a) => a.status === 'pending_documents');
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        apps = apps.filter(
          (a) =>
            (a.student_name_en && a.student_name_en.toLowerCase().includes(q)) ||
            (a.student_name_ar && a.student_name_ar.includes(q)) ||
            a.application_number.toLowerCase().includes(q),
        );
      }

      setApplications(apps);
      setTotalCount(data.meta?.total || 0);
      setTotalPages(data.meta?.totalPages || 1);

      // Compute stats from unfiltered total
      setStats({
        total: data.meta?.total || 0,
        pending_review: apps.filter((a) =>
          ['submitted', 'under_review', 'pending_documents', 'pending_verification'].includes(a.status),
        ).length,
        provisionally_accepted: apps.filter((a) => a.status === 'provisionally_accepted').length,
        approved: apps.filter((a) => a.status === 'approved' || a.status === 'enrollment_activated').length,
        rejected: apps.filter((a) => a.status === 'rejected').length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter,
    gradeFilter,
    transferSourceFilter,
    academicYearFilter,
    page,
    showProvisionalOnly,
    showPendingAttestation,
    showPendingTranslation,
    showMissingDocs,
    searchQuery,
  ]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, gradeFilter, transferSourceFilter, academicYearFilter, searchQuery, showProvisionalOnly, showPendingAttestation, showPendingTranslation, showMissingDocs]);

  const handleRowClick = (app: ApplicationSummary) => {
    router.push(withLocalePrefix(`/admin/admissions/${app.id}`, locale));
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title={locale === 'ar' ? 'إدارة القبول' : 'Admissions Management'} />
        <ErrorState message={error} onRetry={fetchApplications} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={locale === 'ar' ? 'إدارة القبول' : 'Admissions Management'}
        subtitle={locale === 'ar' ? 'مراجعة وإدارة طلبات القبول' : 'Review and manage enrollment applications'}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Applications"
          value={stats.total}
          icon={<Users className="w-5 h-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Pending Review"
          value={stats.pending_review}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
        <StatCard
          label="Provisional"
          value={stats.provisionally_accepted}
          icon={<ShieldCheck className="w-5 h-5 text-yellow-600" />}
          color="bg-yellow-50"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          icon={<CheckCircle className="w-5 h-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={<XCircle className="w-5 h-5 text-red-600" />}
          color="bg-red-50"
        />
      </div>

      {/* Filter Bar */}
      <div className="admin-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2 xl:col-span-1">
            <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or app #..."
              className="admin-input pl-10 rtl:pl-3 rtl:pr-10"
            />
          </div>

          {/* Status */}
          <select
            className="admin-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Grade */}
          <select
            className="admin-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
          >
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Transfer Source */}
          <select
            className="admin-select"
            value={transferSourceFilter}
            onChange={(e) => setTransferSourceFilter(e.target.value)}
          >
            {TRANSFER_SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Academic Year */}
          <input
            type="text"
            value={academicYearFilter}
            onChange={(e) => setAcademicYearFilter(e.target.value)}
            placeholder="Academic Year (e.g. 2026-2027)"
            className="admin-input"
          />
        </div>

        {/* Toggle Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
          <ToggleChip
            label="Provisional Cases"
            active={showProvisionalOnly}
            onClick={() => setShowProvisionalOnly(!showProvisionalOnly)}
          />
          <ToggleChip
            label="Pending Attestation"
            active={showPendingAttestation}
            onClick={() => setShowPendingAttestation(!showPendingAttestation)}
          />
          <ToggleChip
            label="Pending Translation"
            active={showPendingTranslation}
            onClick={() => setShowPendingTranslation(!showPendingTranslation)}
          />
          <ToggleChip
            label="Missing Documents"
            active={showMissingDocs}
            onClick={() => setShowMissingDocs(!showMissingDocs)}
          />
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <LoadingState message="Loading applications..." />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          message="No enrollment applications match the current filters."
        />
      ) : (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Application #</th>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Completeness</th>
                  <th>Submitted</th>
                  <th className="admin-table-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => handleRowClick(app)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <span className="font-mono text-sm text-gray-900">
                        {app.application_number}
                      </span>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-gray-900">
                          {app.student_name_en || app.student_name_ar || '--'}
                        </p>
                        {app.student_name_ar && app.student_name_en && (
                          <p className="text-xs text-gray-500">{app.student_name_ar}</p>
                        )}
                      </div>
                    </td>
                    <td>{app.applying_grade_name || '--'}</td>
                    <td>
                      <EnrollmentTypeBadge type={app.enrollment_type} />
                    </td>
                    <td>
                      <AppStatusBadge status={app.status} locale={locale} />
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              app.completeness_score >= 80
                                ? 'bg-green-500'
                                : app.completeness_score >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${app.completeness_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{app.completeness_score}%</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-500">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : '--'}
                    </td>
                    <td className="admin-table-actions">
                      <div className="admin-table-actions-inner">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(app);
                          }}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} ({totalCount} total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="admin-btn admin-btn-ghost admin-btn-icon disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Toggle Chip ──────────────────────────────────────────────

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}
