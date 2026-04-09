import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <FileQuestion className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">الصفحة غير موجودة</h2>
        <p className="mb-6 text-sm text-slate-500">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <Link
          href="/ar/dashboard"
          className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </div>
  );
}
