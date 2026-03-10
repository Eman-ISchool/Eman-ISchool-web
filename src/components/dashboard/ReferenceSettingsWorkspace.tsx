'use client';

import { useMemo, useState } from 'react';
import { Database, Languages, RefreshCw, Save, Search, ShieldCheck } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type SettingsScope = 'lookups' | 'backup' | 'translations';

type SettingsItem = {
  id: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  status: { ar: string; en: string };
  statusClassName: string;
  meta: string;
};

const settingsMeta: Record<
  SettingsScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof Database;
    tone: string;
  }
> = {
  lookups: {
    hero: { ar: 'البيانات المرجعية', en: 'Lookup workspace' },
    helper: { ar: 'إدارة القيم المرجعية المستخدمة في التسجيل والرسوم والحضور.', en: 'Manage lookup values used across enrollment, fees, and attendance.' },
    createLabel: { ar: 'مجموعة جديدة', en: 'New group' },
    icon: Database,
    tone: 'bg-[#eef4ff] text-[#2563eb]',
  },
  backup: {
    hero: { ar: 'النسخ الاحتياطي', en: 'Backup workspace' },
    helper: { ar: 'مراقبة النسخ، نقاط الاستعادة، وجدولة النسخ القادمة.', en: 'Monitor backups, restore points, and upcoming backup jobs.' },
    createLabel: { ar: 'نسخة جديدة', en: 'New backup' },
    icon: ShieldCheck,
    tone: 'bg-[#edfdf3] text-[#15803d]',
  },
  translations: {
    hero: { ar: 'الترجمات', en: 'Translations workspace' },
    helper: { ar: 'إدارة الحزم اللغوية وحالة المراجعة والنشر.', en: 'Manage language packs, review state, and publishing.' },
    createLabel: { ar: 'حزمة جديدة', en: 'New pack' },
    icon: Languages,
    tone: 'bg-[#f5f3ff] text-[#7c3aed]',
  },
};

