'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Check, X, Clock, AlertCircle } from 'lucide-react';

// Simple toast replacement (original '@/components/ui/use-toast' was missing)
function toast({ title, description, variant }: { title: string; description: string; variant?: string }) {
    if (variant === 'destructive') {
        console.error(`[TOAST] ${title}: ${description}`);
    } else {
        console.log(`[TOAST] ${title}: ${description}`);
    }
}

interface Student {
    id: string;
    name: string;
    email: string;
    image?: string;
}

interface AttendanceRecord {
    studentId: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    notes?: string;
}

export function AttendanceSheet({ lessonId, courseId }: { lessonId: string, courseId: string }) {
    const [students, setStudents] = useState<Student[]>([]);
    const [records, setRecords] = useState<Record<string, AttendanceRecord['status']>>({});
    const [notes, setNotes] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch enrolled students
                const studentsRes = await fetch(`/api/courses/${courseId}/students`); // Need this endpoint
                const studentsData = await studentsRes.json();

                // 2. Fetch existing attendance
                const attendanceRes = await fetch(`/api/attendance?lessonId=${lessonId}`);
                const attendanceData = await attendanceRes.json();

                if (studentsRes.ok) {
                    setStudents(studentsData);

                    // Map existing records
                    const recordMap: any = {};
                    const noteMap: any = {};
                    attendanceData.forEach((r: any) => {
                        recordMap[r.student_id] = r.status;
                        if (r.notes) noteMap[r.student_id] = r.notes;
                    });
                    setRecords(recordMap);
                    setNotes(noteMap);
                }
            } catch (error) {
                console.error('Failed to fetch data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [lessonId, courseId]);

    const handleStatusChange = (studentId: string, status: AttendanceRecord['status']) => {
        setRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleNoteChange = (studentId: string, note: string) => {
        setNotes(prev => ({ ...prev, [studentId]: note }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = students.map(s => ({
                studentId: s.id,
                status: records[s.id] || 'active', // Default? Or require selection?
                notes: notes[s.id] || ''
            })).filter(r => records[r.studentId]); // Only save if status is set

            const res = await fetch('/api/attendance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, records: payload }),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast({ title: 'Attendance Saved', description: 'Records have been updated.' });
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to save attendance.', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const markAll = (status: AttendanceRecord['status']) => {
        const newRecords: any = {};
        students.forEach(s => newRecords[s.id] = status);
        setRecords(newRecords);
    };

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Attendance Sheet</CardTitle>
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => markAll('present')}>Mark All Present</Button>
                    <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 uppercase">
                            <tr>
                                <th className="px-4 py-3 text-left">Student</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-left">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y relative">
                            {students.map(student => (
                                <tr key={student.id}>
                                    <td className="px-4 py-3 font-medium">{student.name}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-1">
                                            <StatusButton
                                                active={records[student.id] === 'present'}
                                                onClick={() => handleStatusChange(student.id, 'present')}
                                                icon={<Check className="h-4 w-4" />}
                                                color="bg-green-100 text-green-700 hover:bg-green-200"
                                                activeColor="bg-green-600 text-white hover:bg-green-700"
                                                label="Present"
                                            />
                                            <StatusButton
                                                active={records[student.id] === 'absent'}
                                                onClick={() => handleStatusChange(student.id, 'absent')}
                                                icon={<X className="h-4 w-4" />}
                                                color="bg-red-100 text-red-700 hover:bg-red-200"
                                                activeColor="bg-red-600 text-white hover:bg-red-700"
                                                label="Absent"
                                            />
                                            <StatusButton
                                                active={records[student.id] === 'late'}
                                                onClick={() => handleStatusChange(student.id, 'late')}
                                                icon={<Clock className="h-4 w-4" />}
                                                color="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                                activeColor="bg-yellow-500 text-white hover:bg-yellow-600"
                                                label="Late"
                                            />
                                            <StatusButton
                                                active={records[student.id] === 'excused'}
                                                onClick={() => handleStatusChange(student.id, 'excused')}
                                                icon={<AlertCircle className="h-4 w-4" />}
                                                color="bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                activeColor="bg-blue-500 text-white hover:bg-blue-600"
                                                label="Excused"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <input
                                            className="w-full border rounded px-2 py-1 text-sm"
                                            placeholder="Notes..."
                                            value={notes[student.id] || ''}
                                            onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {students.length === 0 && <div className="p-8 text-center text-gray-500">No students enrolled.</div>}
                </div>
            </CardContent>
        </Card>
    );
}

function StatusButton({ active, onClick, icon, color, activeColor, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-md transition-colors flex items-center gap-1 ${active ? activeColor : color}`}
            title={label}
        >
            {icon}
            <span className="hidden md:inline text-xs font-medium">{label}</span>
        </button>
    );
}
