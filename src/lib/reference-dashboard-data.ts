import type { ApplicationRecord } from '@/lib/dashboard-applications';

interface StatsSource {
  users?: {
    total?: number;
    students?: number;
    teachers?: number;
    admins?: number;
  };
  courses?: {
    total?: number;
    published?: number;
  };
  lessons?: {
    total?: number;
    upcoming?: number;
    completed?: number;
  };
  enrollments?: {
    active?: number;
    pending?: number;
  };
  attendance?: {
    rate?: number;
    present?: number;
    absent?: number;
    late?: number;
  };
}

const studentProgressRows = [
  ['ميرا محمود حسن', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '91%', '2026-03-08'],
  ['رتاج محمد فاروق', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '88%', '2026-03-08'],
  ['محمد يوسف حسن', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '84%', '2026-03-07'],
  ['إبراهيم محمود عبد الله', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '82%', '2026-03-07'],
  ['حسن عمار محمد عوض', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '79%', '2026-03-06'],
  ['فاطمة علي أحمد علي', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '77%', '2026-03-06'],
  ['آية أحمد عبد النبي', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '74%', '2026-03-05'],
  ['ملك علي محمد', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '71%', '2026-03-05'],
  ['ليان عبد الرحمن', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '69%', '2026-03-04'],
  ['يوسف سامي محمود', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '67%', '2026-03-04'],
  ['سارة حسن محمد', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '63%', '2026-03-03'],
  ['أحمد خالد صلاح', 'كورس المعلم الإلكتروني', 'الأول الثانوي', 12, '61%', '2026-03-03'],
];

const teacherAttendanceRows = [
  ['Fadi Nawaf', 24, 0, '36%'],
  ['لادن ادريس بابكر ادريس', 42, 1, '42%'],
  ['Magda zahran', 22, 0, '58%'],
  ['Muzna seth', 18, 0, '36%'],
  ['مزنة مراد', 42, 1, '41%'],
  ['إبراهيم محمد سعد', 18, 0, '32%'],
  ['إيهاب عبد العظيم', 16, 0, '29%'],
  ['د. رحمة خليل', 24, 0, '39%'],
  ['رحاب رائد فيصل', 18, 0, '28%'],
  ['محمد أحمد عبد الله', 24, 1, '37%'],
  ['هاجر عبد الحميد محمد', 18, 0, '32%'],
  ['وفاء محمد سيد', 24, 0, '34%'],
];

