'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import {
    FileText,
    CheckCircle2,
    Clock,
    XCircle,
    Upload,
    Download,
    AlertTriangle,
    Shield,
    Loader2,
    RefreshCw,
} from 'lucide-react';
import { getLocaleFromPathname } from '@/lib/locale-path';
import type { EnrollmentDocument, EnrollmentDocStatus, EnrollmentDocType } from '@/types/enrollment';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_STATUS_LABELS } from '@/types/enrollment';
import { DataState, createIdleState, createLoadingState, createErrorState, createSuccessState } from '@/types/page-state';

// --------------------------------------------------------------------------
// Status color helpers
// --------------------------------------------------------------------------

const DOC_STATUS_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    verified: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    uploaded: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    pending_review: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    pending_attestation: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    pending_translation: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    rejected: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    re_upload_requested: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: <RefreshCw className="w-3.5 h-3.5" />,
    },
    missing: {
        bg: 'bg-slate-50',
        text: 'text-slate-500',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    expired: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
};

function getDocStatusStyle(status: EnrollmentDocStatus) {
    return DOC_STATUS_STYLES[status] || DOC_STATUS_STYLES.missing;
}

// --------------------------------------------------------------------------
// Document categories
// --------------------------------------------------------------------------

const CATEGORY_ORDER = [
    { key: 'student_identity', label: 'Student Identity', labelAr: 'هوية الطالب', types: ['student_photo', 'student_passport', 'student_emirates_id', 'student_visa', 'birth_certificate'] },
    { key: 'parent_identity', label: 'Parent / Guardian Identity', labelAr: 'هوية ولي الأمر', types: ['parent_emirates_id', 'parent_passport', 'parent_visa', 'custody_guardianship_document'] },
    { key: 'academic', label: 'Academic Records', labelAr: 'السجلات الأكاديمية', types: ['last_report_card', 'academic_transcript', 'transfer_certificate'] },
    { key: 'medical', label: 'Medical & Health', labelAr: 'الطبي والصحي', types: ['vaccination_record', 'medical_report', 'sen_support_document'] },
    { key: 'other', label: 'Other Documents', labelAr: 'مستندات أخرى', types: ['translation_upload', 'additional_supporting_document', 'undertaking_letter'] },
];

const SENSITIVE_DOC_TYPES: EnrollmentDocType[] = ['medical_report', 'sen_support_document', 'custody_guardianship_document'];

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// --------------------------------------------------------------------------
// Mock data
// --------------------------------------------------------------------------

