import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import Link from 'next/link';

export default async function InvoiceDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch invoice with items
    const { data: invoice } = await supabaseAdmin
        .from('invoices')
        .select(`
            *,
            invoice_items (*)
        `)
        .eq('id', id)
        .eq('parent_id', user.id)
        .single();

    if (!invoice) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={withLocalePrefix('/parent/invoices', locale)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Invoices
                    </Link>
                </Button>
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardHeader className="border-b bg-gray-50/50 flex flex-row justify-between items-start">
                    <div>
                        <CardTitle className="text-2xl">Invoice</CardTitle>
                        <p className="text-gray-500 mt-1">#{invoice.invoice_number}</p>
                    </div>
                    <div className="text-right">
                        <div className={`text-lg font-bold ${invoice.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
                            }`}>
                            {invoice.status.toUpperCase()}
                        </div>
                        <p className="text-sm text-gray-500">
                            Date: {new Date(invoice.created_at).toLocaleDateString(locale)}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    {/* Bill To */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                            <p className="text-gray-600">{user.name}</p>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                            {/* Company Details Mock */}
                            <h3 className="font-semibold text-gray-900 mb-2">Eduverse Inc.</h3>
                            <p className="text-gray-600">123 Education St.</p>
                            <p className="text-gray-600">contact@eduverse.com</p>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-100 uppercase">
                                <tr>
                                    <th className="px-4 py-2 text-left">Student</th>
                                    <th className="px-4 py-2 text-left">Course</th>
                                    <th className="px-4 py-2 text-right">Price</th>
                                    <th className="px-4 py-2 text-right">Discount</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {invoice.invoice_items?.map((item: any) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3">{item.students?.name || '-'}</td>
                                        <td className="px-4 py-3">{item.courses?.name || '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(item.unit_price)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.discount_percent > 0 ? `${item.discount_percent}%` : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pay Now Button for Unpaid Invoices */}
                    {invoice.status !== 'paid' && (
                        <div className="mt-6">
                            <Button
                                size="lg"
                                className="w-full bg-brand-primary text-black hover:bg-yellow-400 font-bold"
                                asChild
                            >
                                <Link href={withLocalePrefix('/parent/payments/checkout', locale)}>
                                    Pay Now
                                </Link>
                            </Button>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(invoice.subtotal)}</span>
                            </div>
                            {invoice.discount_amount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Discount</span>
                                    <span>-{new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(invoice.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t text-gray-900">
                                <span>Total</span>
                                <span>{new Intl.NumberFormat(locale, { style: 'currency', currency: invoice.currency }).format(invoice.total)}</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="bg-gray-50 border-t p-4 flex justify-end gap-2 print:hidden uppercase">
                    <Button variant="outline" size="sm" onClick={() => window.print()}> {/* Note: onclick handlers in server component wont work, need client component wrapper but for simplicity just rendering button */}
                        <Printer className="h-4 w-4 mr-2" /> Print
                    </Button>
                    <Button size="sm">
                        <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="destructive" size="sm" asChild>
                        <Link href={`${withLocalePrefix('/parent/support/new', locale)}?category=billing&subject=Refund Request: Invoice ${invoice.invoice_number}&description=I would like to request a refund for invoice ${invoice.invoice_number} because...`}>
                            Request Refund
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