export function getReferenceDashboardData(isArabic: boolean, stats?: StatsSource | null) {
  const totalApplications =
    (stats?.enrollments?.active ?? 54) + (stats?.enrollments?.pending ?? 14);
  const totalStudents = stats?.users?.students ?? 70;
  const totalBundles = stats?.courses?.total ?? 13;
  const totalTeachers = Math.max(stats?.users?.teachers ?? 1, 1);
  const revenueValue = `AED ${Math.max((stats?.users?.total ?? 1) * 100, 100)}`;
  const attendanceRate = stats?.attendance?.rate ?? 100;
  const completionRate =
    stats?.lessons?.total && stats?.lessons?.completed
      ? ((stats.lessons.completed / Math.max(stats.lessons.total, 1)) * 100).toFixed(1)
      : '0.0';

  return {
    topCards: [
      {
        href: '/dashboard/applications',
        label: isArabic ? 'إجمالي الطلبات' : 'Total applications',
        value: `${totalApplications}`,
        sublabel: isArabic ? 'طلبات جديدة اليوم' : 'New requests today',
        accent: 'bg-[#f4e4d2] text-[#e26c16]',
        tone: 'bg-[#fff3e7]',
        miniStats: [
          [isArabic ? 'اليوم' : 'Today', '8'],
          [isArabic ? 'هذا الأسبوع' : 'Week', '18'],
        ],
      },
      {
        href: '/dashboard/payments',
        label: isArabic ? 'إجمالي الإيرادات' : 'Revenue',
        value: revenueValue,
        sublabel: isArabic ? 'ملخص شهري' : 'Monthly summary',
        accent: 'bg-[#dff4df] text-[#2f9f49]',
        tone: 'bg-[#f3fbf3]',
        miniStats: [
          [isArabic ? 'يومي' : 'Daily', 'AED 25'],
          [isArabic ? 'أسبوعي' : 'Weekly', 'AED 200'],
          [isArabic ? 'شهري' : 'Monthly', 'AED 100'],
        ],
      },
      {
        href: '/dashboard/users',
        label: isArabic ? 'إجمالي الطلاب' : 'Students',
        value: `${totalStudents}`,
        sublabel: isArabic ? 'النشطون هذا الشهر' : 'Active this month',
        accent: 'bg-[#dfe7fb] text-[#3f67e8]',
        tone: 'bg-[#eff3ff]',
        miniStats: [
          [isArabic ? 'اليوم' : 'Today', '1'],
          [isArabic ? 'الأسبوع' : 'Week', '14'],
          [isArabic ? 'الشهر' : 'Month', '53'],
        ],
      },
      {
        href: '/dashboard/bundles',
        label: isArabic ? 'إجمالي الفصول' : 'Bundles',
        value: `${totalBundles}`,
        sublabel: isArabic ? 'فصول مفعلة حالياً' : 'Active bundles',
        accent: 'bg-[#efe5fb] text-[#8d56ff]',
        tone: 'bg-[#f8f3ff]',
      },
      {
        href: '/dashboard/users',
        label: isArabic ? 'المستخدمون النشطون' : 'Active users',
        value: `${totalTeachers}`,
        sublabel: isArabic ? 'آخر 24 ساعة' : 'Last 24 hours',
        accent: 'bg-[#dbf3ef] text-[#1595a0]',
        tone: 'bg-[#eefcfa]',
      },
      {
        href: '/dashboard/expenses',
        label: isArabic ? 'إجمالي المصروفات' : 'Expenses',
        value: 'AED0',
        sublabel: isArabic ? 'مصروفات تشغيلية' : 'Operational spend',
        accent: 'bg-[#fde7ee] text-[#e23d61]',
        tone: 'bg-[#fff4f7]',
      },
      {
        href: '/dashboard/quizzes',
        label: isArabic ? 'أداء الاختبارات' : 'Assessments',
        value: '0.0%',
        sublabel: isArabic ? 'معدل النجاح الحالي' : 'Current pass rate',
        accent: 'bg-[#ece7fb] text-[#6b4df7]',
        tone: 'bg-[#f6f3ff]',
      },
      {
        href: '/dashboard/courses',
        label: isArabic ? 'إكمال المادة دراسية' : 'Course completion',
        value: `${completionRate}%`,
        sublabel: isArabic ? 'متوسط الإكمال' : 'Average completion',
        accent: 'bg-[#fbf2df] text-[#d48d08]',
        tone: 'bg-[#fffaf0]',
      },
    ],
    revenueSeries: [3, 3, 3, 3, 4, 3, 4, 4, 5, 4, 5, 6],
    activitySeries: [68, 71, 22, 12, 12, 18, 26, 14, 13, 13, 9, 9, 13, 8, 7, 10, 6, 6],
    quickCards: [
      {
        href: '/dashboard/upcoming-classes',
        label: isArabic ? 'حضور اليوم' : 'Today attendance',
        value: `${attendanceRate.toFixed ? attendanceRate.toFixed(1) : attendanceRate}%`,
        sublabel: isArabic ? 'جميع الفصول مسجلة' : 'All bundles tracked',
        accent: 'bg-[#ddf7e5] text-[#11a743]',
      },
      {
        href: '/dashboard/payments',
        label: isArabic ? 'المبالغ المستحقة' : 'Outstanding due',
        value: 'AED0',
        sublabel: isArabic ? 'لا توجد مبالغ مستحقة' : 'No open due items',
        accent: 'bg-[#efe6fb] text-[#9258ff]',
      },
      {
        href: '/dashboard/quizzes',
        label: isArabic ? 'إعداد الاختبارات' : 'Assessment setup',
        value: '0.0%',
        sublabel: isArabic ? 'جاهزية النماذج الحالية' : 'Current readiness',
        accent: 'bg-[#e8edff] text-[#5373ff]',
      },
      {
        href: '/dashboard/users',
        label: isArabic ? 'المستخدمون النشطون' : 'Active users',
        value: `${totalTeachers}`,
        sublabel: isArabic ? 'جلسات نشطة الآن' : 'Sessions live now',
        accent: 'bg-[#f6eadf] text-[#f08a16]',
      },
    ],
    teacherPerformance: [
      { name: 'Magda zahran', tasks: 12, ratio: '91%', note: isArabic ? 'إنجاز ممتاز' : 'Excellent' },
      { name: 'Muzna seth', tasks: 9, ratio: '88%', note: isArabic ? 'مستقر' : 'Stable' },
      { name: 'مزنة مراد', tasks: 8, ratio: '85%', note: isArabic ? 'مستقر' : 'Stable' },
      { name: 'رحاب رائد فيصل', tasks: 6, ratio: '79%', note: isArabic ? 'بحاجة متابعة' : 'Needs follow-up' },
      { name: 'أحمد خالد صلاح', tasks: 5, ratio: '74%', note: isArabic ? 'نشط' : 'Active' },
    ],
    activeBundles: [
      {
        title: isArabic ? 'كورس المعلم الإلكتروني' : 'Teacher e-course',
        stage: isArabic ? 'الأول الثانوي' : 'First secondary',
        students: 70,
        due: 'AED 0',
        paid: 'AED 1650',
        completion: '0.0%',
      },
      {
        title: isArabic ? 'كورس تأسيس اللغة الإنجليزية' : 'English foundation',
        stage: isArabic ? 'الابتدائي - المستوى الأول' : 'Primary level 1',
        students: 18,
        due: 'AED 0',
        paid: 'AED 750',
        completion: '0.0%',
      },
      {
        title: isArabic ? 'كورس مستوى اللغة الإنجليزية' : 'English level track',
        stage: isArabic ? 'الابتدائي - المستوى الثاني' : 'Primary level 2',
        students: 12,
        due: 'AED 0',
        paid: 'AED 100',
        completion: '0.0%',
      },
    ],
    subjectEnrollment: [
      [isArabic ? 'فيزياء' : 'Physics', 24],
      [isArabic ? 'رياضيات' : 'Math', 14],
      [isArabic ? 'لغة عربية' : 'Arabic', 10],
      [isArabic ? 'أحياء' : 'Biology', 8],
    ],
    bundleEnrollment: [
      [isArabic ? 'الأول الثانوي' : 'First secondary', 33],
      [isArabic ? 'الصف السادس' : 'Sixth grade', 18],
      [isArabic ? 'تأسيسي' : 'Foundation', 12],
      [isArabic ? 'مراجعات' : 'Revision', 7],
    ],
    attendanceBreakdown: [
      [isArabic ? 'حاضر' : 'Present', 68],
      [isArabic ? 'متأخر' : 'Late', 4],
      [isArabic ? 'غائب' : 'Absent', 2],
    ],
    studentProgressRows,
    teacherAttendanceRows,
  };
}

