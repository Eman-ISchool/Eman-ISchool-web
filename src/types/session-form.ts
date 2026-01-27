/**
 * TypeScript types for session form data
 * Used in admin and student calendar forms
 */

export interface SessionFormData {
    title: string;
    description?: string;
    date: string;
    startTime: string;
    endTime: string;
    teacherName?: string;
    teacherId?: string;
    groupName?: string;
    className?: string;
    subject?: string;
    type?: 'lesson' | 'meeting' | 'exam';
    notes?: string;
    meetLink?: string;
    platform?: 'zoom' | 'meet' | 'teams' | 'other';
    capacity?: string;
    accessCode?: string;
}

export interface ConcurrentSessionFormData {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    groupName?: string;
    className?: string;
    teacherName?: string;
    subject?: string;
    meetLink?: string;
    notes?: string;
}

export interface SessionFormErrors {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    groupName?: string;
    className?: string;
    teacherName?: string;
    subject?: string;
    general?: string;
}

export const initialSessionFormData: SessionFormData = {
    title: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    type: 'lesson',
    notes: '',
    meetLink: '',
    platform: 'meet',
    capacity: '',
    accessCode: '',
};

export const initialConcurrentSessionFormData: ConcurrentSessionFormData = {
    date: '',
    startTime: '',
    endTime: '',
    groupName: '',
    className: '',
    teacherName: '',
    subject: '',
    meetLink: '',
    notes: '',
};
