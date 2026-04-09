import OpenAI from 'openai';
import { config } from '../../config';
import { AI_SUGGESTION_TIMEOUT_MS, AI_MAX_RETRIES } from '../../../../shared/constants';
import type { AISuggestion } from '../../../../shared/types';
import { v4 as uuidv4 } from 'uuid';
import { trackAISuggestion, trackModeration } from '../../lib/metrics';

let openai: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!config.openai.enabled) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey: config.openai.apiKey });
  }
  return openai;
}

export function isAIAvailable(): boolean {
  return config.openai.enabled;
}

export async function generateSuggestion(
  topic: string,
  recentTranscript: string,
  participantCount: number,
): Promise<AISuggestion | null> {
  const startTime = Date.now();
  const client = getClient();
  if (!client) {
    trackAISuggestion(Date.now() - startTime, 'fallback');
    return getFallbackSuggestion(topic);
  }

  for (let attempt = 0; attempt < AI_MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), AI_SUGGESTION_TIMEOUT_MS);

      const response = await client.chat.completions.create(
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a friendly conversation facilitator for a casual virtual coffee chat.
The topic is "${topic}" with ${participantCount} participants.
Generate ONE short, engaging suggestion to keep the conversation flowing.
Types: question, topic_pivot, fun_fact, icebreaker.
Respond in JSON: {"content": "...", "type": "question|topic_pivot|fun_fact|icebreaker"}`,
            },
            {
              role: 'user',
              content: recentTranscript
                ? `Recent conversation: ${recentTranscript.slice(0, 500)}`
                : 'The conversation just started. Suggest an icebreaker.',
            },
          ],
          max_tokens: 150,
          temperature: 0.8,
        },
        { signal: controller.signal },
      );

      clearTimeout(timeout);

      const content = response.choices[0]?.message?.content;
      if (!content) continue;

      try {
        const parsed = JSON.parse(content);
        trackAISuggestion(Date.now() - startTime, 'success');
        return {
          id: uuidv4(),
          roomId: '',
          content: parsed.content,
          type: parsed.type || 'question',
          createdAt: new Date().toISOString(),
        };
      } catch {
        // If JSON parsing fails, use the raw text
        trackAISuggestion(Date.now() - startTime, 'success');
        return {
          id: uuidv4(),
          roomId: '',
          content: content.slice(0, 200),
          type: 'question',
          createdAt: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error(`[AI] Suggestion attempt ${attempt + 1} failed:`, err);
      if (attempt === AI_MAX_RETRIES - 1) {
        trackAISuggestion(Date.now() - startTime, 'fallback');
        return getFallbackSuggestion(topic);
      }
    }
  }

  trackAISuggestion(Date.now() - startTime, 'fallback');
  return getFallbackSuggestion(topic);
}

const FALLBACK_SUGGESTIONS: Record<string, string[]> = {
  default: [
    'What brought you to this topic today?',
    "What's something unexpected you learned recently?",
    "If you could have coffee with anyone, who would it be?",
    "What's the most interesting thing that happened to you this week?",
    "Share a fun fact that most people don't know!",
    "What's on your bucket list?",
    "If you could learn any skill instantly, what would it be?",
    "What's the best advice you've ever received?",
  ],
  'Technology & Innovation': [
    "What tech trend are you most excited about?",
    "What's a tool or app you couldn't live without?",
    "Do you think AI will change your daily life in the next year?",
  ],
  'Travel & Culture': [
    "What's your dream travel destination?",
    "What's the most memorable meal you've had while traveling?",
    "Do you prefer adventure travel or relaxation?",
  ],
  'Food & Cooking': [
    "What's your go-to comfort food?",
    "Have you tried cooking something new recently?",
    "What cuisine would you love to master?",
  ],
};

function getFallbackSuggestion(topic: string): AISuggestion {
  const pool = FALLBACK_SUGGESTIONS[topic] || FALLBACK_SUGGESTIONS['default'];
  const content = pool[Math.floor(Math.random() * pool.length)];
  return {
    id: uuidv4(),
    roomId: '',
    content,
    type: 'question',
    createdAt: new Date().toISOString(),
  };
}

export async function moderateContent(text: string): Promise<{
  flagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  confidence: number;
}> {
  const client = getClient();

  // Basic keyword check as first pass / fallback
  const basicCheck = basicModeration(text);
  if (basicCheck.flagged && basicCheck.severity === 'critical') {
    trackModeration(basicCheck.severity, true);
    return basicCheck;
  }

  if (!client) {
    trackModeration(basicCheck.severity, basicCheck.flagged);
    return basicCheck;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const response = await client.moderations.create(
      { input: text },
      { signal: controller.signal },
    );

    clearTimeout(timeout);

    const result = response.results[0];
    if (!result) return basicCheck;

    if (result.flagged) {
      const categories = result.categories;
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
      let reason = 'Content flagged by moderation';

      if (categories.hate || categories['hate/threatening']) {
        severity = 'critical';
        reason = 'Hate speech detected';
      } else if (categories.harassment || categories['harassment/threatening']) {
        severity = 'high';
        reason = 'Harassment detected';
      } else if (categories['sexual/minors'] || categories['violence/graphic']) {
        severity = 'critical';
        reason = 'Severe content violation';
      } else if (categories.sexual || categories.violence) {
        severity = 'medium';
        reason = 'Inappropriate content detected';
      }

      trackModeration(severity, true);
      return { flagged: true, severity, reason, confidence: 0.9 };
    }

    trackModeration('low', false);
    return { flagged: false, severity: 'low', reason: '', confidence: 1.0 };
  } catch (err) {
    console.error('[AI] Moderation failed, using basic check:', err);
    trackModeration(basicCheck.severity, basicCheck.flagged);
    return basicCheck;
  }
}

function basicModeration(text: string): {
  flagged: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  confidence: number;
} {
  const lower = text.toLowerCase();
  const severePatterns = [
    /\b(kill|murder|threat|bomb|attack)\b/i,
  ];

  for (const pattern of severePatterns) {
    if (pattern.test(lower)) {
      return { flagged: true, severity: 'high', reason: 'Potentially harmful content', confidence: 0.6 };
    }
  }

  return { flagged: false, severity: 'low', reason: '', confidence: 0.5 };
}
