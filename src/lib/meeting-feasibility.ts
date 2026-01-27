/**
 * Meeting Feasibility Check Utility
 * Validates whether a meeting can be joined and provides testing capabilities
 */

import { isGoogleMeetUrl, validateMeetLinkForJoining } from './meet-utils';

export interface MeetingFeasibility {
    canJoin: boolean;
    reason: string;
    timeUntilStart?: number; // minutes
    timeUntilEnd?: number; // minutes
    meetLink?: string;
    status: 'too_early' | 'joinable' | 'ended' | 'no_link' | 'invalid_link' | 'cancelled';
}

export interface LessonInfo {
    id: string;
    title: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string | null;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
}

/**
 * Check if a meeting can be joined
 * Rules:
 * - Can join 10 minutes before start until end time
 * - Must have valid meet link
 * - Status must not be cancelled
 */
export function checkMeetingFeasibility(lesson: LessonInfo, currentTime?: Date): MeetingFeasibility {
    const now = currentTime || new Date();
    const start = new Date(lesson.startDateTime);
    const end = new Date(lesson.endDateTime);

    // Check if cancelled
    if (lesson.status === 'cancelled') {
        return {
            canJoin: false,
            reason: 'هذه الجلسة ملغية',
            status: 'cancelled',
        };
    }

    // Check if meet link exists
    if (!lesson.meetLink) {
        return {
            canJoin: false,
            reason: 'لا يوجد رابط اجتماع متاح',
            status: 'no_link',
        };
    }

    // Validate meet link format
    const validation = validateMeetLinkForJoining(lesson.meetLink);
    if (!validation.isValid) {
        return {
            canJoin: false,
            reason: validation.error || 'رابط الاجتماع غير صالح',
            status: 'invalid_link',
        };
    }

    // Calculate time differences
    const joinWindow = new Date(start.getTime() - 10 * 60 * 1000); // 10 min before
    const msUntilStart = start.getTime() - now.getTime();
    const msUntilEnd = end.getTime() - now.getTime();
    const minutesUntilStart = Math.floor(msUntilStart / (60 * 1000));
    const minutesUntilEnd = Math.floor(msUntilEnd / (60 * 1000));

    // Check if too early
    if (now < joinWindow) {
        return {
            canJoin: false,
            reason: `يمكنك الانضمام قبل ${minutesUntilStart} دقيقة من بدء الدرس`,
            timeUntilStart: minutesUntilStart,
            status: 'too_early',
        };
    }

    // Check if ended
    if (now > end) {
        return {
            canJoin: false,
            reason: 'انتهى هذا الدرس',
            status: 'ended',
        };
    }

    // Can join!
    return {
        canJoin: true,
        reason: lesson.status === 'live' ? 'الدرس جارٍ الآن' : 'يمكنك الانضمام الآن',
        timeUntilStart: minutesUntilStart > 0 ? minutesUntilStart : 0,
        timeUntilEnd: minutesUntilEnd,
        meetLink: lesson.meetLink,
        status: 'joinable',
    };
}

/**
 * Format time until start/end for display
 */
export function formatTimeRemaining(minutes: number): string {
    if (minutes <= 0) return 'الآن';
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ساعة`;
    return `${hours}س ${remainingMinutes}د`;
}

/**
 * Testing utilities for meeting feasibility
 */
export const MeetingFeasibilityTest = {
    /**
     * Create a test lesson that starts in X minutes
     */
    createTestLesson(minutesFromNow: number, options?: Partial<LessonInfo>): LessonInfo {
        const now = new Date();
        const start = new Date(now.getTime() + minutesFromNow * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour duration

        return {
            id: 'test-' + Date.now(),
            title: 'Test Lesson',
            startDateTime: start.toISOString(),
            endDateTime: end.toISOString(),
            meetLink: 'https://meet.google.com/abc-defg-hij',
            status: 'scheduled',
            ...options,
        };
    },

    /**
     * Run all feasibility tests
     */
    runTests(): { name: string; passed: boolean; details: string }[] {
        const results: { name: string; passed: boolean; details: string }[] = [];

        // Test 1: Too early (30 minutes before)
        const earlyLesson = this.createTestLesson(30);
        const earlyResult = checkMeetingFeasibility(earlyLesson);
        results.push({
            name: 'Too Early Test',
            passed: !earlyResult.canJoin && earlyResult.status === 'too_early',
            details: `Expected canJoin=false, got ${earlyResult.canJoin}`,
        });

        // Test 2: Joinable (5 minutes before)
        const joinableLesson = this.createTestLesson(5);
        const joinableResult = checkMeetingFeasibility(joinableLesson);
        results.push({
            name: 'Joinable Window Test',
            passed: joinableResult.canJoin && joinableResult.status === 'joinable',
            details: `Expected canJoin=true, got ${joinableResult.canJoin}`,
        });

        // Test 3: Live lesson
        const liveLesson = this.createTestLesson(-10, { status: 'live' });
        const liveResult = checkMeetingFeasibility(liveLesson);
        results.push({
            name: 'Live Lesson Test',
            passed: liveResult.canJoin,
            details: `Expected canJoin=true for live, got ${liveResult.canJoin}`,
        });

        // Test 4: Cancelled lesson
        const cancelledLesson = this.createTestLesson(5, { status: 'cancelled' });
        const cancelledResult = checkMeetingFeasibility(cancelledLesson);
        results.push({
            name: 'Cancelled Lesson Test',
            passed: !cancelledResult.canJoin && cancelledResult.status === 'cancelled',
            details: `Expected canJoin=false, status=cancelled`,
        });

        // Test 5: No meet link
        const noLinkLesson = this.createTestLesson(5, { meetLink: null });
        const noLinkResult = checkMeetingFeasibility(noLinkLesson);
        results.push({
            name: 'No Meet Link Test',
            passed: !noLinkResult.canJoin && noLinkResult.status === 'no_link',
            details: `Expected status=no_link`,
        });

        // Test 6: Ended lesson
        const endedLesson = this.createTestLesson(-120);
        const endedResult = checkMeetingFeasibility(endedLesson);
        results.push({
            name: 'Ended Lesson Test',
            passed: !endedResult.canJoin && endedResult.status === 'ended',
            details: `Expected canJoin=false, status=ended`,
        });

        return results;
    },

    /**
     * Log test results to console
     */
    logResults(): void {
        console.log('=== Meeting Feasibility Tests ===');
        const results = this.runTests();
        results.forEach(r => {
            console.log(`${r.passed ? '✅' : '❌'} ${r.name}: ${r.details}`);
        });
        const passed = results.filter(r => r.passed).length;
        console.log(`\nTotal: ${passed}/${results.length} tests passed`);
    }
};
