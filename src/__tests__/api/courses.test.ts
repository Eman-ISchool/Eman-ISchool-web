import { POST } from '@/app/api/courses/route';
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
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
            data: { id: 'course-1', title: 'Test Course', is_active: true },
            error: null
        }),
    }
}));

describe('POST /api/courses', () => {
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

    it('creates a new course successfully', async () => {
        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Physics 101',
                description: 'Basic Physics',
                price: 10,
                grade_id: 'grade-1',
                subject_id: 'subject-1'
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.course.title).toBe('Test Course');
    });

    it('validates missing title', async () => {
        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                description: 'Basic Physics',
                grade_id: 'grade-1'
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBe('عنوان الدورة مطلوب');
    });

    it('validates missing grade_id', async () => {
        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Physics 101',
                description: 'Basic Physics',
                price: 10,
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBeDefined();
    });

    it('validates invalid grade_id (non-existent UUID)', async () => {
        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Physics 101',
                description: 'Basic Physics',
                price: 10,
                grade_id: 'non-existent-uuid-12345'
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toBeDefined();
    });

    it('returns 401 for unauthenticated requests', async () => {
        // Mock unauthenticated session
        (getServerSession as jest.Mock).mockResolvedValueOnce(null);

        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Physics 101',
                description: 'Basic Physics',
                price: 10,
                grade_id: 'grade-1'
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

        const req = new Request('http://localhost:3000/api/courses', {
            method: 'POST',
            body: JSON.stringify({
                title: 'Physics 101',
                description: 'Basic Physics',
                price: 10,
                grade_id: 'grade-1'
            })
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(403);
        expect(data.error).toBeDefined();
    });
});
