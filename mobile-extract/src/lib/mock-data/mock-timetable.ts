export interface TimetableEntry {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  startTime: string;
  endTime: string;
  courseName: string;
  courseColor: string;
  teacherName: string;
  roomOrLink: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const mockTimetable: TimetableEntry[] = [
  {
    id: '1',
    dayOfWeek: 0,
    startTime: '08:00',
    endTime: '09:00',
    courseName: 'Mathematics',
    courseColor: '#3B82F6',
    teacherName: 'أ. محمد أحمد',
    roomOrLink: 'Room 101',
    status: 'scheduled',
  },
  {
    id: '2',
    dayOfWeek: 0,
    startTime: '09:30',
    endTime: '10:30',
    courseName: 'Arabic Language',
    courseColor: '#10B981',
    teacherName: 'أ. فاطمة علي',
    roomOrLink: 'Room 203',
    status: 'scheduled',
  },
  {
    id: '3',
    dayOfWeek: 0,
    startTime: '11:00',
    endTime: '12:00',
    courseName: 'Science',
    courseColor: '#F59E0B',
    teacherName: 'أ. خالد يوسف',
    roomOrLink: 'Lab 1',
    status: 'scheduled',
  },
  {
    id: '4',
    dayOfWeek: 1,
    startTime: '08:00',
    endTime: '09:00',
    courseName: 'English',
    courseColor: '#EF4444',
    teacherName: 'Ms. Sarah Johnson',
    roomOrLink: 'Online',
    status: 'scheduled',
  },
  {
    id: '5',
    dayOfWeek: 1,
    startTime: '10:00',
    endTime: '11:00',
    courseName: 'Mathematics',
    courseColor: '#3B82F6',
    teacherName: 'أ. محمد أحمد',
    roomOrLink: 'Room 101',
    status: 'scheduled',
  },
  {
    id: '6',
    dayOfWeek: 1,
    startTime: '14:00',
    endTime: '15:00',
    courseName: 'Arabic Language',
    courseColor: '#10B981',
    teacherName: 'أ. فاطمة علي',
    roomOrLink: 'Room 203',
    status: 'scheduled',
  },
  {
    id: '7',
    dayOfWeek: 2,
    startTime: '09:00',
    endTime: '10:00',
    courseName: 'Science',
    courseColor: '#F59E0B',
    teacherName: 'أ. خالد يوسف',
    roomOrLink: 'Lab 1',
    status: 'scheduled',
  },
  {
    id: '8',
    dayOfWeek: 2,
    startTime: '11:00',
    endTime: '12:00',
    courseName: 'English',
    courseColor: '#EF4444',
    teacherName: 'Ms. Sarah Johnson',
    roomOrLink: 'Online',
    status: 'scheduled',
  },
  {
    id: '9',
    dayOfWeek: 3,
    startTime: '08:00',
    endTime: '09:00',
    courseName: 'Mathematics',
    courseColor: '#3B82F6',
    teacherName: 'أ. محمد أحمد',
    roomOrLink: 'Room 101',
    status: 'scheduled',
  },
  {
    id: '10',
    dayOfWeek: 3,
    startTime: '10:00',
    endTime: '11:00',
    courseName: 'Arabic Language',
    courseColor: '#10B981',
    teacherName: 'أ. فاطمة علي',
    roomOrLink: 'Room 203',
    status: 'scheduled',
  },
  {
    id: '11',
    dayOfWeek: 4,
    startTime: '09:00',
    endTime: '10:00',
    courseName: 'Science',
    courseColor: '#F59E0B',
    teacherName: 'أ. خالد يوسف',
    roomOrLink: 'Lab 1',
    status: 'scheduled',
  },
  {
    id: '12',
    dayOfWeek: 4,
    startTime: '14:00',
    endTime: '15:00',
    courseName: 'English',
    courseColor: '#EF4444',
    teacherName: 'Ms. Sarah Johnson',
    roomOrLink: 'Online',
    status: 'scheduled',
  },
];

export const dayNames = {
  ar: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
};

export function getTimetableForDay(
  timetable: TimetableEntry[],
  dayOfWeek: number
): TimetableEntry[] {
  return timetable.filter((entry) => entry.dayOfWeek === dayOfWeek);
}

export function getTodayTimetable(timetable: TimetableEntry[]): TimetableEntry[] {
  const today = new Date().getDay();
  return getTimetableForDay(timetable, today);
}