const itemsByScope: Record<SettingsScope, SettingsItem[]> = {
  lookups: [
    {
      id: 'lookup-1',
      title: { ar: 'مستويات الصفوف', en: 'Grade levels' },
      description: { ar: 'القيم المستخدمة في التسجيل ونماذج العرض.', en: 'Values used in enrollment and listing forms.' },
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      meta: '18 قيمة',
    },
    {
      id: 'lookup-2',
      title: { ar: 'قنوات الدفع', en: 'Payment channels' },
      description: { ar: 'الخيارات المتاحة في عمليات التحصيل.', en: 'Collection options available to finance workflows.' },
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      meta: '6 قنوات',
    },
    {
      id: 'lookup-3',
      title: { ar: 'أنواع الحضور', en: 'Attendance types' },
      description: { ar: 'القيم القياسية للحضور والتأخير والغياب.', en: 'Standard values for present, late, and absent states.' },
      status: { ar: 'منشور', en: 'Published' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      meta: '4 حالات',
    },
  ],
  backup: [
    {
      id: 'backup-1',
      title: { ar: 'نسخة يومية تلقائية', en: 'Daily automated backup' },
      description: { ar: 'قواعد البيانات والملفات العامة كل 24 ساعة.', en: 'Database and public files every 24 hours.' },
      status: { ar: 'سليم', en: 'Healthy' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      meta: 'آخر تشغيل 2026-03-10 02:00',
    },
    {
      id: 'backup-2',
      title: { ar: 'نقطة استعادة قبل النشر', en: 'Pre-release restore point' },
      description: { ar: 'نسخة قبل تغييرات المحتوى الرئيسية.', en: 'Restore point before major content releases.' },
      status: { ar: 'محفوظ', en: 'Stored' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      meta: 'آخر تشغيل 2026-03-08 18:30',
    },
    {
      id: 'backup-3',
      title: { ar: 'نسخة مرتبات شهرية', en: 'Monthly payroll backup' },
      description: { ar: 'نسخة شهرية لأرشيف الرواتب والقسائم.', en: 'Monthly payroll and payslip archive backup.' },
      status: { ar: 'بحاجة متابعة', en: 'Needs follow-up' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      meta: 'آخر تشغيل 2026-02-28 21:00',
    },
  ],
  translations: [
    {
      id: 'translation-1',
      title: { ar: 'حزمة العربية', en: 'Arabic pack' },
      description: { ar: 'النسخة الأساسية لجميع واجهات الإدارة.', en: 'Primary pack for all admin experiences.' },
      status: { ar: 'مفعل', en: 'Enabled' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      meta: '100% مكتمل',
    },
    {
      id: 'translation-2',
      title: { ar: 'حزمة الإنجليزية', en: 'English pack' },
      description: { ar: 'مراجعة العناوين والمسارات المشتركة.', en: 'Reviewing shared route and heading labels.' },
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      meta: '84% مكتمل',
    },
    {
      id: 'translation-3',
      title: { ar: 'حزمة الفرنسية', en: 'French pack' },
      description: { ar: 'مسار ترجمة مبدئي لأسطح التسجيل فقط.', en: 'Initial translation path for registration surfaces only.' },
      status: { ar: 'مسودة', en: 'Draft' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      meta: '41% مكتمل',
    },
  ],
};

export default function ReferenceSettingsWorkspace({ scope }: { scope: SettingsScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = settingsMeta[scope];
  const items = itemsByScope[scope];
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) =>
      [item.title.ar, item.title.en, item.description.ar, item.description.en, item.meta]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [items, query]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [isArabic ? 'إجمالي الوحدات' : 'Total units', items.length, meta.tone],
          [isArabic ? 'جاهزة' : 'Ready', items.filter((item) => item.status.en === 'Published' || item.status.en === 'Enabled' || item.status.en === 'Healthy').length, 'bg-[#edfdf3] text-[#15803d]'],
          [isArabic ? 'تحتاج متابعة' : 'Needs follow-up', items.filter((item) => item.status.en === 'Review' || item.status.en === 'Needs follow-up').length, 'bg-[#fff7ed] text-[#c2410c]'],
          [isArabic ? 'آخر مزامنة' : 'Last sync', '2026-03-10', 'bg-[#eef2ff] text-[#4338ca]'],
        ].map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-2xl p-3 ${meta.tone}`}>
              <meta.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-950">{meta.hero[isArabic ? 'ar' : 'en']}</h2>
              <p className="mt-1 text-sm text-slate-500">{meta.helper[isArabic ? 'ar' : 'en']}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-full border-slate-300"
              onClick={() => showNotice(isArabic ? 'تم تحديث الحالة الحالية.' : 'Current state refreshed.')}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              {isArabic ? 'تحديث' : 'Refresh'}
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
              onClick={() =>
                showNotice(
                  isArabic ? `تم فتح نموذج ${meta.createLabel.ar}.` : `${meta.createLabel.en} form opened.`,
                )
              }
            >
              {meta.createLabel[isArabic ? 'ar' : 'en']}
            </Button>
          </div>
        </div>

        {notice ? (
          <div className="mt-4 rounded-[1.3rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {notice}
          </div>
        ) : null}

        <div className="mt-6 grid gap-3 rounded-[1.6rem] bg-slate-50 p-4 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isArabic ? 'ابحث عن وحدة أو وصف' : 'Search by unit or description'}
              className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-12 rounded-2xl border-slate-300"
            onClick={() => showNotice(isArabic ? 'تم حفظ الإعدادات الحالية.' : 'Current settings saved.')}
          >
            <Save className="ml-2 h-4 w-4" />
            {isArabic ? 'حفظ الحالة' : 'Save state'}
          </Button>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_280px]">
          <div className="grid gap-4">
            {filteredItems.map((item) => (
              <article key={item.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{item.title[isArabic ? 'ar' : 'en']}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                      {item.description[isArabic ? 'ar' : 'en']}
                    </p>
                    <p className="mt-3 text-xs font-semibold text-slate-400">{item.meta}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.statusClassName}`}>
                    {item.status[isArabic ? 'ar' : 'en']}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full border-slate-300"
                    onClick={() =>
                      showNotice(
                        isArabic ? `تم فتح إعدادات ${item.title.ar}.` : `${item.title.en} settings opened.`,
                      )
                    }
                  >
                    {isArabic ? 'الإعدادات' : 'Settings'}
                  </Button>
                  <Button
                    type="button"
                    className="rounded-full bg-slate-950 hover:bg-slate-800"
                    onClick={() =>
                      showNotice(
                        isArabic ? `تمت مزامنة ${item.title.ar}.` : `${item.title.en} synchronized.`,
                      )
                    }
                  >
                    {isArabic ? 'مزامنة' : 'Sync'}
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <aside className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-black text-slate-950">
              {isArabic ? 'إجراءات سريعة' : 'Quick actions'}
            </h2>
            <div className="mt-4 space-y-3">
              {[
                isArabic ? 'مراجعة آخر التغييرات قبل النشر.' : 'Review latest changes before publishing.',
                isArabic ? 'تحقق من السجلات غير المكتملة هذا الأسبوع.' : 'Check incomplete records this week.',
                isArabic ? 'احتفظ بنقطة استعادة قبل تعديل القيم الأساسية.' : 'Keep a restore point before editing core values.',
              ].map((item) => (
                <div key={item} className="rounded-[1.2rem] border border-white bg-white px-4 py-3 text-sm text-slate-500">
                  {item}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
