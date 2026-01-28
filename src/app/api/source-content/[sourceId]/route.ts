import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/source-content/[sourceId]
 * Returns full source content details with transcript and generated reels
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

    // Fetch source content with related data
    const { data: sourceContent, error } = await supabase
      .from('source_content')
      .select(`
        *,
        transcripts (
          id,
          text,
          segments,
          language,
          confidence,
          word_count,
          is_manual,
          created_at
        ),
        reels (
          id,
          title_en,
          title_ar,
          description_en,
          description_ar,
          video_url,
          thumbnail_url,
          duration_seconds,
          status,
          segment_index,
          created_at
        ),
        processing_jobs (
          id,
          type,
          status,
          current_step,
          progress_percent,
          error_message,
          created_at
        )
      `)
      .eq('id', sourceId)
      .eq('teacher_id', session.user.id)
      .single();

    if (error || !sourceContent) {
      if (error?.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Source content not found' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching source content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch source content' },
        { status: 500 }
      );
    }

    // Fetch generated reels count
    const { count: reelsCount } = await supabase
      .from('reels')
      .select('*', { count: 'exact', head: true })
      .eq('source_id', sourceId);

    return NextResponse.json({
      sourceContent: {
        ...sourceContent,
        reelsCount: reelsCount || 0,
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
 * DELETE /api/source-content/[sourceId]
 * Deletes source content and associated data
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

    // Check if user owns this source content
    const { data: sourceContent, error: checkError } = await supabase
      .from('source_content')
      .select('id, teacher_id, file_url')
      .eq('id', sourceId)
      .single();

    if (checkError || !sourceContent) {
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

    // Check if there are published reels
    const { data: publishedReels } = await supabase
      .from('reels')
      .select('id')
      .eq('source_id', sourceId)
      .eq('status', 'published');

    if (publishedReels && publishedReels.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete source content with published reels',
          publishedReelsCount: publishedReels.length,
          message: 'Please unpublish or delete all reels first',
        },
        { status: 400 }
      );
    }

    // Delete from Supabase Storage
    if (sourceContent.file_url) {
      const fileName = sourceContent.file_url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('source-content')
          .remove([fileName]);
      }
    }

    // Delete from database (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('source_content')
      .delete()
      .eq('id', sourceId);

    if (deleteError) {
      console.error('[API] Error deleting source content:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete source content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Source content deleted successfully',
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
