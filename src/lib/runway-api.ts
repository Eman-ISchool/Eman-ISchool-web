/**
 * RunwayML API Integration
 * Handles text-to-video generation using RunwayML Gen-3 API
 */

const RUNWAY_API_BASE = 'https://api.runwayml.com/v1';
const RUNWAY_API_KEY = process.env.RUNWAYML_API_KEY;

export interface ContentSegment {
    segmentNumber: number;
    start: number;
    end: number;
    duration: number;
    text: string;
    title: string;
    summary: string;
    keyPoints: string[];
}

export interface GenerateReelRequest {
    prompt: string;
    duration?: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    model?: 'gen3a_turbo' | 'gen3_turbo';
}

export interface GenerateReelResult {
    videoUrl: string;
    thumbnailUrl: string;
    taskId: string;
}

export interface RunwayTextToVideoRequest {
    prompt_text: string;
    model?: 'gen3a_turbo' | 'gen3_turbo';
    duration?: number; // 5 or 10 seconds
    ratio?: '16:9' | '9:16' | '1:1';
    watermark?: boolean;
}

export interface RunwayTaskResponse {
    id: string;
    status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
    progress?: number;
    output?: string[]; // Array of video URLs
    failure?: string;
    failure_code?: string;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Initiate text-to-video generation
 */
export async function generateTextToVideo(
    request: RunwayTextToVideoRequest
): Promise<RunwayTaskResponse> {
    if (!RUNWAY_API_KEY) {
        throw new Error('RunwayML API key not configured');
    }

    const response = await fetch(`${RUNWAY_API_BASE}/text_to_video`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': RUNWAY_API_KEY,
        },
        body: JSON.stringify({
            prompt_text: request.prompt_text,
            model: request.model || 'gen3a_turbo',
            duration: request.duration || 5,
            ratio: request.ratio || '9:16', // Vertical for reels
            watermark: request.watermark ?? false,
        }),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `RunwayML API error: ${response.status} - ${error.message || response.statusText}`
        );
    }

    return response.json();
}

/**
 * Check the status of a video generation task
 */
export async function checkTaskStatus(taskId: string): Promise<RunwayTaskResponse> {
    if (!RUNWAY_API_KEY) {
        throw new Error('RunwayML API key not configured');
    }

    const response = await fetch(`${RUNWAY_API_BASE}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
            'X-API-Key': RUNWAY_API_KEY,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
            `RunwayML API error: ${response.status} - ${error.message || response.statusText}`
        );
    }

    return response.json();
}

/**
 * Simulate video generation for development/testing
 * Returns a mock task that completes after a delay
 */
export async function simulateTextToVideo(
    request: RunwayTextToVideoRequest
): Promise<RunwayTaskResponse> {
    // Generate a mock task ID
    const taskId = `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
        id: taskId,
        status: 'PENDING',
        progress: 0,
        createdAt: new Date().toISOString(),
    };
}

/**
 * Simulate checking task status
 * Progresses through states and eventually returns a mock video URL
 */
export async function simulateCheckTaskStatus(
    taskId: string,
    createdAt: string
): Promise<RunwayTaskResponse> {
    const elapsedSeconds = (Date.now() - new Date(createdAt).getTime()) / 1000;

    // Simulate progression: PENDING -> RUNNING -> SUCCEEDED
    if (elapsedSeconds < 5) {
        return {
            id: taskId,
            status: 'PENDING',
            progress: 0,
            createdAt,
            updatedAt: new Date().toISOString(),
        };
    } else if (elapsedSeconds < 15) {
        return {
            id: taskId,
            status: 'RUNNING',
            progress: Math.min(95, Math.floor((elapsedSeconds - 5) * 9.5)),
            createdAt,
            updatedAt: new Date().toISOString(),
        };
    } else {
        // Generate a mock video URL (using a sample educational video)
        const mockVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

        return {
            id: taskId,
            status: 'SUCCEEDED',
            progress: 100,
            output: [mockVideoUrl],
            createdAt,
            updatedAt: new Date().toISOString(),
        };
    }
}

/**
 * Generates a reel from a content segment using RunwayML
 * @param segment - Content segment with title, summary, and key points
 * @param visualStyle - Optional visual style for the video
 * @returns GenerateReelResult with video URL and thumbnail
 */
