'use client';

import Link from 'next/link';
import {
  Activity,
  Award,
  BookOpen,
  Calendar,
  ChartColumn,
  ChartNoAxesColumn,
  ChartPie,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  GraduationCap,
  MessageSquare,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';
import { useLocale } from 'next-intl';

import { withLocalePrefix } from '@/lib/locale-path';
import { getReferenceDashboardData } from '@/lib/reference-dashboard-data';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from '@/components/dashboard/recharts-stub';

export default function ReferenceDashboardOverview() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const dashboard = getReferenceDashboardData(isArabic);

  const data = [
    { name: '2025-10-20', uv: 4 },
    { name: '2025-10-28', uv: 3 },
    { name: '2025-11-18', uv: 2 },
    { name: '2025-12-04', uv: 6 },
  ];

  const pieData = [
    { name: 'Category A', value: 400 },
  ];

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white"> </h2>
          <p className="text-muted-foreground mt-2">{isArabic ? 'مرحباً بعودتك! إليك ما يحدث في مدرستك اليوم.' : 'Welcome back! Here is what is happening in your school today.'}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="grid gap-2">
            <button
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-3xl text-sm transition-all border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-12 px-4 py-2 has-[>svg]:px-3 w-[300px] justify-start text-left font-normal"
              type="button"
            >
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              Sep 11, 2025 - Mar 10, 2026
            </button>
          </div>
          <Link href={withLocalePrefix('/dashboard/admin/reports', locale)}>
            <div className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer">
              <ChartNoAxesColumn className="h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">{isArabic ? 'عرض التقارير' : 'View Reports'}</span>
            </div>
          </Link>
          <div className="flex items-center space-x-2 bg-muted/50 px-3 py-2 rounded-lg">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">Tuesday, March 10, 2026</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. إجمالي الفصول (Total bundles) */}
        <div className="rounded-lg text-card-foreground border-0 shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-purple-700 dark:text-purple-300">{isArabic ? 'إجمالي الفصول' : 'Total Bundles'}</h3>
            <div className="p-2 bg-purple-500 rounded-lg">
              <BookOpen className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">13</div>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-2 flex items-center">
              <Activity className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? '3 مواد دراسية نشطة' : '3 active courses'}
            </p>
          </div>
        </div>

        {/* 2. اجمالي الطلاب (Total students) */}
        <div className="rounded-lg text-card-foreground border-0 transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium flex gap-2 items-center text-blue-700 dark:text-blue-300">
              {isArabic ? 'اجمالي الطلاب' : 'Total Students'}
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">70</div>
            </h3>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="grid lg:grid-cols-3 grid-cols-1 text-center gap-2">
              <div className="bg-green-100 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'تمت الموافقة' : 'Approved'}</div>
                <div className="text-2xl font-bold">53</div>
              </div>
              <div className="bg-red-100 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'مرفوض' : 'Rejected'}</div>
                <div className="text-2xl font-bold">14</div>
              </div>
              <div className="bg-yellow-100 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'قيد الانتظار' : 'Pending'}</div>
                <div className="text-2xl font-bold">1</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. إجمالي الإيرادات (Total revenue) */}
        <div className="rounded-lg text-card-foreground border-0 shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-green-700 dark:text-green-300">
              {isArabic ? 'إجمالي الإيرادات' : 'Total Revenue'}
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">AED 100</div>
            </h3>
            <div className="p-2 bg-green-500 rounded-lg">
              <CreditCard className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="grid lg:grid-cols-3 grid-cols-1 text-center gap-2">
              <div className="bg-green-200 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'اجمالي المستحق' : 'Total Due'}</div>
                <div className="text-sm font-bold">AED 2,400</div>
              </div>
              <div className="bg-red-100 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'المديونية' : 'Debt'}</div>
                <div className="text-sm font-bold">AED 2,300</div>
              </div>
              <div className="bg-yellow-100 text-gray-700 p-2 rounded-lg">
                <div className="text-xs font-medium">{isArabic ? 'الرسوم القادمة' : 'Upcoming'}</div>
                <div className="text-sm font-bold">AED 0</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. إجمالي الطلبات (Total applications) */}
        <div className="rounded-lg text-card-foreground border-0 transition-all duration-300 hover:scale-105 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-orange-700 dark:text-orange-300">{isArabic ? 'إجمالي الطلبات' : 'Total Applications'}</h3>
            <div className="p-2 bg-orange-500 rounded-lg">
              <FileText className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">68</div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 flex items-center">
              <Clock className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? 'معلق: 1' : 'Pending: 1'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* 5. إكمال المادة دراسية (Course completion) */}
        <div className="rounded-lg text-card-foreground group shadow-lg bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 dark:from-amber-900 dark:via-yellow-900 dark:to-orange-900 hover:shadow-xl transition-all duration-300 hover:scale-105 border-0">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-amber-800 dark:text-amber-200">{isArabic ? 'إكمال المادة دراسية' : 'Course Completion'}</h3>
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Award className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-amber-900 dark:text-amber-100 mb-2">0.0%</div>
            <p className="text-sm text-amber-700 dark:text-amber-300 flex items-center">
              <Star className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? 'متوسط معدل الإكمال' : 'Average tracking rate'}
            </p>
          </div>
        </div>

        {/* 6. أداء الاختبارات (Exam performance) */}
        <div className="rounded-lg text-card-foreground group border-0 shadow-lg bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-indigo-800 dark:text-indigo-200">{isArabic ? 'أداء الاختبارات' : 'Exam Performance'}</h3>
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Target className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">0.0%</div>
            <p className="text-sm text-indigo-700 dark:text-indigo-300 flex items-center">
              <UserCheck className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? '0 إجمالي المحاولات' : '0 Total Attempts'}
            </p>
          </div>
        </div>

        {/* 7. إجمالي المصروفات (Total expenses) */}
        <div className="rounded-lg text-card-foreground group border-0 shadow-lg bg-gradient-to-br from-red-100 via-pink-50 to-rose-100 dark:from-red-900 dark:via-pink-900 dark:to-rose-900 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-red-800 dark:text-red-200">{isArabic ? 'إجمالي المصروفات' : 'Total Expenses'}</h3>
            <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <TrendingUp className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-red-900 dark:text-red-100 mb-2">AED0</div>
            <p className="text-sm text-red-700 dark:text-red-300 flex items-center">
              <DollarSign className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? 'التكاليف التشغيلية الشهرية' : 'Monthly operating costs'}
            </p>
          </div>
        </div>

        {/* 8. المعلمون النشطون (Active teachers) */}
        <div className="rounded-lg text-card-foreground group border-0 shadow-lg bg-gradient-to-br from-teal-100 via-cyan-50 to-blue-100 dark:from-teal-900 dark:via-cyan-900 dark:to-blue-900 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-3">
            <h3 className="tracking-tight text-sm font-medium text-teal-800 dark:text-teal-200">{isArabic ? 'المعلمون النشطون' : 'Active Teachers'}</h3>
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300">
              <GraduationCap className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold text-teal-900 dark:text-teal-100 mb-2">1</div>
            <p className="text-sm text-teal-700 dark:text-teal-300 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" aria-hidden="true" />
              {isArabic ? '0 رسائل هذا الشهر' : '0 Messages this month'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="tracking-tight text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-500" aria-hidden="true" />
                  {isArabic ? 'نشاط الطلاب' : 'Student Activity'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isArabic ? 'اتجاهات التسجيل الأسبوعية' : 'Weekly enrollment trends'}</p>
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                {isArabic ? 'هذا الأسبوع' : 'This week'}
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  />
                  <Area type="monotone" dataKey="uv" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorStudents)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="tracking-tight text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChartColumn className="h-6 w-6 text-green-500" aria-hidden="true" />
                  {isArabic ? 'نظرة عامة على الإيرادات' : 'Revenue Overview'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isArabic ? 'اتجاهات الإيرادات الشهرية' : 'Monthly revenue trends'}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">{isArabic ? 'الإيرادات' : 'Revenue'}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[280px] w-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl">
              {/* Empty chart stub as in reference HTML */}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-white dark:bg-gray-800">
          <div className="flex flex-col space-y-1.5 p-6 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="tracking-tight text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ChartPie className="h-6 w-6 text-purple-500" aria-hidden="true" />
                  {isArabic ? 'تفصيل المصروفات' : 'Expense Breakdown'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isArabic ? 'الإنفاق الشهري حسب الفئة' : 'Monthly spending by category'}</p>
              </div>
            </div>
          </div>
          <div className="p-6 pt-0 flex justify-center">
            <div className="h-[280px] w-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={'#e2e8f0'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-purple-700 dark:text-purple-300">{isArabic ? 'إجمالي المصروفات' : 'Total Expenses'}</h3>
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">AED0</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">{isArabic ? 'التكاليف التشغيلية الشهرية' : 'Monthly operating costs'}</p>
            </div>
          </div>

          <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-green-700 dark:text-green-300">{isArabic ? 'هامش الربح' : 'Profit Margin'}</h3>
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">100.0%</div>
              <p className="text-xs text-green-600 dark:text-green-400">{isArabic ? 'الإيرادات ناقص المصروفات' : 'Revenue minus expenses'}</p>
            </div>
          </div>

          <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-orange-700 dark:text-orange-300">{isArabic ? 'المعلمون النشطون' : 'Active Teachers'}</h3>
              <div className="p-2 bg-orange-500 rounded-lg">
                <GraduationCap className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">1</div>
              <p className="text-xs text-orange-600 dark:text-orange-400">{isArabic ? '0 رسائل هذا الشهر' : '0 messages this month'}</p>
            </div>
          </div>

          <div className="rounded-lg text-card-foreground border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900 dark:to-indigo-800">
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="tracking-tight text-sm font-medium text-indigo-700 dark:text-indigo-300">{isArabic ? 'إكمال المادة دراسية' : 'Course Completion'}</h3>
              <div className="p-2 bg-indigo-500 rounded-lg">
                <Activity className="h-4 w-4 text-white" aria-hidden="true" />
              </div>
            </div>
            <div className="p-6 pt-0">
              <div className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">0.0%</div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">{isArabic ? 'متوسط معدل الإكمال' : 'Average completion rate'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="relative overflow-hidden h-[500px] shadow-lg rounded-lg border-0 bg-white dark:bg-gray-800">
          <div className="h-full w-full overflow-y-auto overflow-x-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="tracking-tight text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-emerald-500" aria-hidden="true" />
                  {isArabic ? 'نظرة عامة على الفصول النشطة' : 'Active Bundles Overview'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isArabic ? 'جميع حزم المواد الدراسية وأدائها' : 'All course bundles and performance'}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-900">
                  {dashboard.activeBundles.length} {isArabic ? 'فصل' : 'bundles'}
                </div>
                <Link className="text-sm text-primary hover:underline" href={withLocalePrefix('/dashboard/bundles', locale)}>
                  {isArabic ? 'عرض الكل ←' : 'View all →'}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              {dashboard.activeBundles.map((bundle, i) => (
                <div key={i} className="flex flex-col gap-4 lg:flex-row p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold bg-emerald-500`}>
                      <BookOpen className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{bundle.title}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{bundle.students} {isArabic ? 'طلاب' : 'students'}</span>
                        </div>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold border-transparent bg-primary text-primary-foreground text-xs">
                          {isArabic ? 'نشط' : 'Active'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 min-w-max ltr:ml-auto rtl:mr-auto">
                    <div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">{bundle.paid}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isArabic ? 'اجمالي المستحق' : 'Total Due'}</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg text-gray-900 dark:text-white">AED 0</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isArabic ? 'الرسوم القادمة' : 'Upcoming Fees'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900 dark:text-white">{bundle.completion}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{isArabic ? 'الإكمال' : 'Completion'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden h-[500px] shadow-lg rounded-lg border-0 bg-white dark:bg-gray-800">
          <div className="h-full w-full overflow-y-auto overflow-x-hidden p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="tracking-tight text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-blue-500" aria-hidden="true" />
                  {isArabic ? 'أداء المعلمين' : 'Teacher Performance'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{isArabic ? 'أفضل المعلمين أداءً' : 'Top performing teachers'}</p>
              </div>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-900">
                {dashboard.teacherPerformance.length} {isArabic ? 'معلمون' : 'teachers'}
              </div>
            </div>
            <div className="space-y-3">
              {dashboard.teacherPerformance.map((teacher, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white text-sm font-bold">
                      {teacher.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{teacher.name}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">{teacher.tasks / 2} {isArabic ? 'الفصول' : 'Bundles'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{teacher.tasks} {isArabic ? 'مهام' : 'Tasks'}</span>
                        </div>
                        <span className="inline-flex rounded-full bg-slate-950 px-3 py-0.5 text-xs font-bold text-white">
                          {teacher.ratio}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <span className="text-sm text-gray-500">{teacher.note}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
