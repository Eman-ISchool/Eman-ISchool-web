import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TicketChat } from '@/components/support/TicketChat';

export default async function TicketDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch ticket details
    const { data: ticket } = await supabaseAdmin
        .from('support_tickets')
        .select(`
            *,
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

    // Verify ownership
    if (ticket.user_id !== user.id) {
        return <div>Access Denied</div>;
    }

    // Sort messages
    const messages = ticket.messages?.sort((a: any, b: any) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ) || [];

    return (
        <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href={withLocalePrefix('/parent/support', locale)}>
                            <ArrowLeft className="h-4 w-4 mr-2" /> Back
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-bold flex items-center gap-2">
                            {ticket.subject}
                            <span className="text-sm font-normal text-gray-500">#{ticket.ticket_number}</span>
                        </h1>
                        <div className="flex gap-2 text-xs">
                            <span className={`px-2 py-0.5 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                    ticket.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                                        'bg-yellow-100 text-yellow-700'
                                }`}>
                                {ticket.status.toUpperCase()}
                            </span>
                            <span className="px-2 py-0.5 bg-gray-100 rounded-full capitalize">
                                {ticket.category}
                            </span>
                        </div>
                    </div>
                </div>
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