export function getReferenceMockApplications(): ApplicationRecord[] {
  return [
    {
      id: 1024,
      created_at: '2026-03-08T08:10:00.000Z',
      status: 'pending',
      total_amount: 150,
      currency: 'AED',
      student_details: { name: 'ميرا محمود حسن', phone: '790320149' },
      parent_details: { name: 'محمود حسن', phone: '790320168' },
      users: { name: 'محمود حسن', email: 'mahmoud@example.com' },
      grades: { name: 'الأول الثانوي' },
    },
    {
      id: 1023,
      created_at: '2026-03-07T13:20:00.000Z',
      status: 'payment_pending',
      total_amount: 100,
      currency: 'AED',
      student_details: { name: 'رتاج محمد فاروق', phone: '790320150' },
      parent_details: { name: 'محمد فاروق', phone: '790320170' },
      users: { name: 'محمد فاروق', email: 'farouk@example.com' },
      grades: { name: 'الأول الثانوي' },
    },
    {
      id: 1022,
      created_at: '2026-03-07T09:15:00.000Z',
      status: 'payment_completed',
      total_amount: 200,
      currency: 'AED',
      student_details: { name: 'فاطمة علي أحمد علي', phone: '790320151' },
      parent_details: { name: 'علي أحمد', phone: '790320171' },
      users: { name: 'علي أحمد', email: 'ali@example.com' },
      grades: { name: 'الصف السادس' },
    },
    {
      id: 1021,
      created_at: '2026-03-06T12:00:00.000Z',
      status: 'approved',
      total_amount: 100,
      currency: 'AED',
      student_details: { name: 'ملك علي محمد', phone: '790320152' },
      parent_details: { name: 'علي محمد', phone: '790320172' },
      users: { name: 'علي محمد', email: 'mohammad@example.com' },
      grades: { name: 'تأسيس اللغة الإنجليزية' },
    },
    {
      id: 1020,
      created_at: '2026-03-05T15:40:00.000Z',
      status: 'rejected',
      total_amount: 0,
      currency: 'AED',
      student_details: { name: 'ليان عبد الرحمن', phone: '790320153' },
      parent_details: { name: 'عبد الرحمن صالح', phone: '790320173' },
      users: { name: 'عبد الرحمن صالح', email: 'saleh@example.com' },
      grades: { name: 'الصف السادس' },
    },
    {
      id: 1019,
      created_at: '2026-03-04T10:25:00.000Z',
      status: 'pending',
      total_amount: 150,
      currency: 'AED',
      student_details: { name: 'يوسف سامي محمود', phone: '790320154' },
      parent_details: { name: 'سامي محمود', phone: '790320174' },
      users: { name: 'سامي محمود', email: 'sami@example.com' },
      grades: { name: 'الأول الثانوي' },
    },
    {
      id: 1018,
      created_at: '2026-03-03T14:00:00.000Z',
      status: 'approved',
      total_amount: 180,
      currency: 'AED',
      student_details: { name: 'سارة حسن محمد', phone: '790320155' },
      parent_details: { name: 'حسن محمد', phone: '790320175' },
      users: { name: 'حسن محمد', email: 'hassan@example.com' },
      grades: { name: 'كورس مراجعات' },
    },
  ];
}
