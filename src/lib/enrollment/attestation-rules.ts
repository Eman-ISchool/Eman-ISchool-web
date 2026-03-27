// ──────────────────────────────────────────────────────────────
// Attestation and translation rules engine
// Determines attestation chains and translation requirements
// for enrollment documents based on issuing country and language.
// ──────────────────────────────────────────────────────────────

import type { EnrollmentDocument } from '@/types/enrollment';

// ── Types ────────────────────────────────────────────────────

export interface AttestationRequirements {
  attestation_required: boolean;
  attestation_chain: string[];
  translation_required: boolean;
}

export interface DocumentBlockerResult {
  has_attestation_blockers: boolean;
  has_translation_blockers: boolean;
  blocked_documents: string[];
}

// ── Country classification helpers ───────────────────────────

const GCC_COUNTRIES = new Set([
  'sa', 'saudi arabia',
  'kw', 'kuwait',
  'bh', 'bahrain',
  'qa', 'qatar',
  'om', 'oman',
]);

const UAE_EMIRATES = new Set([
  'abu dhabi', 'dubai', 'sharjah', 'ajman',
  'umm al quwain', 'umm al-quwain',
  'ras al khaimah', 'ras al-khaimah',
  'fujairah',
]);

function normalise(value: string | null | undefined): string {
  return (value ?? '').toLowerCase().trim();
}

function isEgypt(country: string): boolean {
  const c = normalise(country);
  return c === 'eg' || c === 'egypt' || c === 'مصر';
}

function isUAE(country: string): boolean {
  const c = normalise(country);
  return (
    c === 'ae' ||
    c === 'uae' ||
    c === 'united arab emirates' ||
    c === 'الإمارات' ||
    UAE_EMIRATES.has(c)
  );
}

function isGCC(country: string): boolean {
  const c = normalise(country);
  return GCC_COUNTRIES.has(c);
}

// ── Core attestation logic ───────────────────────────────────

/**
 * Determine attestation and translation requirements for a single document
 * based on its issuing country and language.
 *
 * Rules by transfer source:
 * A. Egypt-issued documents: require education authority + MOFA chain
 * B. UAE-issued for Egyptian mission: support preparation workflow
 * C. GCC country docs: require education authority + country MOFA
 * D. Another UAE emirate: require local authority handling
 * E. Translation: if document language is not Arabic and not English,
 *    translation is required
 */
export function getAttestationRequirements(doc: {
  document_type: string;
  issuing_country: string | null | undefined;
  document_language: string | null | undefined;
}): AttestationRequirements {
  const country = normalise(doc.issuing_country);
  const language = normalise(doc.document_language);

  // Default: no attestation, no translation
  let attestation_required = false;
  let attestation_chain: string[] = [];
  let translation_required = false;

  // ── Translation check (applies universally) ────────────────
  // If the document language is neither Arabic nor English, translation is required
  if (language && language !== 'arabic' && language !== 'ar' && language !== 'english' && language !== 'en') {
    translation_required = true;
  }

  // If no issuing country, we cannot determine attestation chain
  if (!country) {
    return { attestation_required, attestation_chain, translation_required };
  }

  // ── A. Egypt-issued documents ──────────────────────────────
  if (isEgypt(country)) {
    attestation_required = true;
    attestation_chain = [
      'Issuing school / authority in Egypt',
      'Egyptian Ministry of Education',
      'Egyptian Ministry of Foreign Affairs (MOFA)',
      'UAE Embassy in Egypt',
    ];
    return { attestation_required, attestation_chain, translation_required };
  }

  // ── B. UAE-issued (e.g., Egyptian mission school in UAE) ───
  if (isUAE(country)) {
    // Documents from a different emirate need local authority attestation
    // Documents from the same emirate typically need no extra attestation
    // We treat all UAE-issued docs as potentially needing the preparation workflow
    attestation_required = false; // UAE-local docs generally accepted
    attestation_chain = [
      'Local education authority attestation (if from different emirate)',
    ];
    return { attestation_required, attestation_chain, translation_required };
  }

  // ── C. GCC country documents ───────────────────────────────
  if (isGCC(country)) {
    attestation_required = true;
    attestation_chain = [
      'Issuing school / authority in the GCC country',
      'GCC country Ministry of Education',
      'GCC country Ministry of Foreign Affairs (MOFA)',
      'UAE Embassy in the issuing GCC country',
    ];
    return { attestation_required, attestation_chain, translation_required };
  }

  // ── D. Any other country (outside UAE/GCC) ─────────────────
  attestation_required = true;
  attestation_chain = [
    'Issuing school / authority in the originating country',
    'Originating country Ministry of Education (or equivalent)',
    'Originating country Ministry of Foreign Affairs (MOFA)',
    'UAE Embassy / Consulate in the originating country',
  ];

  return { attestation_required, attestation_chain, translation_required };
}

// ── Blocker evaluation ───────────────────────────────────────

/**
 * Evaluate whether any documents have unresolved attestation or translation
 * blockers that would prevent full approval.
 */
export function evaluateDocumentBlockers(
  documents: EnrollmentDocument[],
): DocumentBlockerResult {
  const blocked_documents: string[] = [];
  let has_attestation_blockers = false;
  let has_translation_blockers = false;

  for (const doc of documents) {
    // Skip documents that are not uploaded / not relevant
    if (doc.status === 'missing' || doc.status === 'rejected') {
      continue;
    }

    // Attestation blocker: required but not yet completed
    if (
      doc.attestation_required &&
      doc.attestation_status !== 'completed' &&
      doc.attestation_status !== 'not_required'
    ) {
      has_attestation_blockers = true;
      blocked_documents.push(
        `${doc.document_type}: attestation ${doc.attestation_status}`,
      );
    }

    // Translation blocker: required but not yet completed
    if (
      doc.translation_required &&
      doc.translation_status !== 'completed' &&
      doc.translation_status !== 'not_required'
    ) {
      has_translation_blockers = true;
      blocked_documents.push(
        `${doc.document_type}: translation ${doc.translation_status}`,
      );
    }
  }

  return {
    has_attestation_blockers,
    has_translation_blockers,
    blocked_documents,
  };
}

// ── Full approval check ──────────────────────────────────────

/**
 * Returns true only if no attestation or translation blockers remain
 * among the provided documents.
 */
export function canFullyApprove(documents: EnrollmentDocument[]): boolean {
  const { has_attestation_blockers, has_translation_blockers } =
    evaluateDocumentBlockers(documents);
  return !has_attestation_blockers && !has_translation_blockers;
}
