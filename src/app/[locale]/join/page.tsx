'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Clock,
  Heart,
  Shield,
  MessageCircle,
  Smartphone,
  GraduationCap,
  Users,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const FEATURES = [
  {
    icon: Smartphone,
    title: { ar: 'التعلم دون اتصال', en: 'Offline Learning' },
    description: {
      ar: 'قم بتحميل المحتوى والتعلم في أي وقت دون الحاجة للإنترنت',
      en: 'Download content and learn anytime without internet connection',
    },
  },
  {
    icon: BookOpen,
    title: { ar: 'المنهج الدراسي', en: 'Curriculum Alignment' },
    description: {
      ar: 'محتوى متوافق مع المناهج الدراسية المعتمدة',
      en: 'Content aligned with official educational curricula',
    },
  },
  {
    icon: Heart,
    title: { ar: 'الدعم النفسي', en: 'Psychological Support' },
    description: {
      ar: 'خدمات إرشاد ودعم نفسي للطلاب',
      en: 'Counseling and psychological support services for students',
    },
  },
  {
    icon: Clock,
    title: { ar: 'جدول مرن', en: 'Flexible Scheduling' },
    description: {
      ar: 'تعلم في الوقت الذي يناسبك مع جداول مرنة',
      en: 'Learn at your own pace with flexible schedules',
    },
  },
  {
    icon: Shield,
    title: { ar: 'الأمان والخصوصية', en: 'Security & Privacy' },
    description: {
      ar: 'حماية كاملة لبياناتك وخصوصيتك',
      en: 'Complete protection for your data and privacy',
    },
  },
  {
    icon: MessageCircle,
    title: { ar: 'دعم سريع', en: 'Quick Response Support' },
    description: {
      ar: 'فريق دعم متاح للرد على استفساراتك بسرعة',
      en: 'Support team available to quickly answer your inquiries',
    },
  },
];

const SERVICES = [
  {
    icon: GraduationCap,
    title: { ar: 'التعليم الأساسي والمتوسط', en: 'Elementary & Middle School' },
    description: {
      ar: 'دعم شامل لطلاب المرحلة الأساسية والمتوسطة',
      en: 'Comprehensive support for elementary and middle school students',
    },
  },
  {
    icon: BookOpen,
    title: { ar: 'تحضير الامتحانات الثانوية', en: 'Secondary Exam Prep' },
    description: {
      ar: 'تجهيز متقدم لامتحانات الثانوية العامة',
      en: 'Advanced preparation for high school exams',
    },
  },
  {
    icon: Briefcase,
    title: { ar: 'التدريب المهني', en: 'Vocational Training' },
    description: {
      ar: 'برامج تدريب مهني لتطوير المهارات العملية',
      en: 'Vocational training programs to develop practical skills',
    },
  },
  {
    icon: Users,
    title: { ar: 'الإرشاد الأكاديمي', en: 'Academic Guidance' },
    description: {
      ar: 'استشارات أكاديمية لتوجيه الطلاب نحو النجاح',
      en: 'Academic counseling to guide students toward success',
    },
  },
];

const TESTIMONIALS = [
  {
    name: 'أحمد محمد',
    role: { ar: 'طالب ثانوي', en: 'High School Student' },
    content: {
      ar: 'ساعدتني المنصة كثيراً في تحضيري للامتحانات. المحتوى منظم وسهل الفهم.',
      en: 'The platform helped me a lot in preparing for exams. The content is organized and easy to understand.',
    },
  },
  {
    name: 'فاطمة علي',
    role: { ar: 'ولية أمر', en: 'Parent' },
    content: {
      ar: 'أصبحت متابعة تعليم أبنائي أسهل مع هذه المنصة. شكراً لكم!',
      en: 'Monitoring my children\'s education became easier with this platform. Thank you!',
    },
  },
  {
    name: 'خالد يوسف',
    role: { ar: 'معلم', en: 'Teacher' },
    content: {
      ar: 'أداة ممتازة للتواصل مع الطلاب ومتابعة تقدمهم. أنصح بها بشدة.',
      en: 'Excellent tool for communicating with students and tracking their progress. Highly recommended.',
    },
  },
];

