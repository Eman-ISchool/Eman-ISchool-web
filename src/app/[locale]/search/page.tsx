"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Users } from "lucide-react";
import { useCartStore } from "@/lib/store";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const addToCart = useCartStore((state) => state.addToCart);
    const [addedId, setAddedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const url = query
                    ? `/api/courses?published=true&search=${encodeURIComponent(query)}`
                    : '/api/courses?published=true';
                const res = await fetch(url);
                const data = await res.json();
                if (data.courses) {
                    setResults(data.courses);
                }
            } catch (error) {
                console.error('Failed to fetch search results', error);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [query]);

    const handleAddToCart = (product: any) => {
        const cartItem = {
            id: product.id,
            title: product.title,
            description: product.description,
            price: `${product.price} ج.م`,
            duration: `${product.duration_hours} ساعة`,
            students: "+100",
            image: product.image_url || ""
        };
        addToCart(cartItem);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold mb-8 text-brand-dark flex items-center gap-2">
                {query ? (
                    <>نتائج البحث عن: <span className="text-brand-primary px-2 rounded-md bg-brand-primary/10">"{query}"</span></>
                ) : (
                    <>كل المواد الدراسية</>
                )}
            </h1>

            {results.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500 text-xl">لا توجد نتائج مطابقة لبحثك.</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {results.map((product) => (
                        <Card key={product.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-gray-100 bg-white hover:-translate-y-2 rounded-2xl flex flex-col">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {product.image_url ? (
                                    <img
                                        src={product.image_url}
                                        alt={product.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-brand-primary/10">
                                        <BookOpen className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                    <span className="text-white font-bold tracking-wide transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">عرض التفاصيل</span>
                                </div>
                            </div>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-2">
                                    <CardTitle className="text-lg font-bold leading-tight group-hover:text-brand-primary transition-colors">{product.title}</CardTitle>
                                    <div className="bg-brand-light px-2 py-1 rounded text-xs font-bold text-brand-dark shrink-0">
                                        {product.price} ج.م
                                    </div>
                                </div>
                                <CardDescription className="line-clamp-2 text-sm mt-2">{product.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="py-2 flex-grow">
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3 text-brand-primary" />
                                        {product.duration_hours || 0} ساعة
                                    </div>
                                    <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                                        <Users className="w-3 h-3 text-brand-primary" />
                                        +100 طالب
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="pt-2 pb-6 px-6">
                                <Button
                                    className={`w-full font-bold transition-all duration-300 shadow-md ${addedId === product.id ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-brand-dark text-white hover:bg-brand-primary hover:text-black'}`}
                                    onClick={() => handleAddToCart(product)}
                                    disabled={addedId === product.id}
                                >
                                    {addedId === product.id ? 'تمت الإضافة ✓' : 'أضف للسلة'}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <div className="container mx-auto px-4 py-12 min-h-screen">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>}>
                <SearchResults />
            </Suspense>
        </div>
    );
}
