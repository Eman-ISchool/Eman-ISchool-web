'use client';

import { useMemo, useState } from 'react';
import { Banknote, CreditCard, Landmark, ReceiptText, Search, TicketPercent, Wallet } from 'lucide-react';
import { useLocale } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type FinanceScope =
  | 'fees'
  | 'payments'
  | 'banks'
  | 'currencies'
  | 'expenses'
  | 'coupons'
  | 'salaries'
  | 'payslips';

type FinanceRow = {
  id: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  owner: string;
  amount: string;
  status: { ar: string; en: string };
  statusClassName: string;
  updatedAt: string;
};

const financeMeta: Record<
  FinanceScope,
  {
    hero: { ar: string; en: string };
    helper: { ar: string; en: string };
    createLabel: { ar: string; en: string };
    icon: typeof Wallet;
    cardTone: string;
  }
> = {
  fees: {
    hero: { ar: 'الرسوم الدراسية', en: 'Academic fees' },
    helper: { ar: 'إدارة الرسوم وخطط التحصيل والمبالغ المفتوحة.', en: 'Manage fee plans, collections, and open balances.' },
    createLabel: { ar: 'إضافة رسوم', en: 'Add fee' },
    icon: ReceiptText,
    cardTone: 'bg-[#eef4ff] text-[#2563eb]',
  },
  payments: {
    hero: { ar: 'المدفوعات', en: 'Payments' },
    helper: { ar: 'متابعة الدفعات المحصلة والمبالغ المعلقة لكل فصل.', en: 'Track collected and pending payments by bundle.' },
    createLabel: { ar: 'إضافة دفعة', en: 'Add payment' },
    icon: CreditCard,
    cardTone: 'bg-[#edfdf3] text-[#16a34a]',
  },
  banks: {
    hero: { ar: 'البنوك والحسابات', en: 'Banks and accounts' },
    helper: { ar: 'مراجعة الحسابات البنكية وقنوات التحصيل النشطة.', en: 'Review bank accounts and active collection channels.' },
    createLabel: { ar: 'حساب جديد', en: 'New account' },
    icon: Landmark,
    cardTone: 'bg-[#fff7ed] text-[#ea580c]',
  },
  currencies: {
    hero: { ar: 'العملات والأسعار', en: 'Currencies and pricing' },
    helper: { ar: 'إدارة العملات الافتراضية وأسعار الصرف المعتمدة.', en: 'Manage default currencies and approved exchange rates.' },
    createLabel: { ar: 'عملة جديدة', en: 'New currency' },
    icon: Banknote,
    cardTone: 'bg-[#f5f3ff] text-[#7c3aed]',
  },
  expenses: {
    hero: { ar: 'المصروفات', en: 'Expenses' },
    helper: { ar: 'تسجيل المصروفات التشغيلية ومراقبة الاعتمادات.', en: 'Record operational expenses and monitor approvals.' },
    createLabel: { ar: 'مصروف جديد', en: 'New expense' },
    icon: Wallet,
    cardTone: 'bg-[#fff1f2] text-[#e11d48]',
  },
  coupons: {
    hero: { ar: 'الكوبونات والخصومات', en: 'Coupons and discounts' },
    helper: { ar: 'ضبط العروض والكوبونات ومسارات الخصم.', en: 'Manage promotional coupons and discount workflows.' },
    createLabel: { ar: 'كوبون جديد', en: 'New coupon' },
    icon: TicketPercent,
    cardTone: 'bg-[#fff7ed] text-[#c2410c]',
  },
  salaries: {
    hero: { ar: 'الرواتب', en: 'Salaries' },
    helper: { ar: 'مراجعة كشوف الرواتب وتسويات الاستحقاقات.', en: 'Review payroll sheets and entitlement settlements.' },
    createLabel: { ar: 'سجل راتب', en: 'New payroll' },
    icon: Banknote,
    cardTone: 'bg-[#eef2ff] text-[#4f46e5]',
  },
  payslips: {
    hero: { ar: 'قسائم الرواتب', en: 'Payslips' },
    helper: { ar: 'توزيع قسائم الرواتب ومراجعة حالة التسليم.', en: 'Distribute payslips and review delivery status.' },
    createLabel: { ar: 'إنشاء قسيمة', en: 'Generate payslip' },
    icon: ReceiptText,
    cardTone: 'bg-[#fdf2f8] text-[#db2777]',
  },
};

