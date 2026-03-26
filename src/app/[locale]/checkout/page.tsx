"use client";

import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export default function CheckoutPage() {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const { items, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toLocale = (href: string) => withLocalePrefix(href, locale);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (status === 'unauthenticated') {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle>يجب تسجيل الدخول للإكمال</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-500 mb-6">يرجى تسجيل الدخول أولاً لتتمكن من إتمام عملية الشراء والوصول لدوراتك.</p>
                        <Button onClick={() => router.push(toLocale('/login'))} className="bg-brand-primary text-black font-bold w-full">
                            تسجيل الدخول
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalPrice = items.reduce((acc, item) => {
        const price = parseInt(item.price.replace(/[^\d]/g, ''));
        return acc + (isNaN(price) ? 0 : price);
    }, 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setError(null);

        try {
            // Enroll in each course
            for (const item of items) {
                const res = await fetch('/api/enrollments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ courseId: item.id }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || `فشل التسجيل في ${item.title}`);
                }
            }

            clearCart();
            alert('تم تأكيد طلبك والاشتراك في الدورات بنجاح! يمكنك الآن الوصول إليها من لوحة التحكم.');
            router.push(toLocale('/dashboard'));
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'حدث خطأ أثناء إتمام الطلب');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8 text-brand-dark text-center">إتمام الشراء</h1>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Order Summary */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>ملخص الطلب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.title}</span>
                                <span>{item.price}</span>
                            </div>
                        ))}
                        <div className="border-t pt-4 flex justify-between font-bold text-lg">
                            <span>الإجمالي</span>
                            <span className="text-brand-primary">{totalPrice} ج.م</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>بيانات الدفع</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <p>{error}</p>
                            </div>
                        )}
                        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">الاسم الثلاثي</Label>
                                <Input id="name" required placeholder="الاسم بالكامل" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">البريد الإلكتروني</Label>
                                <Input id="email" type="email" required placeholder="name@example.com" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">رقم الهاتف</Label>
                                <Input id="phone" type="tel" required placeholder="01xxxxxxxxx" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="payment">طريقة الدفع</Label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50" disabled>
                                    <option>الدفع عند الاستلام (غير متاح للكورسات)</option>
                                    <option selected>فودافون كاش / بطاقة بنكية</option>
                                </select>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button
                            type="submit"
                            form="checkout-form"
                            className="w-full bg-brand-primary text-black font-bold hover:bg-yellow-400"
                            disabled={isProcessing || items.length === 0}
                        >
                            {isProcessing ? 'جاري التنفيذ...' : 'تأكيد الطلب'}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
