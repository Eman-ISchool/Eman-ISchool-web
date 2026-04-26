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
 * POST /api/reels/[reelId]/unpublish
 * Unpublishes a reel, making it unavailable to students
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
      .select('id, teacher_id, status')
      .eq('id', reelId)
      .single();

    if (reelError || !reel) {
      return NextResponse.json({ error: 'Reel not found' }, { status: 404 });
    }

    // Check if user is the teacher who created the reel
    if (reel.teacher_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to unpublish this reel' },
        { status: 403 }
      );
    }

    // Check if reel is already unpublished
    if (reel.status === 'unpublished' || reel.status === 'draft') {
      return NextResponse.json(
        { error: 'Reel is already unpublished' },
        { status: 400 }
      );
    }

    // Unpublish reel
    const { error: updateError } = await getSupabase()
      .from('reels')
      .update({
        status: 'unpublished',
        published_at: null,
      })
      .eq('id', reelId);

    if (updateError) {
      console.error('[API] Error unpublishing reel:', updateError);
      return NextResponse.json(
        { error: 'Failed to unpublish reel' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Reel unpublished successfully',
      reelId,
    });
  } catch (error) {
    console.error('[API] Error unpublishing reel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
