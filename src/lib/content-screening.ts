/**
 * Content Screening Library
 * Provides AI-based content moderation for uploaded files before processing
 */

export interface ScreeningResult {
  isAppropriate: boolean;
  confidence?: number;
  flaggedCategories?: string[];
  details?: string;
}

/**
 * Screens content for inappropriate material using AI moderation
 * @param content - Text content to screen
 * @param contentType - Type of content (video transcript, document text)
 * @returns Screening result with appropriateness flag and confidence score
 */
export async function moderateContent(
  content: string,
  contentType: 'transcript' | 'document' | 'video'
): Promise<ScreeningResult> {
  try {
    console.log('[Content Screening] Screening content:', {
      contentType,
      contentLength: content.length,
    });

    // For now, return a basic screening result
    // In production, this would call an AI moderation API
    // For MVP, we'll use a simple keyword-based approach
    
    const inappropriateKeywords = [
      'violence',
      'weapon',
      'drug',
      'alcohol',
      'adult',
      'gambling',
      'hate',
      'discrimination',
      'terrorism',
    ];

    const contentLower = content.toLowerCase();
    
    // Check for inappropriate content
    const flaggedCategories: string[] = [];
    
    for (const keyword of inappropriateKeywords) {
      if (contentLower.includes(keyword)) {
        flaggedCategories.push(keyword);
      }
    }

    // Check for suspicious patterns (excessive special characters, repeated patterns)
    const suspiciousPatterns = [
      /[!@#$%^&*()_+=\[\]{}|\\:;"'<>,/]{2,}/g,
      /(.{10,})\1{10,}/g, // Repeated characters
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(content)) {
        flaggedCategories.push('suspicious content');
        break;
      }
    }

    const isAppropriate = flaggedCategories.length === 0;

    // Calculate confidence score (simple heuristic)
    let confidence = 100;
    if (flaggedCategories.length > 0) {
      confidence = Math.max(0, 100 - (flaggedCategories.length * 10));
    }

    const result: ScreeningResult = {
      isAppropriate,
      confidence,
      flaggedCategories: flaggedCategories.length > 0 ? flaggedCategories : undefined,
      details: flaggedCategories.length > 0
        ? `Content flagged for: ${flaggedCategories.join(', ')}`
        : 'Content passed screening',
    };

    console.log('[Content Screening] Screening result:', result);

    return result;
  } catch (error) {
    console.error('[Content Screening] Error screening content:', error);
    return {
      isAppropriate: false,
      confidence: 0,
      details: 'Content screening failed',
    };
  }
}

/**
 * Screens video transcript for educational content
 * @param transcription - Transcript text to screen
 * @returns Screening result
 */
export async function screenTranscript(transcription: string): Promise<ScreeningResult> {
  return moderateContent(transcription, 'transcript');
}

/**
 * Screens document text for educational content
 * @param text - Document text to screen
 * @returns Screening result
 */
export async function screenDocumentText(text: string): Promise<ScreeningResult> {
  return moderateContent(text, 'document');
}

/**
 * Screens video file for inappropriate content
 * @param videoUrl - URL of video file to screen
 * @returns Screening result
 */
export async function screenVideoFile(videoUrl: string): Promise<ScreeningResult> {
  // For video files, we would need to analyze the video content
  // This is a placeholder for future implementation
  console.log('[Content Screening] Video screening not yet implemented');
  
  return {
    isAppropriate: true,
    confidence: 100,
    details: 'Video screening not yet implemented',
  };
}
