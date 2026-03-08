import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TicketChat } from '@/components/support/TicketChat';
import { AdminTicketActions } from '@/components/support/AdminTicketActions';

export default async function AdminTicketDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isAdmin(user.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch details
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select(`
            *,
            user:users!support_tickets_user_id_fkey(name, email),
            messages:ticket_messages(
                id,
                message,
                created_at,
                is_internal,
                sender:users!ticket_messages_sender_id_fkey(id, name, role, image)
            )
        `)
        .eq('id', id)
        .single();

    if (!ticket) notFound();

    const messages = ticket.messages?.sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];

    return (
        <div className="space-y-6 flex flex-col h-[calc(100vh-100px)]">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={withLocalePrefix('/admin/support', locale)}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {ticket.subject}
                            <span className="text-sm font-normal text-gray-500">#{ticket.ticket_number}</span>
                        </h1>
                        <p className="text-sm text-gray-500">From: {ticket.user.name} ({ticket.user.email})</p>
                    </div>
                </div>
                <AdminTicketActions ticketId={ticket.id} currentStatus={ticket.status} />
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <TicketChat
                    ticketId={ticket.id}
                    initialMessages={messages}
                    currentUserId={user.id}
                    status={ticket.status}
                />
            </Card>
        </div>
    );
}
