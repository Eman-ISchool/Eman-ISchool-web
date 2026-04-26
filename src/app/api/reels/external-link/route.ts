import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session-api';
import { createClient } from '@supabase/supabase-js';
import {
  validateExternalUrl,
  getVideoMetadata,
  checkVideoAvailability,
  normalizeVideoUrl,
} from '@/lib/external-video';

export const dynamic = 'force-dynamic';
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/reels/external-link
 * Creates a new reel from an external video link (YouTube, Vimeo)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { url, title, description, classId, gradeLevel, groupId } = body;

    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Validate the external URL
    const validation = validateExternalUrl(url);
    if (!validation.isValid || !validation.provider || !validation.externalId) {
      return NextResponse.json(
        { error: validation.error || 'Invalid video URL' },
        { status: 400 }
      );
    }

    const { provider, externalId } = validation;

    // Check if this external link already exists for this teacher
    const { data: existingLink } = await getSupabase()
      .from('external_video_links')
      .select('id, reel_id')
      .eq('external_id', externalId)
      .eq('provider', provider)
      .single();

    if (existingLink) {
      return NextResponse.json(
        { error: 'This video has already been added', reelId: existingLink.reel_id },
        { status: 409 }
      );
    }

    // Fetch video metadata
    const metadata = await getVideoMetadata(url);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Failed to fetch video metadata' },
        { status: 400 }
      );
    }

    // Check video availability
    const isAvailable = await checkVideoAvailability(url);
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Video is not available or has been removed' },
        { status: 400 }
      );
    }

    // Create the reel
    const { data: reel, error: reelError } = await getSupabase()
      .from('reels')
      .insert({
        teacher_id: session.user.id,
        title: title || metadata.title || 'External Video',
        description: description || '',
        video_url: url,
        duration_seconds: metadata.duration || null,
        status: 'draft',
        source_type: 'external_link',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reelError || !reel) {
      console.error('Error creating reel:', reelError);
      return NextResponse.json(
        { error: 'Failed to create reel' },
        { status: 500 }
      );
    }

    // Create external video link record
    const { error: linkError } = await getSupabase()
      .from('external_video_links')
      .insert({
        reel_id: reel.id,
        provider,
        external_id: externalId,
        url: normalizeVideoUrl(url),
        title: metadata.title,
        thumbnail_url: metadata.thumbnailUrl,
        duration_seconds: metadata.duration || null,
        is_available: true,
        last_checked_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (linkError) {
      console.error('Error creating external video link:', linkError);
      // Rollback reel creation
      await getSupabase().from('reels').delete().eq('id', reel.id);
      return NextResponse.json(
        { error: 'Failed to create external video link' },
        { status: 500 }
      );
    }

    // Set visibility if provided
    if (classId || gradeLevel || groupId) {
      const { error: visibilityError } = await getSupabase()
        .from('reel_visibility')
        .insert({
          reel_id: reel.id,
          visibility_type: classId ? 'class' : gradeLevel ? 'grade_level' : 'group',
          class_id: classId || null,
          grade_level: gradeLevel || null,
          group_id: groupId || null,
          created_at: new Date().toISOString(),
        });

      if (visibilityError) {
        console.error('Error setting visibility:', visibilityError);
        // Non-critical error, continue
      }
    }

    return NextResponse.json({
      success: true,
      reel,
      externalLink: {
        provider,
        externalId,
        thumbnailUrl: metadata.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Error in external-link route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/reels/external-link?url={url}
 * Validates and fetches metadata for an external video URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate the URL
    const validation = validateExternalUrl(url);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid video URL' },
        { status: 400 }
      );
    }

    // Fetch metadata
    const metadata = await getVideoMetadata(url);
    if (!metadata) {
      return NextResponse.json(
        { error: 'Failed to fetch video metadata' },
        { status: 400 }
      );
    }

    // Check availability
    const isAvailable = await checkVideoAvailability(url);

    return NextResponse.json({
      isValid: true,
      provider: metadata.provider,
      externalId: metadata.externalId,
      title: metadata.title,
      thumbnailUrl: metadata.thumbnailUrl,
      duration: metadata.duration,
      isAvailable,
    });
  } catch (error) {
    console.error('Error in external-link GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
