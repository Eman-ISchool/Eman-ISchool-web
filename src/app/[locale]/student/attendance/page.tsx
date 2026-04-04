import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { withLocalePrefix } from '@/lib/locale-path';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarX } from 'lucide-react';

export default async function StudentAttendancePage({
    params: { locale }
}: {
    params: { locale: string };
}) {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;

    if (!session || user?.role !== 'student') {
        redirect(withLocalePrefix('/', locale));
    }

    // Fetch all attendance records for this student
    const { data: attendance } = await supabaseAdmin
        .from('attendance')
        .select(`
            status,
            notes,
            recorded_at,
            lesson:lessons(id, title, start_date_time, course:courses(title))
        `)
        .eq('student_id', user.id)
        .order('recorded_at', { ascending: false });

    // Calculate stats
    const total = attendance?.length || 0;
    const present = attendance?.filter(a => a.status === 'present').length || 0;
    const late = attendance?.filter(a => a.status === 'late').length || 0;
    const absent = attendance?.filter(a => a.status === 'absent').length || 0;
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Attendance</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Attendance Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-brand-primary">{rate}%</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Present</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-600">{present}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Late</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-yellow-600">{late}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Absent</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{absent}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    {attendance && attendance.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Date</th>
                                        <th className="px-4 py-3">Course</th>
                                        <th className="px-4 py-3">Lesson</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendance.map((record: any, i) => (
                                        <tr key={i} className="border-b">
                                            <td className="px-4 py-3">
                                                {new Date(record.lesson.start_date_time).toLocaleDateString(locale)}
                                            </td>
                                            <td className="px-4 py-3">{record.lesson.course.title}</td>
                                            <td className="px-4 py-3">{record.lesson.title}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${record.status === 'present' ? 'bg-green-100 text-green-700' :
                                                        record.status === 'absent' ? 'bg-red-100 text-red-700' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {record.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">{record.notes}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={<CalendarX className="h-12 w-12 text-slate-400" />}
                            title="No Attendance Records"
                            description="No attendance records have been recorded for your lessons yet."
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
