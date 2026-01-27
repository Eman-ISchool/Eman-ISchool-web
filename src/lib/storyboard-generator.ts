/**
 * Storyboard Generator
 * Generates AI-powered storyboards from document content for educational reel creation
 */

import OpenAI from 'openai';

export interface StoryboardScene {
  scene_number: number;
  duration: number;
  narration: string;
  visual_suggestion: string;
  text_overlay: string;
  background_style: string;
}

export interface Storyboard {
  scenes: StoryboardScene[];
  summary: string;
  estimated_duration: number;
  target_audience: string;
}

export interface GenerateStoryboardInput {
  content: string;
  targetAudience: string;
  targetDuration?: number;
  visualStyle?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates a storyboard from document content using GPT-4
 * @param input - Storyboard generation parameters
 * @returns Generated storyboard with scene breakdown
 */
export async function generateStoryboard(
  input: GenerateStoryboardInput
): Promise<Storyboard> {
  try {
    console.log('[StoryboardGenerator] Generating storyboard for:', input.targetAudience);
    
    const targetDuration = input.targetDuration || 30;
    const visualStyle = input.visualStyle || 'educational animation style';
    
    // Build prompt for GPT-4
    const prompt = buildStoryboardPrompt(
      input.content,
      input.targetAudience,
      targetDuration,
      visualStyle
    );
    
    // Call GPT-4 API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an educational content specialist. Create engaging, age-appropriate storyboards for ${targetDuration}-second educational videos. Focus on clear learning objectives and visual storytelling.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    });
    
    // Parse response
    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GPT-4');
    }
    
    const storyboardData = JSON.parse(content);
    
    // Validate storyboard structure
    if (!storyboardData.scenes || !Array.isArray(storyboardData.scenes)) {
      throw new Error('Invalid storyboard structure from GPT-4');
    }
    
    // Calculate total duration
    const estimatedDuration = storyboardData.scenes.reduce(
      (total, scene) => total + scene.duration,
      0
    );
    
    console.log('[StoryboardGenerator] Generated storyboard:', {
      sceneCount: storyboardData.scenes.length,
      estimatedDuration,
    });
    
    return {
      scenes: storyboardData.scenes,
      summary: storyboardData.summary || '',
      estimated_duration: estimatedDuration,
      target_audience: input.targetAudience,
    };
  } catch (error: any) {
    console.error('[StoryboardGenerator] Error generating storyboard:', error);
    throw new Error(`Failed to generate storyboard: ${error.message}`);
  }
}

/**
 * Builds the prompt for GPT-4 storyboard generation
 * @param content - Document content
 * @param targetAudience - Target audience (e.g., "Grade 5", "High School")
 * @param targetDuration - Target duration per reel (seconds)
 * @param visualStyle - Visual style preference
 * @returns Formatted prompt
 */
function buildStoryboardPrompt(
  content: string,
  targetAudience: string,
  targetDuration: number,
  visualStyle: string
): string {
  // Truncate content if too long
  const maxContentLength = 3000;
  const truncatedContent = content.length > maxContentLength
    ? content.substring(0, maxContentLength) + '...'
    : content;
  
  return `Create a storyboard for a ${targetDuration}-second educational video reel.

Target Audience: ${targetAudience}

Content Summary:
${truncatedContent}

Requirements:
- Break into ${Math.ceil(targetDuration / 15)} to ${Math.ceil(targetDuration / 10)} scenes (each 10-15 seconds)
- Each scene should have: narration script, visual suggestion, text overlay
- Content must be engaging and educational
- Use clear, simple language appropriate for ${targetAudience}
- Include visual style: ${visualStyle}

Output Format (JSON):
{
  "summary": "Brief 2-3 sentence summary of the entire content",
  "scenes": [
    {
      "scene_number": 1,
      "duration": 15,
      "narration": "Narration text for this scene",
      "visual_suggestion": "Description of visuals/animations",
      "text_overlay": "Key text to display on screen",
      "background_style": "Style/color scheme for background"
    }
  ]
}`;
}

/**
 * Validates storyboard structure
 * @param storyboard - Storyboard to validate
 * @returns True if storyboard is valid
 */
export function validateStoryboard(storyboard: Storyboard): boolean {
  if (!storyboard || !storyboard.scenes || !Array.isArray(storyboard.scenes)) {
    return false;
  }
  
  // Check required fields
  const hasSummary = !!storyboard.summary;
  const hasTargetAudience = !!storyboard.target_audience;
  const hasScenes = storyboard.scenes.length > 0;
  
  // Validate each scene
  const validScenes = storyboard.scenes.every(scene => {
    return (
      typeof scene.scene_number === 'number' &&
      typeof scene.duration === 'number' &&
      typeof scene.narration === 'string' &&
      typeof scene.visual_suggestion === 'string' &&
      typeof scene.text_overlay === 'string' &&
      scene.duration > 0 &&
      scene.duration <= 60 // Max 60 seconds per scene
    );
  });
  
  return hasSummary && hasTargetAudience && hasScenes && validScenes;
}

/**
 * Estimates total duration from storyboard
 * @param storyboard - Storyboard to calculate duration for
 * @returns Total estimated duration in seconds
 */
export function calculateTotalDuration(storyboard: Storyboard): number {
  if (!storyboard || !storyboard.scenes) {
    return 0;
  }
  
  return storyboard.scenes.reduce((total, scene) => total + scene.duration, 0);
}
