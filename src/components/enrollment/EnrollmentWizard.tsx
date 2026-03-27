'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Save,
  AlertCircle,
} from 'lucide-react';
import type {
  StudentPersonalFormData,
  AcademicFormData,
  GuardianFormData,
  IdentityFormData,
  MedicalFormData,
  DeclarationsFormData,
  EnrollmentDocument,
  EnrollmentStatusHistory,
  EnrollmentAppStatus,
} from '@/types/enrollment';

import Step1Start from './steps/Step1Start';
import Step2StudentInfo from './steps/Step2StudentInfo';
import Step3AcademicInfo from './steps/Step3AcademicInfo';
import Step4GuardianInfo from './steps/Step4GuardianInfo';
import Step5IdentityInfo from './steps/Step5IdentityInfo';
import Step6MedicalInfo from './steps/Step6MedicalInfo';
import Step7Documents from './steps/Step7Documents';
import Step8Review from './steps/Step8Review';
import Step9Submit from './steps/Step9Submit';
import Step10Status from './steps/Step10Status';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WizardFormData {
  student: StudentPersonalFormData;
  academic: AcademicFormData;
  guardians: GuardianFormData[];
  identity: IdentityFormData;
  medical: MedicalFormData;
  declarations: DeclarationsFormData;
  documents: EnrollmentDocument[];
  statusHistory: EnrollmentStatusHistory[];
}

interface EnrollmentWizardProps {
  locale: string;
  applicationId?: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEP_LABELS = [
  { en: 'Start', ar: 'البداية' },
  { en: 'Student Info', ar: 'معلومات الطالب' },
  { en: 'Academic', ar: 'الأكاديمي' },
  { en: 'Guardian', ar: 'ولي الأمر' },
  { en: 'Identity', ar: 'الهوية' },
  { en: 'Medical', ar: 'الطبي' },
  { en: 'Documents', ar: 'المستندات' },
  { en: 'Review', ar: 'المراجعة' },
  { en: 'Submit', ar: 'التقديم' },
  { en: 'Status', ar: 'الحالة' },
];

const TOTAL_STEPS = 10;
const AUTOSAVE_DELAY_MS = 30_000;

function getEmptyFormData(): WizardFormData {
  return {
    student: {
      full_name_en: '',
      full_name_ar: '',
      date_of_birth: '',
      gender: '',
      nationality: '',
      religion: '',
      mother_tongue: '',
      place_of_birth: '',
      secondary_nationality: '',
      preferred_language: '',
    },
    academic: {
      enrollment_type: 'new',
      applying_grade_id: '',
      applying_grade_name: '',
      academic_year: '2026-2027',
      curriculum: '',
    },
    guardians: [
      {
        contact_type: 'primary',
        relationship: 'father',
        full_name_en: '',
        full_name_ar: '',
        mobile: '',
        email: '',
        uae_address: '',
        emirate: '',
        area_city_district: '',
      },
    ],
    identity: {
      emirates_id_available: false,
      emirates_id_number: '',
      student_passport_number: '',
      student_passport_expiry: '',
      residence_visa_number: '',
      residence_visa_expiry: '',
      residency_status: '',
      country_of_residence: '',
    },
    medical: {
      has_medical_condition: false,
      medical_condition_details: '',
      has_sen: false,
      sen_details: '',
      vaccination_record_available: false,
      allergies: '',
      medication_notes: '',
      health_notes: '',
    },
    declarations: {
      info_correct: false,
      docs_authentic: false,
      accepts_verification: false,
      acknowledges_attestation: false,
      acknowledges_missing_delays: false,
      privacy_policy_accepted: false,
      medical_emergency_consent: false,
      communications_consent: false,
      marketing_consent: false,
      digital_platform_consent: false,
    },
    documents: [],
    statusHistory: [],
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EnrollmentWizard({
  locale,
  applicationId: initialApplicationId,
  userId,
}: EnrollmentWizardProps) {
  const router = useRouter();
  const isRTL = locale === 'ar';

  // State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<WizardFormData>(getEmptyFormData);
  const [applicationId, setApplicationId] = useState<string | undefined>(initialApplicationId);
  const [applicationNumber, setApplicationNumber] = useState<string>('');
  const [applicationStatus, setApplicationStatus] = useState<EnrollmentAppStatus>('draft');
  const [completenessScore, setCompletenessScore] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDraft, setLoadingDraft] = useState(!!initialApplicationId);
  const [errorMsg, setErrorMsg] = useState('');
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);

  // Autosave timer ref
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // ---------------------------------------------------------------------------
  // Load existing draft
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!initialApplicationId) {
      setLoadingDraft(false);
      return;
    }

