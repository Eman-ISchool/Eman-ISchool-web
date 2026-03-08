import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { MeetButton } from '@/components/teacher/MeetButton';

export default async function SubjectLessonsPage({
    params: { locale, subjectId }
}: {
    params: { locale: string, subjectId: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch subject details
    const { data: subject } = await supabaseAdmin
        .from('subjects')
        .select('*')
        .eq('id', subjectId)
        .single();

    if (!subject) {
        redirect(withLocalePrefix('/teacher/subjects', locale));
    }

    // Fetch lessons for this subject
    const { data: lessons } = await supabaseAdmin
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectId)
        .order('start_date_time', { ascending: true });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{subject.title} - Lessons</h1>
                    <p className="text-gray-500">Manage your lessons and generate Google Meet links.</p>
                </div>
                <Button asChild className="gap-2 bg-brand-primary text-black hover:bg-yellow-400">
                    <Link href={withLocalePrefix(`/teacher/subjects/${subjectId}/lessons/new`, locale)}>
                        <Plus className="h-4 w-4" />
                        Add Lesson
                    </Link>
                </Button>
            </div>

            {lessons && lessons.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                    {lessons.map((lesson: any) => {
                        return (
                            <Card key={lesson.id} className="flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-lg">{lesson.title}</CardTitle>
                                            <CardDescription className="flex items-center gap-1 mt-1">
                                                <CalendarIcon className="h-3 w-3" />
                                                {new Date(lesson.start_date_time).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                        {lesson.description || 'No description provided.'}
                                    </p>
                                    <div className="flex gap-4 text-xs font-semibold text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(lesson.start_date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Video className="h-4 w-4" />
                                            {lesson.meet_link ? 'Meet Ready' : 'No Meet Link'}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        {/* Meet Button Client Component handles the one-click generation and status (Green/Red) */}
                                        <MeetButton lessonId={lesson.id} initialMeetLink={lesson.meet_link} startDateTime={lesson.start_date_time} />
                                    </div>

                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <CalendarIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No Lessons Yet</h3>
                        <p className="text-gray-500 text-center mb-6 max-w-sm">
                            Create your first lesson to schedule a class and generate a Google Meet link.
                        </p>
                        <Button asChild className="gap-2 bg-brand-primary text-black">
                            <Link href={withLocalePrefix(`/teacher/subjects/${subjectId}/lessons/new`, locale)}>
                                <Plus className="h-4 w-4" />
                                Add Lesson
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
