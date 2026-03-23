"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

export default function CartPage() {
    const { items, removeFromCart } = useCartStore();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const [mounted, setMounted] = useState(false);

    // Hydration fix for Persist middleware
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // or a skeleton loader
    }

    const totalPrice = items.reduce((acc, item) => {
        // Basic price parsing for mock data "450 ج.م" -> 450
        const price = parseInt(item.price.replace(/[^\d]/g, ''));
        return acc + (isNaN(price) ? 0 : price);
    }, 0);

    return (
        <div className="container mx-auto px-4 py-12 min-h-[80vh]">
            <h1 className="text-3xl font-bold mb-8 text-brand-dark flex items-center gap-2">
                <span className="bg-brand-primary/20 p-2 rounded-lg">
                    <Trash2 className="w-6 h-6 text-brand-dark opacity-0" /> {/* Spacer/Icon placeholder if needed */}
                    <span className="sr-only">Icon</span>
                </span>
                سلة المشتريات
            </h1>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Trash2 className="w-10 h-10 text-brand-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">سلتك فارغة</h2>
                    <p className="text-gray-500 mb-8 text-lg max-w-md text-center">يبدو أنك لم تضف أي مواد دراسية بعد. تصفح مكتبتنا الواسعة وابدأ رحلتك التعليمية الآن.</p>
                    <Link href={withLocalePrefix('/product/by-subject', locale)}>
                        <Button size="lg" className="bg-brand-primary text-black font-bold hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-lg shadow-brand-primary/20">
                            تصفح المواد الدراسية
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Items List */}
                    <div className="md:col-span-2 space-y-4">
                        {items.map((item) => (
                            <Card key={item.id} className="flex gap-4 p-4 items-center group hover:border-brand-primary/50 transition-colors">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg shrink-0 overflow-hidden relative">
                                    {/* We can use the actual image here if available, or a fallback */}
                                    {item.image ? (
                                        <img loading="lazy" decoding="async" src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">?</div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <CardTitle className="text-lg mb-2 group-hover:text-brand-primary transition-colors">{item.title}</CardTitle>
                                    <p className="text-brand-dark font-bold text-xl">{item.price}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="text-red-400 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors" onClick={() => removeFromCart(item.id)}>
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </Card>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 sticky top-24">
                            <h3 className="text-xl font-bold mb-6 border-b pb-4">ملخص الطلب</h3>
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>عدد المواد</span>
                                    <span className="font-medium bg-gray-100 px-2 rounded-md">{items.length}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold border-t pt-4 text-brand-dark">
                                    <span>الإجمالي</span>
                                    <span className="text-brand-primary">{totalPrice} ج.م</span>
                                </div>
                            </div>
                            <Link href={withLocalePrefix('/checkout', locale)} className="w-full block">
                                <Button className="w-full bg-brand-dark text-white font-bold hover:bg-black py-6 text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                    إتمام الشراء
                                </Button>
                            </Link>
                            <p className="text-xs text-center text-gray-400 mt-4">ضمان استرجاع الأموال لمدة 14 يوم</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
