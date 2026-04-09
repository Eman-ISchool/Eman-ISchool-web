import OpenAI from 'openai';
import { config } from '../../config';
import { STT_TIMEOUT_MS, STT_MAX_AUDIO_DURATION_MS } from '../../../../shared/constants';
import { Readable } from 'stream';

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!config.openai.enabled) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openai;
}

export function isSTTAvailable(): boolean {
  return config.openai.enabled;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  sampleRate: number = 16000,
): Promise<{ text: string; confidence: number } | null> {
  const client = getClient();
  if (!client) {
    console.warn('[STT] OpenAI not available, skipping transcription');
    return null;
  }

  // Validate audio buffer size (rough duration check)
  const estimatedDurationMs = (audioBuffer.length / (sampleRate * 2)) * 1000; // 16-bit audio
  if (estimatedDurationMs > STT_MAX_AUDIO_DURATION_MS) {
    console.warn(`[STT] Audio too long (${estimatedDurationMs}ms), truncating`);
    const maxBytes = Math.floor((STT_MAX_AUDIO_DURATION_MS / 1000) * sampleRate * 2);
    audioBuffer = audioBuffer.subarray(0, maxBytes);
  }

  if (audioBuffer.length < 1000) {
    return null; // Too short to be meaningful audio
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STT_TIMEOUT_MS);

    // Create a file-like object from buffer
    const file = new File([audioBuffer], 'audio.webm', { type: 'audio/webm' });

    const response = await client.audio.transcriptions.create(
      {
        model: 'whisper-1',
        file,
        response_format: 'verbose_json',
      },
      { signal: controller.signal },
    );

    clearTimeout(timeout);

    const text = response.text?.trim();
    if (!text) return null;

    return {
      text,
      confidence: 0.85, // Whisper doesn't provide per-segment confidence directly
    };
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      console.warn('[STT] Transcription timed out');
    } else {
      console.error('[STT] Transcription failed:', err);
    }
    return null;
  }
}

// Debounced transcription for continuous audio streams
const pendingTranscriptions = new Map<string, ReturnType<typeof setTimeout>>();
const audioBuffers = new Map<string, Buffer[]>();

export function queueAudioChunk(
  roomId: string,
  participantId: string,
  chunk: Buffer,
  onResult: (text: string) => void,
  debounceMs: number = 2000,
): void {
  const key = `${roomId}:${participantId}`;

  if (!audioBuffers.has(key)) {
    audioBuffers.set(key, []);
  }
  audioBuffers.get(key)!.push(chunk);

  // Clear pending timer
  const pending = pendingTranscriptions.get(key);
  if (pending) clearTimeout(pending);

  // Set new debounce timer
  pendingTranscriptions.set(
    key,
    setTimeout(async () => {
      const chunks = audioBuffers.get(key);
      if (!chunks || chunks.length === 0) return;

      const combined = Buffer.concat(chunks);
      audioBuffers.set(key, []); // Reset buffer

      const result = await transcribeAudio(combined);
      if (result && result.text) {
        onResult(result.text);
      }

      pendingTranscriptions.delete(key);
    }, debounceMs),
  );
}

export function clearAudioBuffer(roomId: string, participantId: string): void {
  const key = `${roomId}:${participantId}`;
  audioBuffers.delete(key);
  const pending = pendingTranscriptions.get(key);
  if (pending) {
    clearTimeout(pending);
    pendingTranscriptions.delete(key);
  }
}
