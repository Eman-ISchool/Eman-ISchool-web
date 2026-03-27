import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin, hasRole } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit, getAttestationRequirements } from '@/lib/enrollment';
import type { EnrollmentDocType, EnrollmentAppStatus } from '@/types/enrollment';
import crypto from 'crypto';

type RouteContext = { params: Promise<{ id: string }> };

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ── GET: List documents for application ──────────────────────

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify application access
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('id, parent_user_id')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!isAdmin(user.role) && application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { data: documents, error } = await supabaseAdmin
      .from('enrollment_documents')
      .select('*')
      .eq('application_id', applicationId)
      .order('document_type', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ documents: documents || [] });
  } catch (error: any) {
    console.error('GET /api/enrollment/applications/[id]/documents error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── POST: Upload document ────────────────────────────────────
// Accept FormData with file + document_type.
// Upload to Supabase storage. Create/update enrollment_documents record.

export async function POST(req: Request, context: RouteContext) {
  try {
    const { id: applicationId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify application access
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!isAdmin(user.role) && application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only allow uploads for editable statuses
    const editableStatuses: EnrollmentAppStatus[] = ['draft', 'action_required', 'pending_documents'];
    if (!isAdmin(user.role) && !editableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot upload documents for application in '${application.status}' status` },
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('document_type') as EnrollmentDocType | null;
    const issuingCountry = formData.get('issuing_country') as string | null;
    const documentLanguage = formData.get('document_language') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'document_type is required' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type '${file.type}'. Allowed: PDF, JPEG, PNG, GIF` },
        { status: 400 },
      );
    }

    // Upload to Supabase storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'tmp';
    const storagePath = `${applicationId}/${crypto.randomUUID()}_${documentType}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('enrollment-documents-v2')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('enrollment-documents-v2')
      .getPublicUrl(uploadData.path);

    // Evaluate attestation requirements
    const attestation = getAttestationRequirements({
      document_type: documentType,
      issuing_country: issuingCountry,
      document_language: documentLanguage,
    });

    const now = new Date().toISOString();

    // Check if a document record already exists for this type
    const { data: existingDoc } = await supabaseAdmin
      .from('enrollment_documents')
      .select('*')
      .eq('application_id', applicationId)
      .eq('document_type', documentType)
      .maybeSingle();

    let documentRecord: any;

    if (existingDoc) {
      // Update existing record
      const { data: updated, error: updateErr } = await supabaseAdmin
        .from('enrollment_documents')
        .update({
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_mime_type: file.type,
          storage_path: uploadData.path,
          status: 'uploaded',
          issuing_country: issuingCountry || existingDoc.issuing_country,
          document_language: documentLanguage || existingDoc.document_language,
          attestation_required: attestation.attestation_required,
          attestation_status: attestation.attestation_required ? 'pending' : 'not_required',
          translation_required: attestation.translation_required,
          translation_status: attestation.translation_required ? 'pending' : 'not_required',
          upload_count: (existingDoc.upload_count || 0) + 1,
          last_uploaded_at: now,
          rejection_reason: null, // Clear any previous rejection
          reviewed_by: null,
          reviewed_at: null,
          updated_at: now,
        })
        .eq('id', existingDoc.id)
        .select()
        .single();

      if (updateErr) throw updateErr;
      documentRecord = updated;
    } else {
      // Create new record
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('enrollment_documents')
        .insert({
          application_id: applicationId,
          document_type: documentType,
          label: null,
          is_required: false, // Will be re-evaluated
          is_conditional: false,
          condition_rule: null,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_size: file.size,
          file_mime_type: file.type,
          storage_path: uploadData.path,
          status: 'uploaded',
          issuing_country: issuingCountry,
          document_language: documentLanguage,
          attestation_required: attestation.attestation_required,
          attestation_status: attestation.attestation_required ? 'pending' : 'not_required',
          translation_required: attestation.translation_required,
          translation_status: attestation.translation_required ? 'pending' : 'not_required',
          upload_count: 1,
          last_uploaded_at: now,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      documentRecord = inserted;
    }

    // Update the application's document step progress
    const stepsCompleted: number[] = application.steps_completed || [];
    if (!stepsCompleted.includes(6)) {
      stepsCompleted.push(6);
      stepsCompleted.sort((a: number, b: number) => a - b);
      await supabaseAdmin
        .from('enrollment_applications_v2')
        .update({
          steps_completed: stepsCompleted,
          completeness_score: Math.round((stepsCompleted.length / 7) * 100),
          updated_at: now,
        })
        .eq('id', applicationId);
    }

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      documentId: documentRecord.id,
      actorId: user.id,
      action: existingDoc ? 'document_replaced' : 'document_uploaded',
      targetEntity: 'enrollment_documents',
      targetId: documentRecord.id,
      previousState: existingDoc ? { status: existingDoc.status, file_name: existingDoc.file_name } : undefined,
      newState: {
        document_type: documentType,
        file_name: file.name,
        status: 'uploaded',
        attestation_required: attestation.attestation_required,
        translation_required: attestation.translation_required,
      },
    });

    return NextResponse.json(
      {
        success: true,
        document: documentRecord,
        attestation: {
          attestation_required: attestation.attestation_required,
          attestation_chain: attestation.attestation_chain,
          translation_required: attestation.translation_required,
        },
      },
      { status: existingDoc ? 200 : 201 },
    );
  } catch (error: any) {
    console.error('POST /api/enrollment/applications/[id]/documents error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