const MOCK_DOCUMENTS: EnrollmentDocument[] = [
    {
        id: 'd1', application_id: 'app-001', document_type: 'student_photo', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/photo.jpg', file_name: 'student_photo.jpg', file_size: 245000, file_mime_type: 'image/jpeg', storage_path: null,
        status: 'verified',
        reviewed_by: 'admin-1', reviewed_at: new Date(Date.now() - 3 * 86400000).toISOString(), rejection_reason: null,
        issuing_country: null, document_language: null, attestation_required: false, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 7 * 86400000).toISOString(), expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd2', application_id: 'app-001', document_type: 'student_passport', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/passport.pdf', file_name: 'passport_scan.pdf', file_size: 1200000, file_mime_type: 'application/pdf', storage_path: null,
        status: 'verified',
        reviewed_by: 'admin-1', reviewed_at: new Date(Date.now() - 3 * 86400000).toISOString(), rejection_reason: null,
        issuing_country: 'EG', document_language: 'ar', attestation_required: false, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 7 * 86400000).toISOString(), expiry_date: '2028-06-15',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd3', application_id: 'app-001', document_type: 'student_emirates_id', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: null, file_name: null, file_size: null, file_mime_type: null, storage_path: null,
        status: 'missing',
        reviewed_by: null, reviewed_at: null, rejection_reason: null,
        issuing_country: null, document_language: null, attestation_required: false, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 0, last_uploaded_at: null, expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd4', application_id: 'app-001', document_type: 'birth_certificate', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/birth_cert.pdf', file_name: 'birth_certificate.pdf', file_size: 800000, file_mime_type: 'application/pdf', storage_path: null,
        status: 'pending_attestation',
        reviewed_by: null, reviewed_at: null, rejection_reason: null,
        issuing_country: 'EG', document_language: 'ar', attestation_required: true, attestation_status: 'pending', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 5 * 86400000).toISOString(), expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd5', application_id: 'app-001', document_type: 'vaccination_record', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/vax.pdf', file_name: 'vaccination_record.pdf', file_size: 500000, file_mime_type: 'application/pdf', storage_path: null,
        status: 'pending_review',
        reviewed_by: null, reviewed_at: null, rejection_reason: null,
        issuing_country: null, document_language: null, attestation_required: false, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 2 * 86400000).toISOString(), expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd6', application_id: 'app-001', document_type: 'last_report_card', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/report.pdf', file_name: 'last_report_card.pdf', file_size: 950000, file_mime_type: 'application/pdf', storage_path: null,
        status: 'rejected',
        reviewed_by: 'admin-1', reviewed_at: new Date(Date.now() - 1 * 86400000).toISOString(), rejection_reason: 'Document is blurry and unreadable. Please upload a clearer scan.',
        issuing_country: 'EG', document_language: 'ar', attestation_required: false, attestation_status: 'not_required', translation_required: true, translation_status: 'pending',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 4 * 86400000).toISOString(), expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd7', application_id: 'app-001', document_type: 'transfer_certificate', label: null,
        is_required: true, is_conditional: true, condition_rule: 'enrollment_type === transfer',
        file_url: null, file_name: null, file_size: null, file_mime_type: null, storage_path: null,
        status: 'missing',
        reviewed_by: null, reviewed_at: null, rejection_reason: null,
        issuing_country: null, document_language: null, attestation_required: true, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 0, last_uploaded_at: null, expiry_date: null,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
        id: 'd8', application_id: 'app-001', document_type: 'parent_emirates_id', label: null,
        is_required: true, is_conditional: false, condition_rule: null,
        file_url: '/files/parent_eid.pdf', file_name: 'parent_eid.pdf', file_size: 300000, file_mime_type: 'application/pdf', storage_path: null,
        status: 'verified',
        reviewed_by: 'admin-1', reviewed_at: new Date(Date.now() - 3 * 86400000).toISOString(), rejection_reason: null,
        issuing_country: null, document_language: null, attestation_required: false, attestation_status: 'not_required', translation_required: false, translation_status: 'not_required',
        translation_document_id: null, upload_count: 1, last_uploaded_at: new Date(Date.now() - 7 * 86400000).toISOString(), expiry_date: '2027-12-01',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
];

// --------------------------------------------------------------------------
// Page Component
// --------------------------------------------------------------------------

