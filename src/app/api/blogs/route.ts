import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    if (!isSupabaseAdminConfigured || !supabaseAdmin) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get('slug');
        const published = searchParams.get('published') !== 'false';

        if (slug) {
            // Single post by slug
            let singleQuery = supabaseAdmin.from('posts').select('*').eq('slug', slug);

            if (published) {
                singleQuery = singleQuery.eq('is_published', true);
            }

            const { data: post, error } = await singleQuery.single();

            if (error) {
                if (error.code === '42P01' || error.message?.includes('does not exist')) {
                    console.warn('Posts table not yet created, returning empty result');
                    return NextResponse.json({ posts: null });
                }
                console.error('Error fetching post:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            const response = NextResponse.json({ posts: post });
            response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
            return response;
        }

        // List of posts
        let listQuery = supabaseAdmin.from('posts').select('*');

        if (published) {
            listQuery = listQuery.eq('is_published', true);
        }

        listQuery = listQuery.order('published_at', { ascending: false }).limit(50);

        const { data: posts, error } = await listQuery;

        if (error) {
            // Handle missing table gracefully
            if (error.code === '42P01' || error.message?.includes('does not exist')) {
                console.warn('Posts table not yet created, returning empty list');
                return NextResponse.json({ posts: [] });
            }
            console.error('Error fetching posts:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const response = NextResponse.json({ posts });
        response.headers.set('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=600');
        return response;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error('API Error:', error);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
