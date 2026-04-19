interface KpiProps {
  title: string;
  value: string;
  tone: 'indigo' | 'emerald' | 'amber' | 'rose';
}

const TONE_BG: Record<KpiProps['tone'], string> = {
  indigo: 'bg-indigo-50',
  emerald: 'bg-emerald-50',
  amber: 'bg-amber-50',
  rose: 'bg-rose-50',
};

function KpiCard({ title, value, tone }: KpiProps) {
  return (
    <div className={`rounded-2xl ${TONE_BG[tone]} p-5`}>
      <div className="text-sm text-slate-600">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function ParentHome({ locale }: { locale: string }) {
  const ar = locale === 'ar';
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard title={ar ? 'أبنائي' : 'My children'} value="—" tone="indigo" />
        <KpiCard title={ar ? 'المدفوعات الأخيرة' : 'Recent payments'} value="—" tone="emerald" />
        <KpiCard title={ar ? 'الحضور' : 'Attendance'} value="—" tone="amber" />
        <KpiCard title={ar ? 'الرسائل' : 'Messages'} value="—" tone="rose" />
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {ar ? 'متابعة الأبناء' : 'Children overview'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {ar ? 'ستظهر هنا حالة كل ابن وآخر التحديثات.' : 'Each child\u2019s status and latest updates will appear here.'}
        </p>
      </section>
    </div>
  );
}
