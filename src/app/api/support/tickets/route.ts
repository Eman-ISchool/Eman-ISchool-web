import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        let query = supabaseAdmin
            .from('support_tickets')
            .select(`
                *,
                user:users!support_tickets_user_id_fkey(name, email, role)
            `)
            .order('created_at', { ascending: false });

        // If not admin, only show own tickets
        if (!isAdmin(user.role)) {
            query = query.eq('user_id', user.id);
        } else {
            // Admin filters
            if (status) {
                query = query.eq('status', status);
            }
        }

        const { data: tickets, error } = await query;

        if (error) throw error;

        return NextResponse.json(tickets);
    } catch (error: any) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const user = session.user as any;

    try {
        const body = await req.json();
        const { subject, category, description, priority = 'medium' } = body;

        if (!subject || !category || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Ticket
        const { data: ticket, error: ticketError } = await supabaseAdmin
            .from('support_tickets')
            .insert({
                user_id: user.id,
                subject,
                category,
                priority,
                status: 'open',
                ticket_number: (await supabaseAdmin.rpc('generate_ticket_number')) || `TKT-${Date.now()}`
            })
            .select()
            .single();

        if (ticketError) throw ticketError;

        // 2. Create Initial Message from Description
        const { error: messageError } = await supabaseAdmin
            .from('ticket_messages')
            .insert({
                ticket_id: ticket.id,
                sender_id: user.id,
                message: description,
                is_internal: false
            });

        if (messageError) throw messageError;

        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
