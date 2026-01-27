import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from '@/lib/session-api';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/reels/[reelId]/visibility
 * Gets visibility settings for a reel
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

    // Check if reel exists and user owns it
    const { data: reel, error: reelError } = await supabase
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
        { error: 'You do not have permission to view this reel' },
        { status: 403 }
      );
    }

    // Get visibility settings
    const { data: visibility, error: visibilityError } = await supabase
      .from('reel_visibility')
      .select('*')
      .eq('reel_id', reelId);

    if (visibilityError) {
      console.error('[API] Error fetching visibility:', visibilityError);
      return NextResponse.json(
        { error: 'Failed to fetch visibility settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reelId,
      visibility: visibility || [],
    });
  } catch (error) {
    console.error('[API] Error fetching reel visibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/reels/[reelId]/visibility
 * Updates visibility settings for a reel
 */
export async function PUT(
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
    const { visibility } = body;

    if (!Array.isArray(visibility)) {
      return NextResponse.json(
        { error: 'Visibility must be an array' },
        { status: 400 }
      );
    }

    // Validate visibility entries
    for (const entry of visibility) {
      if (!entry.visibility_type) {
        return NextResponse.json(
          { error: 'Each visibility entry must have a visibility_type' },
          { status: 400 }
        );
      }

      if (entry.visibility_type === 'class' && !entry.class_id) {
        return NextResponse.json(
          { error: 'Class visibility requires class_id' },
          { status: 400 }
        );
      }

      if (entry.visibility_type === 'grade_level' && !entry.grade_level) {
        return NextResponse.json(
          { error: 'Grade level visibility requires grade_level' },
          { status: 400 }
        );
      }

      if (entry.visibility_type === 'group' && !entry.group_id) {
        return NextResponse.json(
          { error: 'Group visibility requires group_id' },
          { status: 400 }
        );
      }
    }

    // Check if reel exists and user owns it
    const { data: reel, error: reelError } = await supabase
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
        { error: 'You do not have permission to modify this reel' },
        { status: 403 }
      );
    }

    // If reel is published, unpublish it first
    if (reel.status === 'published') {
      await supabase
        .from('reels')
        .update({ status: 'unpublished' })
        .eq('id', reelId);
    }

    // Delete existing visibility entries
    await supabase
      .from('reel_visibility')
      .delete()
      .eq('reel_id', reelId);

    // Insert new visibility entries
    if (visibility.length > 0) {
      const visibilityEntries = visibility.map((entry: any) => ({
        reel_id: reelId,
        visibility_type: entry.visibility_type,
        class_id: entry.class_id || null,
        grade_level: entry.grade_level || null,
        group_id: entry.group_id || null,
        is_visible: true,
      }));

      const { error: insertError } = await supabase
        .from('reel_visibility')
        .insert(visibilityEntries);

      if (insertError) {
        console.error('[API] Error inserting visibility:', insertError);
        return NextResponse.json(
          { error: 'Failed to update visibility settings' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Visibility settings updated successfully',
      visibility,
    });
  } catch (error) {
    console.error('[API] Error updating reel visibility:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
