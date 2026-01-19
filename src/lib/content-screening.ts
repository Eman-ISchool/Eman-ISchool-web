/**
 * Content Screening Utility
 * Performs automated content screening for AI-generated reels
 */

export interface ScreeningResult {
    passed: boolean;
    violations: ContentViolation[];
    score: number; // 0-100, higher is better
}

export interface ContentViolation {
    type: 'profanity' | 'inappropriate' | 'spam' | 'low_quality' | 'educational_guidelines';
    severity: 'low' | 'medium' | 'high';
    message: string;
    details?: string;
}

/**
 * Screen content for educational appropriateness
 */
export async function screenContent(content: string): Promise<ScreeningResult> {
    const violations: ContentViolation[] = [];
    let score = 100;

    // Check for profanity
    const profanityCheck = checkProfanity(content);
    if (!profanityCheck.passed) {
        violations.push(...profanityCheck.violations);
        score -= profanityCheck.scorePenalty;
    }

    // Check for inappropriate content patterns
    const inappropriateCheck = checkInappropriatePatterns(content);
    if (!inappropriateCheck.passed) {
        violations.push(...inappropriateCheck.violations);
        score -= inappropriateCheck.scorePenalty;
    }

    // Check for spam/low-quality content
    const spamCheck = checkSpam(content);
    if (!spamCheck.passed) {
        violations.push(...spamCheck.violations);
        score -= spamCheck.scorePenalty;
    }

    // Check content quality
    const qualityCheck = checkContentQuality(content);
    if (!qualityCheck.passed) {
        violations.push(...qualityCheck.violations);
        score -= qualityCheck.scorePenalty;
    }

    // Check educational guidelines
    const educationalCheck = checkEducationalGuidelines(content);
    if (!educationalCheck.passed) {
        violations.push(...educationalCheck.violations);
        score -= educationalCheck.scorePenalty;
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Determine if content passed screening
    const passed = violations.filter(v => v.severity === 'high').length === 0;

    return {
        passed,
        violations,
        score,
    };
}

/**
 * Screen generated reel metadata and content
 */
export async function screenReel(reelData: {
    titleEn: string;
    titleAr: string;
    descriptionEn: string | null;
    descriptionAr: string | null;
    captionsEn?: string;
    captionsAr?: string;
}): Promise<ScreeningResult> {
    const allViolations: ContentViolation[] = [];
    let totalScore = 0;
    let contentCount = 0;

    // Screen English title
    const titleEnResult = await screenContent(reelData.titleEn);
    allViolations.push(...titleEnResult.violations.map(v => ({
        ...v,
        details: v.details ? `${v.details} (English title)` : 'English title',
    })));
    totalScore += titleEnResult.score;
    contentCount++;

    // Screen Arabic title
    const titleArResult = await screenContent(reelData.titleAr);
    allViolations.push(...titleArResult.violations.map(v => ({
        ...v,
        details: v.details ? `${v.details} (Arabic title)` : 'Arabic title',
    })));
    totalScore += titleArResult.score;
    contentCount++;

    // Screen English description if present
    if (reelData.descriptionEn) {
        const descEnResult = await screenContent(reelData.descriptionEn);
        allViolations.push(...descEnResult.violations.map(v => ({
            ...v,
            details: v.details ? `${v.details} (English description)` : 'English description',
        })));
        totalScore += descEnResult.score;
        contentCount++;
    }

    // Screen Arabic description if present
    if (reelData.descriptionAr) {
        const descArResult = await screenContent(reelData.descriptionAr);
        allViolations.push(...descArResult.violations.map(v => ({
            ...v,
            details: v.details ? `${v.details} (Arabic description)` : 'Arabic description',
        })));
        totalScore += descArResult.score;
        contentCount++;
    }

    // Screen English captions if present
    if (reelData.captionsEn) {
        const captionsEnResult = await screenContent(reelData.captionsEn);
        allViolations.push(...captionsEnResult.violations.map(v => ({
            ...v,
            details: v.details ? `${v.details} (English captions)` : 'English captions',
        })));
        totalScore += captionsEnResult.score;
        contentCount++;
    }

    // Screen Arabic captions if present
    if (reelData.captionsAr) {
        const captionsArResult = await screenContent(reelData.captionsAr);
        allViolations.push(...captionsArResult.violations.map(v => ({
            ...v,
            details: v.details ? `${v.details} (Arabic captions)` : 'Arabic captions',
        })));
        totalScore += captionsArResult.score;
        contentCount++;
    }

    // Calculate average score
    const averageScore = contentCount > 0 ? totalScore / contentCount : 100;

    // Determine if reel passed screening
    const passed = allViolations.filter(v => v.severity === 'high').length === 0;

    return {
        passed,
        violations: allViolations,
        score: Math.round(averageScore),
    };
}

/**
 * Check for profanity in content
 */
function checkProfanity(content: string): {
    passed: boolean;
    violations: ContentViolation[];
    scorePenalty: number;
} {
    const violations: ContentViolation[] = [];
    let scorePenalty = 0;

    // Basic profanity list (in production, use a proper profanity filter library)
    const profanityList = [
        // Add actual profanity words here for production
        // This is a placeholder list for demonstration
    ];

    const lowerContent = content.toLowerCase();
    const foundProfanity = profanityList.filter(word => lowerContent.includes(word));

    if (foundProfanity.length > 0) {
        violations.push({
            type: 'profanity',
            severity: 'high',
            message: 'Content contains inappropriate language',
            details: `Found ${foundProfanity.length} profanity word(s)`,
        });
        scorePenalty = 50;
    }

    return {
        passed: violations.length === 0,
        violations,
        scorePenalty,
    };
}

/**
 * Check for inappropriate content patterns
 */
function checkInappropriatePatterns(content: string): {
    passed: boolean;
    violations: ContentViolation[];
    scorePenalty: number;
} {
    const violations: ContentViolation[] = [];
    let scorePenalty = 0;

    // Patterns that may indicate inappropriate content
    const inappropriatePatterns = [
        /violence/i,
        /weapons/i,
        /drugs/i,
        /gambling/i,
        // Add more patterns as needed
    ];

    for (const pattern of inappropriatePatterns) {
        if (pattern.test(content)) {
            violations.push({
                type: 'inappropriate',
                severity: 'medium',
                message: 'Content may contain inappropriate material',
                details: `Matched pattern: ${pattern.source}`,
            });
            scorePenalty += 20;
        }
    }

    return {
        passed: violations.length === 0,
        violations,
        scorePenalty,
    };
}

/**
 * Check for spam or low-quality content
 */
function checkSpam(content: string): {
    passed: boolean;
    violations: ContentViolation[];
    scorePenalty: number;
} {
    const violations: ContentViolation[] = [];
    let scorePenalty = 0;

    // Check for excessive repetition
    const words = content.split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    const maxRepetition = Math.max(...Object.values(wordFrequency));
    const repetitionThreshold = Math.max(5, words.length * 0.3); // 30% or 5 words

    if (maxRepetition > repetitionThreshold) {
        violations.push({
            type: 'spam',
            severity: 'medium',
            message: 'Content contains excessive repetition',
            details: `Word repeated ${maxRepetition} times`,
        });
        scorePenalty += 15;
    }

    // Check for very short content
    if (words.length < 10) {
        violations.push({
            type: 'low_quality',
            severity: 'medium',
            message: 'Content is too short',
            details: `Only ${words.length} words found`,
        });
        scorePenalty += 20;
    }

    // Check for excessive special characters
    const specialCharCount = (content.match(/[^\w\s\u0600-\u06FF]/g) || []).length;
    const specialCharRatio = specialCharCount / content.length;

    if (specialCharRatio > 0.3) {
        violations.push({
            type: 'spam',
            severity: 'low',
            message: 'Content contains excessive special characters',
        });
        scorePenalty += 10;
    }

    return {
        passed: violations.length === 0,
        violations,
        scorePenalty,
    };
}

/**
 * Check content quality
 */
function checkContentQuality(content: string): {
    passed: boolean;
    violations: ContentViolation[];
    scorePenalty: number;
} {
    const violations: ContentViolation[] = [];
    let scorePenalty = 0;

    const words = content.split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Check for reasonable sentence length
    if (sentences.length > 0) {
        const avgWordsPerSentence = words.length / sentences.length;
        if (avgWordsPerSentence > 50) {
            violations.push({
                type: 'low_quality',
                severity: 'low',
                message: 'Sentences are very long and may be hard to follow',
            });
            scorePenalty += 5;
        }
    }

    // Check for mixed language consistency (basic check)
    const hasArabic = /[\u0600-\u06FF]/.test(content);
    const hasLatin = /[a-zA-Z]/.test(content);

    if (hasArabic && hasLatin) {
        // Mixed language content is acceptable for bilingual content
        // But flag if it's very mixed within sentences
        const mixedSentences = sentences.filter(sentence => {
            const hasArabicChar = /[\u0600-\u06FF]/.test(sentence);
            const hasLatinChar = /[a-zA-Z]/.test(sentence);
            return hasArabicChar && hasLatinChar;
        });

        if (mixedSentences.length > sentences.length * 0.5) {
            violations.push({
                type: 'low_quality',
                severity: 'low',
                message: 'Content has mixed languages within sentences',
            });
            scorePenalty += 5;
        }
    }

    return {
        passed: violations.length === 0,
        violations,
        scorePenalty,
    };
}

/**
 * Check educational guidelines compliance
 */
function checkEducationalGuidelines(content: string): {
    passed: boolean;
    violations: ContentViolation[];
    scorePenalty: number;
} {
    const violations: ContentViolation[] = [];
    let scorePenalty = 0;

    // Check for educational keywords (positive indicators)
    const educationalKeywords = [
        'learn', 'teach', 'study', 'lesson', 'concept', 'understand',
        'explain', 'example', 'practice', 'knowledge', 'skill',
        'تعلم', 'درس', 'مفهوم', 'فهم', 'شرح', 'مثال', 'تدريب', 'معرفة',
    ];

    const lowerContent = content.toLowerCase();
    const foundKeywords = educationalKeywords.filter(keyword => lowerContent.includes(keyword));

    // If content has no educational keywords, flag as potentially non-educational
    if (foundKeywords.length === 0 && content.length > 100) {
        violations.push({
            type: 'educational_guidelines',
            severity: 'low',
            message: 'Content may not be clearly educational',
            details: 'No educational keywords detected',
        });
        scorePenalty += 10;
    }

    return {
        passed: violations.length === 0,
        violations,
        scorePenalty,
    };
}

/**
 * Get user-friendly screening result message
 */
export function getScreeningResultMessage(result: ScreeningResult): string {
    if (result.passed) {
        if (result.score >= 90) {
            return 'Content passed screening with excellent quality.';
        } else if (result.score >= 70) {
            return 'Content passed screening. Minor issues detected but acceptable.';
        } else {
            return 'Content passed screening but has quality concerns. Review recommended.';
        }
    } else {
        const highSeverityViolations = result.violations.filter(v => v.severity === 'high');
        if (highSeverityViolations.length > 0) {
            return `Content failed screening due to ${highSeverityViolations.length} high-severity issue(s). Please review and modify.`;
        } else {
            return 'Content failed screening. Please review and modify.';
        }
    }
}
