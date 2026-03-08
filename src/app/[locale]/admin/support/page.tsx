import { getServerSession } from 'next-auth';
import { authOptions, isAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquare, AlertCircle } from 'lucide-react';

export default async function AdminSupportPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isAdmin(user.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    const { data: tickets } = await supabaseAdmin
        .from('support_tickets')
        .select(`
            *,
            user:users!support_tickets_user_id_fkey(name, email)
        `)
        .order('created_at', { ascending: false });

    // Simple stats
    const openCount = tickets?.filter(t => t.status === 'open').length || 0;
    const urgentCount = tickets?.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length || 0;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Support Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2"><CardTitle className="text-blue-700 text-sm">Open Tickets</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-blue-900">{openCount}</div></CardContent>
                </Card>
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2"><CardTitle className="text-red-700 text-sm flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Urgent</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-red-900">{urgentCount}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    {tickets && tickets.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-start">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">ID</th>
                                        <th className="px-4 py-3">Subject</th>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Priority</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tickets.map((ticket) => (
                                        <tr key={ticket.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-mono text-xs">{ticket.ticket_number}</td>
                                            <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col">
                                                    <span>{ticket.user.name}</span>
                                                    <span className="text-xs text-gray-500">{ticket.user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                                        ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {ticket.priority.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${ticket.status === 'open' ? 'bg-green-100 text-green-700' :
                                                        ticket.status === 'resolved' ? 'bg-gray-100 text-gray-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {ticket.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={withLocalePrefix(`/admin/support/${ticket.id}`, locale)}>
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
                            No tickets found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
