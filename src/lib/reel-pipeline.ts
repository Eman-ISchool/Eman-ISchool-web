import { createClient } from '@supabase/supabase-js';
import { transcribeVideo, validateTranscriptForSegmentation } from './transcription-api';
import { segmentTranscript, validateSegmentation } from './content-segmenter';
import { generateReel } from './runway-api';
import type { ProcessingJobType, ProcessingJobStatus, SourceStatus } from '@/types/database';
import { notifyAdminOfAIFailure } from './reel-notifications';
import { moderateContent } from './content-screening';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface PipelineConfig {
  sourceId: string;
  teacherId: string;
  targetDuration?: number;
  visualStyle?: string;
  classId?: string | null; // Optional target class for visibility
}

export interface PipelineStatus {
  jobId: string;
  status: ProcessingJobStatus;
  currentStep: string;
  progress: number;
  error?: string;
  metadata?: {
    transcriptionCompleted?: boolean;
    segmentationCompleted?: boolean;
    generationCompleted?: boolean;
    reelsGenerated?: number;
  };
}

/**
 * Starts the AI reel generation pipeline for a source content
 * @param config - Pipeline configuration
 * @returns Job ID for tracking
 */
export async function startPipeline(config: PipelineConfig): Promise<string> {
  try {
    console.log('[Reel Pipeline] Starting pipeline for source:', config.sourceId);

    // Create processing job record
    const { data: job, error: jobError } = await supabase
      .from('processing_jobs')
      .insert({
        source_id: config.sourceId,
        type: 'generation',
        status: 'pending',
        current_step: 'Initializing',
        progress_percent: 0,
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();

    if (jobError || !job) {
      throw new Error(`Failed to create job: ${jobError?.message}`);
    }

    const jobId = job.id;

    // Update source status
    await supabase
      .from('source_content')
      .update({ status: 'processing' })
      .eq('id', config.sourceId);

    // Start pipeline execution asynchronously
    executePipeline(jobId, config).catch((error) => {
      console.error('[Reel Pipeline] Pipeline execution failed:', error);
      handlePipelineFailure(jobId, error);
    });

    return jobId;
  } catch (error) {
    console.error('[Reel Pipeline] Failed to start pipeline:', error);
    throw error;
  }
}

/**
 * Executes the pipeline steps sequentially
 * @param jobId - Processing job ID
 * @param config - Pipeline configuration
 */
async function executePipeline(jobId: string, config: PipelineConfig): Promise<void> {
  try {
    // Step 1: Transcription
    await updateJobProgress(jobId, 'Transcribing video', 10);
    const transcription = await transcribeVideo(config.sourceId);
    await saveTranscript(config.sourceId, transcription);
    await updateJobProgress(jobId, 'Transcription complete', 30);

    // Step 2: Segmentation
    await updateJobProgress(jobId, 'Segmenting content', 40);
    const segmentation = await segmentTranscript(
      transcription,
      config.targetDuration || 30
    );

    if (!validateSegmentation(segmentation)) {
      throw new Error('Segmentation validation failed');
    }

    await updateJobProgress(jobId, 'Segmentation complete', 50);

    // Step 3: Generate reels
    await updateJobProgress(jobId, 'Generating reels', 60);
    const generatedReels = await generateReelsFromSegments(
      config,
      segmentation
    );

    await updateJobProgress(jobId, 'Pipeline complete', 100);

    // Mark job as completed
    await supabase
      .from('processing_jobs')
      .update({
        status: 'completed',
        current_step: 'Completed',
        progress_percent: 100,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    // Update source status
    await supabase
      .from('source_content')
      .update({ status: 'ready' })
      .eq('id', config.sourceId);

    console.log('[Reel Pipeline] Pipeline completed successfully:', {
      jobId,
      reelsGenerated: generatedReels.length,
    });
  } catch (error) {
    console.error('[Reel Pipeline] Pipeline execution error:', error);
    throw error;
  }
}

/**
 * Generates reels from content segments using RunwayML
 * @param config - Pipeline configuration
 * @param segmentation - Segmented content
 * @returns Array of generated reel IDs
 */
async function generateReelsFromSegments(
  config: PipelineConfig,
  segmentation: any
): Promise<string[]> {
  const reelIds: string[] = [];

  for (const segment of segmentation.segments) {
    try {
      // Generate reel using RunwayML
      const reel = await generateReel({
        prompt: buildReelPrompt(segment, config.visualStyle),
        duration: segment.duration,
        aspectRatio: '9:16',
      });

      // Save reel to database
      const { data: savedReel, error } = await supabase
        .from('reels')
        .insert({
          title_en: segment.title,
          title_ar: segment.title, // TODO: Translate to Arabic
          description_en: segment.summary,
          description_ar: segment.summary, // TODO: Translate to Arabic
          video_url: reel.videoUrl,
          thumbnail_url: reel.thumbnailUrl,
          duration_seconds: segment.duration,
          status: 'pending_review',
          teacher_id: config.teacherId,
          source_id: config.sourceId,
          source_type: 'auto_generated',
          segment_index: segment.segmentNumber,
          is_published: false,
          view_count: 0,
        })
        .select()
        .single();

      if (error || !savedReel) {
        console.error('[Reel Pipeline] Failed to save reel:', error);
        continue;
      }

      reelIds.push(savedReel.id);
      console.log('[Reel Pipeline] Generated reel:', savedReel.id);

      // Create visibility entry if classId is specified
      if (config.classId) {
        await supabase.from('reel_visibility').insert({
          reel_id: savedReel.id,
          class_id: config.classId,
          is_visible: true,
        });
        console.log('[Reel Pipeline] Created visibility for reel:', savedReel.id, 'to class:', config.classId);
      }
    } catch (error) {
      console.error('[Reel Pipeline] Failed to generate reel for segment:', {
        segmentNumber: segment.segmentNumber,
        error,
      });
      // Continue with next segment
    }
  }

  return reelIds;
}

/**
 * Builds prompt for RunwayML reel generation
 * @param segment - Content segment
 * @param visualStyle - Optional visual style
 * @returns Prompt string
 */
function buildReelPrompt(segment: any, visualStyle?: string): string {
  const style = visualStyle || 'educational animation style';
  
  return `${style}. Topic: ${segment.title}. Content: ${segment.summary}. Key points: ${segment.keyPoints.join(', ')}. Vertical 9:16 aspect ratio, engaging and educational.`;
}

/**
 * Saves transcript to database
 * @param sourceId - Source content ID
 * @param transcription - Transcription result
 */
async function saveTranscript(
  sourceId: string,
  transcription: any
): Promise<void> {
  const { error } = await supabase.from('transcripts').insert({
    source_id: sourceId,
    text: transcription.text,
    segments: transcription.segments,
    language: transcription.language,
    confidence: transcription.confidence,
    word_count: transcription.wordCount,
    is_manual: false,
  });

  if (error) {
    throw new Error(`Failed to save transcript: ${error.message}`);
  }

  // Update source with transcript ID
  const { data: transcriptData } = await supabase
    .from('transcripts')
    .select('id')
    .eq('source_id', sourceId)
    .single();

  if (transcriptData) {
    await supabase
      .from('source_content')
      .update({ transcript_id: transcriptData.id })
      .eq('id', sourceId);
  }
}

/**
 * Updates job progress in database
 * @param jobId - Job ID
 * @param step - Current step description
 * @param progress - Progress percentage (0-100)
 */
async function updateJobProgress(
  jobId: string,
  step: string,
  progress: number
): Promise<void> {
  const { error } = await supabase
    .from('processing_jobs')
    .update({
      current_step: step,
      progress_percent: Math.min(100, Math.max(0, progress)),
    })
    .eq('id', jobId);

  if (error) {
    console.error('[Reel Pipeline] Failed to update job progress:', error);
  }
}

/**
 * Handles pipeline failure with retry logic
 * @param jobId - Job ID
 * @param error - Error that occurred
 */
async function handlePipelineFailure(jobId: string, error: any): Promise<void> {
  // Get current job to check retry count
  const { data: job } = await supabase
    .from('processing_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!job) {
    console.error('[Reel Pipeline] Job not found:', jobId);
    return;
  }

  const newRetryCount = (job.retry_count || 0) + 1;

  if (newRetryCount <= (job.max_retries || 3)) {
    // Retry the job
    console.log('[Reel Pipeline] Retrying job:', {
      jobId,
      attempt: newRetryCount,
      maxRetries: job.max_retries,
    });

    await supabase
      .from('processing_jobs')
      .update({
        retry_count: newRetryCount,
        status: 'pending',
        error_message: error?.message || 'Unknown error',
      })
      .eq('id', jobId);

    // TODO: Implement retry delay and resume logic
    // await resumePipeline(jobId);
  } else {
    // Mark as failed after max retries
    console.error('[Reel Pipeline] Job failed after max retries:', jobId);

    await supabase
      .from('processing_jobs')
      .update({
        status: 'failed',
        error_message: error?.message || 'Unknown error',
      })
      .eq('id', jobId);

    // Update source status
    await supabase
      .from('source_content')
      .update({ status: 'failed' })
      .eq('id', job.source_id);

    // Notify admin of failure
    await notifyAdminOfFailure(jobId, job.source_id, error);
  }
}

/**
 * Resumes a paused or failed pipeline job
 * @param jobId - Job ID to resume
 */
export async function resumePipeline(jobId: string): Promise<void> {
  try {
    console.log('[Reel Pipeline] Resuming job:', jobId);

    const { data: job, error } = await supabase
      .from('processing_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    // Reset job to pending
    await supabase
      .from('processing_jobs')
      .update({
        status: 'pending',
        error_message: null,
      })
      .eq('id', jobId);

    // TODO: Implement resume logic based on current step
    // This would require tracking which steps completed
    console.log('[Reel Pipeline] Job resumed:', jobId);
  } catch (error) {
    console.error('[Reel Pipeline] Failed to resume job:', error);
    throw error;
  }
}

/**
 * Gets current pipeline status
 * @param jobId - Job ID
 * @returns Pipeline status
 */
export async function getPipelineStatus(jobId: string): Promise<PipelineStatus> {
  const { data: job, error } = await supabase
    .from('processing_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    throw new Error(`Job not found: ${jobId}`);
  }

  return {
    jobId: job.id,
    status: job.status,
    currentStep: job.current_step || 'Unknown',
    progress: job.progress_percent || 0,
    error: job.error_message || undefined,
  };
}

/**
 * Notifies admin of pipeline failure
 * @param jobId - Failed job ID
 * @param sourceId - Source content ID
 * @param error - Error details
 */
async function notifyAdminOfFailure(
  jobId: string,
  sourceId: string,
  error: any
): Promise<void> {
  // TODO: Implement admin notification
  // This would use the existing notification system
  console.log('[Reel Pipeline] Notifying admin of failure:', {
    jobId,
    sourceId,
    error: error?.message,
  });
}

/**
 * Pauses a running pipeline job
 * @param jobId - Job ID to pause
 */
export async function pausePipeline(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('processing_jobs')
    .update({
      status: 'paused',
      current_step: 'Paused by user',
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to pause job: ${error.message}`);
  }

  console.log('[Reel Pipeline] Job paused:', jobId);
}

/**
 * Cancels a pipeline job
 * @param jobId - Job ID to cancel
 */
export async function cancelPipeline(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('processing_jobs')
    .update({
      status: 'failed',
      current_step: 'Cancelled',
      error_message: 'Job cancelled by user',
    })
    .eq('id', jobId);

  if (error) {
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  console.log('[Reel Pipeline] Job cancelled:', jobId);
}
