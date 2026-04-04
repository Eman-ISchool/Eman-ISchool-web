'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { supabaseAdmin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Search, Loader2 } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
}

export default function QuickEnroll({ courseId, courseTitle }: { courseId: string; courseTitle: string }) {
    const { data: session } = useSession();
    const locale = useLocale();
    const isArabic = locale === 'ar';
    
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const user = session?.user as any;

    const searchStudents = async () => {
        if (!searchEmail.trim() || !user) return;

        try {
            setLoading(true);
            setMessage(null);

            // Search for students linked to this parent
            const { data: students } = await supabaseAdmin
                .from('parent_student')
                .select('students(id, name, email)')
                .eq('parent_id', user.id)
                .ilike('students.email', `%${searchEmail}%`);

            if (students) {
                const studentList = students.map((ps: any) => ps.students).filter(Boolean);
                setSearchResults(studentList);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Error searching students:', error);
            setMessage({ type: 'error', text: isArabic ? 'حدث خطأ أثناء البحث' : 'Error searching students' });
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        if (!selectedStudent || !user) return;

        try {
            setEnrolling(true);
            setMessage(null);

            const res = await fetch('/api/enrollments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    courseId: courseId
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Enrollment failed');
            }

            await res.json();

            setMessage({
                type: 'success',
                text: isArabic 
                    ? `تم تسجيل الطالب ${selectedStudent.name} في الدورة بنجاح` 
                    : `${selectedStudent.name} has been enrolled in the course`
            });
            
            // Clear selection after successful enrollment
            setSelectedStudent(null);
            setSearchResults([]);
            setSearchEmail('');
        } catch (error: any) {
            console.error('Error enrolling:', error);
            setMessage({
                type: 'error',
                text: error.message || (isArabic ? 'فشل التسجيل' : 'Enrollment failed')
            });
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-brand-primary" />
                    {isArabic ? 'تسجيل سريع' : 'Quick Enroll'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search by Email */}
                <div className="space-y-2">
                    <Label htmlFor="student-email">
                        {isArabic ? 'ابحث عن طالب موجود بالبريد الإلكتروني' : 'Search for existing student by email'}
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="student-email"
                            type="email"
                            placeholder={isArabic ? 'بريد الطالب...' : 'Student email...'}
                            value={searchEmail}
                            onChange={(e) => setSearchEmail(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchStudents()}
                            disabled={loading}
                        />
                        <Button
                            onClick={searchStudents}
                            disabled={loading || !searchEmail.trim()}
                            size="icon"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="space-y-2">
                        <Label>
                            {isArabic ? 'اختر طالباً للتسجيل' : 'Select a student to enroll'}
                        </Label>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                            {searchResults.map((student) => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                                        selectedStudent?.id === student.id
                                            ? 'border-brand-primary bg-brand-primary/5'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="font-medium text-gray-900">{student.name}</div>
                                    <div className="text-sm text-gray-500">{student.email}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected Student Info */}
                {selectedStudent && (
                    <div className="p-3 bg-brand-primary/5 rounded-lg border border-brand-primary/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">
                                    {isArabic ? 'طالب مختار:' : 'Selected student:'}
                                </div>
                                <div className="font-medium text-gray-900">{selectedStudent.name}</div>
                                <div className="text-sm text-gray-600">{selectedStudent.email}</div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                {isArabic ? 'إلغاء' : 'Clear'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Enroll Button */}
                <Button
                    onClick={handleEnroll}
                    disabled={!selectedStudent || enrolling}
                    className="w-full bg-brand-primary text-black hover:bg-yellow-400"
                >
                    {enrolling ? (
                        <>
                            <Loader2 className="w-4 h-4 me-2 animate-spin" />
                            {isArabic ? 'جاري التسجيل...' : 'Enrolling...'}
                        </>
                    ) : (
                        <>
                            <UserPlus className="w-4 h-4 me-2" />
                            {isArabic ? 'تسجيل الطالب' : 'Enroll Student'}
                        </>
                    )}
                </Button>

                {/* Message */}
                {message && (
                    <div
                        className={`p-3 rounded-lg text-sm ${
                            message.type === 'success'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Info Text */}
                <div className="text-xs text-gray-500">
                    {isArabic 
                        ? 'يمكنك تسجيل أطفالك الموجود بالفعل في الدورة دون الحاجة لإعادة التسجيل.'
                        : 'You can enroll your existing child in this course without re-registration.'
                    }
                </div>
            </CardContent>
        </Card>
    );
}
