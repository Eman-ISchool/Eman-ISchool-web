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
 * POST /api/reels/[reelId]/progress
 * Updates student's view progress for a reel
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
    const body = await request.json();
    const { progress, lastPosition } = body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return NextResponse.json(
        { error: 'Invalid progress value. Must be between 0 and 100.' },
        { status: 400 }
      );
    }

    // Check if reel exists and is published
    const { data: reel, error: reelError } = await getSupabase()
      .from('reels')
      .select('id, status')
      .eq('id', reelId)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    if (reel.status !== 'published') {
      return NextResponse.json(
        { error: 'Reel is not published' },
        { status: 403 }
      );
    }

    // Update or create reel_progress entry
    const { data: existingProgress } = await getSupabase()
      .from('reel_progress')
      .select('id, replay_count')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    let updateData: any = {
      last_position: lastPosition || 0,
      updated_at: new Date().toISOString(),
    };

    if (existingProgress) {
      // Check if this is a replay (progress reset to 0)
      const replayCount = (lastPosition === 0 && existingProgress.last_position > 0)
        ? (existingProgress.replay_count || 0) + 1
        : existingProgress.replay_count || 0;

      updateData.progress = progress;
      updateData.replay_count = replayCount;

      await getSupabase()
        .from('reel_progress')
        .update(updateData)
        .eq('id', existingProgress.id);
    } else {
      // Create new progress entry
      updateData.reel_id = reelId;
      updateData.student_id = session.user.id;
      updateData.progress = progress;
      updateData.replay_count = 0;

      await getSupabase().from('reel_progress').insert(updateData);
    }

    // Increment view count on reel if progress > 50% (considered viewed)
    if (progress > 50) {
      await getSupabase().rpc('increment_reel_view_count', { reel_id: reelId });
    }

    return NextResponse.json({
      success: true,
      progress,
      lastPosition: lastPosition || 0,
    });
  } catch (error) {
    console.error('[API] Error updating reel progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reels/[reelId]/progress
 * Gets student's progress for a specific reel
 */
export async function GET(
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

    const { data: progress, error } = await getSupabase()
      .from('reel_progress')
      .select('*')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" which is ok
      console.error('[API] Error fetching reel progress:', error);
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      progress: progress?.progress || 0,
      lastPosition: progress?.last_position || 0,
      isBookmarked: progress?.is_bookmarked || false,
      isUnderstood: progress?.marked_understood || false,
      understoodAt: progress?.understood_at || null,
      replayCount: progress?.replay_count || 0,
    });
  } catch (error) {
    console.error('[API] Error fetching reel progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
