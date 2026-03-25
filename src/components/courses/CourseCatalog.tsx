import { supabaseAdmin } from '@/lib/supabase';
import { CourseCard } from './CourseCard';
import { CourseFilters } from './CourseFilters';
import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

export async function CourseCatalog({
    searchParams,
    locale,
    role = 'parent'
}: {
    searchParams: { [key: string]: string | string[] | undefined };
    locale: string;
    role?: 'parent' | 'student' | 'public';
}) {
    const t = await getTranslations('courses'); // Need to add 'courses' translations? Or use common

    const queryText = typeof searchParams.q === 'string' ? searchParams.q : '';
    const gradeId = typeof searchParams.grade === 'string' ? searchParams.grade : '';

    // Build grades query for filter
    const gradesQuery = supabaseAdmin
        .from('grades')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

    // Build course query
    let query = supabaseAdmin
        .from('courses')
        .select(`
            *,
            grade:grades(name),
            teacher:users!courses_teacher_id_fkey(name, image),
            enrollments:enrollments(count),
            subjects:subjects(count)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

    if (queryText) {
        query = query.ilike('title', `%${queryText}%`);
    }

    if (gradeId && gradeId !== 'all') {
        query = query.eq('grade_id', gradeId);
    }

    // Performance limit for initial server render
    query = query.limit(12);

    // Fetch both in parallel
    const [ { data: grades }, { data: courses } ] = await Promise.all([
        gradesQuery,
        query
    ]);

    return (
        <div className="space-y-6">
            <CourseFilters grades={grades || []} />

            {courses && courses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((course: any) => (
                        <CourseCard
                            key={course.id}
                            course={course}
                            locale={locale}
                            role={role}
                        />
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <BookOpen className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-1">No courses found</h3>
                        <p className="text-gray-500">
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
