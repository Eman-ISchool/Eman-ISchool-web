import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    try {
        const body = await req.json();
        const { message, isInternal } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message required' }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: params.id,
                sender_id: user.id,
                message,
                is_internal: isInternal === true ? true : false
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error adding message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
