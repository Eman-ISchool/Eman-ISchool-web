'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { withLocalePrefix } from '@/lib/locale-path';

const pageDefinitions = {
  home: {
    title: { ar: 'تحرير الصفحة الرئيسية', en: 'Edit landing page' },
    sections: {
      ar: ['قسم المقدمة', 'الأثر', 'آراء المستخدمين', 'الفريق', 'الأسئلة الشائعة', 'الدعوة إلى الإجراء'],
      en: ['Hero section', 'Impact', 'Voices', 'Team', 'FAQ', 'CTA'],
    },
  },
  about: {
    title: { ar: 'تحرير صفحة من نحن', en: 'Edit about page' },
    sections: {
      ar: ['قسم المقدمة', 'الرسالة والرؤية', 'القيم الأساسية', 'الإحصاءات', 'لماذا نحن'],
      en: ['Hero section', 'Mission & vision', 'Core values', 'Statistics', 'Why choose us'],
    },
  },
  services: {
    title: { ar: 'تحرير صفحة الخدمات', en: 'Edit services page' },
    sections: {
      ar: ['قسم المقدمة', 'الخدمات التعليمية', 'الخدمات الداعمة', 'الدعوة إلى الإجراء'],
      en: ['Hero section', 'Educational services', 'Support services', 'Call to action'],
    },
  },
  contact: {
    title: { ar: 'تحرير صفحة التواصل', en: 'Edit contact page' },
    sections: {
      ar: ['قسم المقدمة', 'نموذج التواصل', 'معلومات التواصل', 'الأسئلة الشائعة', 'الخريطة'],
      en: ['Hero section', 'Contact form', 'Contact information', 'FAQ section', 'Map section'],
    },
  },
} as const;

export default function DashboardCmsEditorPage() {
  const params = useParams<{ pageKey: keyof typeof pageDefinitions }>();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const config = pageDefinitions[params.pageKey] || pageDefinitions.home;
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  const fields = useMemo(
    () =>
      config.sections[language].flatMap((section) =>
        language === 'ar'
          ? [`عنوان ${section}`, `وصف ${section}`]
          : [`${section} title`, `${section} description`],
      ),
    [config.sections, language],
  );

  return (
    <ReferenceDashboardShell
      pageTitle={config.title[isArabic ? 'ar' : 'en']}
      pageSubtitle={isArabic ? 'إدارة محتوى الصفحة الحالية' : 'Manage the content of the current page'}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={withLocalePrefix('/dashboard/cms', locale)}
            className="text-sm font-semibold text-slate-500"
          >
            {isArabic ? 'العودة إلى إدارة المحتوى' : 'Back to CMS'}
          </Link>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="rounded-full">
              {isArabic ? 'معاينة' : 'Preview'}
            </Button>
            <Button type="button" className="rounded-full bg-slate-950 hover:bg-slate-800">
              {isArabic ? 'حفظ التغييرات' : 'Save changes'}
            </Button>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">{config.title[isArabic ? 'ar' : 'en']}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {isArabic ? 'إدارة كل أقسام الصفحة من محرر واحد.' : 'Manage every section of the page from one editor.'}
              </p>
            </div>
            <div className="rounded-full bg-slate-100 p-1">
              {(['en', 'ar'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setLanguage(value)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    language === value ? 'bg-slate-950 text-white' : 'text-slate-500'
                  }`}
                >
                  {value === 'en' ? 'English' : 'العربية'}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {config.sections[isArabic ? 'ar' : 'en'].map((section, index) => (
              <article key={section} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-xl font-black text-slate-950">{section}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isArabic ? 'قم بتحديث العنوان والوصف والحقول ذات الصلة بهذا القسم.' : 'Update the title, description, and related fields for this section.'}
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {fields
                    .slice(index * 2, index * 2 + 2)
                    .map((field) => (
                      <div key={field} className="grid gap-2">
                        <label className="text-sm font-medium text-slate-700">{field}</label>
                        <Input placeholder={`${field} (${language.toUpperCase()})`} />
                      </div>
                    ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </ReferenceDashboardShell>
  );
}
