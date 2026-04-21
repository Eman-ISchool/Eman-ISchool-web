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
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPwaBanner, setShowPwaBanner] = useState(true);

  // Login state
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  const [loginCountryCode, setLoginCountryCode] = useState('971');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register state — matches dashboard/users create form
  const [joinCountryCode, setJoinCountryCode] = useState('971');
  const [joinGuardianCountryCode, setJoinGuardianCountryCode] = useState('971');
  const [joinFullName, setJoinFullName] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinRole, setJoinRole] = useState('student');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinBaseSalary, setJoinBaseSalary] = useState('');
  const [joinPricePerLesson, setJoinPricePerLesson] = useState('');
  const [joinBankName, setJoinBankName] = useState('');
  const [joinBankAccount, setJoinBankAccount] = useState('');
  const [joinAddress, setJoinAddress] = useState('');
  const [joinBirthDate, setJoinBirthDate] = useState('');
  const [joinPreviousEducation, setJoinPreviousEducation] = useState('');
  const [joinGuardianName, setJoinGuardianName] = useState('');
  const [joinGuardianEmail, setJoinGuardianEmail] = useState('');
  const [joinGuardianPhone, setJoinGuardianPhone] = useState('');
  const [joinImagePreview, setJoinImagePreview] = useState<string | null>(null);
  const [joinImage, setJoinImage] = useState<string | null>(null);

  const copy = {
    loginTab: isArabic ? 'تسجيل الدخول' : 'Sign in',
    joinTab: isArabic ? 'تسجيل' : 'Register',
    loginTitle: isArabic ? 'تسجيل الدخول إلى حسابك' : 'Sign in to your account',
    joinTitle: isArabic ? 'إنشاء حساب جديد' : 'Create new account',
    phoneLabel: isArabic ? 'رقم الهاتف' : 'Phone number',
    emailLoginLabel: isArabic ? 'البريد الإلكتروني' : 'Email',
    emailLoginPlaceholder: isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
    switchToEmail: isArabic ? 'الدخول بالبريد الإلكتروني' : 'Sign in with email',
    switchToPhone: isArabic ? 'الدخول برقم الهاتف' : 'Sign in with phone',
    passwordLabel: isArabic ? 'أدخل كلمة المرور' : 'Enter your password',
    passwordPlaceholder: isArabic ? 'أدخل كلمة المرور' : 'Enter your password',
    forgotPassword: isArabic ? 'نسيت كلمة المرور؟' : 'Forgot password?',
    loginSubmit: isArabic ? 'تسجيل الدخول' : 'Sign in',
    joinSubmit: isArabic ? 'تسجيل' : 'Register',
    nameLabel: isArabic ? 'الاسم الكامل' : 'Full Name',
    namePlaceholder: isArabic ? 'الاسم' : 'Name',
    emailLabel: isArabic ? 'عنوان البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: isArabic ? 'البريد الالكتروني' : 'Email',
    createPasswordLabel: isArabic ? 'كلمة المرور' : 'Password',
    createPasswordPlaceholder: isArabic ? 'كلمة المرور' : 'Password',
    roleLabel: isArabic ? 'الدور' : 'Role',
    roleStudent: isArabic ? 'طالب' : 'Student',
    roleTeacher: isArabic ? 'معلم' : 'Teacher',
    roleParent: isArabic ? 'ولي أمر' : 'Parent',
    baseSalaryLabel: isArabic ? 'الراتب الأساسي' : 'Base Salary',
    baseSalaryPlaceholder: isArabic ? 'الراتب الأساسي' : 'Base salary',
    pricePerLessonLabel: isArabic ? 'السعر لكل درس' : 'Price per Lesson',
    pricePerLessonPlaceholder: isArabic ? 'السعر لكل درس' : 'Price per lesson',
    bankNameLabel: isArabic ? 'اسم البنك' : 'Bank Name',
    bankNamePlaceholder: isArabic ? 'اسم البنك' : 'Bank name',
    bankAccountLabel: isArabic ? 'رقم الحساب البنكي' : 'Bank Account Number',
    bankAccountPlaceholder: isArabic ? 'رقم الحساب البنكي' : 'Bank account number',
    addressLabel: isArabic ? 'العنوان' : 'Address',
    addressPlaceholder: isArabic ? 'العنوان' : 'Address',
    profilePicture: isArabic ? 'الصورة الشخصية' : 'Profile Photo',
    dragDrop: isArabic ? 'اسحب وأفلت صورة هنا، أو' : 'Drag and drop an image here, or',
    uploadImage: isArabic ? 'رفع صورة' : 'Upload Image',
    imageUploaded: isArabic ? 'تم تحميل الصورة' : 'Image uploaded',
    supportedFormats: isArabic
      ? 'الصيغ المدعومة: jpg, jpeg, png, gif, webp (الحد الأقصى 2 ميغابايت)'
      : 'Supported formats: jpg, jpeg, png, gif, webp (max 2MB)',
    birthDateLabel: isArabic ? 'تاريخ الميلاد' : 'Date of Birth',
    previousEducationLabel: isArabic ? 'التعليم السابق' : 'Previous Education',
    previousEducationPlaceholder: isArabic ? 'التعليم السابق' : 'Previous education',
    guardianNameLabel: isArabic ? 'اسم ولي الأمر' : 'Guardian Name',
    guardianNamePlaceholder: isArabic ? 'ولي الامر' : 'Guardian name',
    guardianEmailLabel: isArabic ? 'بريد ولي الأمر' : 'Guardian Email',
    guardianEmailPlaceholder: isArabic ? 'بريد ولي الأمر' : 'Guardian email',
    guardianPhoneLabel: isArabic ? 'هاتف ولي الأمر' : 'Guardian Phone',
    pwaBannerTitle: isArabic ? 'تثبيت التطبيق' : 'Install App',
    pwaBannerDesc: isArabic
      ? 'احصل على تجربة التطبيق الكاملة مع الوصول دون اتصال وتحميل أسرع'
      : 'Get the full app experience with offline access and faster loading',
    pwaBannerButton: isArabic ? 'تثبيت التطبيق' : 'Install App',
    invalidCredentials: isArabic ? 'بيانات الدخول غير صحيحة.' : 'Invalid sign-in details.',
    fillRequired: isArabic ? 'يرجى تعبئة جميع الحقول المطلوبة.' : 'Please complete all required fields.',
    joinSuccess: isArabic
      ? 'تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.'
      : 'Account created successfully. You can now sign in.',
    loginPending: isArabic ? 'جارٍ التحقق...' : 'Checking credentials...',
    joinPending: isArabic ? 'جارٍ إنشاء الحساب...' : 'Creating your account...',
  };

  const routeByRole = (_role?: string | null) => {
    return withLocalePrefix('/dashboard', locale);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoginPending(true);

    try {
      const credentialsPayload =
        loginMode === 'email'
          ? {
              identifier: loginEmail.trim().toLowerCase(),
              email: loginEmail.trim().toLowerCase(),
              password: loginPassword,
              redirect: false as const,
            }
          : {
              identifier: loginPhone,
              phone: loginPhone,
              countryCode: loginCountryCode,
              password: loginPassword,
              redirect: false as const,
            };

      const result = await signIn('credentials', credentialsPayload);

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

    if (!joinFullName || !joinEmail || !joinPassword) {
      setError(copy.fillRequired);
      return;
    }

    setRegisterPending(true);

    try {
      const phoneWithCode = joinPhone ? `+${joinCountryCode}${joinPhone}` : '';
      const guardianPhoneWithCode = joinGuardianPhone ? `+${joinGuardianCountryCode}${joinGuardianPhone}` : '';

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: joinFullName,
          email: joinEmail,
          password: joinPassword,
          role: joinRole,
          phone: phoneWithCode,
          countryCode: joinCountryCode,
          base_salary: joinBaseSalary || undefined,
          price_per_lesson: joinPricePerLesson || undefined,
          bank_name: joinBankName || undefined,
          bank_account: joinBankAccount || undefined,
          address: joinAddress || undefined,
          birth_date: joinBirthDate || undefined,
          image: joinImage || undefined,
          salary_currency: 'AED',
          previous_education: joinPreviousEducation || undefined,
          guardian_name: joinGuardianName || undefined,
          guardian_email: joinGuardianEmail || undefined,
          guardian_phone: guardianPhoneWithCode || undefined,
          consentGiven: true,
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
      setJoinPassword('');
      setJoinRole('student');
      setJoinPhone('');
      setJoinBaseSalary('');
      setJoinPricePerLesson('');
      setJoinBankName('');
      setJoinBankAccount('');
      setJoinAddress('');
      setJoinBirthDate('');
      setJoinPreviousEducation('');
      setJoinGuardianName('');
      setJoinGuardianEmail('');
      setJoinGuardianPhone('');
      setJoinImagePreview(null);
      setJoinImage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.fillRequired);
    } finally {
      setRegisterPending(false);
    }
  };

  const handleImageFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setJoinImagePreview(ev.target?.result as string);
        setJoinImage(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
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
        {/* Image side */}
        <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-[#c8e649]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/60">
              <ImageIcon className="h-24 w-24 mx-auto mb-4 text-white/30" />
            </div>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full lg:w-1/2 flex items-start justify-center px-6 py-10 overflow-y-auto">
          <div className="w-full max-w-lg">
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
                  {loginMode === 'phone' ? (
                    <PhoneField
                      countryCode={loginCountryCode}
                      onCountryCodeChange={setLoginCountryCode}
                      onPhoneChange={setLoginPhone}
                      phone={loginPhone}
                      locale={locale}
                      label={copy.phoneLabel}
                      disabled={loginPending}
                    />
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">{copy.emailLoginLabel}</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder={copy.emailLoginPlaceholder}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                        disabled={loginPending}
                        required
                      />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setLoginMode(loginMode === 'phone' ? 'email' : 'phone')}
                    className="text-sm text-gray-500 hover:text-gray-700 transition underline"
                  >
                    {loginMode === 'phone' ? copy.switchToEmail : copy.switchToPhone}
                  </button>

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

            {/* REGISTER TAB — matches dashboard/users create form */}
            {activeTab === 'join' && (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-6">{copy.joinTitle}</h1>
                <form className="space-y-4" onSubmit={handleRegister}>
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        required
                      />
                    </div>
                  </div>

                  {/* Row 2: Password + Role */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">{copy.createPasswordLabel}</label>
                      <div className="relative">
                        <input
                          type={showRegisterPassword ? 'text' : 'password'}
                          value={joinPassword}
                          onChange={(e) => setJoinPassword(e.target.value)}
                          placeholder={copy.createPasswordPlaceholder}
                          className={`w-full h-12 rounded-xl border border-gray-200 bg-white text-sm outline-none transition focus:border-gray-400 ${
                            isArabic ? 'pr-4 pl-10' : 'pl-4 pr-10'
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
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">{copy.roleLabel}</label>
                      <select
                        value={joinRole}
                        onChange={(e) => setJoinRole(e.target.value)}
                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400 appearance-none"
                        disabled={registerPending}
                      >
                        <option value="student">{copy.roleStudent}</option>
                        <option value="teacher">{copy.roleTeacher}</option>
                        <option value="parent">{copy.roleParent}</option>
                      </select>
                    </div>
                  </div>

                  {/* Row 3: Phone */}
                  <PhoneField
                    countryCode={joinCountryCode}
                    onCountryCodeChange={setJoinCountryCode}
                    onPhoneChange={setJoinPhone}
                    phone={joinPhone}
                    locale={locale}
                    label={copy.phoneLabel}
                    disabled={registerPending}
                  />

                  {/* Row 4: Base Salary + Price per Lesson */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">{copy.baseSalaryLabel}</label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">AED</span>
                        <input
                          type="text"
                          dir="ltr"
                          value={joinBaseSalary}
                          onChange={(e) => setJoinBaseSalary(e.target.value)}
                          placeholder={copy.baseSalaryPlaceholder}
                          className="flex-1 h-12 rounded-e-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                          disabled={registerPending}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-900">{copy.pricePerLessonLabel}</label>
                      <div className="flex">
                        <span className="inline-flex items-center rounded-s-xl border border-e-0 border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">AED</span>
                        <input
                          type="text"
                          dir="ltr"
                          value={joinPricePerLesson}
                          onChange={(e) => setJoinPricePerLesson(e.target.value)}
                          placeholder={copy.pricePerLessonPlaceholder}
                          className="flex-1 h-12 rounded-e-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                          disabled={registerPending}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Bank Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.bankNameLabel}</label>
                    <input
                      type="text"
                      value={joinBankName}
                      onChange={(e) => setJoinBankName(e.target.value)}
                      placeholder={copy.bankNamePlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 6: Bank Account */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.bankAccountLabel}</label>
                    <input
                      type="text"
                      dir="ltr"
                      value={joinBankAccount}
                      onChange={(e) => setJoinBankAccount(e.target.value)}
                      placeholder={copy.bankAccountPlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 7: Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.addressLabel}</label>
                    <input
                      type="text"
                      value={joinAddress}
                      onChange={(e) => setJoinAddress(e.target.value)}
                      placeholder={copy.addressPlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 8: Profile Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.profilePicture}</label>
                    <div
                      className={`flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                        joinImagePreview ? 'border-green-300 bg-green-50/30' : 'border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50/50'
                      }`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                    >
                      {joinImagePreview ? (
                        <div className="relative mb-3">
                          <img src={joinImagePreview} alt="Preview" loading="lazy" decoding="async" width={96} height={96} className="h-24 w-24 rounded-xl object-cover shadow-sm" />
                          <button
                            type="button"
                            onClick={() => { setJoinImagePreview(null); setJoinImage(null); }}
                            className="absolute -end-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs shadow-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                          <Upload className="h-7 w-7 text-gray-400" strokeWidth={1.5} />
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        {joinImagePreview ? copy.imageUploaded : copy.dragDrop}
                      </p>
                      {!joinImagePreview && (
                        <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-900 shadow-sm transition-all hover:bg-gray-50">
                          <Upload className="h-4 w-4" />
                          {copy.uploadImage}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageFile(file);
                            }}
                          />
                        </label>
                      )}
                      <p className="mt-3 text-xs text-gray-400">{copy.supportedFormats}</p>
                    </div>
                  </div>

                  {/* Row 9: Birth Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.birthDateLabel}</label>
                    <input
                      type="date"
                      value={joinBirthDate}
                      onChange={(e) => setJoinBirthDate(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 10: Previous Education */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.previousEducationLabel}</label>
                    <input
                      type="text"
                      value={joinPreviousEducation}
                      onChange={(e) => setJoinPreviousEducation(e.target.value)}
                      placeholder={copy.previousEducationPlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 11: Guardian Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.guardianNameLabel}</label>
                    <input
                      type="text"
                      value={joinGuardianName}
                      onChange={(e) => setJoinGuardianName(e.target.value)}
                      placeholder={copy.guardianNamePlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 12: Guardian Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">{copy.guardianEmailLabel}</label>
                    <input
                      type="email"
                      dir="ltr"
                      value={joinGuardianEmail}
                      onChange={(e) => setJoinGuardianEmail(e.target.value)}
                      placeholder={copy.guardianEmailPlaceholder}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                      disabled={registerPending}
                    />
                  </div>

                  {/* Row 13: Guardian Phone */}
                  <PhoneField
                    countryCode={joinGuardianCountryCode}
                    onCountryCodeChange={setJoinGuardianCountryCode}
                    onPhoneChange={setJoinGuardianPhone}
                    phone={joinGuardianPhone}
                    locale={locale}
                    label={copy.guardianPhoneLabel}
                    disabled={registerPending}
                    required={false}
                  />

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
