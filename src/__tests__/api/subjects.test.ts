import { POST } from '@/app/api/subjects/route';
import { NextResponse } from 'next/server';
import { getServerSession, getCurrentUser } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
    getServerSession: jest.fn(),
    getCurrentUser: jest.fn(),
    isTeacherOrAdmin: jest.fn().mockReturnValue(true),
}));

jest.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { id: 'subj-1', title: 'Test Subject' },
            error: null
        }),
    }
}));

describe('POST /api/subjects', () => {
    beforeEach(() => {
        // Reset mocks before each test
        (getServerSession as jest.Mock).mockResolvedValue({
            user: { email: 'teacher@test.com' }
        });
        (getCurrentUser as jest.Mock).mockResolvedValue({
            id: '123',
            role: 'teacher'
        });
    });

    it('creates a new subject successfully', async () => {
        const req = new Request('http://localhost:3000/api/subjects', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Mathematics 101',
                description: 'Basic Math',
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.subject.title).toBe('Test Subject');
    });

    it('validates missing title', async () => {
        const req = new Request('http://localhost:3000/api/subjects', {
            method: 'POST',
            body: JSON.stringify({
                description: 'Basic Math',
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBe('عنوان المادة مطلوب');
    });

    it('returns 401 for unauthenticated requests', async () => {
        // Mock unauthenticated session
        (getServerSession as jest.Mock).mockResolvedValueOnce(null);

        const req = new Request('http://localhost:3000/api/subjects', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Mathematics 101',
                description: 'Basic Math',
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(401);
        expect(data.error).toBeDefined();
    });

    it('returns 403 for student role', async () => {
        // Mock student role
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({
            id: '123',
            role: 'student'
        });

        const req = new Request('http://localhost:3000/api/subjects', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Mathematics 101',
                description: 'Basic Math',
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.error).toBeDefined();
    });
});
