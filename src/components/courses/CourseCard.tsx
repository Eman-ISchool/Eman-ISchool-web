'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, BookOpen } from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';

interface CourseCardProps {
    course: {
        id: string;
        title: string;
        description: string;
        image_url: string | null;
        price: number;
        slug: string;
        grade?: { name: string };
        teacher?: { name: string; image: string | null };
        enrollments?: { count: number }[];
        subjects?: { count: number }[];
    };
    locale: string;
    role: 'parent' | 'student' | 'public';
}

export function CourseCard({ course, locale, role }: CourseCardProps) {
    const enrollmentsCount = course.enrollments?.[0]?.count || 0;
    const subjectsCount = course.subjects?.[0]?.count || 0;

    // Determine link destination based on role
    // For now, both parent and student go to details page to enroll/view
    const linkHref = withLocalePrefix(`/${role}/courses/${course.id}`, locale);

    return (
        <Card className="overflow-hidden flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
            <div className="relative h-48 w-full bg-gray-100">
                {course.image_url ? (
                    <Image
                        src={course.image_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <BookOpen className="h-12 w-12" />
                    </div>
                )}
                <div className="absolute top-2 end-2 px-2 py-1 bg-white/90 rounded text-xs font-bold shadow-sm text-brand-primary">
                    {course.grade?.name}
                </div>
            </div>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                </div>
                <CardDescription className="line-clamp-2 h-10">{course.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 py-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden relative">
                        {course.teacher?.image ? (
                            <Image src={course.teacher.image} alt={course.teacher.name} fill />
                        ) : (
                            <div className="w-full h-full bg-brand-primary/20 flex items-center justify-center text-[10px] text-brand-primary font-bold">
                                {course.teacher?.name?.charAt(0) || 'T'}
                            </div>
                        )}
                    </div>
                    <span className="text-sm text-gray-600 truncate">{course.teacher?.name}</span>
                </div>

                <div className="flex gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{enrollmentsCount} Students</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{subjectsCount} Subjects</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t pt-4 bg-gray-50/50">
                <div className="font-bold text-lg text-brand-primary">
                    {course.price > 0 ? `$${course.price}` : 'Free'}
                </div>
                <Button size="sm" asChild className="bg-brand-primary text-black hover:bg-yellow-400">
                    <Link href={linkHref}>
                        View Details
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
