import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';
import { validateFileByType } from '@/lib/file-validation';
import { computeFileHash } from '@/lib/content-hash';
import type { SourceContentType, SourceStatus } from '@/types/database';
import { parseDocument, validatePageCount } from '@/lib/document-parser';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/source-content
 * Lists teacher's source content with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as SourceContentType | null;
    const status = searchParams.get('status') as SourceStatus | null;
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Build query
    let query = getSupabase()
      .from('source_content')
      .select(`
        *,
        transcripts (
          id,
          word_count,
          language
        ),
        reels (
          id,
          title_en,
          status
        )
      `)
      .eq('teacher_id', session.user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: sourceContent, error } = await query;

    if (error) {
      console.error('[API] Error fetching source content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch source content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sourceContent,
      pagination: {
        limit,
        offset,
        total: sourceContent?.length || 0,
      },
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/source-content
 * Handles multipart file upload with validation
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as SourceContentType | null;
    const classId = formData.get('class_id') as string | null;
    const lessonId = formData.get('lesson_id') as string | null;

    // Validate required fields
    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }
    if (!type) {
      return NextResponse.json({ error: 'Type is required' }, { status: 400 });
    }

    // Validate file type
    const validationResult = validateFileByType(file, type);
    if (!validationResult.valid) {
      return NextResponse.json(
        {
          error: validationResult.error,
          details: validationResult.details,
        },
        { status: 400 }
      );
    }

    // For documents, parse and validate page count
    let pageCount: number | null = null;
    if (type === 'document') {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const parseResult = await parseDocument(fileBuffer, file.type);
      
      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: parseResult.error || 'Failed to parse document',
          },
          { status: 400 }
        );
      }
      
      pageCount = parseResult.pageCount || 0;
      
      // Validate page count
      if (!validatePageCount(pageCount, 100)) {
        return NextResponse.json(
          {
            error: 'Document exceeds maximum page limit of 100 pages',
          },
          { status: 400 }
        );
      }
    }

    // Read file and compute hash
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileHash = computeFileHash(fileBuffer);

    // Check for duplicates
    const { data: existingContent, error: duplicateError } = await getSupabase()
      .from('source_content')
      .select('id, original_filename, created_at')
      .eq('teacher_id', session.user.id)
      .eq('file_hash', fileHash)
      .single();

    if (existingContent && !duplicateError) {
      // Duplicate found - return warning with existing content info
      return NextResponse.json(
        {
          error: 'Duplicate file detected',
          duplicate: {
            id: existingContent.id,
            filename: existingContent.original_filename,
            createdAt: existingContent.created_at,
          },
          message: 'This file has already been uploaded. Do you want to use the existing content or upload anyway?',
        },
        { status: 409 }
      );
    }

    // Upload file to Supabase Storage
    const fileName = `${session.user.id}/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await getSupabase().storage
      .from('source-content')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('[API] File upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = getSupabase().storage
      .from('source-content')
      .getPublicUrl(fileName);

    const fileUrl = urlData?.publicUrl || uploadData.path;

    // Extract metadata
    const metadata = {
      originalFilename: file.name,
      mimeType: file.type,
      ...(classId && { classId }),
      ...(lessonId && { lessonId }),
      ...(pageCount && { pageCount }),
    };

    // Insert source content record
    const { data: sourceContent, error: insertError } = await getSupabase()
      .from('source_content')
      .insert({
        teacher_id: session.user.id,
        type,
        file_url: fileUrl,
        file_hash: fileHash,
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        status: 'uploaded',
        metadata,
      })
      .select()
      .single();

    if (insertError || !sourceContent) {
      console.error('[API] Database insert error:', insertError);
      // Cleanup uploaded file
      await getSupabase().storage
        .from('source-content')
        .remove([fileName]);
      
      return NextResponse.json(
        { error: 'Failed to create source content record' },
        { status: 500 }
      );
    }

    // Auto-trigger transcription for video types
    if (type === 'video' || type === 'recording') {
      // Start transcription job asynchronously
      const { error: jobError } = await getSupabase()
        .from('processing_jobs')
        .insert({
          source_id: sourceContent.id,
          type: 'transcription',
          status: 'pending',
          current_step: 'Queued for transcription',
          progress_percent: 0,
          retry_count: 0,
          max_retries: 3,
        });

      if (jobError) {
        console.error('[API] Failed to create transcription job:', jobError);
      } else {
        console.log('[API] Transcription job queued for source:', sourceContent.id);
      }
    }

    return NextResponse.json(
      {
        sourceContent,
        message: 'File uploaded successfully',
        ...(type === 'video' && {
          note: 'Transcription will begin automatically',
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
