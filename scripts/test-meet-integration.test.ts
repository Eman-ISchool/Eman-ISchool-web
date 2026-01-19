
import { createGoogleMeet, MeetError } from '../src/lib/meet';
import { google } from 'googleapis';

// Mock googleapis
jest.mock('googleapis', () => {
    const mOAuth2Client = {
        setCredentials: jest.fn(),
    };
    const mEvents = {
        insert: jest.fn(),
    };
    const mCalendar = {
        events: mEvents,
    };
    return {
        google: {
            auth: {
                OAuth2: jest.fn(() => mOAuth2Client),
            },
            calendar: jest.fn(() => mCalendar),
        },
    };
});

describe('createGoogleMeet', () => {
    const mockAccessToken = 'mock-access-token';
    const mockEventDetails = {
        summary: 'Test Meeting',
        description: 'Test Description',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a meeting successfully', async () => {
        const mInsert = google.calendar('v3').events.insert as jest.Mock;
        mInsert.mockResolvedValueOnce({
            data: {
                hangoutLink: 'https://meet.google.com/abc-defg-hij',
                id: 'event-id-123',
                htmlLink: 'https://calendar.google.com/event?eid=123',
            },
        });

        const result = await createGoogleMeet(mockAccessToken, mockEventDetails);

        expect(result.success).toBe(true);
        expect(result.meetLink).toBe('https://meet.google.com/abc-defg-hij');
        expect(result.eventId).toBe('event-id-123');
        expect(google.auth.OAuth2).toHaveBeenCalled();
    });

    it('should handle missing access token', async () => {
        const result = await createGoogleMeet('', mockEventDetails);
        expect(result.success).toBe(false);
        expect(result.error).toContain('لا يوجد رمز وصول صالح');
    });

    it('should handle 401 error (token expired)', async () => {
        const mInsert = google.calendar('v3').events.insert as jest.Mock;
        mInsert.mockRejectedValueOnce({
            response: { status: 401 },
        });

        const result = await createGoogleMeet(mockAccessToken, mockEventDetails);

        expect(result.success).toBe(false);
        expect(result.requiresReauth).toBe(true);
        expect(result.error).toContain('انتهت صلاحية الجلسة');
    });

    it('should handle 429 error (rate limit) with retries', async () => {
        const mInsert = google.calendar('v3').events.insert as jest.Mock;
        // Fail twice, succeed third time
        mInsert
            .mockRejectedValueOnce({ response: { status: 429 } })
            .mockRejectedValueOnce({ response: { status: 429 } })
            .mockResolvedValueOnce({
                data: {
                    hangoutLink: 'https://meet.google.com/retry-success',
                },
            });

        // Mock delay to speed up test
        // Note: The delay function in the file is internal and not exported or easily mocked without rewiring.
        // For this test, we accept the delay (it adds a few seconds) or we could use jest.useFakeTimers.
        jest.useFakeTimers();

        const promise = createGoogleMeet(mockAccessToken, mockEventDetails);

        // Fast-forward time for retries
        await jest.runAllTimersAsync();

        const result = await promise;

        expect(result.success).toBe(true);
        expect(result.meetLink).toBe('https://meet.google.com/retry-success');
        expect(mInsert).toHaveBeenCalledTimes(3);

        jest.useRealTimers();
    });
});
