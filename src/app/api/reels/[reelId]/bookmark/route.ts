import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/reels/[reelId]/bookmark
 * Adds a reel to student's bookmarks
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

    // Check if reel exists and is published
    const { data: reel, error: reelError } = await supabase
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

    // Check if already bookmarked
    const { data: existingProgress } = await supabase
      .from('reel_progress')
      .select('id, is_bookmarked')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    if (existingProgress) {
      if (existingProgress.is_bookmarked) {
        return NextResponse.json(
          { error: 'Reel is already bookmarked' },
          { status: 400 }
        );
      }

      // Update existing progress entry
      await supabase
        .from('reel_progress')
        .update({ is_bookmarked: true })
        .eq('id', existingProgress.id);
    } else {
      // Create new progress entry with bookmark
      await supabase.from('reel_progress').insert({
        reel_id: reelId,
        student_id: session.user.id,
        is_bookmarked: true,
        marked_understood: false,
        progress: 0,
        replay_count: 0,
        last_position: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reel bookmarked successfully',
    });
  } catch (error) {
    console.error('[API] Error bookmarking reel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reels/[reelId]/bookmark
 * Removes a reel from student's bookmarks
 */
export async function DELETE(
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

    // Check if bookmarked
    const { data: existingProgress } = await supabase
      .from('reel_progress')
      .select('id, is_bookmarked')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Reel not found in progress' },
        { status: 404 }
      );
    }

    if (!existingProgress.is_bookmarked) {
      return NextResponse.json(
        { error: 'Reel is not bookmarked' },
        { status: 400 }
      );
    }

    // Remove bookmark
    await supabase
      .from('reel_progress')
      .update({ is_bookmarked: false })
      .eq('id', existingProgress.id);

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully',
    });
  } catch (error) {
    console.error('[API] Error removing bookmark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
