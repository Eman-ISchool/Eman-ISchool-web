'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { Camera, Lock, ShieldAlert, User, UserCheck, Phone, BookOpen, KeyRound, AlertTriangle, ShieldX, Trash2 } from 'lucide-react';

import ReferenceDashboardShell from '@/components/dashboard/ReferenceDashboardShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardProfilePage() {
  const { data: session } = useSession();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const [form, setForm] = useState({
    name: session?.user?.name || 'Fadi',
    email: session?.user?.email || 'fadi@gmail.com',
    dob: '',
    nationality: '',
    phone: '',
    whatsapp: '',
    address: '',
    prevEducation: '',
    bio: '',
  });

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const pageTitle = isArabic ? 'الملف الشخصي' : 'Profile';
  const pageSubtitle = isArabic ? 'إدارة معلوماتك الشخصية وإعدادات الحساب' : 'Manage your personal information and account settings';

  return (
    <ReferenceDashboardShell>
      <div className="p-6 pb-20 md:pb-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight dark:text-white">
                {pageTitle}
              </h1>
              <p className="text-gray-600 mt-2 text-muted-foreground">{pageSubtitle}</p>
            </div>
          </div>

          <Tabs defaultValue="personal" className="w-full" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="relative flex items-center mb-6">
              <div className="overflow-x-auto scrollbar-hide grid w-full grid-cols-3">
                <TabsList className="items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground grid grid-cols-3 w-full">
                  <TabsTrigger value="personal" className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-[...state=active]:bg-white dark:data-[state=active]:bg-slate-900 flex items-center gap-2">
                    <User className="h-4 w-4 shrink-0" />
                    <span className="truncate">{isArabic ? 'المعلومات الشخصية' : 'Personal info'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-[...state=active]:bg-white dark:data-[state=active]:bg-slate-900 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 shrink-0" />
                    <span className="truncate">{isArabic ? 'الأمان' : 'Security'}</span>
                  </TabsTrigger>
                  <TabsTrigger value="danger" className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-[...state=active]:bg-white dark:data-[state=active]:bg-slate-900 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span className="truncate">{isArabic ? 'المنطقة الخطرة' : 'Danger zone'}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="personal" className="mt-2 focus-visible:outline-none text-foreground">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 dark:text-white">
                    <User className="h-5 w-5" />
                    {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isArabic ? 'تحديث معلوماتك الشخصية وتفاصيل الاتصال' : 'Update your personal details and contact info'}
                  </p>
                </div>

                <div className="p-6 pt-0">
                  <form className="space-y-8">
                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800 dark:text-white">
                        <UserCheck className="h-5 w-5" />
                        {isArabic ? 'المعلومات الأساسية' : 'Basic Details'}
                      </h3>

                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <div className="flex flex-col gap-2 relative group col-span-full mb-4">
                          <Label>{isArabic ? 'الصورة الشخصية' : 'Profile picture'}</Label>
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                                <Camera className="h-8 w-8" />
                              </div>
                            </div>
                            <Button type="button" variant="outline" className="rounded-3xl h-12 px-4">
                              {isArabic ? 'تغيير الصورة' : 'Change picture'}
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label>{isArabic ? 'الاسم الكامل' : 'Full name'}</Label>
                          <Input value={form.name} onChange={(e) => updateField('name', e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'البريد الإلكتروني' : 'Email'}</Label>
                          <Input type="email" dir="ltr" value={form.email} onChange={(e) => updateField('email', e.target.value)} className="rtl:text-right" />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'تاريخ الميلاد' : 'Date of birth'}</Label>
                          <Input type="date" value={form.dob} onChange={(e) => updateField('dob', e.target.value)} className="rtl:text-right" />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'الجنسية' : 'Nationality'}</Label>
                          <Input value={form.nationality} onChange={(e) => updateField('nationality', e.target.value)} placeholder={isArabic ? 'الجنسية' : 'Nationality'} />
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800 dark:text-white">
                        <Phone className="h-5 w-5" />
                        {isArabic ? 'معلومات الاتصال' : 'Contact Information'}
                      </h3>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'رقم الهاتف' : 'Phone number'}</Label>
                          <Input dir="ltr" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="0123456789" className="rtl:text-right" />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'رقم الواتساب' : 'WhatsApp number'}</Label>
                          <Input dir="ltr" value={form.whatsapp} onChange={(e) => updateField('whatsapp', e.target.value)} placeholder="0123456789" className="rtl:text-right" />
                        </div>
                        <div className="grid gap-2 md:col-span-2">
                          <Label>{isArabic ? 'العنوان' : 'Address'}</Label>
                          <Input value={form.address} onChange={(e) => updateField('address', e.target.value)} placeholder={isArabic ? 'العنوان السكني' : 'Residential address'} />
                        </div>
                      </div>
                    </div>

                    {/* Education */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 dark:border-gray-800 dark:text-white">
                        <BookOpen className="h-5 w-5" />
                        {isArabic ? 'التعليم والسيرة الذاتية' : 'Education and Bio'}
                      </h3>
                      <div className="grid gap-6">
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'التعليم السابق' : 'Previous education'}</Label>
                          <textarea
                            value={form.prevEducation}
                            onChange={(e) => updateField('prevEducation', e.target.value)}
                            className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            placeholder={isArabic ? 'خلفيتك الأكاديمية' : 'Your academic background'}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>{isArabic ? 'نبذة عنك' : 'Bio'}</Label>
                          <textarea
                            value={form.bio}
                            onChange={(e) => updateField('bio', e.target.value)}
                            className="flex min-h-[120px] w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                            placeholder={isArabic ? 'تحدث قليلاً عن نفسك' : 'Tell us a bit about yourself'}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t dark:border-gray-800">
                      <Button type="button" className="bg-blue-600 text-white rounded-3xl hover:bg-blue-700 h-12 px-6">
                        {isArabic ? 'حفظ التحديثات' : 'Save Updates'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="mt-2 focus-visible:outline-none text-foreground">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-white dark:bg-gray-950 dark:border-gray-800">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 dark:text-white">
                    <Lock className="h-5 w-5" />
                    {isArabic ? 'إعدادات الأمان' : 'Security Settings'}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isArabic ? 'تحديث كلمة المرور وإدارة الحماية الخاصّة بك' : 'Update password and manage your account protection'}
                  </p>
                </div>

                <div className="p-6 pt-0">
                  <form className="space-y-6 max-w-2xl">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label>{isArabic ? 'كلمة المرور الحالية' : 'Current password'}</Label>
                        <Input type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label>{isArabic ? 'كلمة المرور الجديدة' : 'New password'}</Label>
                        <Input type="password" />
                      </div>
                      <div className="grid gap-2">
                        <Label>{isArabic ? 'تأكيد كلمة المرور' : 'Confirm password'}</Label>
                        <Input type="password" />
                      </div>
                    </div>

                    <div className="pt-4 border-t dark:border-gray-800">
                      <Button type="button" className="bg-blue-600 text-white rounded-3xl hover:bg-blue-700 h-12 px-6">
                        {isArabic ? 'تحديث كلمة المرور' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="danger" className="mt-2 focus-visible:outline-none text-foreground">
              <div className="rounded-xl border bg-card text-card-foreground shadow-sm bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-2 text-red-600 dark:text-red-500">
                    <AlertTriangle className="h-5 w-5" />
                    {isArabic ? 'المنطقة الخطرة' : 'Danger Zone'}
                  </h3>
                  <p className="text-sm text-red-800/70 dark:text-red-400/80 mt-2">
                    {isArabic ? 'أفعال حساسة لا يمكن التراجع عنها، يرجى الحذر.' : 'Sensitive actions that cannot be undone, please be careful.'}
                  </p>
                </div>

                <div className="p-6 pt-0">
                  <div className="bg-white/50 dark:bg-black/50 p-6 rounded-xl border border-red-100 dark:border-red-900/50 mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                      <ShieldX className="h-4 w-4 text-red-500" />
                      {isArabic ? 'تسجيل الخروج من كل الأجهزة' : 'Sign out everywhere'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {isArabic ? 'سيتم إخراج حسابك من كافة الجلسات النشطة في الأجهزة المتصلة.' : 'Your account will be signed out from all active sessions on connected devices.'}
                    </p>
                    <Button type="button" variant="outline" className="rounded-3xl border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-500 dark:hover:bg-red-900/50">
                      {isArabic ? 'إنهاء كافة الجلسات' : 'End all sessions'}
                    </Button>
                  </div>

                  <div className="bg-white/50 dark:bg-black/50 p-6 rounded-xl border border-red-100 dark:border-red-900/50">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-2">
                      <Trash2 className="h-4 w-4 text-red-500" />
                      {isArabic ? 'طلب حذف الحساب' : 'Request account closure'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {isArabic ? 'سيتم تقديم طلب للإدارة بحذف الحساب مع إتلاف البيانات التابعة له نهائياً.' : 'A request will be submitted to the administration to delete the account and permanently destroy its data.'}
                    </p>
                    <Button type="button" className="bg-red-600 text-white rounded-3xl hover:bg-red-700">
                      {isArabic ? 'طلب الحذف السريع' : 'Request fast deletion'}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ReferenceDashboardShell>
  );
}
