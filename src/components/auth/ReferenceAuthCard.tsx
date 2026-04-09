'use client';

import { useState } from 'react';
import Link from 'next/link';
import { getSession, signIn } from 'next-auth/react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Download,
  Smartphone,
  X,
  ImageIcon,
  Upload,
} from 'lucide-react';

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
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  const [loginCountryCode, setLoginCountryCode] = useState('971');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [joinCountryCode, setJoinCountryCode] = useState('971');
  const [joinParentCountryCode, setJoinParentCountryCode] = useState('249');
  const [joinFullName, setJoinFullName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinConfirmPassword, setJoinConfirmPassword] = useState('');
  const [joinParentName, setJoinParentName] = useState('');
  const [joinParentPhone, setJoinParentPhone] = useState('');

  const copy = {
    loginTab: isArabic ? 'تسجيل الدخول' : 'Sign in',
    joinTab: isArabic ? 'تسجيل' : 'Register',
    loginTitle: isArabic ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account',
    joinTitle: isArabic ? 'إنشاء حساب جديد' : 'Create new account',
    phoneLabel: isArabic ? 'رقم الهاتف' : 'Phone number',
    passwordLabel: isArabic ? 'أدخل كلمة المرور' : 'Enter your password',
    passwordPlaceholder: isArabic ? 'أدخل كلمة المرور' : 'Enter your password',
    forgotPassword: isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    loginSubmit: isArabic ? 'تسجيل الدخول' : 'Sign in',
    joinSubmit: isArabic ? 'تسجيل' : 'Register',
    nameLabel: isArabic ? 'الاسم' : 'Name',
    namePlaceholder: isArabic ? 'أدخل اسمك' : 'Enter your name',
    emailLabel: isArabic ? 'البريد الإلكتروني' : 'Email',
    emailPlaceholder: isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    parentNameLabel: isArabic ? 'اسم ولي الأمر (اختياري)' : 'Parent name (optional)',
    parentNamePlaceholder: isArabic ? 'أدخل اسم ولي الأمر' : 'Enter parent name',
    parentPhoneLabel: isArabic ? 'رقم هاتف ولي الأمر (اختياري)' : 'Parent phone (optional)',
    createPasswordLabel: isArabic ? 'كلمة المرور' : 'Password',
    createPasswordPlaceholder: isArabic ? 'إنشاء كلمة مرور' : 'Create password',
    confirmPasswordLabel: isArabic ? 'تأكيد كلمة المرور' : 'Confirm password',
    confirmPasswordPlaceholder: isArabic ? 'تأكيد كلمة المرور' : 'Confirm password',
    profilePicture: isArabic ? 'الصورة الشخصية (اختياري)' : 'Profile picture (optional)',
    dragDrop: isArabic ? 'قم بسحب الملف هنا او' : 'Drag and drop an image here, or',
    supportedFormats: isArabic
      ? 'الصيغ المدعومة: jpg, jpeg, png, gif, webp, pdf, mp4, mp3, mov, avi, mkv, ppt (max 300MB)'
      : 'Supported formats: jpg, jpeg, png, gif, webp, pdf, mp4, mp3, mov, avi, mkv, ppt (max 300MB)',
    pwaBannerTitle: isArabic ? 'تثبيت التطبيق' : 'Install App',
    pwaBannerDesc: isArabic
      ? 'احصل على تجربة التطبيق الكاملة مع الوصول دون اتصال وتحميل أسرع'
      : 'Get the full app experience with offline access and faster loading',
    pwaBannerButton: isArabic ? 'تثبيت التطبيق' : 'Install App',
    invalidCredentials: isArabic ? 'بيانات الدخول غير صحيحة.' : 'Invalid sign-in details.',
    passwordMismatch: isArabic ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.',
    fillRequired: isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة.' : 'Please complete all required fields.',
    joinSuccess: isArabic
      ? 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.'
      : 'Account created successfully. You can now sign in.',
    loginPending: isArabic ? 'جارٍ التحقق...' : 'Checking credentials...',
    joinPending: isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating your account...',
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
      const result = await signIn('credentials', {
        identifier: loginPhone,
        phone: loginPhone,
        countryCode: loginCountryCode,
        password: loginPassword,
        redirect: false,
      });

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

    if (!joinFullName || !joinPhone || !joinPassword || !joinConfirmPassword) {
      setError(copy.fillRequired);
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
          parentName: joinParentName,
          parentPhone: joinParentPhone,
          parentCountryCode: joinParentCountryCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || copy.fillRequired);

      setSuccess(copy.joinSuccess);
      setActiveTab('login');
      setLoginCountryCode(joinCountryCode);
      setLoginPhone(joinPhone);
      setJoinFullName('');
      setJoinEmail('');
      setJoinPhone('');
      setJoinPassword('');
      setJoinConfirmPassword('');
      setJoinParentName('');
      setJoinParentPhone('');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.fillRequired);
    } finally {
      setRegisterPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* PWA Install Banner */}
      {showPwaBanner && (
        <div className="relative bg-gray-900 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className={`flex items-center gap-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <Smartphone className="h-8 w-8 text-gray-400 shrink-0" />
              <div className={isArabic ? 'text-right' : ''}>
                <p className="font-semibold text-sm">{copy.pwaBannerTitle}</p>
                <p className="text-xs text-gray-300">{copy.pwaBannerDesc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="flex items-center gap-2 rounded-lg bg-white text-gray-900 px-4 py-2.5 text-sm font-medium hover:bg-gray-100 transition">
                <Download className="h-4 w-4" />
                {copy.pwaBannerButton}
              </button>
              <button
                onClick={() => setShowPwaBanner(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex min-h-[calc(100vh-60px)] ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Image side — matches reference lime-green background with children image */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#c8e649]" />
          {/* Placeholder for the branded children image — replace with actual asset */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/60">
              <ImageIcon className="h-24 w-24 mx-auto mb-4 text-white/30" />
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {error && (
              <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            {/* Tabs */}
            <div className="flex rounded-full bg-gray-100 p-1 mb-8">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setError(null); setSuccess(null); }}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
                  activeTab === 'login'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {copy.loginTab}
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('join'); setError(null); setSuccess(null); }}
                className={`flex-1 rounded-full py-2.5 text-sm font-medium transition ${
                  activeTab === 'join'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {copy.joinTab}
              </button>
            </div>

            {/* LOGIN TAB */}
            {activeTab === 'login' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-8">{copy.loginTitle}</h1>
                <form className="space-y-5" onSubmit={handleLogin}>
                  <PhoneField
                    countryCode={loginCountryCode}
                    onCountryCodeChange={setLoginCountryCode}
                    onPhoneChange={setLoginPhone}
                    phone={loginPhone}
                    locale={locale}
                    label={copy.phoneLabel}
                    disabled={loginPending}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.passwordLabel}</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 flex items-center ${isArabic ? 'right-3' : 'left-3'}`}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder={copy.passwordPlaceholder}
                        className={`w-full h-12 rounded-xl border border-gray-200 bg-white text-sm outline-none transition focus:border-gray-400 ${
                          isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'
                        }`}
                        disabled={loginPending}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className={`absolute inset-y-0 flex items-center ${isArabic ? 'left-3' : 'right-3'}`}
                      >
                        {showLoginPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginPending}
                    className="w-full h-12 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loginPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {copy.loginPending}
                      </>
                    ) : (
                      copy.loginSubmit
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href={withLocalePrefix('/forgot-password', locale)}
                      className="text-sm text-gray-500 hover:text-gray-700 transition"
                    >
                      {copy.forgotPassword}
                    </Link>
                  </div>
                </form>
              </>
            )}

            {/* REGISTER TAB */}
            {activeTab === 'join' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{copy.joinTitle}</h1>
                <form className="space-y-4" onSubmit={handleRegister}>
                  {/* Profile picture upload */}
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                    <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">{copy.dragDrop}</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Upload className="h-4 w-4" />
                      {copy.profilePicture}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">{copy.supportedFormats}</p>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.nameLabel}</label>
                    <input
                      type="text"
                      value={joinFullName}
                      onChange={(e) => setJoinFullName(e.target.value)}
                      placeholder={copy.namePlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <PhoneField
                    countryCode={joinCountryCode}
                    onCountryCodeChange={setJoinCountryCode}
                    onPhoneChange={setJoinPhone}
                    phone={joinPhone}
                    locale={locale}
                    label={copy.phoneLabel}
                    disabled={registerPending}
                  />

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.emailLabel}</label>
                    <input
                      type="email"
                      dir="ltr"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                      placeholder={copy.emailPlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Parent name (optional) */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.parentNameLabel}</label>
                    <input
                      type="text"
                      value={joinParentName}
                      onChange={(e) => setJoinParentName(e.target.value)}
                      placeholder={copy.parentNamePlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Parent phone (optional) */}
                  <PhoneField
                    countryCode={joinParentCountryCode}
                    onCountryCodeChange={setJoinParentCountryCode}
                    onPhoneChange={setJoinParentPhone}
                    phone={joinParentPhone}
                    locale={locale}
                    label={copy.parentPhoneLabel}
                    disabled={registerPending}
                    required={false}
                  />

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.createPasswordLabel}</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 flex items-center ${isArabic ? 'right-3' : 'left-3'}`}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={joinPassword}
                        onChange={(e) => setJoinPassword(e.target.value)}
                        placeholder={copy.createPasswordPlaceholder}
                        className={`w-full h-12 rounded-xl border border-gray-200 bg-white text-sm outline-none transition focus:border-gray-400 ${
                          isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'
                        }`}
                        disabled={registerPending}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className={`absolute inset-y-0 flex items-center ${isArabic ? 'left-3' : 'right-3'}`}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.confirmPasswordLabel}</label>
                    <div className="relative">
                      <div className={`absolute inset-y-0 flex items-center ${isArabic ? 'right-3' : 'left-3'}`}>
                        <Lock className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type={showRegisterConfirmPassword ? 'text' : 'password'}
                        value={joinConfirmPassword}
                        onChange={(e) => setJoinConfirmPassword(e.target.value)}
                        placeholder={copy.confirmPasswordPlaceholder}
                        className={`w-full h-12 rounded-xl border border-gray-200 bg-white text-sm outline-none transition focus:border-gray-400 ${
                          isArabic ? 'pr-10 pl-10' : 'pl-10 pr-10'
                        }`}
                        disabled={registerPending}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
                        className={`absolute inset-y-0 flex items-center ${isArabic ? 'left-3' : 'right-3'}`}
                      >
                        {showRegisterConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerPending}
                    className="w-full h-12 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {registerPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {copy.joinPending}
                      </>
                    ) : (
                      copy.joinSubmit
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
