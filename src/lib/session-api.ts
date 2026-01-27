/**
 * Session API helper functions
 * Provides fetch wrapper with error handling for session/lesson operations
 */

export interface Session {
    _id: string;
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    meetLink?: string | null;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    course?: {
        id: string;
        title: string;
        slug: string;
    };
    teacher?: {
        id: string;
        name: string;
        email: string;
        image?: string;
    };
    googleEventId?: string | null;
    googleCalendarLink?: string | null;
    recordingUrl?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface CreateSessionInput {
    title: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    courseId?: string;
    skipMeetGeneration?: boolean;
    status?: 'scheduled' | 'completed';
    notes?: string;
}

export interface UpdateSessionInput {
    id: string;
    title?: string;
    description?: string;
    startDateTime?: string;
    endDateTime?: string;
    status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
    meetLink?: string;
    notes?: string;
}

export interface SessionApiResponse<T = Session | Session[]> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    requiresGoogleAuth?: boolean;
}

/**
 * Fetch sessions with optional filters
 */
export async function fetchSessions(params?: {
    status?: string;
    upcoming?: boolean;
    courseId?: string;
    teacherId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
}): Promise<SessionApiResponse<Session[]>> {
    try {
        const searchParams = new URLSearchParams();
        if (params?.status) searchParams.append('status', params.status);
        if (params?.upcoming) searchParams.append('upcoming', 'true');
        if (params?.courseId) searchParams.append('courseId', params.courseId);
        if (params?.teacherId) searchParams.append('teacherId', params.teacherId);
        if (params?.startDate) searchParams.append('startDate', params.startDate);
        if (params?.endDate) searchParams.append('endDate', params.endDate);
        if (params?.limit) searchParams.append('limit', String(params.limit));
        if (params?.offset) searchParams.append('offset', String(params.offset));

        const response = await fetch(`/api/lessons?${searchParams.toString()}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'فشل جلب الجلسات' }));
            return {
                success: false,
                error: errorData.error || 'فشل جلب الجلسات',
            };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء جلب الجلسات. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * Create a new session
 */
export async function createSession(input: CreateSessionInput): Promise<SessionApiResponse<Session>> {
    try {
        const response = await fetch('/api/lessons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل إنشاء الجلسة',
                code: data.code,
                requiresGoogleAuth: data.requiresGoogleAuth,
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error creating session:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء إنشاء الجلسة. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * Update an existing session
 */
export async function updateSession(input: UpdateSessionInput): Promise<SessionApiResponse<Session>> {
    try {
        const response = await fetch('/api/lessons', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل تحديث الجلسة',
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error updating session:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء تحديث الجلسة. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * Delete a session
 */
export async function deleteSession(id: string): Promise<SessionApiResponse<void>> {
    try {
        const response = await fetch(`/api/lessons?id=${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل حذف الجلسة',
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error deleting session:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء حذف الجلسة. يرجى المحاولة مرة أخرى.',
        };
    }
}

/**
 * Regenerate Google Meet link for a session
 */
export async function regenerateMeetLink(lessonId: string): Promise<SessionApiResponse<{ meetLink: string; googleEventId?: string; googleCalendarLink?: string }>> {
    try {
        const response = await fetch(`/api/lessons/${lessonId}/regenerate-meet`, {
            method: 'POST',
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل إعادة إنشاء رابط Meet',
                requiresGoogleAuth: data.requiresGoogleAuth,
            };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error regenerating Meet link:', error);
        return {
            success: false,
            error: 'حدث خطأ أثناء إعادة إنشاء رابط Meet. يرجى المحاولة مرة أخرى.',
        };
    }
}
