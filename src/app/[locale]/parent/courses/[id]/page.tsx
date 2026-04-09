import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { notFound, redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import QuickEnroll from '@/components/parent/QuickEnroll';

export default async function ParentCourseDetailsPage({
    params: { id, locale }
}: {
    params: { id: string; locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'parent') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch course details with subjects and teacher
    const { data: course } = await supabaseAdmin
        .from('courses')
        .select(`
            *,
            teacher:users!courses_teacher_id_fkey(name, image, bio),
            grade:grades(name),
            subjects:subjects(
                id,
                title,
                sort_order,
                lessons(count)
            )
        `)
        .eq('id', id)
        .eq('is_published', true) // Only published
        .single();

    if (!course) {
        notFound();
    }

    // Sort subjects (supabase order might not be preserved in deeply nested if not specified carefully)
    // We can sort in JS
    const subjects = (course.subjects || []).sort((a: any, b: any) => a.sort_order - b.sort_order);

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={withLocalePrefix('/parent/courses', locale)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Catalog
                    </Link>
                </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* Hero Section */}
                    <div>
                        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
                        <div className="relative h-64 w-full rounded-xl overflow-hidden bg-gray-100 mb-6">
                            {course.image_url ? (
                                <Image
                                    src={course.image_url}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <BookOpen className="h-16 w-16" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                                {course.grade?.name}
                            </div>
                        </div>

                        <div className="prose max-w-none text-gray-700">
                            <h3 className="text-xl font-semibold mb-2">About this Course</h3>
                            <p>{course.description}</p>
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4">Curriculum</h3>
                        <div className="space-y-3">
                            {subjects.length > 0 ? (
                                subjects.map((subject: any) => (
                                    <Card key={subject.id}>
                                        <CardHeader className="py-3 px-4 bg-gray-50/50">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">{subject.title}</h4>
                                                <span className="text-xs text-gray-500">
                                                    {subject.lessons[0]?.count || 0} Lessons
                                                </span>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                ))
                            ) : (
                                <div className="p-4 border rounded text-gray-500 italic">
                                    Curriculum details coming soon.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Enroll for Existing Students */}
                    <QuickEnroll courseId={course.id} courseTitle={course.title} />
                    
                    <Card className="sticky top-6">
                        <CardContent className="p-6 space-y-6">
                            <div className="text-3xl font-bold text-center text-brand-primary">
                                {course.price > 0 ? `$${course.price}` : 'Free'}
                            </div>

                            <Button size="lg" className="w-full bg-brand-primary text-black hover:bg-yellow-400 font-bold" disabled>
                                Enroll Now (Coming Soon)
                            </Button>

                            <p className="text-center text-xs text-gray-500">
                                Enrollment opens soon in Phase 3
                            </p>

                            <hr />

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">Duration</div>
                                        <div className="text-gray-500">Self-paced</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpen className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">Subjects</div>
                                        <div className="text-gray-500">{subjects.length} Subjects</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <div className="font-medium">Certificate</div>
                                        <div className="text-gray-500">Completion Certificate</div>
                                    </div>
                                </div>
                            </div>

                            <hr />

                            {course.teacher && (
                                <div>
                                    <div className="font-medium mb-3">Instructor</div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden relative">
                                            {course.teacher.image ? (
                                                <Image src={course.teacher.image} alt={course.teacher.name} fill sizes="40px" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 font-bold">
                                                    {course.teacher.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{course.teacher.name}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{course.teacher.bio || 'Teacher'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
