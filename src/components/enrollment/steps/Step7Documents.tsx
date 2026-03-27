'use client';

import { useCallback } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import DocumentUploadCard from '../DocumentUploadCard';
import { getRequiredDocuments } from '@/lib/enrollment/document-rules';
import type {
  AcademicFormData,
  IdentityFormData,
  GuardianFormData,
  MedicalFormData,
  EnrollmentDocument,
  EnrollmentDocType,
} from '@/types/enrollment';

interface Step7DocumentsProps {
  locale: string;
  applicationId?: string;
  documents: EnrollmentDocument[];
  academicData: AcademicFormData;
  identityData: IdentityFormData;
  guardians: GuardianFormData[];
  medicalData: MedicalFormData;
  onDocumentsChange: (docs: EnrollmentDocument[]) => void;
  readOnly: boolean;
}

export default function Step7Documents({
  locale,
  applicationId,
  documents,
  academicData,
  identityData,
  guardians,
  medicalData,
  onDocumentsChange,
  readOnly,
}: Step7DocumentsProps) {
  const isRTL = locale === 'ar';

  // Compute required documents from business rules
  const requiredDocs = getRequiredDocuments(
    {
      enrollment_type: academicData.enrollment_type,
      applying_grade_name: academicData.applying_grade_name,
      transfer_source: academicData.transfer_source || null,
    } as any,
    {
      emirates_id_available: identityData.emirates_id_available,
      country_of_residence: identityData.country_of_residence,
      residence_visa_number: identityData.residence_visa_number || null,
    } as any,
    guardians.map((g) => ({
      ...g,
      id: '',
      application_id: '',
      created_at: '',
      updated_at: '',
    })) as any,
    {
      has_medical_condition: medicalData.has_medical_condition,
      has_sen: medicalData.has_sen,
    } as any,
  );

  // Find existing document record by type
  const findDoc = useCallback(
    (docType: EnrollmentDocType): EnrollmentDocument | undefined => {
      return documents.find((d) => d.document_type === docType);
    },
    [documents],
  );

  // Handle file upload
  const handleUpload = useCallback(
    async (docType: EnrollmentDocType, file: File) => {
      if (!applicationId) return;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', docType);

      const res = await fetch(
        `/api/enrollment/applications/${applicationId}/documents`,
        {
          method: 'POST',
          body: formData,
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Upload failed');
      }

      const result = await res.json();

      // Update document list
      const existingIdx = documents.findIndex(
        (d) => d.document_type === docType,
      );
      const updatedDocs = [...documents];
      if (existingIdx >= 0) {
        updatedDocs[existingIdx] = result.document;
      } else {
        updatedDocs.push(result.document);
      }
      onDocumentsChange(updatedDocs);
    },
    [applicationId, documents, onDocumentsChange],
  );

  // Count missing required docs
  const missingRequired = requiredDocs.filter((req) => {
    if (!req.isRequired) return false;
    const doc = findDoc(req.docType);
    return (
      !doc ||
      doc.status === 'missing' ||
      doc.status === 'rejected' ||
      doc.status === 're_upload_requested'
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-primary" />
          {isRTL ? 'رفع المستندات' : 'Document Uploads'}
        </h2>
        <p className="text-gray-500 mt-1">
          {isRTL
            ? 'ارفع المستندات المطلوبة. الملفات المقبولة: PDF, JPG, JPEG, PNG (حد 20 ميجابايت).'
            : 'Upload the required documents. Accepted: PDF, JPG, JPEG, PNG (max 20MB).'}
        </p>
      </div>

      {/* Missing items warning */}
      {missingRequired.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {isRTL
                ? `${missingRequired.length} مستند(ات) مطلوبة مفقودة`
                : `${missingRequired.length} required document(s) missing`}
            </p>
            <ul className="mt-1 list-disc list-inside text-xs text-red-700 space-y-0.5">
              {missingRequired.map((req) => (
                <li key={req.docType}>{req.label}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* No applicationId warning */}
      {!applicationId && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          {isRTL
            ? 'يرجى حفظ الطلب أولا قبل رفع المستندات.'
            : 'Please save the application first before uploading documents.'}
        </div>
      )}

      {/* Document cards */}
      <div className="space-y-4">
        {requiredDocs.map((req) => {
          const doc = findDoc(req.docType);
          return (
            <DocumentUploadCard
              key={req.docType}
              label={req.label}
              isRequired={req.isRequired}
              status={doc?.status || 'missing'}
              fileName={doc?.file_name}
              fileSize={doc?.file_size}
              fileUrl={doc?.file_url}
              rejectionReason={doc?.rejection_reason}
              uploadDate={doc?.last_uploaded_at}
              onUpload={(file) => handleUpload(req.docType, file)}
              readOnly={readOnly || !applicationId}
              locale={locale}
            />
          );
        })}
      </div>

      {/* File rules */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">
          {isRTL ? 'ملاحظات هامة' : 'Important Notes'}
        </h4>
        <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
          <li>
            {isRTL
              ? 'الملفات المقبولة: PDF, JPG, JPEG, PNG'
              : 'Accepted file types: PDF, JPG, JPEG, PNG'}
          </li>
          <li>
            {isRTL
              ? 'الحد الأقصى لحجم الملف: 20 ميجابايت'
              : 'Maximum file size: 20MB'}
          </li>
          <li>
            {isRTL
              ? 'تأكد من وضوح المستندات وقابليتها للقراءة'
              : 'Ensure documents are clear and legible'}
          </li>
          <li>
            {isRTL
              ? 'المستندات غير المكتملة قد تؤخر معالجة الطلب'
              : 'Incomplete documents may delay application processing'}
          </li>
        </ul>
      </div>
    </div>
  );
}
