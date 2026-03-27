import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { logEnrollmentAudit, getAttestationRequirements } from '@/lib/enrollment';
import type { EnrollmentAppStatus } from '@/types/enrollment';
import crypto from 'crypto';

type RouteContext = { params: Promise<{ id: string; docId: string }> };

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ── PUT: Replace document (re-upload) ────────────────────────
// Upload new file, increment upload_count, update status to 'uploaded', log audit.

export async function PUT(req: Request, context: RouteContext) {
  try {
    const { id: applicationId, docId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch application for access check
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('id, parent_user_id, status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!isAdmin(user.role) && application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check editable status
    const editableStatuses: EnrollmentAppStatus[] = ['draft', 'action_required', 'pending_documents'];
    if (!isAdmin(user.role) && !editableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot replace documents for application in '${application.status}' status` },
        { status: 400 },
      );
    }

    // Fetch the existing document
    const { data: existingDoc, error: docError } = await supabaseAdmin
      .from('enrollment_documents')
      .select('*')
      .eq('id', docId)
      .eq('application_id', applicationId)
      .single();

    if (docError || !existingDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const issuingCountry = formData.get('issuing_country') as string | null;
    const documentLanguage = formData.get('document_language') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    // Validate file
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type '${file.type}'. Allowed: PDF, JPEG, PNG, GIF` },
        { status: 400 },
      );
    }

    // Upload new file to storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split('.').pop() || 'tmp';
    const storagePath = `${applicationId}/${crypto.randomUUID()}_${existingDoc.document_type}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('enrollment-documents-v2')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`File upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('enrollment-documents-v2')
      .getPublicUrl(uploadData.path);

    // Re-evaluate attestation requirements
    const attestation = getAttestationRequirements({
      document_type: existingDoc.document_type,
      issuing_country: issuingCountry || existingDoc.issuing_country,
      document_language: documentLanguage || existingDoc.document_language,
    });

    const now = new Date().toISOString();
    const previousState = {
      status: existingDoc.status,
      file_name: existingDoc.file_name,
      file_url: existingDoc.file_url,
      upload_count: existingDoc.upload_count,
    };

    // Update document record
    const { data: updatedDoc, error: updateError } = await supabaseAdmin
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
        rejection_reason: null,
        reviewed_by: null,
        reviewed_at: null,
        updated_at: now,
      })
      .eq('id', docId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Optionally delete old file from storage
    if (existingDoc.storage_path) {
      await supabaseAdmin.storage
        .from('enrollment-documents-v2')
        .remove([existingDoc.storage_path]);
    }

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      documentId: docId,
      actorId: user.id,
      action: 'document_replaced',
      targetEntity: 'enrollment_documents',
      targetId: docId,
      previousState,
      newState: {
        status: 'uploaded',
        file_name: file.name,
        upload_count: updatedDoc.upload_count,
      },
    });

    return NextResponse.json({
      success: true,
      document: updatedDoc,
      attestation: {
        attestation_required: attestation.attestation_required,
        attestation_chain: attestation.attestation_chain,
        translation_required: attestation.translation_required,
      },
    });
  } catch (error: any) {
    console.error('PUT /api/enrollment/applications/[id]/documents/[docId] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// ── DELETE: Remove document ──────────────────────────────────
// Only for draft applications.

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id: applicationId, docId } = await context.params;
    const session = await getServerSession(authOptions);
    const user = await getCurrentUser(session);

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Fetch application for access check
    const { data: application, error: appError } = await supabaseAdmin
      .from('enrollment_applications_v2')
      .select('id, parent_user_id, status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (!isAdmin(user.role) && application.parent_user_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Only draft applications allow document deletion
    if (application.status !== 'draft') {
      return NextResponse.json(
        { error: 'Documents can only be removed from draft applications' },
        { status: 400 },
      );
    }

    // Fetch the document
    const { data: doc, error: docError } = await supabaseAdmin
      .from('enrollment_documents')
      .select('*')
      .eq('id', docId)
      .eq('application_id', applicationId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file from storage
    if (doc.storage_path) {
      await supabaseAdmin.storage
        .from('enrollment-documents-v2')
        .remove([doc.storage_path]);
    }

    // Delete the document record
    const { error: deleteError } = await supabaseAdmin
      .from('enrollment_documents')
      .delete()
      .eq('id', docId);

    if (deleteError) throw deleteError;

    // Log audit
    await logEnrollmentAudit({
      applicationId,
      documentId: docId,
      actorId: user.id,
      action: 'document_deleted',
      targetEntity: 'enrollment_documents',
      targetId: docId,
      previousState: {
        document_type: doc.document_type,
        file_name: doc.file_name,
        status: doc.status,
      },
    });

    return NextResponse.json({ success: true, message: 'Document deleted' });
  } catch (error: any) {
    console.error('DELETE /api/enrollment/applications/[id]/documents/[docId] error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
