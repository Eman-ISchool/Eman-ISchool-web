import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/session-api';
import { startPipeline, PipelineConfig } from '@/lib/reel-pipeline';

/**
 * POST /api/reels/generate-from-source
 * Initiates AI pipeline to generate reels from source content
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { sourceId, targetDuration, visualStyle, classId } = body;

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    // TODO: Verify user owns this source content
    // For now, we'll let the pipeline handle authorization

    // Build pipeline configuration
    const config: PipelineConfig = {
      sourceId,
      teacherId: session.user.id,
      targetDuration: targetDuration || 30, // Default 30 seconds
      visualStyle: visualStyle || 'educational animation',
      classId: classId || null, // Optional target class
    };

    // Start pipeline
    const jobId = await startPipeline(config);

    return NextResponse.json(
      {
        jobId,
        message: 'Reel generation pipeline started',
        config: {
          sourceId,
          targetDuration: config.targetDuration,
          visualStyle: config.visualStyle,
        },
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('[API] Error starting reel generation:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