    async function loadDraft() {
      try {
        const res = await fetch(`/api/enrollment/applications/${initialApplicationId}`);
        if (!res.ok) {
          setErrorMsg('Failed to load application draft.');
          setLoadingDraft(false);
          return;
        }
        const data = await res.json();
        const app = data.application;

        // Populate form data from loaded application
        setApplicationId(app.application?.id);
        setApplicationNumber(app.application?.application_number || '');
        setApplicationStatus(app.application?.status || 'draft');
        setCompletenessScore(app.application?.completeness_score || 0);
        setStepsCompleted(app.application?.steps_completed || []);
        setCurrentStep(app.application?.current_step || 1);

        const newFormData = getEmptyFormData();

        if (app.student_details) {
          newFormData.student = {
            full_name_en: app.student_details.full_name_en || '',
            full_name_ar: app.student_details.full_name_ar || '',
            date_of_birth: app.student_details.date_of_birth || '',
            gender: app.student_details.gender || '',
            nationality: app.student_details.nationality || '',
            religion: app.student_details.religion || '',
            mother_tongue: app.student_details.mother_tongue || '',
            place_of_birth: app.student_details.place_of_birth || '',
            secondary_nationality: app.student_details.secondary_nationality || '',
            preferred_language: app.student_details.preferred_language || '',
          };
        }

        if (app.academic_details) {
          newFormData.academic = {
            enrollment_type: app.academic_details.enrollment_type || 'new',
            applying_grade_id: app.academic_details.applying_grade_id || '',
            applying_grade_name: app.academic_details.applying_grade_name || '',
            academic_year: app.academic_details.academic_year || '2026-2027',
            curriculum: app.academic_details.curriculum || '',
            previous_school_name: app.academic_details.previous_school_name || '',
            previous_school_country: app.academic_details.previous_school_country || '',
            previous_school_emirate: app.academic_details.previous_school_emirate || '',
            previous_grade_completed: app.academic_details.previous_grade_completed || '',
            is_mid_year_transfer: app.academic_details.is_mid_year_transfer || false,
            transfer_source: app.academic_details.transfer_source || undefined,
            last_report_card_year: app.academic_details.last_report_card_year || '',
            transcript_available: app.academic_details.transcript_available || false,
            transfer_certificate_available: app.academic_details.transfer_certificate_available || false,
            transfer_reason: app.academic_details.transfer_reason || '',
          };
        }

        if (app.guardians && app.guardians.length > 0) {
          newFormData.guardians = app.guardians.map((g: any) => ({
            contact_type: g.contact_type || 'primary',
            relationship: g.relationship || 'father',
            full_name_en: g.full_name_en || '',
            full_name_ar: g.full_name_ar || '',
            mobile: g.mobile || '',
            email: g.email || '',
            uae_address: g.uae_address || '',
            emirate: g.emirate || '',
            area_city_district: g.area_city_district || '',
            emirates_id_number: g.emirates_id_number || '',
            passport_number: g.passport_number || '',
            visa_number: g.visa_number || '',
            is_legal_guardian: g.is_legal_guardian || false,
            custody_case: g.custody_case || false,
            guardian_authorization_notes: g.guardian_authorization_notes || '',
          }));
        }

        if (app.identity_details) {
          newFormData.identity = {
            emirates_id_available: app.identity_details.emirates_id_available || false,
            emirates_id_number: app.identity_details.emirates_id_number || '',
            student_passport_number: app.identity_details.student_passport_number || '',
            student_passport_expiry: app.identity_details.student_passport_expiry || '',
            residence_visa_number: app.identity_details.residence_visa_number || '',
            residence_visa_expiry: app.identity_details.residence_visa_expiry || '',
            residency_status: app.identity_details.residency_status || '',
            country_of_residence: app.identity_details.country_of_residence || '',
          };
        }

        if (app.medical_details) {
          newFormData.medical = {
            has_medical_condition: app.medical_details.has_medical_condition || false,
            medical_condition_details: app.medical_details.medical_condition_details || '',
            has_sen: app.medical_details.has_sen || false,
            sen_details: app.medical_details.sen_details || '',
            vaccination_record_available: app.medical_details.vaccination_record_available || false,
            allergies: app.medical_details.allergies || '',
            medication_notes: app.medical_details.medication_notes || '',
            health_notes: app.medical_details.health_notes || '',
          };
        }

        if (app.declarations) {
          newFormData.declarations = {
            info_correct: app.declarations.info_correct || false,
            docs_authentic: app.declarations.docs_authentic || false,
            accepts_verification: app.declarations.accepts_verification || false,
            acknowledges_attestation: app.declarations.acknowledges_attestation || false,
            acknowledges_missing_delays: app.declarations.acknowledges_missing_delays || false,
            privacy_policy_accepted: app.declarations.privacy_policy_accepted || false,
            medical_emergency_consent: app.declarations.medical_emergency_consent || false,
            communications_consent: app.declarations.communications_consent || false,
            marketing_consent: app.declarations.marketing_consent || false,
            digital_platform_consent: app.declarations.digital_platform_consent || false,
          };
        }

        if (app.documents) {
          newFormData.documents = app.documents;
        }

        if (app.status_history) {
          newFormData.statusHistory = app.status_history;
        }

        setFormData(newFormData);

        // Lock the form if already submitted
        const lockedStatuses: EnrollmentAppStatus[] = [
          'submitted',
          'pending_verification',
          'under_review',
          'pending_attestation',
          'pending_translation',
          'awaiting_transfer_certificate',
          'provisionally_accepted',
          'approved',
          'rejected',
          'enrollment_activated',
        ];
        if (lockedStatuses.includes(app.application?.status)) {
          setIsLocked(true);
          setCurrentStep(10); // Jump to status tracking
        }
      } catch {
        setErrorMsg('Failed to load application draft.');
      } finally {
        setLoadingDraft(false);
      }
    }

