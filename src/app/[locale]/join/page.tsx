'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ImageIcon,
  Loader2,
  Upload,
} from 'lucide-react';
import { PhoneField } from '@/components/auth/PhoneField';
import { withLocalePrefix } from '@/lib/locale-path';
import PublicNav from '@/components/layout/PublicNav';

const BUNDLES = [
  { id: 1, name: { ar: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الأول', en: 'English Foundation Course for Kids - Level 1' } },
  { id: 2, name: { ar: 'كورس تأسيس اللغة الإنجليزية للأطفال - المستوى الثاني', en: 'English Foundation Course for Kids - Level 2' } },
];

const GENDERS = [
  { value: 'female', label: { ar: 'أنثى', en: 'Female' } },
  { value: 'male', label: { ar: 'ذكر', en: 'Male' } },
];

export default function JoinPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [bundle, setBundle] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneCode, setPhoneCode] = useState('249');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [previousEducation, setPreviousEducation] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhoneCode, setGuardianPhoneCode] = useState('249');
  const [guardianPhone, setGuardianPhone] = useState('');

  const copy = {
    logo: 'Future Labs Academy',
    about: isArabic ? 'حولنا' : 'About',
    contact: isArabic ? 'اتصل بنا' : 'Contact',
    services: isArabic ? 'خدماتنا' : 'Services',
    login: isArabic ? 'تسجيل الدخول' : 'Log in',
    join: isArabic ? 'انضم' : 'Join',
    pageTitle: isArabic ? 'التقديم للمدرسة' : 'Apply for the school',
    pageSubtitle: isArabic ? 'طلب التحاق للطالب' : 'Student Application',
    selectBundle: isArabic ? 'اختر الفصل' : 'Select a Bundle',
    selectBundlePlaceholder: isArabic ? 'اختر فصل للتقديم' : 'Select a bundle to apply for',
    personalInfo: isArabic ? 'المعلومات الشخصية' : 'Personal Information',
    fullName: isArabic ? 'الاسم الكامل' : 'Full Name',
    fullNamePlaceholder: isArabic ? 'أدخل اسمك الكامل' : 'Enter your full name',
    dob: isArabic ? 'تاريخ الميلاد' : 'Date of Birth',
    dobPlaceholder: isArabic ? 'اختر تاريخ الميلاد' : 'Select your date of birth',
    gender: isArabic ? 'النوع' : 'Gender',
    genderPlaceholder: isArabic ? 'اختر النوع' : 'Select your gender',
    password: isArabic ? 'كلمة المرور' : 'Password',
    studentImage: isArabic ? 'صورة الطالب' : 'Student Image',
    dragDrop: isArabic ? 'Drag and drop an image here, or' : 'Drag and drop an image here, or',
    uploadImage: isArabic ? 'Upload Image' : 'Upload Image',
    imageFormats: 'Supported formats: jpg, jpeg, png, gif, webp (max 5MB)',
    contactInfo: isArabic ? 'معلومات الاتصال' : 'Contact Information',
    phoneLabel: isArabic ? 'رقم الهاتف' : 'Phone Number',
    addressLabel: isArabic ? 'العنوان' : 'Address',
    addressPlaceholder: isArabic ? 'أدخل عنوانك' : 'Enter your complete address',
    educationInfo: isArabic ? 'المعلومات التعليمية' : 'Educational Information',
    previousEducation: isArabic ? 'التعليم السابق' : 'Previous Education',
    previousEducationPlaceholder: isArabic ? 'أدخل خلفيتك التعليمية' : 'Enter your previous educational experience',
    guardianInfo: isArabic ? 'معلومات ولي الامر' : 'Guardian Information',
    guardianName: isArabic ? 'اسم ولي الامر' : 'Guardian Name',
    guardianNamePlaceholder: isArabic ? 'أدخل اسم ولي الامر' : "Enter guardian's full name",
    guardianPhone: isArabic ? 'رقم هاتف ولي الامر' : 'Guardian Phone',
    passportLabel: isArabic ? 'رقم جواز السفر (اختياري)' : 'Passport Number (optional)',
    nationalIdLabel: isArabic ? 'الرقم الوطني (اختياري)' : 'National ID (optional)',
    dragFile: isArabic ? 'قم بسحب الملف هنا او' : 'Drag and drop a file here, or',
    chooseFile: isArabic ? 'اختر ملف' : 'Choose a file',
    fileFormats: isArabic
      ? 'الصيغ المدعومة: jpg, jpeg, png, gif, webp, pdf, mp4, mp3, mov, avi, mkv, ppt (max 300MB)'
      : 'Supported formats: jpg, jpeg, png, gif, webp, pdf, mp4, mp3, mov, avi, mkv, ppt (max 300MB)',
    submit: isArabic ? 'إرسال الطلب' : 'Submit Application',
    submitting: isArabic ? 'جارٍ الإرسال...' : 'Submitting...',
    successTitle: isArabic ? 'تم إرسال الطلب بنجاح' : 'Application submitted successfully',
    successBody: isArabic ? 'سيتم مراجعة طلبك والتواصل معك قريباً.' : 'Your application will be reviewed and we will contact you soon.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bundleId: bundle,
          fullName,
          dateOfBirth: dob,
          gender,
          password,
          phone,
          phoneCode,
          address,
          previousEducation,
          guardianName,
          guardianPhone,
          guardianPhoneCode,
        }),
      });
      setSubmitted(true);
    } catch {
      // handle error
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="max-w-md text-center p-8">
          <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">{copy.successTitle}</h2>
          <p className="text-gray-500 mb-6">{copy.successBody}</p>
          <Link
            href={withLocalePrefix('/login', locale)}
            className="inline-block rounded-full bg-gray-900 text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition"
          >
            {copy.login}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isArabic ? 'rtl' : 'ltr'}>
      <PublicNav />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-teal-50 to-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isArabic ? 'انضم إلى رحلة التعلم' : 'Join the Learning Journey'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {isArabic
              ? 'سجّل طفلك في أفضل منصة تعليمية للمنهج المصري أونلاين. تعليم متميز بأيدي نخبة المعلمين.'
              : 'Register your child in the best online Egyptian curriculum platform. Quality education by top educators.'}
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📚',
                title: isArabic ? 'تعلم أوفلاين' : 'Offline Learning',
                desc: isArabic ? 'حمّل الدروس وتعلّم في أي وقت بدون إنترنت' : 'Download lessons and learn anytime without internet',
              },
              {
                icon: '🎯',
                title: isArabic ? 'مناهج معتمدة' : 'Aligned Curriculum',
                desc: isArabic ? 'مطابقة للمواصفات الوزارية المصرية بالكامل' : 'Fully aligned with Egyptian Ministry standards',
              },
              {
                icon: '👨‍🏫',
                title: isArabic ? 'دعم مستمر' : 'Continuous Support',
                desc: isArabic ? 'متابعة أكاديمية ونفسية مع تقارير دورية لولي الأمر' : 'Academic and psychological support with regular parent reports',
              },
              {
                icon: '📅',
                title: isArabic ? 'جدول مرن' : 'Flexible Schedule',
                desc: isArabic ? 'جلسات مباشرة ومسجلة تناسب فروق التوقيت' : 'Live and recorded sessions for all time zones',
              },
              {
                icon: '🔒',
                title: isArabic ? 'بيئة آمنة' : 'Safe Environment',
                desc: isArabic ? 'حماية كاملة لبيانات الطلاب وأولياء الأمور' : 'Full data protection for students and parents',
              },
              {
                icon: '⚡',
                title: isArabic ? 'استجابة سريعة' : 'Fast Response',
                desc: isArabic ? 'فريق دعم فني متاح للمساعدة في أي وقت' : 'Technical support team available anytime',
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center hover:shadow-md transition-shadow">
                <span className="text-3xl mb-3 block">{feature.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-4 bg-teal-600 text-white">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { num: '500+', label: isArabic ? 'طالب مسجل' : 'Enrolled Students' },
            { num: '50+', label: isArabic ? 'معلم متميز' : 'Expert Teachers' },
            { num: '200+', label: isArabic ? 'درس مسجل' : 'Recorded Lessons' },
            { num: '98%', label: isArabic ? 'نسبة رضا أولياء الأمور' : 'Parent Satisfaction' },
          ].map((stat) => (
            <div key={stat.num}>
              <div className="text-3xl font-bold">{stat.num}</div>
              <div className="text-sm text-teal-100 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-6 border-b border-gray-100">
            <button
              type="button"
              onClick={() => window.history.back()}
              className={`mb-2 ${isArabic ? 'rotate-180' : ''}`}
            >
              <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">{copy.pageTitle}</h1>
            <p className="text-sm text-gray-500">{copy.pageSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Bundle Selection */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{copy.selectBundle}</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{copy.selectBundle}</label>
                <div className="relative">
                  <select
                    value={bundle}
                    onChange={(e) => setBundle(e.target.value)}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm appearance-none outline-none focus:border-gray-400"
                    required
                  >
                    <option value="">{copy.selectBundlePlaceholder}</option>
                    {BUNDLES.map((b) => (
                      <option key={b.id} value={b.id}>{b.name[locale]}</option>
                    ))}
                  </select>
                  <ChevronDown className={`absolute top-3.5 h-4 w-4 text-gray-400 pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} />
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{copy.personalInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.fullName}</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={copy.fullNamePlaceholder}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.dob}</label>
                  <button
                    type="button"
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm flex items-center gap-2 text-gray-500"
                  >
                    <Calendar className="h-4 w-4" />
                    {dob || copy.dobPlaceholder}
                  </button>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.gender}</label>
                  <div className="relative">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm appearance-none outline-none focus:border-gray-400"
                    >
                      <option value="">{copy.genderPlaceholder}</option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label[locale]}</option>
                      ))}
                    </select>
                    <ChevronDown className={`absolute top-3.5 h-4 w-4 text-gray-400 pointer-events-none ${isArabic ? 'left-3' : 'right-3'}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.password}</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={copy.password}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Student Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{copy.studentImage}</label>
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                  <ImageIcon className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">{copy.dragDrop}</p>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    <Upload className="h-4 w-4" />
                    {copy.uploadImage}
                  </button>
                  <p className="text-xs text-gray-400 mt-2">{copy.imageFormats}</p>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{copy.contactInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PhoneField
                  countryCode={phoneCode}
                  onCountryCodeChange={setPhoneCode}
                  onPhoneChange={setPhone}
                  phone={phone}
                  locale={locale}
                  label={copy.phoneLabel}
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.addressLabel}</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={copy.addressPlaceholder}
                    className="w-full min-h-[48px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 resize-y"
                  />
                </div>
              </div>
            </section>

            {/* Educational Information */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{copy.educationInfo}</h2>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900">{copy.previousEducation}</label>
                <textarea
                  value={previousEducation}
                  onChange={(e) => setPreviousEducation(e.target.value)}
                  placeholder={copy.previousEducationPlaceholder}
                  className="w-full min-h-[80px] rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-gray-400 resize-y"
                />
              </div>
            </section>

            {/* Guardian Information */}
            <section className="space-y-4">
              <h2 className="text-lg font-bold text-gray-900">{copy.guardianInfo}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-900">{copy.guardianName}</label>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder={copy.guardianNamePlaceholder}
                    className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400"
                    required
                  />
                </div>
                <PhoneField
                  countryCode={guardianPhoneCode}
                  onCountryCodeChange={setGuardianPhoneCode}
                  onPhoneChange={setGuardianPhone}
                  phone={guardianPhone}
                  locale={locale}
                  label={copy.guardianPhone}
                />
              </div>

              {/* Document uploads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{copy.passportLabel}</label>
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">{copy.dragFile}</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Upload className="h-4 w-4" />
                      {copy.chooseFile}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">{copy.fileFormats}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{copy.nationalIdLabel}</label>
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                    <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-2">{copy.dragFile}</p>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                    >
                      <Upload className="h-4 w-4" />
                      {copy.chooseFile}
                    </button>
                    <p className="text-xs text-gray-400 mt-2">{copy.fileFormats}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-gray-900 text-white px-8 py-3 text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {copy.submitting}
                </>
              ) : (
                copy.submit
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
