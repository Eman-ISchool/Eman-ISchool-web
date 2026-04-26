import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

export const dynamic = 'force-dynamic';
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/reels/[reelId]/understood
 * Marks a reel as understood by the student
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

    // Check if already marked as understood
    const { data: existingProgress } = await getSupabase()
      .from('reel_progress')
      .select('id, marked_understood')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    if (existingProgress) {
      if (existingProgress.marked_understood) {
        return NextResponse.json(
          { error: 'Reel is already marked as understood' },
          { status: 400 }
        );
      }

      // Update existing progress entry
      await getSupabase()
        .from('reel_progress')
        .update({
          marked_understood: true,
          understood_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id);
    } else {
      // Create new progress entry with understood flag
      await getSupabase().from('reel_progress').insert({
        reel_id: reelId,
        student_id: session.user.id,
        is_bookmarked: false,
        marked_understood: true,
        understood_at: new Date().toISOString(),
        progress: 0,
        replay_count: 0,
        last_position: 0,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Reel marked as understood',
    });
  } catch (error) {
    console.error('[API] Error marking reel as understood:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reels/[reelId]/understood
 * Removes the understood mark from a reel
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

    // Check if progress exists
    const { data: existingProgress } = await getSupabase()
      .from('reel_progress')
      .select('id, marked_understood')
      .eq('reel_id', reelId)
      .eq('student_id', session.user.id)
      .single();

    if (!existingProgress) {
      return NextResponse.json(
        { error: 'Reel not found in progress' },
        { status: 404 }
      );
    }

    if (!existingProgress.marked_understood) {
      return NextResponse.json(
        { error: 'Reel is not marked as understood' },
        { status: 400 }
      );
    }

    // Remove understood mark
    await getSupabase()
      .from('reel_progress')
      .update({
        marked_understood: false,
        understood_at: null,
      })
      .eq('id', existingProgress.id);

    return NextResponse.json({
      success: true,
      message: 'Understood mark removed successfully',
    });
  } catch (error) {
    console.error('[API] Error removing understood mark:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
