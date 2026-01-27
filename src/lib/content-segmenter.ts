import OpenAI from 'openai';
import { TranscriptSegment, TranscriptionResult } from './transcription-api';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export interface SegmentationResult {
  segments: ContentSegment[];
  totalSegments: number;
  totalDuration: number;
  averageDuration: number;
}

/**
 * Segments transcript into educational content segments using GPT-4
 * @param transcript - Transcription result with segments
 * @param targetDuration - Target segment duration in seconds (default: 30)
 * @returns SegmentationResult with educational segments
 */
export async function segmentTranscript(
  transcript: TranscriptionResult,
  targetDuration: number = 30
): Promise<SegmentationResult> {
  try {
    console.log('[Content Segmenter] Starting segmentation:', {
      wordCount: transcript.wordCount,
      segments: transcript.segments.length,
      targetDuration,
    });

    // Prepare prompt for GPT-4
    const prompt = buildSegmentationPrompt(transcript, targetDuration);

    // Call GPT-4 for intelligent segmentation
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content curator. Your task is to segment educational video transcripts into coherent, topic-based segments suitable for short-form video reels.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent results
      response_format: { type: 'json_object' },
    });

    // Parse GPT-4 response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4');
    }

    const segmentationData = JSON.parse(content);

    // Process and validate segments
    const segments = processSegments(
      segmentationData.segments || [],
      transcript.segments
    );

    const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
    const averageDuration = segments.length > 0 ? totalDuration / segments.length : 0;

    console.log('[Content Segmenter] Segmentation complete:', {
      totalSegments: segments.length,
      totalDuration,
      averageDuration,
    });

    return {
      segments,
      totalSegments: segments.length,
      totalDuration,
      averageDuration,
    };
  } catch (error) {
    console.error('[Content Segmenter] Error:', error);
    throw new Error(`Segmentation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Builds prompt for GPT-4 segmentation
 * @param transcript - Full transcript
 * @param targetDuration - Target duration per segment
 * @returns Formatted prompt string
 */
function buildSegmentationPrompt(
  transcript: TranscriptionResult,
  targetDuration: number
): string {
  const transcriptText = transcript.segments
    .map((seg) => `[${seg.start.toFixed(1)}s - ${seg.end.toFixed(1)}s] ${seg.text}`)
    .join('\n');

  return `Please analyze this educational video transcript and segment it into coherent, topic-based segments suitable for ${targetDuration}-second video reels.

Transcript with timestamps:
${transcriptText}

Requirements:
1. Each segment should be approximately ${targetDuration} seconds (±5 seconds is acceptable)
2. Identify natural topic boundaries - don't cut in the middle of explaining a concept
3. Each segment should be a complete educational thought or concept
4. Provide a clear, engaging title for each segment
5. Summarize the key educational content in 1-2 sentences
6. List 2-3 key learning points for each segment

Return a JSON object with this structure:
{
  "segments": [
    {
      "segmentNumber": 1,
      "start": 0.0,
      "end": 30.5,
      "title": "Introduction to Photosynthesis",
      "summary": "Brief overview of what photosynthesis is and why it's important",
      "keyPoints": ["Definition of photosynthesis", "Importance for plants", "Basic equation"]
    }
  ]
}

Ensure timestamps match the transcript exactly. Start times must be >= 0 and end times must match transcript segments.`;
}

/**
 * Processes and validates segments from GPT-4 response
 * @param segments - Raw segments from GPT-4
 * @param transcriptSegments - Original transcript segments for text extraction
 * @returns Processed ContentSegment array
 */
function processSegments(
  segments: any[],
  transcriptSegments: TranscriptSegment[]
): ContentSegment[] {
  return segments
    .map((seg, index) => {
      // Find text for this segment from transcript
      const segmentText = extractSegmentText(seg.start, seg.end, transcriptSegments);

      return {
        segmentNumber: index + 1,
        start: seg.start,
        end: seg.end,
        duration: seg.end - seg.start,
        text: segmentText,
        title: seg.title || `Segment ${index + 1}`,
        summary: seg.summary || '',
        keyPoints: Array.isArray(seg.keyPoints) ? seg.keyPoints : [],
      };
    })
    .filter((seg) => {
      // Filter out invalid segments
      return (
        seg.duration > 0 &&
        seg.duration <= 120 && // Max 2 minutes per segment
        seg.text.trim().length > 0
      );
    })
    .sort((a, b) => a.start - b.start); // Ensure chronological order
}

/**
 * Extracts text for a segment from transcript segments
 * @param start - Start time in seconds
 * @param end - End time in seconds
 * @param transcriptSegments - Original transcript segments
 * @returns Concatenated text for the segment
 */
function extractSegmentText(
  start: number,
  end: number,
  transcriptSegments: TranscriptSegment[]
): string {
  return transcriptSegments
    .filter((seg) => {
      // Include segments that overlap with the target segment
      return seg.start < end && seg.end > start;
    })
    .map((seg) => seg.text)
    .join(' ')
    .trim();
}

/**
 * Validates segmentation result
 * @param result - Segmentation result to validate
 * @returns True if valid
 */
export function validateSegmentation(result: SegmentationResult): boolean {
  const MIN_SEGMENTS = 1;
  const MAX_SEGMENTS = 60; // Max 60 segments for 30-minute video
  const MIN_DURATION = 15; // Min 15 seconds per segment
  const MAX_DURATION = 120; // Max 2 minutes per segment

  if (
    result.totalSegments < MIN_SEGMENTS ||
    result.totalSegments > MAX_SEGMENTS
  ) {
    console.warn(
      `[Content Segmenter] Invalid segment count: ${result.totalSegments}`
    );
    return false;
  }

  const invalidDurations = result.segments.filter(
    (seg) => seg.duration < MIN_DURATION || seg.duration > MAX_DURATION
  );

  if (invalidDurations.length > 0) {
    console.warn(
      `[Content Segmenter] Invalid segment durations:`,
      invalidDurations.map((s) => `${s.segmentNumber}: ${s.duration}s`)
    );
    return false;
  }

  return true;
}

/**
 * Adjusts segment boundaries to match transcript sentence boundaries
 * @param segments - Segments to adjust
 * @param transcriptSegments - Original transcript segments
 * @returns Adjusted segments
 */
export function adjustToSentenceBoundaries(
  segments: ContentSegment[],
  transcriptSegments: TranscriptSegment[]
): ContentSegment[] {
  return segments.map((seg) => {
    // Find nearest transcript segment start
    const nearestStart = transcriptSegments.find(
      (ts) => Math.abs(ts.start - seg.start) < 1.0
    );

    // Find nearest transcript segment end
    const nearestEnd = transcriptSegments.find(
      (ts) => Math.abs(ts.end - seg.end) < 1.0
    );

    return {
      ...seg,
      start: nearestStart?.start || seg.start,
      end: nearestEnd?.end || seg.end,
      duration: (nearestEnd?.end || seg.end) - (nearestStart?.start || seg.start),
    };
  });
}

/**
 * Gets segment statistics for debugging
 * @param result - Segmentation result
 * @returns Statistics object
 */
export function getSegmentationStats(result: SegmentationResult): {
  minDuration: number;
  maxDuration: number;
  medianDuration: number;
} {
  const durations = result.segments.map((s) => s.duration).sort((a, b) => a - b);

  return {
    minDuration: durations[0] || 0,
    maxDuration: durations[durations.length - 1] || 0,
    medianDuration:
      durations.length > 0
        ? durations[Math.floor(durations.length / 2)]
        : 0,
  };
}
