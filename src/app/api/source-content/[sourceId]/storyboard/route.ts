import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';
import { generateStoryboard, validateStoryboard } from '@/lib/storyboard-generator';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/source-content/[sourceId]/storyboard
 * Returns generated storyboard for a source content
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
): Promise<NextResponse> {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId } = params;

    // Fetch source content with storyboard
    const { data: sourceContent, error } = await supabase
      .from('source_content')
      .select(`
        *,
        storyboards (
          id,
          scenes,
          summary,
          estimated_duration,
          target_audience,
          created_at
        )
      `)
      .eq('id', sourceId)
      .eq('teacher_id', session.user.id)
      .single();

    if (error || !sourceContent) {
      console.error('[API] Error fetching source content:', error);
      return NextResponse.json(
        { error: 'Failed to fetch source content' },
        { status: 500 }
      );
    }

    // Check if storyboard already exists
    if (sourceContent.storyboards && sourceContent.storyboards.length > 0) {
      const storyboard = sourceContent.storyboards[0];
      return NextResponse.json({
        storyboard,
        message: 'Storyboard already exists',
      });
    }

    return NextResponse.json(
      { error: 'No storyboard found for this source content' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/source-content/[sourceId]/storyboard
 * Generates a new storyboard for a source content
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
): Promise<NextResponse> {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceId } = params;

    // Parse request body
    const body = await request.json();
    const { targetAudience, visualStyle } = body;

    if (!targetAudience) {
      return NextResponse.json(
        { error: 'Target audience is required' },
        { status: 400 }
      );
    }

    // Fetch source content
    const { data: sourceContent, error: fetchError } = await supabase
      .from('source_content')
      .select('id, type, status')
      .eq('id', sourceId)
      .eq('teacher_id', session.user.id)
      .single();

    if (fetchError || !sourceContent) {
      console.error('[API] Error fetching source content:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch source content' },
        { status: 500 }
      );
    }

    // Check if source content is ready for storyboard generation
    if (sourceContent.status !== 'uploaded' && sourceContent.status !== 'ready') {
      return NextResponse.json(
        { error: 'Source content must be in uploaded or ready status' },
        { status: 400 }
      );
    }

    // Generate storyboard
    const storyboard = await generateStoryboard({
      content: '', // TODO: Get actual content from document
      targetAudience,
      visualStyle,
    });

    // Validate storyboard
    if (!validateStoryboard(storyboard)) {
      return NextResponse.json(
        { error: 'Generated storyboard is invalid' },
        { status: 400 }
      );
    }

    // Save storyboard to database
    const { data: savedStoryboard, error: insertError } = await supabase
      .from('storyboards')
      .insert({
        source_id: sourceId,
        target_audience: storyboard.target_audience,
        scenes: storyboard.scenes,
        summary: storyboard.summary,
        estimated_duration: storyboard.estimated_duration,
      })
      .select()
      .single();

    if (insertError || !savedStoryboard) {
      console.error('[API] Error saving storyboard:', insertError);
      return NextResponse.json(
        { error: 'Failed to save storyboard' },
        { status: 500 }
      );
    }

    // Update source content with storyboard reference
    const { error: updateError } = await supabase
      .from('source_content')
      .update({ storyboard_id: savedStoryboard.id })
      .eq('id', sourceId);

    if (updateError) {
      console.error('[API] Error updating source content:', updateError);
      return NextResponse.json(
        { error: 'Failed to update source content' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        storyboard: savedStoryboard,
        message: 'Storyboard generated successfully',
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
