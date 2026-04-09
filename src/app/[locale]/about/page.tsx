'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  BookOpen,
  Globe,
  GraduationCap,
  Heart,
  Lightbulb,
  MonitorSmartphone,
  Sparkles,
  Target,
  Trophy,
  Users,
  ChevronLeft,
} from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import PublicNav from '@/components/layout/PublicNav';

export default function AboutPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <PublicNav activeRoute="about" />

      {/* Hero */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm text-blue-700 mb-6">
            <Sparkles className="h-4 w-4" />
            {isArabic ? 'مؤسسة تعليمية رائدة' : 'Leading Educational Institution'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            {isArabic ? 'حول Future Labs Academy' : 'About Future Labs Academy'}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            {isArabic
              ? 'نحن مؤسسة تعليمية رائدة تهدف إلى تقديم تعليم عالي الجودة وتطوير قدرات الطلاب في بيئة تعليمية محفزة ومبتكرة.'
              : 'We are a leading educational institution aimed at providing high-quality education and developing students capabilities in a stimulating and innovative learning environment.'}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href={withLocalePrefix('/services', locale)} className="inline-flex items-center gap-2 rounded-full bg-blue-600 text-white px-6 py-3 text-sm font-medium hover:bg-blue-700 transition">
              {isArabic ? 'تعرف على برامجنا' : 'Explore Our Programs'}
              <ChevronLeft className={`h-4 w-4 ${isArabic ? '' : 'rotate-180'}`} />
            </Link>
            <Link href={withLocalePrefix('/contact', locale)} className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              {isArabic ? 'اتصل بنا' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-blue-50 p-8">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? 'رؤيتنا' : 'Our Vision'}</h3>
            <p className="text-gray-600">{isArabic ? 'أن نكون المؤسسة التعليمية الرائدة في المنطقة، نلهم الطلاب لتحقيق إمكاناتهم الكاملة ونعدهم لمستقبل مشرق في عالم متغير.' : 'To be the leading educational institution in the region, inspiring students to achieve their full potential and preparing them for a bright future in a changing world.'}</p>
          </div>
          <div className="rounded-2xl bg-purple-50 p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{isArabic ? 'مهمتنا' : 'Our Mission'}</h3>
            <p className="text-gray-600">{isArabic ? 'تقديم تعليم متميز يجمع بين الأصالة والمعاصرة، وبناء شخصيات قادرة على الإبداع والابتكار والمساهمة الفعالة في المجتمع.' : 'Delivering distinguished education that combines tradition and modernity, building personalities capable of creativity, innovation, and effective contribution to society.'}</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{isArabic ? 'قيمنا الأساسية' : 'Our Core Values'}</h2>
          <p className="text-gray-500 mb-12">{isArabic ? 'القيم التي تقود رحلتنا التعليمية وتشكل مستقبل طلابنا' : 'The values that guide our educational journey'}</p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isArabic ? 'التميز الأكاديمي' : 'Academic Excellence'}</h3>
              <p className="text-sm text-gray-500">{isArabic ? 'نسعى لتحقيق أعلى معايير الجودة في التعليم والتعلم' : 'We strive to achieve the highest quality standards in teaching and learning'}</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-pink-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isArabic ? 'التعلم التعاوني' : 'Collaborative Learning'}</h3>
              <p className="text-sm text-gray-500">{isArabic ? 'نؤمن بقوة العمل الجماعي والتعلم من خلال التفاعل' : 'We believe in teamwork and learning through interaction'}</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Globe className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{isArabic ? 'الانفتاح العالمي' : 'Global Openness'}</h3>
              <p className="text-sm text-gray-500">{isArabic ? 'نعد طلابنا ليكونوا مواطنين عالميين مسؤولين' : 'We prepare our students to be responsible global citizens'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Sparkles className="h-4 w-4" />
            {isArabic ? 'نمو مستمر' : 'Continuous Growth'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{isArabic ? 'إنجازاتنا بالأرقام' : 'Our Achievements in Numbers'}</h2>
          <p className="text-gray-500 mb-12">{isArabic ? 'أرقام تعكس التزامنا بالتميز والجودة في التعليم' : 'Numbers that reflect our commitment to excellence'}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: '500+', label: isArabic ? 'طالب وطالبة' : 'Students' },
              { num: '50+', label: isArabic ? 'معلم ومعلمة' : 'Teachers' },
              { num: '20+', label: isArabic ? 'برنامج تعليمي' : 'Programs' },
              { num: '10+', label: isArabic ? 'سنوات من التميز' : 'Years' },
            ].map((s) => (
              <div key={s.num} className="rounded-2xl border border-gray-100 p-6">
                <div className="text-3xl font-black text-blue-600 mb-1">{s.num}</div>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{isArabic ? 'لماذا تختار مدرسة عزياز؟' : 'Why Choose Azziaz School?'}</h2>
          <p className="text-gray-500 mb-12">{isArabic ? 'اكتشف الأسباب التي تجعلنا الخيار الأمثل لتعليم أطفالكم وبناء مستقبلهم' : 'Discover why we are the best choice'}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: isArabic ? 'معلمون مؤهلون' : 'Qualified Teachers', desc: isArabic ? 'فريق تعليمي متخصص وذو خبرة عالية' : 'Specialized teaching team' },
              { icon: BookOpen, title: isArabic ? 'مناهج حديثة' : 'Modern Curricula', desc: isArabic ? 'مناهج تعليمية متطورة تواكب العصر' : 'Advanced curricula' },
              { icon: Lightbulb, title: isArabic ? 'بيئة تفاعلية' : 'Interactive Environment', desc: isArabic ? 'بيئة تعليمية محفزة للإبداع والتفاعل' : 'Stimulating learning environment' },
              { icon: MonitorSmartphone, title: isArabic ? 'تقنيات متقدمة' : 'Advanced Technology', desc: isArabic ? 'استخدام أحدث التقنيات في التعليم' : 'Latest technology in education' },
              { icon: Target, title: isArabic ? 'متابعة فردية' : 'Individual Follow-up', desc: isArabic ? 'اهتمام شخصي بكل طالب وطالبة' : 'Personal attention' },
              { icon: Heart, title: isArabic ? 'قيم أصيلة' : 'Authentic Values', desc: isArabic ? 'غرس القيم الأصيلة والأخلاق الحميدة' : 'Instilling authentic values' },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <f.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
        <h3 className="text-2xl font-bold mb-3">{isArabic ? 'ابدأ رحلة التعلم معنا اليوم' : 'Start Your Learning Journey Today'}</h3>
        <p className="text-blue-100 mb-8">{isArabic ? 'انضم إلى عائلة مدرسة عزياز واكتشف الفرق في التعليم المتميز' : 'Join the Azziaz School family'}</p>
        <div className="flex items-center justify-center gap-4">
          <Link href={withLocalePrefix('/contact', locale)} className="rounded-full bg-white text-blue-600 px-6 py-3 text-sm font-medium hover:bg-blue-50 transition">{isArabic ? 'احجز جولة' : 'Book a Tour'}</Link>
          <Link href={withLocalePrefix('/join', locale)} className="rounded-full border border-white/30 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition">{isArabic ? 'تقدم بطلب' : 'Apply Now'}</Link>
        </div>
      </section>
    </div>
  );
}
