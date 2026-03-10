import Link from 'next/link';
import { ArrowRight, BookOpen, Building2, Globe2, Users } from 'lucide-react';

interface AboutPageProps {
  params: { locale: string };
}

export default function AboutPage({ params: { locale } }: AboutPageProps) {
  const isArabic = locale === 'ar';

  const stats = [
    {
      value: isArabic ? '٢٤/٧' : '24/7',
      label: isArabic ? 'وصول رقمي' : 'Digital access',
    },
    {
      value: isArabic ? 'RTL' : 'RTL',
      label: isArabic ? 'تجربة عربية' : 'Arabic-ready UX',
    },
    {
      value: isArabic ? 'K-12' : 'K-12',
      label: isArabic ? 'مراحل تعليمية' : 'School stages',
    },
  ];

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
                {isArabic ? 'حول المنصة' : 'About the platform'}
              </span>
              <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                {isArabic
                  ? 'منصة تعليمية حديثة تجمع بين الوضوح، السرعة، وتجربة عربية قوية.'
                  : 'A modern learning platform built around clarity, speed, and strong Arabic UX.'}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                {isArabic
                  ? 'هذا المسار يعيد بناء طابع المرجع العام: معلومات مختصرة، أقسام مرتبة، نقاط ثقة واضحة، ومسارات دخول وانضمام ظاهرة من أول شاشة.'
                  : 'This path rebuilds the public-reference feel: concise messaging, ordered sections, visible trust points, and clear login/join entry paths from the first screen.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${locale}/services`}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  {isArabic ? 'تعرف على الخدمات' : 'Explore services'}
                  <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                </Link>
                <Link
                  href={`/${locale}/contact`}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  {isArabic ? 'تواصل معنا' : 'Contact us'}
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-3xl font-black text-slate-950">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Globe2,
              title: isArabic ? 'وصول من أي مكان' : 'Access from anywhere',
              body: isArabic
                ? 'تنقل عام واضح، تبديل لغة مباشر، وتجربة تعمل من الهاتف والكمبيوتر بدون كسر التخطيط.'
                : 'Clear public navigation, direct locale switching, and a layout that holds up on mobile and desktop.',
            },
            {
              icon: Users,
              title: isArabic ? 'مسار ولي الأمر والطالب' : 'Parent and learner flow',
              body: isArabic
                ? 'بوابة موحدة للدخول والانضمام، ثم انتقال إلى لوحة تحكم تناسب الدور والمحتوى المتاح.'
                : 'Unified login/join entry, then role-aware movement into the dashboard and learning flows.',
            },
            {
              icon: Building2,
              title: isArabic ? 'هيكل أكاديمي قابل للتوسع' : 'Scalable academic structure',
              body: isArabic
                ? 'صفحات إدارة، دروس، تقويم، ومواد تعليمية مبنية فوق مكونات قابلة لإعادة الاستخدام.'
                : 'Admin, lessons, calendar, and course surfaces built on reusable components and shared states.',
            },
          ].map((item) => (
            <article key={item.title} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <item.icon className="h-10 w-10 rounded-2xl bg-sky-100 p-2 text-sky-700" />
              <h2 className="mt-5 text-xl font-bold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              {isArabic ? 'جاهزية المنصة' : 'Platform readiness'}
            </p>
            <h2 className="text-3xl font-black text-slate-950">
              {isArabic ? 'ابدأ من الخدمات أو انطلق مباشرة إلى التسجيل.' : 'Start with services or go straight into sign-up.'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/join`}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              <BookOpen className="h-4 w-4" />
              {isArabic ? 'انضم الآن' : 'Join now'}
            </Link>
            <Link
              href={`/${locale}/login`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              {isArabic ? 'تسجيل الدخول' : 'Login'}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

