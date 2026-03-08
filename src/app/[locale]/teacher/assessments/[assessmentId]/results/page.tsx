import { getServerSession } from 'next-auth';
import { authOptions, isTeacherOrAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, Save, FileBox, FileQuestion } from 'lucide-react';

export default async function AssessmentResultsPage({
    params: { locale, assessmentId }
}: {
    params: { locale: string; assessmentId: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || !isTeacherOrAdmin(user?.role)) {
        redirect(withLocalePrefix('/', locale));
    }

    const { data: assessment } = await supabaseAdmin
        .from('assessments')
        .select('*, course:courses(title), subject:subjects(title)')
        .eq('id', assessmentId)
        .eq('teacher_id', user.id)
        .single();

    if (!assessment) {
        redirect(withLocalePrefix('/teacher/assessments', locale));
    }

    const { data: submissions } = await supabaseAdmin
        .from('assessment_submissions')
        .select('*, student:users(name, email)')
        .eq('assessment_id', assessmentId)
        .order('submitted_at', { ascending: false });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={withLocalePrefix('/teacher/assessments?tab=results', locale)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">{assessment.title} - Results</h1>
                    <p className="text-gray-500">
                        {assessment.course?.title || assessment.subject?.title || 'General Assessment'}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b bg-gray-50/50">
                    <h2 className="font-semibold text-lg text-gray-900">Student Submissions</h2>
                </div>
                {submissions && submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 bg-gray-50 uppercase border-b">
                                <tr>
                                    <th className="px-6 py-3">Student Name</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Time Taken</th>
                                    <th className="px-6 py-3">Score</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub: any) => (
                                    <tr key={sub.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {sub.student?.name || 'Unknown Student'}
                                            <div className="text-xs text-gray-500 font-normal">{sub.student?.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {sub.status === 'in_progress' && (
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium flex items-center w-max gap-1">
                                                    <Clock className="h-3 w-3" /> In Progress
                                                </span>
                                            )}
                                            {sub.status === 'submitted' && sub.manual_grading_required && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex items-center w-max gap-1">
                                                    <FileQuestion className="h-3 w-3" /> Needs Grading
                                                </span>
                                            )}
                                            {sub.status === 'submitted' && !sub.manual_grading_required && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center w-max gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Auto-Graded
                                                </span>
                                            )}
                                            {sub.status === 'graded' && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center w-max gap-1">
                                                    <CheckCircle className="h-3 w-3" /> Graded
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {sub.time_taken_minutes ? `${sub.time_taken_minutes} mins` : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            {sub.status === 'in_progress' ? '-' : `${sub.total_score || 0} / ${sub.max_score || 0}`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {(sub.status === 'submitted' || sub.status === 'graded') ? (
                                                <Button size="sm" variant={sub.manual_grading_required ? 'default' : 'outline'} className={sub.manual_grading_required ? 'bg-brand-primary text-black hover:bg-yellow-400' : ''} asChild>
                                                    <Link href={withLocalePrefix(`/teacher/assessments/${assessmentId}/results/${sub.id}`, locale)}>
                                                        {sub.manual_grading_required ? 'Grade Now' : 'View Details'}
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-gray-400">Wait for submission</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-500">
                        <FileBox className="h-12 w-12 text-gray-300 mb-4" />
                        <p>No submissions yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
