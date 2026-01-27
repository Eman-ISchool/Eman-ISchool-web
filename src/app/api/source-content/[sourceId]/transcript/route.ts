import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/source-content/[sourceId]/transcript
 * Returns transcript for a source content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sourceId = params.sourceId;

    // Fetch source content to verify ownership
    const { data: sourceContent, error: sourceError } = await supabase
      .from('source_content')
      .select('id, teacher_id')
      .eq('id', sourceId)
      .single();

    if (sourceError || !sourceContent) {
      return NextResponse.json(
        { error: 'Source content not found' },
        { status: 404 }
      );
    }

    if (sourceContent.teacher_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this content' },
        { status: 403 }
      );
    }

    // Fetch transcript
    const { data: transcript, error } = await supabase
      .from('transcripts')
      .select('*')
      .eq('source_id', sourceId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Transcript not found' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching transcript:', error);
      return NextResponse.json(
        { error: 'Failed to fetch transcript' },
        { status: 500 }
      );
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/source-content/[sourceId]/transcript
 * Updates or creates manual transcript
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sourceId = params.sourceId;

    // Parse request body
    const body = await request.json();
    const { text, segments, language, isManual } = body;

    if (!text || !segments) {
      return NextResponse.json(
        { error: 'Text and segments are required' },
        { status: 400 }
      );
    }

    // Verify source content ownership
    const { data: sourceContent, error: sourceError } = await supabase
      .from('source_content')
      .select('id, teacher_id')
      .eq('id', sourceId)
      .single();

    if (sourceError || !sourceContent) {
      return NextResponse.json(
        { error: 'Source content not found' },
        { status: 404 }
      );
    }

    if (sourceContent.teacher_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this content' },
        { status: 403 }
      );
    }

    // Check if transcript exists
    const { data: existingTranscript } = await supabase
      .from('transcripts')
      .select('id')
      .eq('source_id', sourceId)
      .maybeSingle();

    // Calculate word count
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const transcriptData = {
      source_id: sourceId,
      text,
      segments: Array.isArray(segments) ? segments : [],
      language: language || 'en',
      confidence: 0.95, // Default confidence for manual transcripts
      word_count: wordCount,
      is_manual: isManual !== undefined ? isManual : true,
    };

    let result;

    if (existingTranscript) {
      // Update existing transcript
      const { data, error: updateError } = await supabase
        .from('transcripts')
        .update(transcriptData)
        .eq('id', existingTranscript.id)
        .select()
        .single();

      if (updateError || !data) {
        console.error('[API] Error updating transcript:', updateError);
        return NextResponse.json(
          { error: 'Failed to update transcript' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new transcript
      const { data, error: insertError } = await supabase
        .from('transcripts')
        .insert(transcriptData)
        .select()
        .single();

      if (insertError || !data) {
        console.error('[API] Error creating transcript:', insertError);
        return NextResponse.json(
          { error: 'Failed to create transcript' },
          { status: 500 }
        );
      }

      result = data;

      // Update source content with transcript ID
      await supabase
        .from('source_content')
        .update({ transcript_id: result.id })
        .eq('id', sourceId);
    }

    return NextResponse.json({
      transcript: result,
      message: existingTranscript
        ? 'Transcript updated successfully'
        : 'Transcript created successfully',
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
 * DELETE /api/source-content/[sourceId]/transcript
 * Deletes transcript for a source content
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sourceId = params.sourceId;

    // Verify source content ownership
    const { data: sourceContent, error: sourceError } = await supabase
      .from('source_content')
      .select('id, teacher_id')
      .eq('id', sourceId)
      .single();

    if (sourceError || !sourceContent) {
      return NextResponse.json(
        { error: 'Source content not found' },
        { status: 404 }
      );
    }

    if (sourceContent.teacher_id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden - you do not own this content' },
        { status: 403 }
      );
    }

    // Delete transcript
    const { error: deleteError } = await supabase
      .from('transcripts')
      .delete()
      .eq('source_id', sourceId);

    if (deleteError) {
      console.error('[API] Error deleting transcript:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete transcript' },
        { status: 500 }
      );
    }

    // Update source content to remove transcript reference
    await supabase
      .from('source_content')
      .update({ transcript_id: null })
      .eq('id', sourceId);

    return NextResponse.json({
      message: 'Transcript deleted successfully',
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