export default function StudentDocumentsPage() {
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const isAr = locale === 'ar';

    const [state, setState] = useState<DataState<EnrollmentDocument[]>>(createIdleState());
    const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [targetDocId, setTargetDocId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setState(createLoadingState());
        try {
            // In production: GET /api/enrollment/applications/[id]/documents
            await new Promise((resolve) => setTimeout(resolve, 500));
            setState(createSuccessState(MOCK_DOCUMENTS));
        } catch {
            setState(createErrorState('Failed to load documents', () => fetchData()));
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const validateFile = (file: File): string | null => {
        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return isAr
                ? 'نوع الملف غير مدعوم. يرجى تحميل PDF أو JPG أو PNG.'
                : 'Unsupported file type. Please upload PDF, JPG, or PNG.';
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return isAr
                ? `حجم الملف يتجاوز ${MAX_FILE_SIZE_MB} ميجابايت.`
                : `File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`;
        }
        return null;
    };

    const handleUploadClick = (docId: string) => {
        setUploadError(null);
        setTargetDocId(docId);
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !targetDocId || state.status !== 'success') return;

        const validationError = validateFile(file);
        if (validationError) {
            setUploadError(validationError);
            e.target.value = '';
            return;
        }

        setUploadingDocId(targetDocId);
        setUploadError(null);

        try {
            // In production: POST to upload endpoint, then update document status
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setState(
                createSuccessState(
                    state.data.map((doc) =>
                        doc.id === targetDocId
                            ? {
                                  ...doc,
                                  status: 'pending_review' as EnrollmentDocStatus,
                                  file_url: `/files/${file.name}`,
                                  file_name: file.name,
                                  file_size: file.size,
                                  file_mime_type: file.type,
                                  upload_count: doc.upload_count + 1,
                                  last_uploaded_at: new Date().toISOString(),
                                  rejection_reason: null,
                              }
                            : doc
                    )
                )
            );
        } catch {
            setUploadError(isAr ? 'فشل التحميل. حاول مرة أخرى.' : 'Upload failed. Please try again.');
        } finally {
            setUploadingDocId(null);
            setTargetDocId(null);
            e.target.value = '';
        }
    };

    // Group documents by category
    const groupDocsByCategory = (docs: EnrollmentDocument[]) => {
        const grouped: { key: string; label: string; docs: EnrollmentDocument[] }[] = [];
        for (const cat of CATEGORY_ORDER) {
            const catDocs = docs.filter((d) => cat.types.includes(d.document_type));
            if (catDocs.length > 0) {
                grouped.push({
                    key: cat.key,
                    label: isAr ? cat.labelAr : cat.label,
                    docs: catDocs,
                });
            }
        }
        return grouped;
    };

    if (state.status === 'loading' || state.status === 'idle') {
        return (
            <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse bg-teal-100/70 rounded-xl" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 animate-pulse bg-teal-100/70 rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (state.status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <p className="text-slate-500">{state.message}</p>
                <button
                    onClick={state.retryFn}
                    className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-xl hover:bg-teal-700 transition-colors"
                >
                    {isAr ? 'حاول مرة أخرى' : 'Try Again'}
                </button>
            </div>
        );
    }

    if (state.status !== 'success') return null;
    const documents = state.data;
    const categories = groupDocsByCategory(documents);
    const needsUpload = documents.filter(
        (d: EnrollmentDocument) => d.status === 'missing' || d.status === 'rejected' || d.status === 're_upload_requested'
    );

    return (
        <div className={`space-y-6 pb-8 ${isAr ? 'rtl' : 'ltr'}`}>
            {/* Hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
            />

            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-slate-800">
                    {isAr ? 'مركز المستندات' : 'Documents Center'}
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    {isAr ? 'إدارة وتتبع مستندات التسجيل' : 'Manage and track your enrollment documents'}
                </p>
            </div>

            {/* Upload error banner */}
            {uploadError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                    <span className="text-sm text-red-700">{uploadError}</span>
                    <button
                        onClick={() => setUploadError(null)}
                        className="ml-auto text-red-400 hover:text-red-600 text-sm font-bold"
                    >
                        &times;
                    </button>
                </div>
            )}

            {/* Upload needed banner */}
            {needsUpload.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                    <Upload className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800">
                            {isAr
                                ? `${needsUpload.length} مستند${needsUpload.length > 1 ? 'ات' : ''} بحاجة للرفع`
                                : `${needsUpload.length} document${needsUpload.length !== 1 ? 's' : ''} need${needsUpload.length === 1 ? 's' : ''} uploading`}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                            {isAr
                                ? 'يرجى تحميل المستندات المطلوبة لإكمال طلبك.'
                                : 'Please upload the required documents to complete your application.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Document Grid by Category */}
            {categories.map((cat) => (
                <section key={cat.key}>
                    <h2 className="text-sm font-semibold text-slate-700 mb-3">{cat.label}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {cat.docs.map((doc) => {
                            const style = getDocStatusStyle(doc.status);
                            const isSensitive = SENSITIVE_DOC_TYPES.includes(doc.document_type);
                            const canUpload =
                                doc.status === 'missing' || doc.status === 'rejected' || doc.status === 're_upload_requested';
                            const isUploading = uploadingDocId === doc.id;

                            return (
                                <div
                                    key={doc.id}
                                    className={`rounded-xl border border-slate-200 bg-white p-4 space-y-3 ${
                                        canUpload ? 'ring-1 ring-amber-200' : ''
                                    }`}
                                >
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                                            <span className="text-sm font-medium text-slate-800 truncate">
                                                {DOCUMENT_TYPE_LABELS[doc.document_type]}
                                            </span>
                                        </div>
                                        {isSensitive && (
                                            <span title="Restricted access">
                                                <Shield className="w-4 h-4 text-slate-400 shrink-0" />
                                            </span>
                                        )}
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center gap-1.5">
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${style.bg} ${style.text}`}
                                        >
                                            {style.icon}
                                            {DOCUMENT_STATUS_LABELS[doc.status]}
                                        </span>
                                        {doc.is_required && (
                                            <span className="text-[10px] font-bold text-red-500">Required</span>
                                        )}
                                    </div>

                                    {/* Upload date */}
                                    {doc.last_uploaded_at && (
                                        <p className="text-[11px] text-slate-400">
                                            {isAr ? 'تم الرفع:' : 'Uploaded:'}{' '}
                                            {new Date(doc.last_uploaded_at).toLocaleDateString(
                                                isAr ? 'ar-AE' : 'en-US',
                                                { month: 'short', day: 'numeric', year: 'numeric' }
                                            )}
                                        </p>
                                    )}

                                    {/* Rejection reason */}
                                    {doc.status === 'rejected' && doc.rejection_reason && (
                                        <div className="rounded-lg bg-red-50 border border-red-100 p-2">
                                            <p className="text-[11px] text-red-600">
                                                <span className="font-semibold">{isAr ? 'السبب:' : 'Reason:'}</span>{' '}
                                                {doc.rejection_reason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Attestation/Translation status */}
                                    {(doc.attestation_required && doc.attestation_status === 'pending') && (
                                        <p className="text-[11px] text-amber-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {isAr ? 'بانتظار التصديق' : 'Awaiting attestation'}
                                        </p>
                                    )}
                                    {(doc.translation_required && doc.translation_status === 'pending') && (
                                        <p className="text-[11px] text-amber-600 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {isAr ? 'بانتظار الترجمة' : 'Awaiting translation'}
                                        </p>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 pt-1">
                                        {canUpload && (
                                            <button
                                                onClick={() => handleUploadClick(doc.id)}
                                                disabled={isUploading}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                                            >
                                                {isUploading ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Upload className="w-3.5 h-3.5" />
                                                )}
                                                {doc.status === 'rejected' || doc.status === 're_upload_requested'
                                                    ? isAr ? 'إعادة الرفع' : 'Re-upload'
                                                    : isAr ? 'رفع' : 'Upload'}
                                            </button>
                                        )}
                                        {doc.file_url && doc.status !== 'missing' && (
                                            <button
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                            >
                                                <Download className="w-3.5 h-3.5" />
                                                {isAr ? 'تحميل' : 'Download'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            ))}

            {/* File type info */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-500">
                    {isAr
                        ? `الملفات المدعومة: PDF، JPG، PNG. الحد الأقصى لحجم الملف: ${MAX_FILE_SIZE_MB} ميجابايت.`
                        : `Supported files: PDF, JPG, PNG. Maximum file size: ${MAX_FILE_SIZE_MB}MB.`}
                </p>
            </div>
        </div>
    );
}
