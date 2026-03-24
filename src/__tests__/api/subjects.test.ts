import { POST } from '@/app/api/subjects/route';
import { getCurrentUser } from '@/lib/auth';

jest.mock('next-auth', () => ({
    default: jest.fn(),
    getServerSession: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
    authOptions: {},
    getCurrentUser: jest.fn(),
    isTeacherOrAdmin: jest.fn().mockImplementation((role: string) =>
        role === 'teacher' || role === 'admin'
    ),
    isAdmin: jest.fn().mockImplementation((role: string) => role === 'admin'),
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
    let getServerSession: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        getServerSession = require('next-auth').getServerSession as jest.Mock;
        getServerSession.mockResolvedValue({ user: { email: 'teacher@test.com' } });
        (getCurrentUser as jest.Mock).mockResolvedValue({ id: '123', role: 'teacher' });
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

        expect(res.status).toBe(201);
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
        expect(data.error).toBe('Subject title is required');
    });

    it('returns 401 for unauthenticated requests', async () => {
        getServerSession.mockResolvedValueOnce(null);

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
        (getCurrentUser as jest.Mock).mockResolvedValueOnce({ id: '123', role: 'student' });

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