const financeRowsByScope: Record<FinanceScope, FinanceRow[]> = {
  fees: [
    {
      id: 'fee-1',
      title: { ar: 'رسوم كورس المعلم الإلكتروني', en: 'Teacher course fees' },
      subtitle: { ar: 'الأول الثانوي', en: 'First secondary' },
      owner: 'ميرا محمود حسن',
      amount: 'AED 150',
      status: { ar: 'قيد التحصيل', en: 'Collecting' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'fee-2',
      title: { ar: 'رسوم تأسيس اللغة الإنجليزية', en: 'English foundation fees' },
      subtitle: { ar: 'الصف السادس', en: 'Sixth grade' },
      owner: 'ليان عبد الرحمن',
      amount: 'AED 100',
      status: { ar: 'مدفوع', en: 'Paid' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-09',
    },
    {
      id: 'fee-3',
      title: { ar: 'رسوم المراجعات النهائية', en: 'Final revision fees' },
      subtitle: { ar: 'الثالث الثانوي', en: 'Third secondary' },
      owner: 'يوسف سامي محمود',
      amount: 'AED 180',
      status: { ar: 'متأخر', en: 'Overdue' },
      statusClassName: 'bg-[#fff1f2] text-[#e11d48]',
      updatedAt: '2026-03-07',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      title: { ar: 'دفعة ميرا محمود حسن', en: 'Mira Mahmoud payment' },
      subtitle: { ar: 'تحويل بنكي', en: 'Bank transfer' },
      owner: 'حساب المستقبل - بنك الإمارات',
      amount: 'AED 150',
      status: { ar: 'مؤكد', en: 'Confirmed' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'pay-2',
      title: { ar: 'دفعة رتاج محمد فاروق', en: 'Retaj Farouk payment' },
      subtitle: { ar: 'رابط دفع', en: 'Payment link' },
      owner: 'بطاقة Visa',
      amount: 'AED 100',
      status: { ar: 'بانتظار التأكيد', en: 'Awaiting confirmation' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      updatedAt: '2026-03-09',
    },
    {
      id: 'pay-3',
      title: { ar: 'دفعة فاطمة علي أحمد', en: 'Fatima Ali payment' },
      subtitle: { ar: 'نقدي', en: 'Cash' },
      owner: 'الصندوق الرئيسي',
      amount: 'AED 200',
      status: { ar: 'مسجلة', en: 'Recorded' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-08',
    },
  ],
  banks: [
    {
      id: 'bank-1',
      title: { ar: 'حساب التحصيل الرئيسي', en: 'Primary collection account' },
      subtitle: { ar: 'بنك الإمارات دبي الوطني', en: 'Emirates NBD' },
      owner: 'AED - 1122 3344',
      amount: 'AED 84,220',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'bank-2',
      title: { ar: 'حساب المرتبات', en: 'Payroll account' },
      subtitle: { ar: 'بنك أبوظبي الأول', en: 'First Abu Dhabi Bank' },
      owner: 'AED - 9988 1100',
      amount: 'AED 21,450',
      status: { ar: 'نشط', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-09',
    },
    {
      id: 'bank-3',
      title: { ar: 'محفظة الخصومات', en: 'Discount wallet' },
      subtitle: { ar: 'حساب مساعد', en: 'Auxiliary account' },
      owner: 'AED - 2002 8866',
      amount: 'AED 2,100',
      status: { ar: 'مراجعة', en: 'Review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-06',
    },
  ],
  currencies: [
    {
      id: 'cur-1',
      title: { ar: 'الدرهم الإماراتي', en: 'UAE dirham' },
      subtitle: { ar: 'العملة الافتراضية', en: 'Default currency' },
      owner: 'AED',
      amount: '1.00',
      status: { ar: 'مفعل', en: 'Enabled' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'cur-2',
      title: { ar: 'الجنيه المصري', en: 'Egyptian pound' },
      subtitle: { ar: 'تحويل الرسوم', en: 'Fee conversion' },
      owner: 'EGP',
      amount: '13.10',
      status: { ar: 'مراقب', en: 'Tracked' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      updatedAt: '2026-03-09',
    },
    {
      id: 'cur-3',
      title: { ar: 'الدولار الأمريكي', en: 'US dollar' },
      subtitle: { ar: 'الدفع الدولي', en: 'International payments' },
      owner: 'USD',
      amount: '0.27',
      status: { ar: 'مفعل', en: 'Enabled' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-08',
    },
  ],
  expenses: [
    {
      id: 'exp-1',
      title: { ar: 'اشتراك المنصة التعليمية', en: 'Platform subscription' },
      subtitle: { ar: 'اشتراك شهري', en: 'Monthly subscription' },
      owner: 'الفريق التقني',
      amount: 'AED 460',
      status: { ar: 'معتمد', en: 'Approved' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'exp-2',
      title: { ar: 'أدوات التسويق', en: 'Marketing tools' },
      subtitle: { ar: 'رخصة فريق', en: 'Team license' },
      owner: 'قسم التسويق',
      amount: 'AED 220',
      status: { ar: 'بانتظار الصرف', en: 'Pending payout' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-07',
    },
    {
      id: 'exp-3',
      title: { ar: 'استوديو التسجيل', en: 'Recording studio' },
      subtitle: { ar: 'مصروف تشغيلي', en: 'Operational expense' },
      owner: 'قسم المحتوى',
      amount: 'AED 300',
      status: { ar: 'مرفوض', en: 'Rejected' },
      statusClassName: 'bg-[#fff1f2] text-[#e11d48]',
      updatedAt: '2026-03-06',
    },
  ],
  coupons: [
    {
      id: 'cop-1',
      title: { ar: 'خصم العودة للدراسة', en: 'Back to school discount' },
      subtitle: { ar: 'خصم 15%', en: '15% off' },
      owner: 'ALL-BUNDLES-15',
      amount: '72 استخدام',
      status: { ar: 'مفعل', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'cop-2',
      title: { ar: 'خصم الأشقاء', en: 'Sibling discount' },
      subtitle: { ar: 'خصم 10%', en: '10% off' },
      owner: 'SIBLING10',
      amount: '18 استخدام',
      status: { ar: 'مفعل', en: 'Active' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-08',
    },
    {
      id: 'cop-3',
      title: { ar: 'عرض المراجعات', en: 'Revision promo' },
      subtitle: { ar: 'خصم 20%', en: '20% off' },
      owner: 'REVISION20',
      amount: '0 استخدام',
      status: { ar: 'مجمد', en: 'Paused' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      updatedAt: '2026-03-05',
    },
  ],
  salaries: [
    {
      id: 'sal-1',
      title: { ar: 'كشف رواتب مارس', en: 'March payroll' },
      subtitle: { ar: 'فريق المعلمين', en: 'Teaching team' },
      owner: '11 معلم',
      amount: 'AED 14,400',
      status: { ar: 'جاهز للتحويل', en: 'Ready to transfer' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'sal-2',
      title: { ar: 'حوافز فبراير', en: 'February incentives' },
      subtitle: { ar: 'المحتوى والدعم', en: 'Content and support' },
      owner: '6 موظفين',
      amount: 'AED 2,300',
      status: { ar: 'تم التحويل', en: 'Transferred' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-08',
    },
    {
      id: 'sal-3',
      title: { ar: 'تسوية بدل إضافي', en: 'Allowance settlement' },
      subtitle: { ar: 'معلمون متعاقدون', en: 'Contract teachers' },
      owner: '4 ملفات',
      amount: 'AED 920',
      status: { ar: 'قيد المراجعة', en: 'Under review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-06',
    },
  ],
  payslips: [
    {
      id: 'ps-1',
      title: { ar: 'قسائم مارس', en: 'March payslips' },
      subtitle: { ar: 'فريق المعلمين', en: 'Teaching team' },
      owner: '11 ملف PDF',
      amount: 'جاهزة',
      status: { ar: 'مرسلة', en: 'Sent' },
      statusClassName: 'bg-[#edfdf3] text-[#15803d]',
      updatedAt: '2026-03-10',
    },
    {
      id: 'ps-2',
      title: { ar: 'قسائم فبراير', en: 'February payslips' },
      subtitle: { ar: 'الدعم والإدارة', en: 'Support and admin' },
      owner: '5 ملفات PDF',
      amount: 'جاهزة',
      status: { ar: 'أرشيف', en: 'Archived' },
      statusClassName: 'bg-[#eef2ff] text-[#4338ca]',
      updatedAt: '2026-03-08',
    },
    {
      id: 'ps-3',
      title: { ar: 'قسائم بدل إضافي', en: 'Allowance slips' },
      subtitle: { ar: 'دفعة خاصة', en: 'Special batch' },
      owner: '4 ملفات PDF',
      amount: 'بانتظار المراجعة',
      status: { ar: 'قيد المراجعة', en: 'Under review' },
      statusClassName: 'bg-[#fff7ed] text-[#c2410c]',
      updatedAt: '2026-03-06',
    },
  ],
};

export default function ReferenceFinanceWorkspace({ scope }: { scope: FinanceScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = financeMeta[scope];
  const rows = financeRowsByScope[scope];
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'attention'>('all');
  const [notice, setNotice] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        !normalizedQuery ||
        [row.title.ar, row.title.en, row.subtitle.ar, row.subtitle.en, row.owner]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesTab =
        tab === 'all' ||
        (tab === 'active' &&
          (row.status.en === 'Active' ||
            row.status.en === 'Enabled' ||
            row.status.en === 'Confirmed' ||
            row.status.en === 'Paid' ||
            row.status.en === 'Sent' ||
            row.status.en === 'Transferred' ||
            row.status.en === 'Approved')) ||
        (tab === 'attention' &&
          !(
            row.status.en === 'Active' ||
            row.status.en === 'Enabled' ||
            row.status.en === 'Confirmed' ||
            row.status.en === 'Paid' ||
            row.status.en === 'Sent' ||
            row.status.en === 'Transferred' ||
            row.status.en === 'Approved'
          ));

      return matchesQuery && matchesTab;
    });
  }, [query, rows, tab]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2500);
  };

  const summaryCards = [
    [isArabic ? 'إجمالي السجلات' : 'Total records', rows.length, meta.cardTone],
    [
      isArabic ? 'الحالات النشطة' : 'Active states',
      rows.filter((row) => row.status.en === 'Active' || row.status.en === 'Enabled' || row.status.en === 'Confirmed').length,
      'bg-[#edfdf3] text-[#15803d]',
    ],
    [
      isArabic ? 'تحتاج متابعة' : 'Needs follow-up',
      rows.filter((row) => row.status.en !== 'Active' && row.status.en !== 'Enabled' && row.status.en !== 'Confirmed').length,
      'bg-[#fff7ed] text-[#c2410c]',
    ],
    [isArabic ? 'أحدث تحديث' : 'Latest update', rows[0]?.updatedAt || '-', 'bg-[#eef2ff] text-[#4338ca]'],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, value, tone]) => (
          <article key={String(label)} className={`rounded-[1.75rem] p-5 shadow-sm ${tone}`}>
            <p className="text-sm font-semibold">{label}</p>
            <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`rounded-2xl p-3 ${meta.cardTone}`}>
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
              onClick={() =>
                showNotice(isArabic ? 'تم تجهيز ملف التصدير.' : 'Export file prepared.')
              }
            >
              {isArabic ? 'تصدير' : 'Export'}
            </Button>
            <Button
              type="button"
              className="rounded-full bg-[#4f7cff] hover:bg-[#416ce4]"
              onClick={() =>
                showNotice(
                  isArabic
                    ? `تم فتح نموذج ${meta.createLabel.ar}.`
                    : `${meta.createLabel.en} form opened.`,
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
              placeholder={isArabic ? 'ابحث بالاسم أو الوصف أو المالك' : 'Search by name, description, or owner'}
              className="h-12 rounded-2xl border-slate-200 bg-white pe-11"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ['all', isArabic ? 'الكل' : 'All'],
              ['active', isArabic ? 'نشط' : 'Active'],
              ['attention', isArabic ? 'متابعة' : 'Attention'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value as 'all' | 'active' | 'attention')}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  tab === value ? 'bg-slate-950 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[1.6rem] border border-slate-200">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3">{isArabic ? 'العنصر' : 'Record'}</th>
                <th className="px-4 py-3">{isArabic ? 'المالك / المصدر' : 'Owner / source'}</th>
                <th className="px-4 py-3">{isArabic ? 'القيمة' : 'Amount'}</th>
                <th className="px-4 py-3">{isArabic ? 'الحالة' : 'Status'}</th>
                <th className="px-4 py-3">{isArabic ? 'آخر تحديث' : 'Updated'}</th>
                <th className="px-4 py-3">{isArabic ? 'إجراء' : 'Action'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-200">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{row.title[isArabic ? 'ar' : 'en']}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.subtitle[isArabic ? 'ar' : 'en']}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{row.owner}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.amount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${row.statusClassName}`}>
                      {row.status[isArabic ? 'ar' : 'en']}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{row.updatedAt}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full border-slate-300"
                      onClick={() =>
                        showNotice(
                          isArabic
                            ? `تم فتح تفاصيل ${row.title.ar}.`
                            : `${row.title.en} details opened.`,
                        )
                      }
                    >
                      {isArabic ? 'عرض' : 'View'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
