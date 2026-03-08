import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    try {
        // Fetch ticket details
        const { data: ticket, error } = await supabaseAdmin
            .from('support_tickets')
            .select(`
                *,
                user:users!support_tickets_user_id_fkey(name, email, role),
                messages:ticket_messages(
                    id,
                    message,
                    created_at,
                    is_internal,
                    sender:users!ticket_messages_sender_id_fkey(id, name, role, image)
                )
            `)
            .eq('id', params.id)
            .single();

        if (error || !ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Authorization Check
        if (!isAdmin(user.role) && ticket.user_id !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Sort messages manually if needed (Supabase usually allows ordering in join but simple select might needed)
        // Let's sort in JS to be safe
        if (ticket.messages) {
            ticket.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    // Only admin or the ticket owner (cancel only) can update
    // Actually, usually only admin updates status to 'resolved'/'in_progress'. 
    // User might 'close' it.

    try {
        const body = await req.json();
        const { status, assignedTo } = body;

        const updates: any = {};
        if (status) updates.status = status;
        if (assignedTo && isAdmin(user.role)) updates.assigned_to = assignedTo;

        // If resolving, set resolved_at
        if (status === 'resolved' || status === 'closed') {
            updates.resolved_at = new Date().toISOString();
        }

        const { data, error } = await supabaseAdmin
            .from('support_tickets')
            .update(updates)
            .eq('id', params.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error updating ticket:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
