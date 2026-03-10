'use client';

import { useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CreditCard,
  Globe,
  HardDrive,
  Mail,
  Palette,
  Settings,
  Share2,
  Shield,
  TrendingUp,
  X,
} from 'lucide-react';
import { useLocale } from 'next-intl';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SettingsTab {
  id: string;
  label: string;
  icon: typeof Globe;
}

function SettingRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
      <div className="space-y-0.5">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground text-slate-500">{value}</p>
      </div>
      <Button type="button" variant="outline" className="font-semibold px-4 py-2">
        {action}
      </Button>
    </div>
  );
}

function AssetPreview({ label, src }: { label: string; src: string }) {
  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      <div className="relative inline-block border rounded-xl bg-slate-50 dark:bg-slate-900 border-dashed border-slate-300 dark:border-slate-700 p-2">
        <img alt="Preview" className="h-24 w-24 rounded-lg object-contain bg-white dark:bg-black p-1" src={src} />
        <button
          type="button"
          className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default function DashboardSystemSettingsPage() {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const tabs = useMemo<SettingsTab[]>(
    () => [
      { id: 'general', label: isArabic ? 'عام' : 'General', icon: Globe },
      { id: 'appearance', label: isArabic ? 'المظهر' : 'Appearance', icon: Palette },
      { id: 'notifications', label: isArabic ? 'الإشعارات' : 'Notifications', icon: Bell },
      { id: 'security', label: isArabic ? 'الأمان' : 'Security', icon: Shield },
      { id: 'payment', label: isArabic ? 'الدفع' : 'Payment', icon: CreditCard },
      { id: 'email', label: isArabic ? 'البريد الإلكتروني' : 'Email', icon: Mail },
      { id: 'system', label: isArabic ? 'النظام' : 'System', icon: Settings },
      { id: 'calendar', label: isArabic ? 'تقويم جوجل' : 'Google Calendar', icon: CalendarDays },
      { id: 'drive', label: isArabic ? 'جوجل درايف' : 'Google Drive', icon: HardDrive },
      { id: 'social', label: isArabic ? 'وسائل التواصل الاجتماعي' : 'Social media', icon: Share2 },
      { id: 'marketing', label: isArabic ? 'التسويق' : 'Marketing', icon: TrendingUp },
      { id: 'all', label: isArabic ? 'جميع الإعدادات' : 'All settings', icon: Settings },
    ],
    [isArabic],
  );

  const showSaved = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  const pageTitle = isArabic ? 'إعدادات النظام' : 'System Settings';
  const pageSubtitle = isArabic ? 'إدارة إعدادات التطبيق والتكوينات على مستوى النظام.' : 'Manage app configuration and system-wide settings.';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
            <p className="text-muted-foreground mt-2">{pageSubtitle}</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex flex-col md:flex-row gap-6 w-full"
            orientation="vertical"
            dir={isArabic ? 'rtl' : 'ltr'}
          >
            <div className="w-full md:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-fit p-1 space-y-1 bg-transparent w-full text-left justify-start rtl:text-right">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-foreground data-[state=active]:shadow-sm hover:translate-x-1 rtl:hover:-translate-x-1"
                  >
                    <tab.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="flex-1 max-w-4xl min-w-0">
              {saved ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 mb-6 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isArabic ? 'تم حفظ الإعدادات بنجاح.' : 'Settings saved successfully.'}
                </div>
              ) : null}

              <TabsContent value="general" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">{isArabic ? 'الإعدادات العامة' : 'General settings'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic
                        ? 'تكوين المعلومات الأساسية للموقع والعلامة التجارية.'
                        : 'Configure the basic site information and brand assets.'}
                    </p>
                  </div>

                  <div className="border border-border bg-card rounded-xl shadow-sm text-card-foreground">
                    <form className="p-6 space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="site-name">{isArabic ? 'اسم الموقع' : 'Site name'}</Label>
                        <Input id="site-name" defaultValue="Future Labs Academy" className="max-w-md" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="site-description">{isArabic ? 'وصف الموقع' : 'Site description'}</Label>
                        <Textarea id="site-description" defaultValue={isArabic ? 'تعليم نحو مستقبل مشرق' : 'Learning for a brighter future'} className="max-w-xl" />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="site-whatsapp">{isArabic ? 'رقم الواتساب' : 'WhatsApp number'}</Label>
                        <Input id="site-whatsapp" dir="ltr" defaultValue="971501588216" className="max-w-md rtl:text-right rtl:placeholder:text-right" />
                      </div>

                      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 pt-4">
                        <AssetPreview label={isArabic ? 'رابط الشعار' : 'Logo'} src="/icons/icon-72x72.svg" />
                        <AssetPreview label={isArabic ? 'رابط الأيقونة المفضلة' : 'Favicon'} src="/favicon.ico" />
                        <AssetPreview label={isArabic ? 'بانر تسجيل الدخول' : 'Login banner'} src="/icons/icon-152x152.svg" />
                      </div>

                      <div className="flex items-center justify-end pt-6 border-t">
                        <Button type="button" className="bg-blue-600 hover:bg-blue-700 text-white rounded-3xl" onClick={showSaved}>
                          {isArabic ? 'حفظ التغييرات' : 'Save changes'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">{isArabic ? 'المظهر' : 'Appearance'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'تخصيص الواجهة وتجربة المستخدم' : 'Customize the interface and user experience'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <SettingRow
                      label={isArabic ? 'نمط السمة' : 'Theme mode'}
                      value={isArabic ? 'الوضع الفاتح هو النمط الافتراضي الحالي.' : 'Light mode is currently the default theme.'}
                      action={isArabic ? 'تحديث' : 'Update'}
                    />
                    <SettingRow
                      label={isArabic ? 'لوحة الألوان' : 'Color palette'}
                      value={isArabic ? 'ألوان البوابة الأساسية مرتبطة بالهوية الحالية.' : 'Primary portal colors follow the current brand identity.'}
                      action={isArabic ? 'تخصيص' : 'Customize'}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">{isArabic ? 'الإشعارات' : 'Notifications'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'تكوين التنبيهات وقنوات التواصل' : 'Configure alerts and communication channels'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <SettingRow
                      label={isArabic ? 'التنبيهات الفورية' : 'Real-time alerts'}
                      value={isArabic ? 'تنبيهات التسجيل والمدفوعات والتقارير مفعلة.' : 'Enrollment, payment, and reporting alerts are enabled.'}
                      action={isArabic ? 'إدارة' : 'Manage'}
                    />
                    <SettingRow
                      label={isArabic ? 'قنوات الإشعارات' : 'Notification channels'}
                      value={isArabic ? 'البريد الإلكتروني، الرسائل، وإشعارات المتصفح.' : 'Email, messages, and browser notifications.'}
                      action={isArabic ? 'تحرير' : 'Edit'}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">{isArabic ? 'الأمان' : 'Security'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? 'إدارة الوصول والحماية' : 'Manage access and protection'}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <SettingRow
                      label={isArabic ? 'سياسات كلمات المرور' : 'Password policies'}
                      value={isArabic ? 'حد أدنى 8 أحرف وتأكيد دوري للتحديث.' : 'Minimum 8 characters with periodic refresh checks.'}
                      action={isArabic ? 'تحديث' : 'Update'}
                    />
                    <SettingRow
                      label={isArabic ? 'الوصول الإداري' : 'Admin access'}
                      value={isArabic ? 'يتم تسجيل النشاطات الحساسة ومراجعتها.' : 'Sensitive admin actions are logged and reviewed.'}
                      action={isArabic ? 'عرض' : 'View'}
                    />
                  </div>
                </div>
              </TabsContent>

              {['payment', 'email', 'system', 'calendar', 'drive', 'social', 'marketing', 'all'].map((tabId) => (
                <TabsContent key={tabId} value={tabId} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium">{tabs.find(t => t.id === tabId)?.label}</h3>
                    </div>
                    <SettingRow
                      label={tabs.find((tab) => tab.id === tabId)?.label || ''}
                      value={
                        isArabic
                          ? 'هذا القسم يتبع بنية المرجع مع مساحات مخصصة للإعدادات الفرعية'
                          : 'This section follows the reference layout with room for nested settings'
                      }
                      action={isArabic ? 'توسيع' : 'Expand'}
                    />
                  </div>
                </TabsContent>
              ))}

            </div>
          </Tabs>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
