import { describe, it, expect, vi, beforeEach } from 'vitest';
import { STT_MAX_AUDIO_DURATION_MS } from '@shared/constants';

// ── Hoisted mocks ──────────────────────────────────────────────────
const { mockConfig, mockTranscriptionsCreate } = vi.hoisted(() => ({
  mockConfig: {
    jwt: { secret: 'test-secret', expiresIn: '24h' },
    openai: { enabled: true, apiKey: 'sk-test-key' },
    redis: { url: 'redis://localhost:6379' },
    database: { url: 'postgresql://localhost/test' },
    port: 3001,
    nodeEnv: 'test',
    isProduction: false,
    cors: { origin: 'http://localhost:3000' },
  },
  mockTranscriptionsCreate: vi.fn(),
}));

vi.mock('../../src/config', () => ({
  config: mockConfig,
}));

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = { completions: { create: vi.fn() } };
      moderations = { create: vi.fn() };
      audio = {
        transcriptions: {
          create: mockTranscriptionsCreate,
        },
      };
    },
  };
});

import { transcribeAudio, isSTTAvailable, clearAudioBuffer } from '../../src/services/stt';

describe('STT Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.openai.enabled = true;
    mockConfig.openai.apiKey = 'sk-test-key';
  });

  // ── isSTTAvailable ─────────────────────────────────────────────

  describe('isSTTAvailable', () => {
    it('should return true when OpenAI is enabled', () => {
      mockConfig.openai.enabled = true;
      expect(isSTTAvailable()).toBe(true);
    });

    it('should return false when OpenAI is disabled', () => {
      mockConfig.openai.enabled = false;
      expect(isSTTAvailable()).toBe(false);
    });
  });

  // ── transcribeAudio ────────────────────────────────────────────

  describe('transcribeAudio', () => {
    it('should return null when OpenAI is disabled', async () => {
      mockConfig.openai.enabled = false;

      const buffer = Buffer.alloc(5000, 0);
      const result = await transcribeAudio(buffer);

      expect(result).toBeNull();
      expect(mockTranscriptionsCreate).not.toHaveBeenCalled();
    });

    it('should return null for audio buffer that is too short', async () => {
      const tinyBuffer = Buffer.alloc(500, 0);

      const result = await transcribeAudio(tinyBuffer);

      expect(result).toBeNull();
    });

    it('should transcribe valid audio and return text with confidence', async () => {
      mockTranscriptionsCreate.mockResolvedValue({
        text: 'Hello everyone, welcome to the coffee chat!',
      });

      const buffer = Buffer.alloc(5000, 0);
      const result = await transcribeAudio(buffer);

      expect(result).not.toBeNull();
      expect(result!.text).toBe('Hello everyone, welcome to the coffee chat!');
      expect(result!.confidence).toBe(0.85);
    });

    it('should return null when transcription returns empty text', async () => {
      mockTranscriptionsCreate.mockResolvedValue({
        text: '   ',
      });

      const buffer = Buffer.alloc(5000, 0);
      const result = await transcribeAudio(buffer);

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      mockTranscriptionsCreate.mockRejectedValue(new Error('Whisper API error'));

      const buffer = Buffer.alloc(5000, 0);
      const result = await transcribeAudio(buffer);

      expect(result).toBeNull();
    });

    it('should handle abort/timeout errors gracefully', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockTranscriptionsCreate.mockRejectedValue(abortError);

      const buffer = Buffer.alloc(5000, 0);
      const result = await transcribeAudio(buffer);

      expect(result).toBeNull();
    });

    it('should truncate audio that exceeds max duration', async () => {
      mockTranscriptionsCreate.mockResolvedValue({
        text: 'Truncated audio result',
      });

      const sampleRate = 16000;
      const oversizedDurationMs = STT_MAX_AUDIO_DURATION_MS + 5000;
      const oversizedBytes = Math.floor((oversizedDurationMs / 1000) * sampleRate * 2);
      const bigBuffer = Buffer.alloc(oversizedBytes, 0);

      const result = await transcribeAudio(bigBuffer, sampleRate);

      expect(result).not.toBeNull();
      expect(result!.text).toBe('Truncated audio result');
      expect(mockTranscriptionsCreate).toHaveBeenCalledOnce();
    });
  });

  // ── clearAudioBuffer ──────────────────────────────────────────

  describe('clearAudioBuffer', () => {
    it('should not throw when clearing non-existent buffer', () => {
      expect(() => clearAudioBuffer('room-1', 'part-1')).not.toThrow();
    });
  });
});
