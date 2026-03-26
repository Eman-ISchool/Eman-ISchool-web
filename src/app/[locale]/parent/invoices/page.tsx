import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText } from 'lucide-react';

export default async function ParentInvoicesPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    const { data: invoices } = await supabaseAdmin
        .from('invoices')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Invoices & Payments</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                </CardHeader>
                <CardContent>
                    {invoices && invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Invoice #</th>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Amount</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id} className="border-b">
                                            <td className="px-4 py-3 font-medium">{invoice.invoice_number}</td>
                                            <td className="px-4 py-3">
                                                {new Date(invoice.created_at).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-4 py-3 font-bold">
                                                {new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(invoice.total)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                    }`}>
                                                    {invoice.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={withLocalePrefix(`/parent/invoices/${invoice.id}`, locale)}>
                                                            <FileText className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No invoices found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
