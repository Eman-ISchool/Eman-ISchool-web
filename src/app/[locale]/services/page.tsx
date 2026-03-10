import Link from 'next/link';
import { ArrowRight, BookOpen, CalendarDays, MessageSquareMore, ShieldCheck } from 'lucide-react';

interface ServicesPageProps {
  params: { locale: string };
}

export default function ServicesPage({ params: { locale } }: ServicesPageProps) {
  const isArabic = locale === 'ar';

  const services = [
    {
      icon: BookOpen,
      title: isArabic ? 'إدارة تعلم ومحتوى' : 'Learning and content delivery',
      body: isArabic
        ? 'مواد، دروس، واجبات، وصفحات عامة مترابطة بتخطيط موحّد ومكوّنات قابلة لإعادة الاستخدام.'
        : 'Courses, lessons, assignments, and public content connected through a unified layout and reusable components.',
    },
    {
      icon: CalendarDays,
      title: isArabic ? 'تقويم وتشغيل يومي' : 'Calendar and daily operations',
      body: isArabic
        ? 'تنقل إلى الجلسات الحية، الجداول، والمتابعة اليومية من لوحة تحكم إدارية واضحة.'
        : 'Move into live sessions, calendars, and daily operational follow-up from a clear admin dashboard.',
    },
    {
      icon: MessageSquareMore,
      title: isArabic ? 'تواصل ودعم' : 'Communication and support',
      body: isArabic
        ? 'نماذج تواصل، رسائل، ودعم مبني على حالات تحميل ونجاح وخطأ واضحة.'
        : 'Contact surfaces, messages, and support built around clear loading, success, and error states.',
    },
    {
      icon: ShieldCheck,
      title: isArabic ? 'عربية وRTL وأداء' : 'Arabic, RTL, and performance',
      body: isArabic
        ? 'تجربة عربية قوية، توجيه RTL، وهيكل خفيف للواجهات العامة ومسارات الدخول.'
        : 'Strong Arabic coverage, RTL directionality, and lighter public/auth surfaces for better perceived performance.',
    },
  ];

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
              {isArabic ? 'خدماتنا' : 'Services'}
            </span>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              {isArabic ? 'خدمات تعليمية وإدارية تغطي التجربة العامة والدخول ولوحة التحكم.' : 'Educational and administrative services spanning public discovery, account entry, and dashboard workflows.'}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-slate-600">
              {isArabic
                ? 'المرجع يعتمد على صفحات تسويق قليلة لكن مرتبة، ثم يربطها مباشرة بالدخول والانضمام والمسارات الداخلية. هذه الصفحة تعكس نفس المنطق داخل المشروع الحالي.'
                : 'The reference uses a small but ordered marketing IA, then connects it directly to login, join, and internal flows. This page mirrors that logic inside the current project.'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((service) => (
            <article key={service.title} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
              <service.icon className="h-11 w-11 rounded-2xl bg-slate-950 p-2 text-white" />
              <h2 className="mt-5 text-2xl font-bold text-slate-950">{service.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{service.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
              {isArabic ? 'المسار التالي' : 'Next step'}
            </p>
            <h2 className="text-3xl font-black text-slate-950">
              {isArabic ? 'اختر بين تجربة التعريف أو الانتقال المباشر إلى الانضمام.' : 'Choose between discovery and a direct move into sign-up.'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
            >
              {isArabic ? 'تحدث معنا' : 'Talk to us'}
            </Link>
            <Link
              href={`/${locale}/join`}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700"
            >
              {isArabic ? 'انضم الآن' : 'Join now'}
              <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

