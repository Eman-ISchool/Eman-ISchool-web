'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

/**
 * Hook to consistently check current user permissions client-side.
 * Used to conditionally render UI elements based on the role hierarchy.
 */
export function usePermissions() {
    const { data: session, status } = useSession();

    const permissions = useMemo(() => {
        const role = (session?.user as any)?.role || 'guest';

        return {
            isAdmin: role === 'admin',
            isSupervisor: role === 'supervisor',
            isTeacher: role === 'teacher',
            isStudent: role === 'student',
            isParent: role === 'parent',

            // Feature-specific capabilities
            canCreateGrade: role === 'admin',
            canEditGrade: role === 'admin' || role === 'supervisor',
            canDeleteGrade: role === 'admin',

            canCreateCourse: role === 'admin',
            canEditCourse: role === 'admin' || role === 'teacher' || role === 'supervisor',
            canDeleteCourse: role === 'admin' || role === 'teacher',

            canCreateLesson: role === 'admin' || role === 'teacher',
            canEditLesson: role === 'admin' || role === 'teacher' || role === 'supervisor',
            canDeleteLesson: role === 'admin' || role === 'teacher',

            canViewAdminPortal: role === 'admin' || role === 'supervisor',
            canViewTeacherPortal: role === 'teacher',
        };
    }, [session?.user]);

    return { permissions, status, isLoading: status === 'loading', user: session?.user };
}
