import { GET } from '@/app/api/grade-levels/route';

jest.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({
            data: [
                { id: 'grade-1', name: 'KG 1', name_en: 'KG 1', slug: 'kg1', sort_order: 1, is_active: true },
                { id: 'grade-2', name: 'KG 2', name_en: 'KG 2', slug: 'kg2', sort_order: 2, is_active: true },
                { id: 'grade-3', name: 'Grade 1', name_en: 'Grade 1', slug: 'grade-1', sort_order: 3, is_active: true },
            ],
            error: null
        }),
    }
}));

jest.mock('@/lib/request-id', () => ({
    generateRequestId: jest.fn().mockReturnValue('test-request-id-123'),
}));

describe('GET /api/grade-levels', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns 200 with grades sorted by sort_order', async () => {
        const req = new Request('http://127.0.0.1:3000/api/grade-levels');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.grades).toBeDefined();
        expect(Array.isArray(data.grades)).toBe(true);
        expect(data.total).toBe(3);
        expect(data.requestId).toBe('test-request-id-123');
        
        // Verify grades are sorted by sort_order
        const sortOrders = data.grades.map((g: any) => g.sort_order);
        const sortedOrders = [...sortOrders].sort((a, b) => a - b);
        expect(sortOrders).toEqual(sortedOrders);
    });

    it('returns empty array when no grades exist', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        supabaseAdmin.from().select().eq().order.mockResolvedValueOnce({
            data: [],
            error: null
        });

        const req = new Request('http://127.0.0.1:3000/api/grade-levels');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.grades).toEqual([]);
        expect(data.total).toBe(0);
    });

    it('returns 500 on database error', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        supabaseAdmin.from().select().eq().order.mockResolvedValueOnce({
            data: null,
            error: { message: 'Database connection failed' }
        });

        const req = new Request('http://127.0.0.1:3000/api/grade-levels');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('Failed to fetch grade levels');
        expect(data.code).toBe('GRADE_FETCH_ERROR');
        expect(data.requestId).toBe('test-request-id-123');
    });

    it('excludes inactive grades from response', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        supabaseAdmin.from().select().eq().order.mockResolvedValueOnce({
            data: [
                { id: 'grade-1', name: 'KG 1', name_en: 'KG 1', slug: 'kg1', sort_order: 1, is_active: true },
                { id: 'grade-2', name: 'KG 2', name_en: 'KG 2', slug: 'kg2', sort_order: 2, is_active: false },
                { id: 'grade-3', name: 'Grade 1', name_en: 'Grade 1', slug: 'grade-1', sort_order: 3, is_active: true },
            ],
            error: null
        });

        const req = new Request('http://127.0.0.1:3000/api/grade-levels');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(200);
        expect(data.grades).toHaveLength(2);
        expect(data.grades.every((g: any) => g.is_active === true)).toBe(true);
    });

    it('handles unexpected errors gracefully', async () => {
        const { supabaseAdmin } = require('@/lib/supabase');
        supabaseAdmin.from.mockImplementationOnce(() => {
            throw new Error('Unexpected error');
        });

        const req = new Request('http://127.0.0.1:3000/api/grade-levels');
        const res = await GET(req);
        const data = await res.json();

        expect(res.status).toBe(500);
        expect(data.error).toBe('An unexpected error occurred');
        expect(data.code).toBe('INTERNAL_SERVER_ERROR');
        expect(data.requestId).toBe('test-request-id-123');
    });
});
