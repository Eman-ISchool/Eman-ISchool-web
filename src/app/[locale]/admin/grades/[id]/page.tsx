/**
 * Grade Detail Page
 * 
 * Displays detailed information about a grade with 5 tabs:
 * - Info: Grade information, supervisor, description
 * - Courses: List of courses in this grade
 * - Schedule: Grade schedule calendar (Phase 8)
 * - Students: List of students with export functionality
 * - Fees: Fee structure and payment status
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions, getCurrentUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import GradeDetailTabs, { GradeTab } from '@/components/grades/GradeDetailTabs';

interface GradeDetailPageProps {
  params: { locale: string; id: string };
  searchParams: { tab?: string };
}

export default async function GradeDetailPage({ params, searchParams }: GradeDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect(`/${params.locale}/login?callbackUrl=/${params.locale}/admin/grades/${params.id}`);
  }

  const currentUser = await getCurrentUser(session);

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'supervisor')) {
    redirect(`/${params.locale}/admin/grades`);
  }

  // Fetch grade data
  const { data: grade, error } = await supabaseAdmin
    .from('grades')
    .select(`
      *,
      supervisor:users!grades_supervisor_id_fkey(id, name, email)
    `)
    .eq('id', params.id)
    .single();

  if (error || !grade) {
    console.error('Error fetching grade:', error);
    redirect(`/${params.locale}/admin/grades`);
  }

  // Supervisor scope validation: supervisor can only view grades they supervise
  if (currentUser.role === 'supervisor' && grade.supervisor_id !== currentUser.id) {
    // Redirect with access denied message
    redirect(`/${params.locale}/admin/grades?error=access_denied`);
  }

  const initialTab = (searchParams.tab as GradeTab) || 'info';

  return (
    <div className="container">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li>
            <a href={`/${params.locale}/admin`}>Admin</a>
          </li>
          <li>
            <a href={`/${params.locale}/admin/grades`}>Grades</a>
          </li>
          <li aria-current="page">{grade.name}</li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="page-header">
        <h1>{grade.name}</h1>
        <p className="page-description">
          View and manage grade information, courses, students, and fees.
        </p>
      </header>

      {/* Grade Detail Tabs */}
      <GradeDetailTabs
        gradeId={params.id}
        initialTab={initialTab}
        userRole={currentUser.role}
        supervisorId={grade.supervisor_id}
        onTabChange={(tab) => {
          // TODO: Track tab changes for analytics
        }}
      />
    </div>
  );
}
