import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session-api';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/reels/record
 * Handles recorded video upload from in-app recording
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const duration = formData.get('duration') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const classId = formData.get('classId') as string;
    const gradeLevel = formData.get('gradeLevel') as string;
    const groupId = formData.get('groupId') as string;

    // Validate video file
    if (!videoFile) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validate duration
    const durationNum = duration ? parseInt(duration, 10) : 0;
    if (durationNum <= 0 || durationNum > 60) {
      return NextResponse.json(
        { error: 'Duration must be between 1 and 60 seconds' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['video/webm', 'video/mp4'];
    if (!allowedTypes.includes(videoFile.type)) {
      return NextResponse.json(
        { error: 'Invalid video format. Only WebM and MP4 are supported.' },
        { status: 400 }
      );
    }

    // Read file
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const userId = session.user.id;
    const filename = `recorded/${userId}/${timestamp}-${videoFile.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await getSupabase().storage
      .from('reels')
      .upload(filename, buffer, {
        contentType: videoFile.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Error uploading recorded video:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload recorded video' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = getSupabase().storage
      .from('reels')
      .getPublicUrl(filename);

    const videoUrl = publicUrlData.publicUrl;

    // Create reel
    const { data: reel, error: reelError } = await getSupabase()
      .from('reels')
      .insert({
        teacher_id: session.user.id,
        title: title || `Recorded Reel - ${new Date().toLocaleString()}`,
        description: description || '',
        video_url: videoUrl,
        duration_seconds: durationNum,
        status: 'draft',
        source_type: 'recording',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (reelError || !reel) {
      console.error('Error creating reel:', reelError);
      // Clean up uploaded file
      await getSupabase().storage.from('reels').remove([filename]);
      return NextResponse.json(
        { error: 'Failed to create reel' },
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
      message: 'Recorded reel saved successfully',
    });
  } catch (error) {
    console.error('Error in record route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
