'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneField } from '@/components/auth/PhoneField';
import { withLocalePrefix } from '@/lib/locale-path';

type AuthTab = 'login' | 'join';

interface ReferenceAuthCardProps {
  defaultTab?: AuthTab;
}

export default function ReferenceAuthCard({
  defaultTab = 'login',
}: ReferenceAuthCardProps) {
  const router = useRouter();
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  const [activeTab, setActiveTab] = useState<AuthTab>(defaultTab);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [loginCountryCode, setLoginCountryCode] = useState('962');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');

  const [joinCountryCode, setJoinCountryCode] = useState('962');
  const [joinFullName, setJoinFullName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinConfirmPassword, setJoinConfirmPassword] = useState('');
  const [joinConsent, setJoinConsent] = useState(false);

  const copy = {
    badge: isArabic ? 'نظام إدارة المدرسة' : 'School Management System',
    title: isArabic ? 'أهلاً بك في Future-style Portal' : 'Welcome to the Future-style Portal',
    subtitle: isArabic
      ? 'تسجيل دخول موحّد برقم الهاتف مع تجربة عربية كاملة وشريط تنقل عام مماثل للمرجع.'
      : 'Unified phone-based auth with bilingual public navigation and reference-style account entry.',
    loginTab: isArabic ? 'تسجيل الدخول' : 'Login',
    joinTab: isArabic ? 'انضم الآن' : 'Join now',
    loginTitle: isArabic ? 'ادخل إلى لوحة التحكم' : 'Access your dashboard',
    joinTitle: isArabic ? 'أنشئ حساب ولي أمر' : 'Create a parent account',
    name: isArabic ? 'الاسم الكامل' : 'Full name',
    email: isArabic ? 'البريد الإلكتروني' : 'Email address',
    phone: isArabic ? 'رقم الجوال' : 'Mobile number',
    password: isArabic ? 'كلمة المرور' : 'Password',
    confirmPassword: isArabic ? 'تأكيد كلمة المرور' : 'Confirm password',
    forgotPassword: isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    consent: isArabic
      ? 'أوافق على إنشاء الحساب واستخدام بياناتي للتواصل والخدمات التعليمية.'
      : 'I agree to create an account and use my details for educational services and contact.',
    loginSubmit: isArabic ? 'تسجيل الدخول' : 'Sign in',
    joinSubmit: isArabic ? 'إنشاء الحساب' : 'Create account',
    loginPending: isArabic ? 'جارٍ التحقق...' : 'Checking credentials...',
    joinPending: isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating your account...',
    joinSuccess: isArabic
      ? 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول بنفس رقم الجوال.'
      : 'Account created successfully. You can now sign in with the same mobile number.',
    invalidCredentials: isArabic ? 'بيانات الدخول غير صحيحة.' : 'Invalid sign-in details.',
    passwordMismatch: isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
    fillRequired: isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة.' : 'Please complete all required fields.',
    consentRequired: isArabic ? 'يجب الموافقة للمتابعة.' : 'You must accept the consent notice.',
    emailLabel: isArabic ? 'البريد الإلكتروني' : 'Email address',
    usePhone: isArabic ? 'الدخول برقم الجوال' : 'Sign in with phone',
    useEmail: isArabic ? 'الدخول بالبريد الإلكتروني' : 'Sign in with email',
    phoneHint: isArabic ? 'نستخدم رقم الجوال للدخول كما في المرجع.' : 'Phone-based sign-in matches the reference flow.',
    featureOne: isArabic ? 'واجهة عامة مبسطة مع تبديل لغة فعلي' : 'Simplified public shell with real locale switching',
    featureTwo: isArabic ? 'نموذج موحّد لتسجيل الدخول والانضمام' : 'Unified login and join experience',
    featureThree: isArabic ? 'جاهز للوحة التحكم العربية وRTL' : 'Ready for Arabic RTL dashboard flows',
  };

  const routeByRole = (role?: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return withLocalePrefix('/dashboard', locale);
      case 'teacher':
        return withLocalePrefix('/teacher/home', locale);
      case 'student':
        return withLocalePrefix('/student/home', locale);
      case 'parent':
        return withLocalePrefix('/parent/home', locale);
      default:
        return withLocalePrefix('/dashboard', locale);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoginPending(true);

    try {
      const credentialPayload = loginMethod === 'email'
        ? { identifier: loginEmail, email: loginEmail, password: loginPassword, redirect: false }
        : { identifier: loginPhone, phone: loginPhone, countryCode: loginCountryCode, password: loginPassword, redirect: false };

      const result = await signIn('credentials', credentialPayload);

      if (result?.error) {
        setError(copy.invalidCredentials);
        return;
      }

      const session = await getSession();
      router.push(routeByRole((session?.user as { role?: string } | undefined)?.role));
      router.refresh();
    } catch {
      setError(copy.invalidCredentials);
    } finally {
      setLoginPending(false);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!joinFullName || !joinEmail || !joinPhone || !joinPassword || !joinConfirmPassword) {
      setError(copy.fillRequired);
      return;
    }

    if (!joinConsent) {
      setError(copy.consentRequired);
      return;
    }

    if (joinPassword !== joinConfirmPassword) {
      setError(copy.passwordMismatch);
      return;
    }

    setRegisterPending(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: joinFullName,
          email: joinEmail,
          phone: joinPhone,
          countryCode: joinCountryCode,
          password: joinPassword,
          consentGiven: joinConsent,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || copy.fillRequired);
      }

      setSuccess(copy.joinSuccess);
      setActiveTab('login');
      setLoginCountryCode(joinCountryCode);
      setLoginPhone(joinPhone);
      setJoinFullName('');
      setJoinEmail('');
      setJoinPhone('');
      setJoinPassword('');
      setJoinConfirmPassword('');
      setJoinConsent(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.fillRequired);
    } finally {
      setRegisterPending(false);
    }
  };

  const passwordToggle = (
    visible: boolean,
    onClick: () => void,
  ) => (
    <button
      type="button"
      onClick={onClick}
      className={`absolute inset-y-0 flex items-center text-slate-400 transition hover:text-slate-700 ${isArabic ? 'left-3' : 'right-3'
        }`}
      aria-label={visible ? (isArabic ? 'إخفاء كلمة المرور' : 'Hide password') : (isArabic ? 'إظهار كلمة المرور' : 'Show password')}
    >
      {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <Card className="overflow-hidden rounded-[2rem] border-slate-200 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.35)]">
      <CardContent className="p-0">
        <div className="grid min-h-[720px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_42%),linear-gradient(135deg,#0a52bd,#0D6EFD_60%,#0b5ed7)] px-8 py-10 text-white sm:px-10 lg:px-12">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  <span>{copy.badge}</span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-black leading-tight sm:text-5xl">
                    {copy.title}
                  </h1>
                  <p className="max-w-lg text-sm leading-7 text-sky-100 sm:text-base">
                    {copy.subtitle}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {[copy.featureOne, copy.featureTwo, copy.featureThree].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <p className="text-sm text-slate-100">{feature}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-black/15 p-4 text-sm text-sky-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/12">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p>{copy.phoneHint}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-8 sm:px-8 lg:px-10">
            <div className="mx-auto flex h-full w-full max-w-md flex-col justify-center">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 tracking-wide">FutureLab</p>
                  <p className="text-xs text-slate-500 font-medium">{copy.badge}</p>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  aria-live="polite"
                  className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
                >
                  {success}
                </div>
              )}

              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value as AuthTab);
                  setError(null);
                  setSuccess(null);
                }}
                className="space-y-6"
              >
                <TabsList className="tabs-pill-active grid w-full grid-cols-2 rounded-2xl bg-white p-1 shadow-sm">
                  <TabsTrigger value="login" className="rounded-xl">
                    {copy.loginTab}
                  </TabsTrigger>
                  <TabsTrigger value="join" className="rounded-xl">
                    {copy.joinTab}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-950">{copy.loginTitle}</h2>
                  </div>

                  {/* Login method toggle */}
                  <div className="flex rounded-xl bg-white p-1 shadow-sm border border-slate-100">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('phone')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        loginMethod === 'phone'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Phone className="h-4 w-4" />
                      {copy.usePhone}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('email')}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
                        loginMethod === 'email'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Mail className="h-4 w-4" />
                      {copy.useEmail}
                    </button>
                  </div>

                  <form className="space-y-4" onSubmit={handleLogin}>
                    {loginMethod === 'phone' ? (
                      <PhoneField
                        countryCode={loginCountryCode}
                        onCountryCodeChange={setLoginCountryCode}
                        onPhoneChange={setLoginPhone}
                        phone={loginPhone}
                        locale={locale}
                        label={copy.phone}
                        disabled={loginPending}
                      />
                    ) : (
                      <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">{copy.emailLabel}</Label>
                        <Input
                          type="email"
                          dir="ltr"
                          value={loginEmail}
                          onChange={(event) => setLoginEmail(event.target.value)}
                          placeholder="email@example.com"
                          className="h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20"
                          disabled={loginPending}
                          required
                        />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700">{copy.password}</Label>
                        <Link
                          href={withLocalePrefix('/forgot-password', locale)}
                          className="text-xs font-medium text-sky-700 transition hover:text-sky-900"
                        >
                          {copy.forgotPassword}
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          type={showLoginPassword ? 'text' : 'password'}
                          value={loginPassword}
                          onChange={(event) => setLoginPassword(event.target.value)}
                          className={`h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20 ${isArabic ? 'ps-10 pe-4' : 'ps-4 pe-10'
                            }`}
                          disabled={loginPending}
                          required
                        />
                        {passwordToggle(showLoginPassword, () => setShowLoginPassword((value) => !value))}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md font-bold text-[15px]"
                      disabled={loginPending}
                    >
                      {loginPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{copy.loginPending}</span>
                        </>
                      ) : (
                        copy.loginSubmit
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="join" className="space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-950">{copy.joinTitle}</h2>
                  </div>

                  <form className="space-y-4" onSubmit={handleRegister}>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">{copy.name}</Label>
                      <Input
                        value={joinFullName}
                        onChange={(event) => setJoinFullName(event.target.value)}
                        className="h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20"
                        disabled={registerPending}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">{copy.email}</Label>
                      <Input
                        type="email"
                        dir="ltr"
                        value={joinEmail}
                        onChange={(event) => setJoinEmail(event.target.value)}
                        className="h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20"
                        disabled={registerPending}
                        required
                      />
                    </div>

                    <PhoneField
                      countryCode={joinCountryCode}
                      onCountryCodeChange={setJoinCountryCode}
                      onPhoneChange={setJoinPhone}
                      phone={joinPhone}
                      locale={locale}
                      label={copy.phone}
                      disabled={registerPending}
                    />

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">{copy.password}</Label>
                      <div className="relative">
                        <Input
                          type={showRegisterPassword ? 'text' : 'password'}
                          value={joinPassword}
                          onChange={(event) => setJoinPassword(event.target.value)}
                          className={`h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20 ${isArabic ? 'ps-10 pe-4' : 'ps-4 pe-10'
                            }`}
                          disabled={registerPending}
                          required
                        />
                        {passwordToggle(showRegisterPassword, () => setShowRegisterPassword((value) => !value))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">{copy.confirmPassword}</Label>
                      <div className="relative">
                        <Input
                          type={showRegisterConfirmPassword ? 'text' : 'password'}
                          value={joinConfirmPassword}
                          onChange={(event) => setJoinConfirmPassword(event.target.value)}
                          className={`h-12 rounded-xl border-slate-200 focus-visible:border-primary focus-visible:ring-primary/20 ${isArabic ? 'ps-10 pe-4' : 'ps-4 pe-10'
                            }`}
                          disabled={registerPending}
                          required
                        />
                        {passwordToggle(showRegisterConfirmPassword, () => setShowRegisterConfirmPassword((value) => !value))}
                      </div>
                    </div>

                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={joinConsent}
                        onChange={(event) => setJoinConsent(event.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300"
                      />
                      <span>{copy.consent}</span>
                    </label>

                    <Button
                      type="submit"
                      className="h-12 w-full rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md font-bold text-[15px]"
                      disabled={registerPending}
                    >
                      {registerPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{copy.joinPending}</span>
                        </>
                      ) : (
                        copy.joinSubmit
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
                <span>{isArabic ? 'واجهة عربية واتجاه RTL' : 'Arabic-ready RTL experience'}</span>
                <span className="inline-flex items-center gap-1">
                  <ArrowRight className={`h-3 w-3 ${isArabic ? 'rotate-180' : ''}`} />
                  {copy.badge}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
