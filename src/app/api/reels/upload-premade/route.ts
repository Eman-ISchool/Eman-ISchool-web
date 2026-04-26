import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session-api';
import { createClient } from '@supabase/supabase-js';
import { validateVideoFile } from '@/lib/file-validation';

export const dynamic = 'force-dynamic';
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * POST /api/reels/upload-premade
 * Uploads a pre-made short video directly as a reel
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
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const classId = formData.get('classId') as string;
    const gradeLevel = formData.get('gradeLevel') as string;
    const groupId = formData.get('groupId') as string;

    // Validate file
    if (!file) {
      return NextResponse.json(
        { error: 'Video file is required' },
        { status: 400 }
      );
    }

    // Validate video file
    const validation = validateVideoFile(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename
    const timestamp = Date.now();
    const userId = session.user.id;
    const filename = `premade/${userId}/${timestamp}-${file.name}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await getSupabase().storage
      .from('reels')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload video' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = getSupabase().storage
      .from('reels')
      .getPublicUrl(filename);

    const videoUrl = publicUrlData.publicUrl;

    // Create the reel
    const { data: reel, error: reelError } = await getSupabase()
      .from('reels')
      .insert({
        teacher_id: session.user.id,
        title: title || file.name.replace(/\.[^/.]+$/, ''),
        description: description || '',
        video_url: videoUrl,
        duration_seconds: null, // Duration will be extracted later
        status: 'draft',
        source_type: 'premade',
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
      message: 'Pre-made reel uploaded successfully',
    });
  } catch (error) {
    console.error('Error in upload-premade route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
