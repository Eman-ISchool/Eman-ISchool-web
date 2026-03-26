'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Users,
    Layers,
    RefreshCw,
    Plus,
    CalendarDays,
    CreditCard,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { withLocalePrefix } from '@/lib/locale-path';
import { SubjectTabs, SubjectTab } from '@/components/subjects/SubjectTabs';
import { CourseCardsList } from '@/components/subjects/CourseCardsList';

interface Subject {
    id: string;
    title: string;
    description?: string;
    image_url?: string;
    is_active: boolean;
    teacher_id: string;
    created_at: string;
}

interface Course {
    id: string;
    title: string;
    description?: string;
    is_published: boolean;
    enrollments?: { count: number }[];
}

export default function SubjectDetailPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const params = useParams();
    const locale = useLocale();
    const subjectId = params.subjectId as string;

    const [subject, setSubject] = useState<Subject | null>(null);
    const [activeTab, setActiveTab] = useState<SubjectTab>('information');
    const [courses, setCourses] = useState<Course[]>([]);
    const [studentsCount, setStudentsCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [tabLoading, setTabLoading] = useState(false);

    // Fetch subject details
    const fetchSubject = useCallback(async () => {
        try {
            const res = await fetch(`/api/subjects/${subjectId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.subject) setSubject(data.subject);
            }
        } catch (err) {
            console.error('Error fetching subject:', err);
        }
    }, [subjectId]);

    // Fetch courses for this subject
    const fetchCourses = useCallback(async () => {
        setTabLoading(true);
        try {
            const res = await fetch(`/api/courses?subjectId=${subjectId}&limit=50`);
            if (res.ok) {
                const data = await res.json();
                const fetchedCourses = data.courses || [];
                setCourses(fetchedCourses);

                // Calculate total students
                const totalStudents = fetchedCourses.reduce((sum: number, course: any) => sum + (course.enrollments?.[0]?.count || 0), 0);
                setStudentsCount(totalStudents);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
        } finally {
            setTabLoading(false);
        }
    }, [subjectId]);

    useEffect(() => {
        fetchSubject();
        fetchCourses();
    }, [fetchSubject, fetchCourses]);

    useEffect(() => {
        setLoading(false);
    }, [subject]);

    const handleNavigation = (path: string) => {
        router.push(withLocalePrefix(path, locale));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="h-6 w-6 text-gray-300 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ── Back Navigation ────────────────────────────────── */}
            <button
                onClick={() => handleNavigation('/teacher/subjects')}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Subjects
            </button>

            {/* ── Subject Header ─────────────────────────────────── */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
                {subject?.image_url ? (
                    <div className="h-48 bg-gray-100 relative">
                        <img
                            src={subject.image_url}
                            alt={subject.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : (
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-center">
                        <Layers className="h-12 w-12 text-blue-200" />
                    </div>
                )}
                <div className="p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {subject?.title || 'Loading...'}
                            </h1>
                            {subject?.description && (
                                <p className="text-gray-500 mt-2 max-w-2xl">{subject.description}</p>
                            )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${subject?.is_active
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-500'
                            }`}>
                            {subject?.is_active ? 'Active' : 'Draft'}
                        </span>
                    </div>

                    {/* Quick Info */}
                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>{courses.length} Courses</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{studentsCount} Students</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabs ───────────────────────────────────────────── */}
            <SubjectTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                counts={{ courses: courses.length, students: studentsCount }}
            />

            {/* ── Tab Content ────────────────────────────────────── */}
            <div className="min-h-[300px] mt-6">
                {tabLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="h-5 w-5 text-gray-300 animate-spin" />
                    </div>
                ) : (
                    <>
                        {activeTab === 'information' && (
                            <InformationTab subject={subject} />
                        )}
                        {activeTab === 'courses' && (
                            <CourseCardsList
                                courses={courses}
                                locale={locale}
                                onNavigate={handleNavigation}
                            />
                        )}
                        {activeTab === 'calendar' && (
                            <CalendarTab />
                        )}
                        {activeTab === 'fees' && (
                            <FeesTab />
                        )}
                        {activeTab === 'students' && (
                            <StudentsTab courses={courses} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Tab Components ──────────────────────────────────────────

function InformationTab({ subject }: { subject: Subject | null }) {
    if (!subject) return null;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Subject Description</h3>
                <p className="text-gray-600 leading-relaxed uppercase">
                    {subject.description || 'No description provided for this subject.'}
                </p>
            </div>
            {/* Additional info widgets can go here */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <p className="font-semibold text-gray-900">{subject.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Created At</p>
                    <p className="font-semibold text-gray-900">{new Date(subject.created_at).toLocaleDateString()}</p>
                </div>
            </div>
        </div>
    );
}

function CalendarTab() {
    return (
        <EmptyState
            icon={<CalendarDays className="h-10 w-10" />}
            title="Schedule & Calendar"
            description="A comprehensive calendar view of all course lessons belonging to this subject will appear here."
            actionLabel="View Calendar"
        />
    );
}

function FeesTab() {
    return (
        <EmptyState
            icon={<CreditCard className="h-10 w-10" />}
            title="Tuition & Fees"
            description="Manage and track fee structures related to the courses within this subject."
        />
    );
}

function StudentsTab({ courses }: { courses: Course[] }) {
    if (courses.length === 0 || courses.every(c => (c.enrollments?.[0]?.count || 0) === 0)) {
        return (
            <EmptyState
                icon={<Users className="h-10 w-10" />}
                title="No enrolled students"
                description="Students will appear here once they enroll in courses under this subject."
            />
        );
    }

    return (
        <div className="space-y-3">
            {courses.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{s.title}</h3>
                            <p className="text-sm text-gray-500">{s.enrollments?.[0]?.count || 0} enrolled students</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// EmptyState component

function EmptyState({ icon, title, description, actionLabel, onAction }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="text-center py-16 border border-dashed border-gray-200 rounded-2xl">
            <div className="text-gray-300 mx-auto mb-3 flex justify-center">{icon}</div>
            <h3 className="font-semibold text-gray-700 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{description}</p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                    <Plus className="h-4 w-4" />
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