const STATS = [
  { value: '10K+', label: { ar: 'طالب نشط', en: 'Active Students' } },
  { value: '500+', label: { ar: 'معلم خبير', en: 'Expert Teachers' } },
  { value: '95%', label: { ar: 'نسبة النجاح', en: 'Success Rate' } },
  { value: '24/7', label: { ar: 'دعم متواصل', en: 'Support Available' } },
];

const FAQ_ITEMS = [
  {
    question: {
      ar: 'كيف يمكنني التسجيل في المنصة؟',
      en: 'How can I register on the platform?',
    },
    answer: {
      ar: 'يمكنك التسجيل بسهولة من خلال صفحة "انضم الآن" وتعبئة البيانات المطلوبة. ستحتاج فقط إلى رقم هاتفك وكلمة مرور.',
      en: 'You can easily register through the "Join Now" page by filling in the required information. You will only need your phone number and password.',
    },
  },
  {
    question: {
      ar: 'هل يمكنني الوصول للمحتوى دون اتصال بالإنترنت؟',
      en: 'Can I access content without internet connection?',
    },
    answer: {
      ar: 'نعم، يمكنك تحميل المحتوى والوصول إليه دون الحاجة للاتصال بالإنترنت.',
      en: 'Yes, you can download content and access it without needing an internet connection.',
    },
  },
  {
    question: {
      ar: 'كيف يمكنني التواصل مع فريق الدعم؟',
      en: 'How can I contact the support team?',
    },
    answer: {
      ar: 'يمكنك التواصل معنا من خلال صفحة الدعم في حسابك أو إرسال رسالة مباشرة.',
      en: 'You can contact us through the support page in your account or send a direct message.',
    },
  },
];

interface FAQItemProps {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  const locale = useLocale() as 'ar' | 'en';

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-900">{question[locale]}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <p className="text-slate-700">{answer[locale]}</p>
        </div>
      )}
    </div>
  );
}

export default function JoinPage() {
  const locale = useLocale() as 'ar' | 'en';
  const router = useRouter();
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleJoin = () => router.push(`/${locale}/register`);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            {locale === 'ar' ? 'انضم إلى عائلتنا التعليمية' : 'Join Our Educational Family'}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            {locale === 'ar'
              ? 'ابدأ رحلتك التعليمية مع منصة متكاملة توفر لك كل ما تحتاجه للنجاح'
              : 'Start your educational journey with an integrated platform that provides everything you need for success'}
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleJoin}>
            {locale === 'ar' ? 'ابدأ الآن' : 'Get Started Now'}
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {locale === 'ar' ? 'مميزاتنا' : 'Our Features'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-lg bg-sky-100 text-sky-600">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {feature.title[locale]}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {feature.description[locale]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {locale === 'ar' ? 'خدماتنا' : 'Our Services'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600">
                          <Icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          {service.title[locale]}
                        </h3>
                        <p className="text-slate-600 text-sm">
                          {service.description[locale]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sky-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold mb-2">{stat.value}</div>
                <div className="text-sky-100">{stat.label[locale]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {locale === 'ar' ? 'آراء المستخدمين' : 'What Our Users Say'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                      <Users className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
                      <div className="text-sm text-slate-500">{testimonial.role[locale]}</div>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {testimonial.content[locale]}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            {locale === 'ar' ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openFAQIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            {locale === 'ar' ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            {locale === 'ar'
              ? 'انضم إلى آلاف الطلاب الذين يحققون نجاحاً مع منصتنا التعليمية'
              : 'Join thousands of students achieving success with our educational platform'}
          </p>
          <Button size="lg" className="text-lg px-8 py-6" onClick={handleJoin}>
            {locale === 'ar' ? 'أنشئ حسابك الآن' : 'Create Your Account Now'}
          </Button>
        </div>
      </section>
    </div>
  );
}