    loadDraft();
  }, [initialApplicationId]);

  // ---------------------------------------------------------------------------
  // Autosave
  // ---------------------------------------------------------------------------

  const saveDraft = useCallback(
    async (data: WizardFormData, step: number) => {
      if (isLocked) return;

      const serialized = JSON.stringify({ data, step });
      if (serialized === lastSavedDataRef.current) return;

      setSaving(true);
      try {
        const url = applicationId
          ? `/api/enrollment/applications/${applicationId}`
          : '/api/enrollment/applications';
        const method = applicationId ? 'PATCH' : 'POST';

        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            current_step: step,
            student_details: data.student,
            academic_details: data.academic,
            guardians: data.guardians,
            identity_details: data.identity,
            medical_details: data.medical,
            declarations: data.declarations,
          }),
        });

        if (res.ok) {
          const result = await res.json();
          lastSavedDataRef.current = serialized;
          if (!applicationId && result.application?.id) {
            setApplicationId(result.application.id);
            setApplicationNumber(result.application.application_number || '');
            // Update URL with applicationId without full page reload
            const newUrl = `/${locale}/enrollment/apply?applicationId=${result.application.id}`;
            window.history.replaceState({}, '', newUrl);
          }
          if (result.application?.completeness_score !== undefined) {
            setCompletenessScore(result.application.completeness_score);
          }
          if (result.application?.steps_completed) {
            setStepsCompleted(result.application.steps_completed);
          }
        }
      } catch {
        // Autosave failure is silent; user can manually save
      } finally {
        setSaving(false);
      }
    },
    [applicationId, isLocked, locale],
  );

  // Debounced autosave
  useEffect(() => {
    if (isLocked || currentStep === 1 || currentStep === 10) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = setTimeout(() => {
      saveDraft(formData, currentStep);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [formData, currentStep, isLocked, saveDraft]);

  // Save on step change
  const handleStepChange = useCallback(
    (newStep: number) => {
      if (!isLocked && currentStep !== 1 && currentStep !== 10) {
        saveDraft(formData, newStep);
      }
      setStepErrors({});
      setErrorMsg('');
      setCurrentStep(newStep);
    },
    [currentStep, formData, isLocked, saveDraft],
  );

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      handleStepChange(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      handleStepChange(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      handleStepChange(step);
    }
  };

  // ---------------------------------------------------------------------------
  // Form data updaters
  // ---------------------------------------------------------------------------

  const updateStudent = (updates: Partial<StudentPersonalFormData>) => {
    setFormData((prev) => ({
      ...prev,
      student: { ...prev.student, ...updates },
    }));
  };

  const updateAcademic = (updates: Partial<AcademicFormData>) => {
    setFormData((prev) => ({
      ...prev,
      academic: { ...prev.academic, ...updates },
    }));
  };

  const updateGuardians = (guardians: GuardianFormData[]) => {
    setFormData((prev) => ({ ...prev, guardians }));
  };

  const updateIdentity = (updates: Partial<IdentityFormData>) => {
    setFormData((prev) => ({
      ...prev,
      identity: { ...prev.identity, ...updates },
    }));
  };

  const updateMedical = (updates: Partial<MedicalFormData>) => {
    setFormData((prev) => ({
      ...prev,
      medical: { ...prev.medical, ...updates },
    }));
  };

  const updateDeclarations = (updates: Partial<DeclarationsFormData>) => {
    setFormData((prev) => ({
      ...prev,
      declarations: { ...prev.declarations, ...updates },
    }));
  };

  const updateDocuments = (documents: EnrollmentDocument[]) => {
    setFormData((prev) => ({ ...prev, documents }));
  };

  // ---------------------------------------------------------------------------
  // Start new application
  // ---------------------------------------------------------------------------

  const handleStartNew = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/enrollment/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_step: 2,
          student_details: formData.student,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create application');
      }
      const result = await res.json();
      setApplicationId(result.application.id);
      setApplicationNumber(result.application.application_number || '');
      const newUrl = `/${locale}/enrollment/apply?applicationId=${result.application.id}`;
      window.history.replaceState({}, '', newUrl);
      setCurrentStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Submit application
  // ---------------------------------------------------------------------------

  const handleSubmit = async () => {
    if (!applicationId) return;
    setLoading(true);
    setErrorMsg('');
    try {
      // Save final state first
      await saveDraft(formData, 9);

      const res = await fetch(`/api/enrollment/applications/${applicationId}/submit`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit application');
      }
      const result = await res.json();
      setApplicationStatus('submitted');
      setIsLocked(true);
      if (result.status_history) {
        setFormData((prev) => ({
          ...prev,
          statusHistory: result.status_history,
        }));
      }
      setCurrentStep(10);
    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Step indicator
  // ---------------------------------------------------------------------------

  const renderStepIndicator = () => (
    <div className="mb-8 overflow-x-auto pb-2">
      <div className="flex items-center justify-between relative min-w-[600px]">
        {/* Progress line */}
        <div className="absolute left-0 top-5 w-full h-1 bg-gray-200 z-0" />
        <div
          className="absolute left-0 top-5 h-1 bg-brand-primary z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
        />

        {STEP_LABELS.map((label, i) => {
          const stepNum = i + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum || stepsCompleted.includes(stepNum);
          return (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => !isLocked && goToStep(stepNum)}
                disabled={isLocked && stepNum !== 10}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors cursor-pointer disabled:cursor-not-allowed
                  ${
                    isActive
                      ? 'bg-white border-brand-primary text-brand-primary shadow-md'
                      : isCompleted
                        ? 'bg-brand-primary border-brand-primary text-black'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}
              >
                {isCompleted && !isActive ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  stepNum
                )}
              </button>
              <span
                className={`mt-2 text-[10px] font-medium hidden sm:block text-center w-16 leading-tight ${
                  isActive || isCompleted ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {isRTL ? label.ar : label.en}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loadingDraft) {
    return (
      <Card className="shadow-lg border-0 ring-1 ring-gray-200">
        <CardContent className="p-10 flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-4" />
          <p className="text-gray-500">
            {isRTL ? 'جاري تحميل الطلب...' : 'Loading your application...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 ring-1 ring-gray-200" dir={isRTL ? 'rtl' : 'ltr'}>
      <CardContent className="p-6 sm:p-10">
        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Saving indicator */}
        {saving && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
            <Save className="w-4 h-4 animate-pulse" />
            {isRTL ? 'جاري الحفظ التلقائي...' : 'Autosaving...'}
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step errors summary */}
        {Object.keys(stepErrors).length > 0 && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">
              {isRTL ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following:'}
            </p>
            <ul className="list-disc list-inside space-y-1">
              {Object.values(stepErrors).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Step content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Step1Start
              locale={locale}
              applicationId={applicationId}
              applicationNumber={applicationNumber}
              applicationStatus={applicationStatus}
              onStartNew={handleStartNew}
              onContinueDraft={() => setCurrentStep(2)}
              loading={loading}
            />
          )}

          {currentStep === 2 && (
            <Step2StudentInfo
              locale={locale}
              data={formData.student}
              onChange={updateStudent}
              errors={stepErrors}
              readOnly={isLocked}
            />
          )}

          {currentStep === 3 && (
            <Step3AcademicInfo
              locale={locale}
              data={formData.academic}
              onChange={updateAcademic}
              errors={stepErrors}
              readOnly={isLocked}
            />
          )}

          {currentStep === 4 && (
            <Step4GuardianInfo
              locale={locale}
              guardians={formData.guardians}
              onChange={updateGuardians}
              errors={stepErrors}
              readOnly={isLocked}
            />
          )}

          {currentStep === 5 && (
            <Step5IdentityInfo
              locale={locale}
              data={formData.identity}
              onChange={updateIdentity}
              errors={stepErrors}
              readOnly={isLocked}
            />
          )}

          {currentStep === 6 && (
            <Step6MedicalInfo
              locale={locale}
              data={formData.medical}
              onChange={updateMedical}
              errors={stepErrors}
              readOnly={isLocked}
            />
          )}

          {currentStep === 7 && (
            <Step7Documents
              locale={locale}
              applicationId={applicationId}
              documents={formData.documents}
              academicData={formData.academic}
              identityData={formData.identity}
              guardians={formData.guardians}
              medicalData={formData.medical}
              onDocumentsChange={updateDocuments}
              readOnly={isLocked}
            />
          )}

          {currentStep === 8 && (
            <Step8Review
              locale={locale}
              formData={formData}
              declarations={formData.declarations}
              onDeclarationsChange={updateDeclarations}
              onEditStep={goToStep}
              readOnly={isLocked}
            />
          )}

          {currentStep === 9 && (
            <Step9Submit
              locale={locale}
              formData={formData}
              completenessScore={completenessScore}
              onSubmit={handleSubmit}
              loading={loading}
              readOnly={isLocked}
            />
          )}

          {currentStep === 10 && (
            <Step10Status
              locale={locale}
              applicationId={applicationId}
              applicationNumber={applicationNumber}
              applicationStatus={applicationStatus}
              statusHistory={formData.statusHistory}
              documents={formData.documents}
            />
          )}
        </div>

        {/* Navigation Controls */}
        {currentStep !== 1 && currentStep !== 10 && (
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={loading}
            >
              {isRTL ? (
                <>
                  {isRTL ? 'السابق' : 'Back'} <ChevronRight className="w-4 h-4 ms-2" />
                </>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4 me-2" /> Back
                </>
              )}
            </Button>

            <div className="flex items-center gap-3">
              {/* Manual save button */}
              {!isLocked && currentStep !== 9 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraft(formData, currentStep)}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ms-2 hidden sm:inline">
                    {isRTL ? 'حفظ' : 'Save'}
                  </span>
                </Button>
              )}

              {currentStep < 9 ? (
                <Button
                  className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold"
                  onClick={handleNext}
                  disabled={loading}
                >
                  {isRTL ? (
                    <>
                      <ChevronLeft className="w-4 h-4 me-2" />{' '}
                      {isRTL ? 'التالي' : 'Next'}
                    </>
                  ) : (
                    <>
                      Next <ChevronRight className="w-4 h-4 ms-2" />
                    </>
                  )}
                </Button>
              ) : currentStep === 9 && !isLocked ? (
                <Button
                  className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {isRTL ? 'جاري التقديم...' : 'Submitting...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 me-2" />
                      {isRTL ? 'تقديم الطلب' : 'Submit Application'}
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
