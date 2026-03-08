'use client';

import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    email: string;
    courses: number;
}

interface Course {
    id: string;
    title: string;
}

interface ClassStudentsTabProps {
    students: Student[];
    courses: Course[];
    gradeId: string;
}

export function ClassStudentsTab({ students: initialStudents, courses }: ClassStudentsTabProps) {
    const [students, setStudents] = useState<Student[]>(initialStudents);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentEmail, setStudentEmail] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentEmail.trim() || !selectedCourseId) {
            setError('Student email and course selection are required');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/e2e-rpc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'enrollStudent',
                    payload: { courseId: selectedCourseId, studentEmail },
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || data.message || 'Failed to enroll student');

            // Update student list locally if applicable
            // Note: for a robust implementation, we might refetch, but here we just update UI
            let existingStudent = students.find(s => s.email === studentEmail);
            if (existingStudent) {
                setStudents(students.map(s => s.email === studentEmail ? { ...s, courses: s.courses + 1 } : s));
            } else {
                setStudents([...students, {
                    id: data.student_id || 'new-id',
                    name: data.student_name || 'Enrolled Student',
                    email: studentEmail,
                    courses: 1
                }]);
            }

            setIsModalOpen(false);
            setStudentEmail('');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Students in this Class</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Enroll Student
                </button>
            </div>

            {students.length === 0 ? (
                <p className="text-sm text-gray-500">No active students found for this class.</p>
            ) : (
                <div className="space-y-2">
                    {students.map((student) => (
                        <div key={student.id} className="rounded-lg border border-gray-100 px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {student.courses} Active Enrollments
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Enroll Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Enroll Student</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEnroll} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-1">
                                        Student Email *
                                    </label>
                                    <input
                                        id="studentEmail"
                                        type="email"
                                        value={studentEmail}
                                        onChange={(e) => { setStudentEmail(e.target.value); setError(''); }}
                                        placeholder="student@eduverse.com"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label htmlFor="courseId" className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Course *
                                    </label>
                                    {courses.length === 0 ? (
                                        <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded-lg">
                                            Please create a Course first before enrolling students.
                                        </p>
                                    ) : (
                                        <select
                                            id="courseId"
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all outline-none"
                                        >
                                            {courses.map(c => (
                                                <option key={c.id} value={c.id}>{c.title}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || courses.length === 0}
                                    className="px-5 py-2 text-sm font-medium text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Enrolling...' : 'Enroll'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