export async function generateReelFromSegment(
    segment: ContentSegment,
    visualStyle?: string
): Promise<GenerateReelResult> {
    // Build prompt from segment data
    const prompt = buildSegmentPrompt(segment, visualStyle);
    
    // Initiate generation
    const task = await generateTextToVideo({
        prompt_text: prompt,
        model: 'gen3a_turbo',
        duration: Math.min(10, Math.max(5, Math.round(segment.duration))),
        ratio: '9:16', // Vertical aspect ratio for reels
        watermark: false,
    });
    
    console.log('[Runway API] Started reel generation:', {
        taskId: task.id,
        segmentNumber: segment.segmentNumber,
        duration: segment.duration,
    });
    
    // Poll for completion
    const completedTask = await waitForTaskCompletion(task.id);
    
    if (completedTask.status !== 'SUCCEEDED' || !completedTask.output || completedTask.output.length === 0) {
        throw new Error(`Reel generation failed: ${completedTask.failure || 'Unknown error'}`);
    }
    
    const videoUrl = completedTask.output[0];
    
    // Generate thumbnail URL (using video URL with thumbnail parameter)
    const thumbnailUrl = `${videoUrl}#t=1.0`; // Thumbnail at 1 second
    
    console.log('[Runway API] Reel generation complete:', {
        taskId: task.id,
        videoUrl,
        thumbnailUrl,
    });
    
    return {
        videoUrl,
        thumbnailUrl,
        taskId: task.id,
    };
}

/**
 * Builds a prompt for RunwayML from content segment
 * @param segment - Content segment data
 * @param visualStyle - Optional visual style
 * @returns Formatted prompt string
 */
function buildSegmentPrompt(segment: ContentSegment, visualStyle?: string): string {
    const style = visualStyle || 'educational animation with clean visuals';
    const keyPointsText = segment.keyPoints.length > 0
        ? `. Key points: ${segment.keyPoints.join(', ')}`
        : '';
    
    return `${style}. ${segment.title}. ${segment.summary}${keyPointsText}. Vertical 9:16 aspect ratio, engaging and educational.`;
}

/**
 * Waits for RunwayML task to complete with polling
 * @param taskId - Task ID to poll
 * @param maxAttempts - Maximum polling attempts (default: 30)
 * @param pollInterval - Polling interval in ms (default: 2000)
 * @returns Completed task response
 */
async function waitForTaskCompletion(
    taskId: string,
    maxAttempts: number = 30,
    pollInterval: number = 2000
): Promise<RunwayTaskResponse> {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const task = await checkTaskStatus(taskId);
        
        if (task.status === 'SUCCEEDED') {
            return task;
        }
        
        if (task.status === 'FAILED' || task.status === 'CANCELLED') {
            throw new Error(`Task failed: ${task.failure || task.status}`);
        }
        
        // Log progress
        if (task.progress !== undefined && attempts % 5 === 0) {
            console.log(`[Runway API] Task ${taskId} progress: ${task.progress}%`);
        }
        
        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        attempts++;
    }
    
    throw new Error(`Task timeout after ${maxAttempts * pollInterval / 1000} seconds`);
}

/**
 * Generates multiple reels in batch from content segments
 * @param segments - Array of content segments
 * @param visualStyle - Optional visual style for all reels
 * @param concurrency - Maximum concurrent generations (default: 3)
 * @returns Array of generation results
 */
export async function generateReelsBatch(
    segments: ContentSegment[],
    visualStyle?: string,
    concurrency: number = 3
): Promise<GenerateReelResult[]> {
    const results: GenerateReelResult[] = [];
    const errors: { segmentNumber: number; error: string }[] = [];
    
    // Process segments in batches
    for (let i = 0; i < segments.length; i += concurrency) {
        const batch = segments.slice(i, i + concurrency);
        
        console.log(`[Runway API] Processing batch ${Math.floor(i / concurrency) + 1}:`, {
            segments: batch.map(s => s.segmentNumber),
        });
        
        const batchPromises = batch.map(segment =>
            generateReelFromSegment(segment, visualStyle)
                .catch(error => {
                    console.error(`[Runway API] Failed to generate reel for segment ${segment.segmentNumber}:`, error);
                    errors.push({
                        segmentNumber: segment.segmentNumber,
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    return null;
                })
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        // Add successful results
        batchResults.forEach(result => {
            if (result) {
                results.push(result);
            }
        });
        
        // Small delay between batches to respect rate limits
        if (i + concurrency < segments.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    console.log('[Runway API] Batch generation complete:', {
        totalSegments: segments.length,
        successful: results.length,
        failed: errors.length,
    });
    
    if (errors.length > 0) {
        console.warn('[Runway API] Failed segments:', errors);
    }
    
    return results;
}

/**
 * Alias for generateReelFromSegment for backward compatibility
 */
export async function generateReel(request: GenerateReelRequest): Promise<GenerateReelResult> {
    const segment: ContentSegment = {
        segmentNumber: 1,
        start: 0,
        end: request.duration || 5,
        duration: request.duration || 5,
        text: request.prompt,
        title: 'Custom Reel',
        summary: request.prompt,
        keyPoints: [],
    };
    
    return generateReelFromSegment(segment);
}
