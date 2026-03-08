import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = session.user as any;

    if (user.role !== 'teacher' && user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        // Fetch material first to check ownership
        const { data: material } = await supabaseAdmin
            .from('materials')
            .select('id, uploaded_by')
            .eq('id', params.id)
            .single();

        if (!material) {
            return NextResponse.json({ error: 'Material not found' }, { status: 404 });
        }

        // Check ownership - teachers can only delete their own materials, admins can delete any
        if (user.role !== 'admin' && material.uploaded_by !== user.id) {
            return NextResponse.json({ error: 'Forbidden - You can only delete your own materials' }, { status: 403 });
        }

        const { error } = await supabaseAdmin
            .from('materials')
            .delete()
            .eq('id', params.id);

        if (error) throw error;

        return NextResponse.json({ message: 'Material deleted' });
    } catch (error) {
        console.error('Error deleting material:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
