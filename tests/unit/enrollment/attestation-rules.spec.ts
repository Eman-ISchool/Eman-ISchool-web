// ============================================================
// Attestation & Translation Rules Engine Tests
// Tests: getAttestationRequirements, evaluateDocumentBlockers,
//        canFullyApprove
// ============================================================

import {
  getAttestationRequirements,
  evaluateDocumentBlockers,
  canFullyApprove,
} from '@/lib/enrollment/attestation-rules';

import type { EnrollmentDocument } from '@/types/enrollment';

// ── Helpers ──────────────────────────────────────────────────

const baseTimestamps = {
  id: 'doc-1',
  application_id: 'app-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function makeDoc(
  overrides: Partial<EnrollmentDocument> = {},
): EnrollmentDocument {
  return {
    ...baseTimestamps,
    document_type: 'birth_certificate',
    label: 'Birth Certificate',
    is_required: true,
    is_conditional: false,
    condition_rule: null,
    file_url: 'https://storage.example.com/doc.pdf',
    file_name: 'doc.pdf',
    file_size: 2048,
    file_mime_type: 'application/pdf',
    storage_path: '/uploads/doc.pdf',
    status: 'verified',
    reviewed_by: null,
    reviewed_at: null,
    rejection_reason: null,
    issuing_country: null,
    document_language: null,
    attestation_required: false,
    attestation_status: 'not_required',
    translation_required: false,
    translation_status: 'not_required',
    translation_document_id: null,
    upload_count: 1,
    last_uploaded_at: '2026-01-01T00:00:00Z',
    expiry_date: null,
    ...overrides,
  };
}

// ── getAttestationRequirements ───────────────────────────────

describe('getAttestationRequirements', () => {
  describe('attestation by country', () => {
    it('should require attestation for Egypt-issued documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Egypt',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
      expect(result.attestation_chain.length).toBeGreaterThan(0);
      expect(result.attestation_chain).toContain('Egyptian Ministry of Education');
      expect(result.attestation_chain).toContain('Egyptian Ministry of Foreign Affairs (MOFA)');
      expect(result.attestation_chain).toContain('UAE Embassy in Egypt');
    });

    it('should require attestation for Egypt using country code "EG"', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'EG',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should require attestation for Egypt in Arabic (\u0645\u0635\u0631)', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: '\u0645\u0635\u0631',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should NOT require attestation for UAE-issued documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'UAE',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(false);
    });

    it('should NOT require attestation for Dubai-issued documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Dubai',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(false);
    });

    it('should NOT require attestation for Abu Dhabi-issued documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Abu Dhabi',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(false);
    });

    it('should require attestation for GCC country (Saudi Arabia)', () => {
      const result = getAttestationRequirements({
        document_type: 'academic_transcript',
        issuing_country: 'Saudi Arabia',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
      expect(result.attestation_chain).toContain('GCC country Ministry of Education');
      expect(result.attestation_chain).toContain('GCC country Ministry of Foreign Affairs (MOFA)');
    });

    it('should require attestation for GCC country (Kuwait)', () => {
      const result = getAttestationRequirements({
        document_type: 'academic_transcript',
        issuing_country: 'Kuwait',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should require attestation for GCC country (Bahrain)', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Bahrain',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should require attestation for GCC country (Qatar)', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Qatar',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should require attestation for GCC country (Oman)', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Oman',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
    });

    it('should require attestation for documents from outside UAE/GCC (India)', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'India',
        document_language: 'English',
      });
      expect(result.attestation_required).toBe(true);
      expect(result.attestation_chain).toContain(
        'Originating country Ministry of Foreign Affairs (MOFA)',
      );
    });

    it('should return no attestation when issuing_country is null', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: null,
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(false);
      expect(result.attestation_chain).toHaveLength(0);
    });

    it('should return no attestation when issuing_country is empty', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: '',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(false);
    });
  });

  describe('translation requirements', () => {
    it('should require translation for French documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'France',
        document_language: 'French',
      });
      expect(result.translation_required).toBe(true);
    });

    it('should require translation for Spanish documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Spain',
        document_language: 'Spanish',
      });
      expect(result.translation_required).toBe(true);
    });

    it('should require translation for Urdu documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Pakistan',
        document_language: 'Urdu',
      });
      expect(result.translation_required).toBe(true);
    });

    it('should NOT require translation for Arabic documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Egypt',
        document_language: 'Arabic',
      });
      expect(result.translation_required).toBe(false);
    });

    it('should NOT require translation for Arabic using code "ar"', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Egypt',
        document_language: 'ar',
      });
      expect(result.translation_required).toBe(false);
    });

    it('should NOT require translation for English documents', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'UK',
        document_language: 'English',
      });
      expect(result.translation_required).toBe(false);
    });

    it('should NOT require translation for English using code "en"', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'UK',
        document_language: 'en',
      });
      expect(result.translation_required).toBe(false);
    });

    it('should NOT require translation when language is null', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Egypt',
        document_language: null,
      });
      expect(result.translation_required).toBe(false);
    });

    it('should NOT require translation when language is empty', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Egypt',
        document_language: '',
      });
      expect(result.translation_required).toBe(false);
    });
  });

  describe('combined attestation and translation', () => {
    it('should require both attestation and translation for non-Arabic non-English doc from abroad', () => {
      const result = getAttestationRequirements({
        document_type: 'academic_transcript',
        issuing_country: 'France',
        document_language: 'French',
      });
      expect(result.attestation_required).toBe(true);
      expect(result.translation_required).toBe(true);
    });

    it('should require attestation only for Arabic doc from GCC', () => {
      const result = getAttestationRequirements({
        document_type: 'birth_certificate',
        issuing_country: 'Kuwait',
        document_language: 'Arabic',
      });
      expect(result.attestation_required).toBe(true);
      expect(result.translation_required).toBe(false);
    });
  });
});

