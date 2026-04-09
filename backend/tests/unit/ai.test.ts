import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Hoisted mocks ──────────────────────────────────────────────────
const { mockConfig, mockCreate, mockModerationsCreate } = vi.hoisted(() => ({
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
  mockCreate: vi.fn(),
  mockModerationsCreate: vi.fn(),
}));

vi.mock('../../src/config', () => ({
  config: mockConfig,
}));

vi.mock('uuid', () => ({ v4: () => 'mock-suggestion-id' }));

vi.mock('openai', () => {
  return {
    default: class MockOpenAI {
      chat = {
        completions: {
          create: mockCreate,
        },
      };
      moderations = {
        create: mockModerationsCreate,
      };
      audio = {
        transcriptions: {
          create: vi.fn(),
        },
      };
    },
  };
});

import { generateSuggestion, moderateContent, isAIAvailable } from '../../src/services/ai';

describe('AI Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig.openai.enabled = true;
    mockConfig.openai.apiKey = 'sk-test-key';
  });

  // ── isAIAvailable ──────────────────────────────────────────────

  describe('isAIAvailable', () => {
    it('should return true when OpenAI is enabled', () => {
      mockConfig.openai.enabled = true;
      expect(isAIAvailable()).toBe(true);
    });

    it('should return false when OpenAI is disabled', () => {
      mockConfig.openai.enabled = false;
      expect(isAIAvailable()).toBe(false);
    });
  });

  // ── generateSuggestion ────────────────────────────────────────

  describe('generateSuggestion', () => {
    it('should generate a suggestion from OpenAI response', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                content: 'What tech trend excites you most?',
                type: 'question',
              }),
            },
          },
        ],
      });

      const suggestion = await generateSuggestion('Technology', 'We talked about AI...', 3);

      expect(suggestion).not.toBeNull();
      expect(suggestion!.content).toBe('What tech trend excites you most?');
      expect(suggestion!.type).toBe('question');
      expect(suggestion!.id).toBe('mock-suggestion-id');
    });

    it('should handle non-JSON OpenAI response as raw text suggestion', async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: 'Here is a fun icebreaker for everyone!',
            },
          },
        ],
      });

      const suggestion = await generateSuggestion('Random Chat', '', 2);

      expect(suggestion).not.toBeNull();
      expect(suggestion!.content).toBe('Here is a fun icebreaker for everyone!');
      expect(suggestion!.type).toBe('question');
    });

    it('should return fallback suggestion when OpenAI is disabled', async () => {
      mockConfig.openai.enabled = false;

      const suggestion = await generateSuggestion('Technology & Innovation', '', 3);

      expect(suggestion).not.toBeNull();
      expect(typeof suggestion!.content).toBe('string');
      expect(suggestion!.content.length).toBeGreaterThan(0);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return fallback suggestion when all retries fail', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const suggestion = await generateSuggestion('Technology', 'some transcript', 3);

      expect(suggestion).not.toBeNull();
      expect(typeof suggestion!.content).toBe('string');
    });

    it('should retry on failure up to AI_MAX_RETRIES times', async () => {
      mockCreate
        .mockRejectedValueOnce(new Error('Transient error'))
        .mockResolvedValueOnce({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  content: 'Recovered suggestion',
                  type: 'icebreaker',
                }),
              },
            },
          ],
        });

      const suggestion = await generateSuggestion('Random Chat', '', 2);

      expect(suggestion).not.toBeNull();
      expect(suggestion!.content).toBe('Recovered suggestion');
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it('should use topic-specific fallbacks when available', async () => {
      mockConfig.openai.enabled = false;

      const suggestion = await generateSuggestion('Food & Cooking', '', 3);

      expect(suggestion).not.toBeNull();
      const foodFallbacks = [
        "What's your go-to comfort food?",
        'Have you tried cooking something new recently?',
        'What cuisine would you love to master?',
      ];
      expect(foodFallbacks).toContain(suggestion!.content);
    });

    it('should use default fallbacks for unknown topics', async () => {
      mockConfig.openai.enabled = false;

      const suggestion = await generateSuggestion('Obscure Topic Nobody Knows', '', 2);

      expect(suggestion).not.toBeNull();
      expect(typeof suggestion!.content).toBe('string');
    });

    it('should handle empty choices array from OpenAI', async () => {
      mockCreate.mockResolvedValue({ choices: [] });

      const suggestion = await generateSuggestion('Tech', 'transcript', 3);

      expect(suggestion).not.toBeNull();
      expect(typeof suggestion!.content).toBe('string');
    });
  });

  // ── moderateContent ────────────────────────────────────────────

  describe('moderateContent', () => {
    it('should return not-flagged for clean content via OpenAI', async () => {
      mockModerationsCreate.mockResolvedValue({
        results: [
          {
            flagged: false,
            categories: {},
            category_scores: {},
          },
        ],
      });

      const result = await moderateContent('I love coffee and conversations!');

      expect(result.flagged).toBe(false);
      expect(result.severity).toBe('low');
    });

    it('should detect hate speech as critical severity', async () => {
      mockModerationsCreate.mockResolvedValue({
        results: [
          {
            flagged: true,
            categories: {
              hate: true,
              'hate/threatening': false,
              harassment: false,
              'harassment/threatening': false,
              'sexual/minors': false,
              'violence/graphic': false,
              sexual: false,
              violence: false,
            },
            category_scores: {},
          },
        ],
      });

      const result = await moderateContent('some hate speech text');

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('critical');
      expect(result.reason).toBe('Hate speech detected');
    });

    it('should detect harassment as high severity', async () => {
      mockModerationsCreate.mockResolvedValue({
        results: [
          {
            flagged: true,
            categories: {
              hate: false,
              'hate/threatening': false,
              harassment: true,
              'harassment/threatening': false,
              'sexual/minors': false,
              'violence/graphic': false,
              sexual: false,
              violence: false,
            },
            category_scores: {},
          },
        ],
      });

      const result = await moderateContent('harassing text');

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.reason).toBe('Harassment detected');
    });

    it('should use basic moderation as fallback when OpenAI is disabled', async () => {
      mockConfig.openai.enabled = false;

      const result = await moderateContent('This is a normal conversation.');

      expect(result.flagged).toBe(false);
    });

    it('should flag severe keywords with basic moderation when OpenAI is down', async () => {
      mockModerationsCreate.mockRejectedValue(new Error('API down'));

      const result = await moderateContent('I will threat and kill');

      expect(result.flagged).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.reason).toBe('Potentially harmful content');
    });

    it('should return basic check result when OpenAI moderation fails', async () => {
      mockModerationsCreate.mockRejectedValue(new Error('timeout'));

      const result = await moderateContent('This is a bomb threat');

      expect(result.flagged).toBe(true);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });
  });
});
