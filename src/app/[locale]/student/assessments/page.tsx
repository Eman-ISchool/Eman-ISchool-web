import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Clock, CheckCircle, PlaySquare, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default async function StudentAssessmentsPage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'student') {
        redirect(withLocalePrefix('/', locale));
    }

    // 1. Get student enrollments
    const { data: enrollments } = await supabaseAdmin
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)
        .eq('status', 'active');

    const courseIds = enrollments?.map(e => e.course_id) || [];

    let availableAssessments: any[] = [];

    if (courseIds.length > 0) {
        // Fetch subjects for those courses
        const { data: subjects } = await supabaseAdmin.from('subjects').select('id').in('course_id', courseIds);
        const subjectIds = subjects?.map(s => s.id) || [];

        // Fetch lessons for those courses
        const { data: lessons } = await supabaseAdmin.from('lessons').select('id').in('course_id', courseIds);
        const lessonIds = lessons?.map(l => l.id) || [];

        // Build query for assessments
        const courseFilter = courseIds.length > 0 ? `course_id.in.(${courseIds.join(',')})` : '';
        const subjectFilter = subjectIds.length > 0 ? `subject_id.in.(${subjectIds.join(',')})` : '';
        const lessonFilter = lessonIds.length > 0 ? `lesson_id.in.(${lessonIds.join(',')})` : '';

        const filterStr = [courseFilter, subjectFilter, lessonFilter].filter(Boolean).join(',');

        const { data: assessments } = await supabaseAdmin
            .from('assessments')
            .select('*, course:courses(title), subject:subjects(title)')
            .eq('is_published', true)
            .or(filterStr)
            .order('created_at', { ascending: false });

        availableAssessments = assessments || [];
    }

    // 2. Get student's past submissions
    const { data: submissions } = await supabaseAdmin
        .from('assessment_submissions')
        .select('*')
        .eq('student_id', user.id);

    const submissionsMap = new Map();
    submissions?.forEach(sub => {
        submissionsMap.set(sub.assessment_id, sub);
    });

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">My Assessments</h1>
                <p className="text-gray-500 mt-2">View and take exams, quizzes, and assignments for your enrolled courses.</p>
            </div>

            {availableAssessments.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                    {availableAssessments.map(assessment => {
                        const submission = submissionsMap.get(assessment.id);
                        const isCompleted = submission?.status === 'submitted' || submission?.status === 'graded';
                        const inProgress = submission?.status === 'in_progress';

                        return (
                            <Card key={assessment.id} className={`flex flex-col border-2 ${isCompleted ? 'border-gray-200' : 'border-blue-100 shadow-md'}`}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-xl line-clamp-1" title={assessment.title}>
                                            {assessment.title}
                                        </CardTitle>
                                        {isCompleted && (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold flex items-center gap-1">
                                                <CheckCircle className="h-3 w-3" /> Completed
                                            </span>
                                        )}
                                        {inProgress && (
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-semibold flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> In Progress
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="line-clamp-2 mt-1">
                                        {assessment.short_description || 'No description provided.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <div className="text-sm font-semibold text-gray-500 mb-3">
                                        Context: {assessment.course?.title || assessment.subject?.title || 'General'}
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-xs font-semibold text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {assessment.duration_minutes ? `${assessment.duration_minutes} Minutes` : 'No Time Limit'}
                                        </div>
                                    </div>

                                    {isCompleted && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border flex justify-between items-center text-sm font-semibold text-gray-700">
                                            <span>Score:</span>
                                            {submission.status === 'graded' ? (
                                                <span className="text-blue-600">{submission.total_score} / {submission.max_score}</span>
                                            ) : (
                                                <span className="text-orange-500 font-normal italic">Pending Manual Grading</span>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t pt-4 bg-gray-50/50">
                                    {isCompleted ? (
                                        <Button asChild className="w-full gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200">
                                            <Link href={withLocalePrefix(`/student/assessments/${assessment.id}/take`, locale)}>
                                                <RefreshCw className="h-4 w-4" /> Retake Assessment
                                            </Link>
                                        </Button>
                                    ) : inProgress ? (
                                        <Button asChild className="w-full gap-2 bg-yellow-400 text-black hover:bg-yellow-500">
                                            <Link href={withLocalePrefix(`/student/assessments/${assessment.id}/take`, locale)}>
                                                <PlaySquare className="h-4 w-4" /> Resume Assessment
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button asChild className="w-full gap-2 bg-brand-primary text-black hover:bg-yellow-400 shadow-sm">
                                            <Link href={withLocalePrefix(`/student/assessments/${assessment.id}/take`, locale)}>
                                                <PlaySquare className="h-4 w-4" /> Start Assessment
                                            </Link>
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-16 px-6 border-2 border-dashed rounded-xl bg-white">
                    <ClipboardCheck className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-900">No Assessments Available</h3>
                    <p className="mt-2 text-gray-500 max-w-sm mx-auto">
                        Your teachers have not published any assessments or exams for your enrolled courses yet.
                    </p>
                </div>
            )}
        </div>
    );
}