// ── evaluateDocumentBlockers ─────────────────────────────────

describe('evaluateDocumentBlockers', () => {
  it('should detect pending attestation blockers', () => {
    const documents = [
      makeDoc({
        attestation_required: true,
        attestation_status: 'pending',
        status: 'uploaded',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(true);
    expect(result.blocked_documents.length).toBeGreaterThan(0);
    expect(result.blocked_documents[0]).toContain('attestation');
  });

  it('should detect pending translation blockers', () => {
    const documents = [
      makeDoc({
        translation_required: true,
        translation_status: 'pending',
        status: 'uploaded',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_translation_blockers).toBe(true);
    expect(result.blocked_documents.length).toBeGreaterThan(0);
    expect(result.blocked_documents[0]).toContain('translation');
  });

  it('should detect both attestation and translation blockers simultaneously', () => {
    const documents = [
      makeDoc({
        id: 'doc-att',
        attestation_required: true,
        attestation_status: 'pending',
        status: 'uploaded',
      }),
      makeDoc({
        id: 'doc-trans',
        translation_required: true,
        translation_status: 'pending',
        status: 'uploaded',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(true);
    expect(result.has_translation_blockers).toBe(true);
    expect(result.blocked_documents.length).toBe(2);
  });

  it('should report no blockers when attestation is completed', () => {
    const documents = [
      makeDoc({
        attestation_required: true,
        attestation_status: 'completed',
        status: 'verified',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(false);
    expect(result.blocked_documents).toHaveLength(0);
  });

  it('should report no blockers when attestation is not_required', () => {
    const documents = [
      makeDoc({
        attestation_required: true,
        attestation_status: 'not_required',
        status: 'verified',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(false);
  });

  it('should report no blockers when translation is completed', () => {
    const documents = [
      makeDoc({
        translation_required: true,
        translation_status: 'completed',
        status: 'verified',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_translation_blockers).toBe(false);
  });

  it('should skip documents with "missing" status', () => {
    const documents = [
      makeDoc({
        attestation_required: true,
        attestation_status: 'pending',
        status: 'missing',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(false);
    expect(result.blocked_documents).toHaveLength(0);
  });

  it('should skip documents with "rejected" status', () => {
    const documents = [
      makeDoc({
        attestation_required: true,
        attestation_status: 'pending',
        status: 'rejected',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(false);
  });

  it('should report no blockers for an empty document list', () => {
    const result = evaluateDocumentBlockers([]);
    expect(result.has_attestation_blockers).toBe(false);
    expect(result.has_translation_blockers).toBe(false);
    expect(result.blocked_documents).toHaveLength(0);
  });

  it('should report no blockers when no attestation or translation is required', () => {
    const documents = [
      makeDoc({
        attestation_required: false,
        attestation_status: 'not_required',
        translation_required: false,
        translation_status: 'not_required',
        status: 'verified',
      }),
    ];

    const result = evaluateDocumentBlockers(documents);
    expect(result.has_attestation_blockers).toBe(false);
    expect(result.has_translation_blockers).toBe(false);
    expect(result.blocked_documents).toHaveLength(0);
  });
});

// ── canFullyApprove ──────────────────────────────────────────

describe('canFullyApprove', () => {
  it('should return true when all docs are verified with no blockers', () => {
    const documents = [
      makeDoc({
        status: 'verified',
        attestation_required: false,
        attestation_status: 'not_required',
        translation_required: false,
        translation_status: 'not_required',
      }),
      makeDoc({
        id: 'doc-2',
        document_type: 'student_passport',
        status: 'verified',
        attestation_required: false,
        attestation_status: 'not_required',
        translation_required: false,
        translation_status: 'not_required',
      }),
    ];

    expect(canFullyApprove(documents)).toBe(true);
  });

  it('should return true when attestation is completed', () => {
    const documents = [
      makeDoc({
        status: 'verified',
        attestation_required: true,
        attestation_status: 'completed',
        translation_required: false,
        translation_status: 'not_required',
      }),
    ];

    expect(canFullyApprove(documents)).toBe(true);
  });

  it('should return false when attestation is pending', () => {
    const documents = [
      makeDoc({
        status: 'uploaded',
        attestation_required: true,
        attestation_status: 'pending',
        translation_required: false,
        translation_status: 'not_required',
      }),
    ];

    expect(canFullyApprove(documents)).toBe(false);
  });

  it('should return false when translation is pending', () => {
    const documents = [
      makeDoc({
        status: 'uploaded',
        attestation_required: false,
        attestation_status: 'not_required',
        translation_required: true,
        translation_status: 'pending',
      }),
    ];

    expect(canFullyApprove(documents)).toBe(false);
  });

  it('should return true for an empty document list', () => {
    expect(canFullyApprove([])).toBe(true);
  });

  it('should return true when all blockers are on rejected/missing docs (skipped)', () => {
    const documents = [
      makeDoc({
        status: 'rejected',
        attestation_required: true,
        attestation_status: 'pending',
      }),
      makeDoc({
        id: 'doc-2',
        status: 'missing',
        translation_required: true,
        translation_status: 'pending',
      }),
    ];

    expect(canFullyApprove(documents)).toBe(true);
  });
});
