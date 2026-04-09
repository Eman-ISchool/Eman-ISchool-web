export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
  data?: Record<string, unknown>;
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'info',
    title: 'New Lesson Scheduled',
    message: 'A new lesson "Introduction to Algebra" has been scheduled for tomorrow at 10:00 AM.',
    read: false,
    createdAt: '2024-04-04T08:30:00',
    data: {
      lessonId: 'lesson-1',
      courseId: 'course-1',
    },
  },
  {
    id: '2',
    type: 'success',
    title: 'Grade Posted',
    message: 'Your Mathematics quiz has been graded. Score: 85/100',
    read: false,
    createdAt: '2024-04-03T15:45:00',
    data: {
      gradeId: 'grade-1',
      courseId: 'course-1',
    },
  },
  {
    id: '3',
    type: 'warning',
    title: 'Upcoming Assignment Due',
    message: 'Your Science project is due in 2 days.',
    read: true,
    createdAt: '2024-04-03T09:00:00',
    data: {
      assignmentId: 'assignment-1',
      courseId: 'course-3',
    },
  },
  {
    id: '4',
    type: 'info',
    title: 'Course Material Added',
    message: 'New study material has been added to Arabic Language course.',
    read: true,
    createdAt: '2024-04-02T14:20:00',
    data: {
      materialId: 'material-1',
      courseId: 'course-2',
    },
  },
  {
    id: '5',
    type: 'success',
    title: 'Attendance Marked',
    message: 'Your attendance for today\'s lessons has been recorded.',
    read: true,
    createdAt: '2024-04-02T16:00:00',
  },
];

export function getUnreadNotifications(notifications: Notification[]): Notification[] {
  return notifications.filter((n) => !n.read);
}

export function getNotificationsByType(
  notifications: Notification[],
  type: Notification['type']
): Notification[] {
  return notifications.filter((n) => n.type === type);
}
