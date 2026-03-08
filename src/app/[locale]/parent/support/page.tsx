import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, MessageSquare } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function ParentSupportPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    const t = await getTranslations('parent.support'); // Assume keys exist or fallback

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    const { data: tickets } = await supabaseAdmin
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Support Center</h1>
                <Button asChild className="bg-brand-primary text-black hover:bg-yellow-400">
                    <Link href={withLocalePrefix('/parent/support/new', locale)}>
                        <Plus className="h-4 w-4 mr-2" /> New Ticket
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {tickets && tickets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">Category</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Last Update</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-b">
                                            <td className="px-4 py-3 font-mono text-xs">{ticket.ticket_number}</td>
                                            <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                                            <td className="px-4 py-3 capitalize">{ticket.category}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        ticket.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {ticket.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                {new Date(ticket.updated_at).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={withLocalePrefix(`/parent/support/${ticket.id}`, locale)}>
                                                        <MessageSquare className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No tickets found. Need help? Create a new ticket.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
