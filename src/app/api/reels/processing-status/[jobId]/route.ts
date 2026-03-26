import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/reels/processing-status/[jobId]
 * Returns job progress for a processing job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const jobId = params.jobId;

    // Fetch job status from database
    const { data: job, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Processing job not found' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching job status:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job status' },
        { status: 500 }
      );
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Processing job not found' },
        { status: 404 }
      );
    }

    // Format response
    return NextResponse.json({
      jobId: job.id,
      status: job.status,
      currentStep: job.current_step || 'Unknown',
      progress: job.progress_percent || 0,
      error: job.error_message || undefined,
      metadata: {
        type: job.type,
        sourceId: job.source_id,
        retryCount: job.retry_count,
        maxRetries: job.max_retries,
        startedAt: job.started_at,
        completedAt: job.completed_at,
      },
    });
  } catch (error) {
    console.error('[API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
