/**
 * Reel Validation Utilities
 * Validates material eligibility for AI reel generation
 */

export interface ValidationResult {
    valid: boolean;
    error?: string;
    details?: string;
}

/**
 * Validate if material is eligible for AI reel generation
 */
export function validateMaterialEligibility(content: string): ValidationResult {
    // Check content length
    if (!content || content.trim().length === 0) {
        return {
            valid: false,
            error: 'Material content is empty',
        };
    }

    // Check minimum content length
    if (content.trim().length < 100) {
        return {
            valid: false,
            error: 'Material content is too short for video generation. Minimum 100 characters required.',
            details: `Current length: ${content.trim().length} characters`,
        };
    }

    // Check if content is text-based (basic check)
    // This is a simplified check - in production, you might want more sophisticated detection
    const textBasedPatterns = [
        // Contains sentences (periods, question marks, exclamation marks)
        /[.!?]/,
        // Contains paragraphs (newlines)
        /\n/,
        // Contains common educational keywords
        /(learn|teach|explain|understand|concept|example|practice|study|lesson|تعلم|درس|شرح|فهم)/i,
    ];

    const hasTextBasedContent = textBasedPatterns.some(pattern => pattern.test(content));

    if (!hasTextBasedContent) {
        return {
            valid: false,
            error: 'Material does not appear to be text-based content suitable for video generation',
            details: 'Please ensure the material contains text content with sentences or paragraphs',
        };
    }

    return {
        valid: true,
    };
}

/**
 * Check if there's a concurrent generation request for the same material
 */
export async function checkConcurrentGeneration(
    materialId: string,
    teacherId: string,
    supabase: any
): Promise<{ hasConcurrent: boolean; existingReelId?: string }> {
    try {
        const { data: existingReels, error } = await supabase
            .from('reels')
            .select('id, status')
            .eq('lesson_material_id', materialId)
            .eq('teacher_id', teacherId)
            .in('status', ['queued', 'processing'])
            .limit(1);

        if (error) {
            console.error('Error checking concurrent generations:', error);
            return { hasConcurrent: false };
        }

        if (existingReels && existingReels.length > 0) {
            return {
                hasConcurrent: true,
                existingReelId: existingReels[0].id,
            };
        }

        return { hasConcurrent: false };
    } catch (error: any) {
        console.error('Error in checkConcurrentGeneration:', error);
        return { hasConcurrent: false };
    }
}

/**
 * Validate lesson material for reel generation
 */
export function validateLessonMaterial(
    lessonId: string | null,
    materialId: string | null
): ValidationResult {
    if (!lessonId && !materialId) {
        return {
            valid: false,
            error: 'Either lesson ID or material ID must be provided',
        };
    }

    return {
        valid: true,
    };
}
