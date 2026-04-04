'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Banknote, Construction, CreditCard, Landmark, ReceiptText, Search, TicketPercent, Wallet } from 'lucide-react';
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

/** Scopes that have no backend API yet */
const UNIMPLEMENTED_SCOPES: FinanceScope[] = ['banks', 'expenses', 'coupons', 'salaries', 'payslips'];

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

const financeApiByScope: Record<FinanceScope, string | null> = {
  fees: '/api/invoices',
  payments: '/api/invoices',
  banks: null,
  currencies: '/api/currencies',
  expenses: null,
  coupons: null,
  salaries: null,
  payslips: null,
};

function mapApiToFinanceRow(item: Record<string, unknown>, scope: FinanceScope): FinanceRow {
  const id = String(item.id || '');
  const titleAr = String(item.name_ar || item.name || item.title || item.description || '');
  const titleEn = String(item.name_en || item.name || item.title || item.description || '');
  const subtitleAr = String(item.type || item.category || item.code || '');
  const subtitleEn = String(item.type || item.category || item.code || '');
  const owner = String(item.student_name || item.user_name || item.owner || '-');
  const amount = item.amount ? `AED ${item.amount}` : item.rate ? String(item.rate) : '-';
  const isPaid = item.status === 'paid' || item.status === 'active' || item.status === 'confirmed' || item.is_active === true;
  const updatedAt = String(item.updated_at || item.created_at || '-').split('T')[0];

  const statusMap: Record<string, { label: { ar: string; en: string }; className: string }> = {
    paid: { label: { ar: 'مدفوع', en: 'Paid' }, className: 'bg-[#edfdf3] text-[#15803d]' },
    active: { label: { ar: 'نشط', en: 'Active' }, className: 'bg-[#edfdf3] text-[#15803d]' },
    confirmed: { label: { ar: 'مؤكد', en: 'Confirmed' }, className: 'bg-[#edfdf3] text-[#15803d]' },
    pending: { label: { ar: 'قيد التحصيل', en: 'Collecting' }, className: 'bg-[#fff7ed] text-[#c2410c]' },
    overdue: { label: { ar: 'متأخر', en: 'Overdue' }, className: 'bg-[#fff1f2] text-[#e11d48]' },
  };

  const statusKey = String(item.status || (isPaid ? 'active' : 'pending'));
  const mapped = statusMap[statusKey] || (isPaid
    ? { label: { ar: 'نشط', en: 'Active' }, className: 'bg-[#edfdf3] text-[#15803d]' }
    : { label: { ar: 'قيد المراجعة', en: 'Under review' }, className: 'bg-[#fff7ed] text-[#c2410c]' });

  return {
    id,
    title: { ar: titleAr, en: titleEn },
    subtitle: { ar: subtitleAr, en: subtitleEn },
    owner,
    amount: String(amount),
    status: mapped.label,
    statusClassName: mapped.className,
    updatedAt,
  };
}

export default function ReferenceFinanceWorkspace({ scope }: { scope: FinanceScope }) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const meta = financeMeta[scope];
  const isUnimplemented = UNIMPLEMENTED_SCOPES.includes(scope);
  const [rows, setRows] = useState<FinanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'all' | 'active' | 'attention'>('all');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const endpoint = financeApiByScope[scope];
    if (!endpoint) {
      setRows([]);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);

    // FIX 2: For payments scope, only fetch paid/confirmed invoices
    const url = scope === 'payments' ? `${endpoint}?status=paid` : endpoint;

    fetch(url)
      .then((res) => {
        if (!res.ok) {
          return res.json().then((body) => {
            throw new Error(body?.error || `${res.status} ${res.statusText}`);
          }).catch((parseErr) => {
            if (parseErr instanceof Error && parseErr.message !== `${res.status} ${res.statusText}`) {
              throw parseErr;
            }
            throw new Error(`${res.status} ${res.statusText}`);
          });
        }
        return res.json();
      })
      .then((data) => {
        const items = Array.isArray(data) ? data : data?.invoices || data?.currencies || [];
        // FIX 2: Additional client-side filter for payments (in case API doesn't filter by payment_status)
        const filtered = scope === 'payments'
          ? items.filter((item: Record<string, unknown>) =>
              item.status === 'paid' || item.status === 'confirmed' || item.payment_status === 'paid' || item.payment_status === 'confirmed')
          : items;
        setRows(filtered.map((item: Record<string, unknown>) => mapApiToFinanceRow(item, scope)));
      })
      .catch((err: Error) => {
        setRows([]);
        setError(err.message || (isArabic ? 'حدث خطأ أثناء تحميل البيانات' : 'An error occurred while loading data'));
      })
      .finally(() => setLoading(false));
  }, [scope, isArabic]);

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
            <Search className="pointer-events-none absolute end-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="mx-auto h-6 w-48 animate-pulse rounded bg-slate-100" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                      <p className="text-sm font-semibold text-red-600">
                        {isArabic ? 'حدث خطأ' : 'An error occurred'}
                      </p>
                      <p className="text-xs text-red-500">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : isUnimplemented ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                      <Construction className="h-10 w-10 text-amber-400" />
                      <p className="text-base font-bold text-slate-700">
                        {isArabic ? 'هذا القسم قيد التطوير' : 'This section is under development'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {isArabic
                          ? 'لا توجد بيانات حالياً. سيتم إضافة هذه الميزة قريباً'
                          : 'No data currently available. This feature will be added soon'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                    {isArabic ? 'لا توجد بيانات حالياً.' : 'No data available.'}
                  </td>
                </tr>
              ) : null}
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
