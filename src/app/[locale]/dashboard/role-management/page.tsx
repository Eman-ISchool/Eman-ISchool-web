'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  BookOpen,
  Users,
  CreditCard,
  MessageSquare,
  FilePen,
  ChartNoAxesColumn,
  Database,
  Loader2,
  Save,
  CheckCircle,
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';

interface SectionPermission {
  section_key: string;
  section_label: string;
  is_allowed: boolean;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  academic: <BookOpen className="h-5 w-5" />,
  admin: <Users className="h-5 w-5" />,
  finance: <CreditCard className="h-5 w-5" />,
  communication: <MessageSquare className="h-5 w-5" />,
  content: <FilePen className="h-5 w-5" />,
  analytics: <ChartNoAxesColumn className="h-5 w-5" />,
  data: <Database className="h-5 w-5" />,
};

const SECTION_DESCRIPTIONS: Record<string, string> = {
  academic: 'المواد الدراسية، الفئات، الفصول، الامتحانات، الاختبارات',
  admin: 'المستخدمون، القبول والتسجيل، الطلبات، البيانات المرجعية',
  finance: 'المدفوعات، المصروفات، الكوبونات، البنوك، العملات، الرواتب',
  communication: 'الرسائل، الإعلانات',
  content: 'إدارة المحتوى، الترجمات',
  analytics: 'التقارير',
  data: 'النسخ الاحتياطي',
};

export default function RoleManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sections, setSections] = useState<SectionPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const userRole = ((session?.user as any)?.role || '').toLowerCase();

  useEffect(() => {
    if (status === 'authenticated' && userRole !== 'admin') {
      router.replace('/dashboard');
      return;
    }
    fetch('/api/admin/supervisor-permissions')
      .then(res => res.json())
      .then(data => {
        if (data.sections) setSections(data.sections);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status, userRole, router]);

  const toggleSection = (key: string) => {
    setSections(prev =>
      prev.map(s =>
        s.section_key === key ? { ...s, is_allowed: !s.is_allowed } : s
      )
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/admin/supervisor-permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sections: sections.map(s => ({
            section_key: s.section_key,
            is_allowed: s.is_allowed,
          })),
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (userRole !== 'admin') return null;

  const allowedCount = sections.filter(s => s.is_allowed).length;

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة صلاحيات المشرف</h1>
            </div>
            <p className="text-gray-500 text-sm mt-2">
              تحكم في الأقسام التي يمكن للمشرف الوصول إليها في لوحة التحكم.
              المشرف يرى فقط الأقسام المفعّلة أدناه.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
            <p className="text-sm text-blue-600 font-medium">الأقسام المفعّلة</p>
            <p className="text-3xl font-bold text-blue-700 mt-1">{allowedCount}</p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-sm text-gray-500 font-medium">إجمالي الأقسام</p>
            <p className="text-3xl font-bold text-gray-700 mt-1">{sections.length}</p>
          </div>
        </div>

        {/* Sections Grid */}
        <div className="space-y-3">
          {sections.map(section => (
            <div
              key={section.section_key}
              className={`flex items-center justify-between rounded-2xl border p-5 transition-all cursor-pointer ${
                section.is_allowed
                  ? 'border-blue-200 bg-blue-50/50 shadow-sm'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
              onClick={() => toggleSection(section.section_key)}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  section.is_allowed ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {SECTION_ICONS[section.section_key] || <Database className="h-5 w-5" />}
                </div>
                <div>
                  <p className={`font-semibold ${section.is_allowed ? 'text-gray-900' : 'text-gray-600'}`}>
                    {section.section_label}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {SECTION_DESCRIPTIONS[section.section_key] || ''}
                  </p>
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSection(section.section_key); }}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  section.is_allowed ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    section.is_allowed ? 'translate-x-6 rtl:-translate-x-6' : 'translate-x-1 rtl:-translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'جاري الحفظ...' : 'حفظ الصلاحيات'}
          </button>

          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium animate-in fade-in">
              <CheckCircle className="h-4 w-4" />
              تم الحفظ بنجاح
            </span>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
