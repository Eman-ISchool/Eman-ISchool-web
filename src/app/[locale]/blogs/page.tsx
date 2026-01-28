"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ArrowLeft, BookOpen } from "lucide-react";

interface Post {
    id: string;
    title: string;
    slug: string;
    main_image: string | null;
    published_at: string;
}

export default function BlogsPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await fetch('/api/blogs?published=true');
                const data = await res.json();
                if (data.posts) {
                    setPosts(data.posts);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="text-center py-20 text-xl animate-pulse text-gray-400">جاري تحميل المقالات...</div>
            </div>
        );
    }

    const displayPosts = posts.length > 0 ? posts : [];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-brand-dark">المدونة</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    اطلع على أحدث المقالات التعليمية والنصائح الدراسية من خبرائنا
                </p>
            </div>

            {displayPosts.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-2 text-lg font-medium">لا توجد مقالات حالياً</p>
                    <p className="text-gray-400">تابعنا قريباً للحصول على محتوى تعليمي مميز</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {displayPosts.map((post) => (
                        <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 group rounded-2xl flex flex-col">
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {post.main_image ? (
                                    <img
                                        src={post.main_image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gradient-to-br from-brand-primary/10 to-brand-dark/10">
                                        <BookOpen className="w-12 h-12 opacity-50" />
                                    </div>
                                )}
                            </div>
                            <CardHeader className="flex-grow">
                                <CardTitle className="text-xl line-clamp-2 group-hover:text-brand-primary transition-colors">
                                    {post.title}
                                </CardTitle>
                                {post.published_at && (
                                    <CardDescription className="flex items-center gap-2 mt-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(post.published_at).toLocaleDateString('ar-EG', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="pt-0 pb-6 mt-auto">
                                <Link
                                    href={`/blogs/${post.slug || post.id}`}
                                    className="inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark font-bold transition-colors"
                                >
                                    اقرأ المزيد
                                    <ArrowLeft className="w-4 h-4" />
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
