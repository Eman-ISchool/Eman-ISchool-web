import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
  confidence: number;
}

export interface TranscriptionResult {
  text: string;
  segments: TranscriptSegment[];
  language: string;
  confidence: number;
  wordCount: number;
}

/**
 * Transcribes video audio using OpenAI Whisper API
 * @param audioUrl - URL to audio file (MP3, MP4, M4A, WAV, WEBM)
 * @returns TranscriptionResult with text, segments, and metadata
 */
export async function transcribeVideo(audioUrl: string): Promise<TranscriptionResult> {
  try {
    console.log('[Transcription API] Starting transcription for:', audioUrl);

    // Call Whisper API
    const transcription = await openai.audio.transcriptions.create({
      file: await fetchAudioFile(audioUrl),
      model: 'whisper-1',
      response_format: 'verbose_json', // Get timestamps and segments
      timestamp_granularities: ['segment'], // Get segment-level timestamps
      language: 'en', // Default to English, auto-detect if needed
    });

    // Process segments
    const segments: TranscriptSegment[] = (transcription.segments || []).map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.95,
    }));

    // Calculate overall confidence
    const overallConfidence =
      segments.length > 0
        ? segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length
        : 0.95;

    // Count words
    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length;

    console.log('[Transcription API] Transcription complete:', {
      language: transcription.language,
      duration: transcription.duration,
      wordCount,
      segments: segments.length,
    });

    return {
      text: transcription.text,
      segments,
      language: transcription.language,
      confidence: overallConfidence,
      wordCount,
    };
  } catch (error) {
    console.error('[Transcription API] Error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches audio file from URL for Whisper API
 * @param url - Audio file URL
 * @returns File object for API upload
 */
async function fetchAudioFile(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio file: ${response.statusText}`);
  }

  const blob = await response.blob();
  const filename = url.split('/').pop() || 'audio.mp3';
  
  return new File([blob], filename, { type: blob.type });
}

/**
 * Transcribes video with auto language detection
 * @param audioUrl - URL to audio file
 * @returns TranscriptionResult with detected language
 */
export async function transcribeVideoAutoDetect(
  audioUrl: string
): Promise<TranscriptionResult> {
  try {
    console.log('[Transcription API] Starting transcription with auto-detect for:', audioUrl);

    const transcription = await openai.audio.transcriptions.create({
      file: await fetchAudioFile(audioUrl),
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    });

    const segments: TranscriptSegment[] = (transcription.segments || []).map((seg) => ({
      start: seg.start,
      end: seg.end,
      text: seg.text.trim(),
      confidence: seg.avg_logprob ? Math.exp(seg.avg_logprob) : 0.95,
    }));

    const overallConfidence =
      segments.length > 0
        ? segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length
        : 0.95;

    const wordCount = transcription.text.split(/\s+/).filter(Boolean).length;

    console.log('[Transcription API] Transcription complete:', {
      language: transcription.language,
      duration: transcription.duration,
      wordCount,
      segments: segments.length,
    });

    return {
      text: transcription.text,
      segments,
      language: transcription.language,
      confidence: overallConfidence,
      wordCount,
    };
  } catch (error) {
    console.error('[Transcription API] Error:', error);
    throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validates if transcript has enough content for segmentation
 * @param transcript - Transcription result to validate
 * @returns True if valid for segmentation
 */
export function validateTranscriptForSegmentation(
  transcript: TranscriptionResult
): boolean {
  const MIN_WORD_COUNT = 100; // Minimum words for meaningful segmentation
  const MIN_CONFIDENCE = 0.7; // Minimum confidence threshold

  return (
    transcript.wordCount >= MIN_WORD_COUNT &&
    transcript.confidence >= MIN_CONFIDENCE &&
    transcript.segments.length > 0
  );
}

/**
 * Gets transcript duration in seconds
 * @param transcript - Transcription result
 * @returns Duration in seconds
 */
export function getTranscriptDuration(transcript: TranscriptionResult): number {
  if (transcript.segments.length === 0) return 0;
  
  const lastSegment = transcript.segments[transcript.segments.length - 1];
  return lastSegment.end;
}
