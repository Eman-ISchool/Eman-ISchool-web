import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET(req: Request) {
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const published = searchParams.get('published') !== 'false';

        let query = supabaseAdmin.from('posts').select('*');

        if (published) {
            query = query.eq('is_published', true);
        }

        if (slug) {
            query = query.eq('slug', slug).single();
        } else {
            query = query.order('published_at', { ascending: false });
        }

        const { data: posts, error } = await query;

        if (error) {
            console.error('Error fetching posts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ posts });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
