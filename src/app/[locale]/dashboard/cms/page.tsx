'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Globe, FileText, CheckCircle2, Clock, Calendar, Pencil, Eye, Section, Settings, LayoutTemplate } from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { withLocalePrefix } from '@/lib/locale-path';

const cmsPages = [
  {
    key: 'home',
    title: { ar: 'الصفحة الرئيسية', en: 'Landing page' },
    description: {
      ar: 'الصفحة الرئيسية مع أقسام المقدمة والأثر وآراء المستخدمين والفريق والأسئلة الشائعة والدعوة إلى الإجراء.',
      en: 'Main homepage with hero, impact, testimonials, team, FAQ, and CTA sections',
    },
    sections: 6,
    preview: '/',
    icon: Globe,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
  },
  {
    key: 'about',
    title: { ar: 'من نحن', en: 'About us' },
    description: {
      ar: 'معلومات المدرسة والرسالة والرؤية والقيم الأساسية.',
      en: 'School information, mission, vision, and values',
    },
    sections: 5,
    preview: '/about',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
  },
  {
    key: 'services',
    title: { ar: 'الخدمات', en: 'Services' },
    description: {
      ar: 'البرامج التعليمية والخدمات الداعمة المعروضة للطلاب والأهالي.',
      en: 'Educational services and programs offered',
    },
    sections: 4,
    preview: '/services',
    icon: LayoutTemplate,
    color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  },
  {
    key: 'contact',
    title: { ar: 'تواصل معنا', en: 'Contact us' },
    description: {
      ar: 'معلومات التواصل ونموذج الاستفسارات العام.',
      en: 'Contact information and inquiry form',
    },
    sections: 3,
    preview: '/contact',
    icon: Section,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400',
  },
];

export default function DashboardCmsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [notice, setNotice] = useState<string | null>(null);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const pageTitle = isArabic ? 'إدارة المحتوى' : 'CMS';
  const pageSubtitle = isArabic ? 'نظرة عامة على الصفحات وإدارتها' : 'Overview of managed pages and their content';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">
                {pageTitle}
              </h1>
              <p className="text-gray-600 mt-2 text-muted-foreground">
                {pageSubtitle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'إجمالي الصفحات' : 'Total Pages'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {cmsPages.length}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-500" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'منشورة' : 'Published'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {cmsPages.length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'مسودة' : 'Drafts'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      0
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-500" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'إجمالي الأقسام' : 'Total Sections'}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {cmsPages.reduce((total, page) => total + page.sections, 0)}
                    </p>
                  </div>
                  <Section className="h-8 w-8 text-purple-600 dark:text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {notice ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {notice}
            </div>
          ) : null}

          <Tabs defaultValue="pages" className="space-y-6" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="relative flex items-center">
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground flex-nowrap min-w-max">
                  <TabsTrigger value="pages" className="inline-flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-foreground">
                    <FileText className="h-4 w-4" />
                    {isArabic ? 'أقسام الصفحات' : 'Page Sections'}
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="inline-flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all hover:text-foreground">
                    <Settings className="h-4 w-4" />
                    {isArabic ? 'إعدادات عامة' : 'Global Settings'}
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="pages" className="mt-2 text-sm text-foreground focus-visible:outline-none space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cmsPages.map((page) => (
                  <div key={page.key} className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-950 dark:border-gray-800">
                    <div className="flex flex-col space-y-1.5 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className={`p-2 rounded-lg ${page.color}`}>
                            <page.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold tracking-tight text-lg dark:text-white">
                              {page.title[isArabic ? 'ar' : 'en']}
                            </h3>
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 mt-1 text-xs font-semibold transition-colors focus:outline-none border-transparent bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                              {isArabic ? 'منشورة' : 'published'}
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-slate-500 mt-2 min-h-[40px]">
                        {page.description[isArabic ? 'ar' : 'en']}
                      </p>
                    </div>

                    <div className="p-6 pt-0">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                            {isArabic ? 'آخر تعديل:' : 'Last modified:'} {new Date().toLocaleDateString(isArabic ? 'ar' : 'en')}
                          </span>
                          <span className="font-medium">
                            {page.sections} {isArabic ? 'أقسام' : 'sections'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-6 justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-primary hover:text-primary hover:bg-primary/10 transition-colors font-semibold"
                        onClick={() =>
                          showNotice(
                            isArabic
                              ? `تم فتح وضع التحرير الاستعراضي لصفحة ${page.title.ar}.`
                              : `Preview edit mode opened for ${page.title.en}.`,
                          )
                        }
                      >
                        <Pencil className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                        {isArabic ? 'تعديل الأقسام' : 'Edit Sections'}
                      </Button>
                      <Link prefetch={false} href={withLocalePrefix(page.preview, locale)} target="_blank">
                        <Button
                          type="button"
                          variant="outline"
                          className="font-semibold"
                        >
                          <Eye className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                          {isArabic ? 'معاينة' : 'Preview'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-2 text-sm text-foreground focus-visible:outline-none">
              <div className="flex items-center justify-center p-12 border border-dashed rounded-xl border-slate-200">
                <p className="text-slate-500 text-center">
                  {isArabic ? 'جاري تطوير نافذة الإعدادات...' : 'Settings view under development...'}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
