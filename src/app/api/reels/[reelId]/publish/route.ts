import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/reels/[reelId]/publish
 * Publishes a reel, validating that visibility settings exist
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { reelId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reelId = params.reelId;

    // Check if reel exists and user owns it
    const { data: reel, error: reelError } = await getSupabase()
      .from('reels')
      .select('id, teacher_id, status, video_url, thumbnail_url')
      .eq('id', reelId)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    // Check if user is the teacher who created the reel
    if (reel.teacher_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to publish this reel' },
        { status: 403 }
      );
    }

    // Check if reel is already published
    if (reel.status === 'published') {
      return NextResponse.json(
        { error: 'Reel is already published' },
        { status: 400 }
      );
    }

    // Validate that visibility settings exist
    const { data: visibility, error: visibilityError } = await getSupabase()
      .from('reel_visibility')
      .select('id')
      .eq('reel_id', reelId);

    if (visibilityError) {
      console.error('[API] Error checking visibility:', visibilityError);
      return NextResponse.json(
        { error: 'Failed to check visibility settings' },
        { status: 500 }
      );
    }

    // Require at least one visibility setting
    if (!visibility || visibility.length === 0) {
      return NextResponse.json(
        { error: 'Cannot publish reel without visibility settings. Please set at least one visibility rule.' },
        { status: 400 }
      );
    }

    // Validate that video and thumbnail exist
    if (!reel.video_url) {
      return NextResponse.json(
        { error: 'Cannot publish reel without video' },
        { status: 400 }
      );
    }

    // Publish the reel
    const { error: updateError } = await getSupabase()
      .from('reels')
      .update({
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', reelId);

    if (updateError) {
      console.error('[API] Error publishing reel:', updateError);
      return NextResponse.json(
        { error: 'Failed to publish reel' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reel published successfully',
      reelId,
      publishedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[API] Error publishing reel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
