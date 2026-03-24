
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Video,
  Users,
  Globe,
  Target,
  BarChart3,
  Clock,
  Shield,
  CheckCircle,
  Calendar,
  Smartphone,
  Sparkles,
  TrendingUp,
  Timer
} from "lucide-react";
import UserPortalSection from "@/components/UserPortalSection";
import { getTranslations } from 'next-intl/server';

export default async function Home() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-dark text-white py-20 px-4 relative overflow-hidden min-h-[600px] flex items-center">
        {/* Background Overlay or Image */}
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Abstract shapes or pattern can go here */}
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 animate-in slide-in-from-right-10 duration-700 fade-in">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {t('hero.title')} <span className="text-brand-primary relative inline-block">
                {t('hero.titleHighlight')}
                <svg className="absolute w-full h-3 -bottom-1 right-0 text-brand-primary opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span>
              <br />
              {t('hero.subtitle')}
            </h1>
            <p className="text-lg text-gray-300 max-w-xl leading-relaxed">
              {t('hero.description')}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="text-base font-bold bg-brand-primary text-black hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-lg shadow-brand-primary/20 px-8 py-6 h-auto">
                  {t('hero.ctaPrimary')}
                </Button>
              </Link>
              <Link href="/exam-simulation">
                <Button size="lg" variant="outline" className="text-base bg-transparent border-white text-white hover:bg-white/10 px-8 py-6 h-auto">
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
          {/* Hero Image */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-brand-primary/10 shadow-2xl bg-gray-800 aspect-video flex items-center justify-center group cursor-pointer animate-in slide-in-from-left-10 duration-700 fade-in delay-200 hover:shadow-brand-primary/20 transition-all">
            {/* Using standard img for simplicity and direct local file access assurance */}
            <Image
              src="/hero-bg.png"
              alt="Eman Academy Hero"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent" />

            <div className="w-20 h-20 bg-brand-primary/90 rounded-full flex items-center justify-center z-10 animate-pulse group-hover:bg-brand-primary group-hover:scale-110 transition-all shadow-lg shadow-brand-primary/30 backdrop-blur-sm">
              <Video className="text-black ml-1 w-10 h-10" />
            </div>
          </div>
        </div>
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-primary/5 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-gradient-to-t from-brand-primary/5 to-transparent pointer-events-none rounded-full blur-3xl opacity-50" />
      </section>

      {/* NEW: Diaspora Hero Banner */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm">
              <Globe className="w-4 h-4 text-brand-primary" />
              <span>{t('diasporaBanner.badge')}</span>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold leading-tight">
              {t('diasporaBanner.title')}
              <span className="block text-brand-primary mt-2">{t('diasporaBanner.titleHighlight')}</span>
            </h2>

            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {t('diasporaBanner.description')}
            </p>

            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/parent-dashboard">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-gray-100 font-bold">
                  {t('diasporaBanner.cta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-brand-dark">{t('benefits.sectionTitle')} <span className="text-brand-primary">{t('benefits.sectionTitleHighlight')}</span></h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('benefits.sectionDescription')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardHeader>
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:rotate-6 transition-all duration-300">
                  <BookOpen className="w-8 h-8 text-brand-primary group-hover:text-black transition-colors" />
                </div>
                <CardTitle className="text-xl font-bold">{t('benefits.curriculum.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  {t('benefits.curriculum.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardHeader>
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:rotate-6 transition-all duration-300">
                  <Users className="w-8 h-8 text-brand-primary group-hover:text-black transition-colors" />
                </div>
                <CardTitle className="text-xl font-bold">{t('benefits.teachers.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  {t('benefits.teachers.description')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group">
              <CardHeader>
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-brand-primary group-hover:rotate-6 transition-all duration-300">
                  <GraduationCap className="w-8 h-8 text-brand-primary group-hover:text-black transition-colors" />
                </div>
                <CardTitle className="text-xl font-bold">{t('benefits.tracking.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-gray-600 leading-relaxed">
                  {t('benefits.tracking.description')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* NEW: USP Section - Why We're Different */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-brand-dark">
                    {t('usp.sectionTitle')} <span className="text-brand-primary">{t('usp.sectionTitleHighlight')}</span>
                  </h2>

                  {/* Key USP Quote */}
                  <div className="bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 rounded-2xl p-6 border-r-4 border-brand-primary">
                    <p className="text-xl font-bold text-brand-dark">
                      {t('usp.quote')}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { icon: Globe, text: t('usp.points.dedicated') },
                    { icon: Target, text: t('usp.points.notTutoring') },
                    { icon: Clock, text: t('usp.points.smartTracking') },
                    { icon: BarChart3, text: t('usp.points.examSimulation') }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon className="w-6 h-6 text-brand-primary" />
                      </div>
                      <span className="text-gray-700 font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Element */}
              <div className="relative">
                <div className="bg-gradient-to-br from-brand-dark to-gray-900 rounded-3xl p-8 text-white">
                  <div className="text-center space-y-6">
                    <div className="text-6xl">🎯</div>
                    <h3 className="text-2xl font-bold">{t('usp.sectionTitle')}</h3>
                    <p className="text-gray-300 text-lg">
                      {t('diasporaBanner.description')}
                    </p>
                    <div className="pt-4">
                      <Link href="/exam-simulation">
                        <Button className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold">
                          {t('hero.ctaSecondary')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Exam Simulation System Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm backdrop-blur-sm mb-6">
              <Target className="w-4 h-4 text-brand-primary" />
              <span>{t('usp.points.examSimulation')}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('nav.examSimulation')}</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              {t('usp.points.examSimulation')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Note: In a real app, these specific feature cards should also be in translations */}
            {[
              { icon: Target, title: t('features.quizzes.title'), desc: t('features.quizzes.description') },
              { icon: Timer, title: t('common.loading'), desc: t('usp.points.smartTracking') },
              { icon: BarChart3, title: t('features.progress.title'), desc: t('features.progress.description') },
              { icon: TrendingUp, title: t('features.homework.title'), desc: t('features.homework.description') },
              { icon: Shield, title: t('features.support.title'), desc: t('features.support.description') },
              { icon: CheckCircle, title: t('common.success'), desc: t('features.recordedLessons.description') }
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="w-14 h-14 bg-brand-primary/20 rounded-2xl flex items-center justify-center mb-4">
                  <item.icon className="w-7 h-7 text-brand-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-300 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/exam-simulation">
              <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                {t('hero.ctaSecondary')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEW: Smart Study Plans Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-dark">
                {t('features.sectionTitle')} <span className="text-brand-primary">{t('features.sectionTitleHighlight')}</span>
              </h2>
              <p className="text-lg text-gray-600">
                {t('diasporaBanner.description')}
              </p>

              <div className="space-y-4">
                {[
                  { icon: Globe, title: t('usp.points.dedicated'), desc: t('benefits.curriculum.description') },
                  { icon: Calendar, title: key => t('common.appName'), desc: t('benefits.tracking.description') }, // Placeholder usage
                  { icon: Clock, title: t('usp.points.smartTracking'), desc: t('features.liveClasses.description') },
                  { icon: Shield, title: t('features.support.title'), desc: t('features.support.description') }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{typeof item.title === 'function' ? item.title('appName') : item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule Preview */}
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {t('common.loading')} {/* Placeholder for "Weekly Schedule" */}
              </h3>
              <div className="space-y-4">
                {[
                  { day: "الأحد", subject: "آلرياضيات", time: "5:00 م", status: "done" },
                  { day: "الإثنين", subject: "اللغة العربية", time: "5:30 م", status: "done" },
                  { day: "الثلاثاء", subject: "العلوم", time: "6:00 م", status: "upcoming" },
                  { day: "الأربعاء", subject: "امتحان تجريبي", time: "5:00 م", status: "upcoming" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${item.status === 'done' ? 'bg-green-50' : 'bg-blue-50'}`}>
                    <div className="flex items-center gap-4">
                      {item.status === 'done' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-blue-600" />
                      )}
                      <div>
                        <span className="font-medium">{item.subject}</span>
                        <span className="text-gray-500 text-sm mr-3">{item.day}</span>
                      </div>
                    </div>
                    <span className={`font-medium ${item.status === 'done' ? 'text-green-600' : 'text-blue-600'}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: Parent Dashboard Preview Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Dashboard Mockup */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-xl order-2 lg:order-1">
              <div className="bg-white rounded-2xl p-6 text-gray-900">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg">{t('nav.parentDashboard')}</h3>
                  <span className="text-2xl font-bold text-emerald-600">78%</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{t('features.progress.title')}</p>

                <div className="space-y-4">
                  {[
                    { name: "اللغة العربية", score: 85, color: "emerald" },
                    { name: "الرياضيات", score: 62, color: "amber" },
                    { name: "العلوم", score: 90, color: "emerald" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.name}</span>
                        <span className="font-bold">{item.score}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.score >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                {t('diasporaBanner.title')} <span className="text-brand-primary">{t('diasporaBanner.titleHighlight')}</span>
              </h2>
              <p className="text-xl text-gray-300">
                {t('diasporaBanner.description')}
              </p>

              <div className="space-y-4">
                {[
                  { icon: BarChart3, text: t('features.progress.description') },
                  { icon: CheckCircle, text: t('features.quizzes.description') },
                  { icon: TrendingUp, text: t('usp.points.smartTracking') },
                  { icon: Smartphone, text: t('features.support.description') }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-brand-primary" />
                    </div>
                    <span className="text-gray-200">{item.text}</span>
                  </div>
                ))}
              </div>

              <Link href="/parent-dashboard">
                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold">
                  {t('diasporaBanner.cta')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-brand-light relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-brand-dark">{t('testimonials.sectionTitle')} <span className="text-brand-primary">{t('testimonials.sectionTitleHighlight')}</span></h2>
            <p className="text-gray-600">{t('testimonials.sectionDescription')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white border-none shadow-lg p-8 relative">
              <div className="absolute top-6 left-6 text-6xl text-brand-primary/20 font-serif">"</div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-brand-primary/20" />
                <div>
                  <h4 className="font-bold text-lg">أحمد محمد</h4>
                  <p className="text-sm text-gray-500">ولي أمر - الإمارات 🇦🇪</p>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed italic relative z-10">
                "أفضل منصة تعليمية تعاملت معها. المدرسين ممتازين والمتابعة مستمرة. ابني تحسن جداً في اللغة العربية رغم بعدي عن مصر."
              </p>
            </Card>

            <Card className="bg-white border-none shadow-lg p-8 relative">
              <div className="absolute top-6 left-6 text-6xl text-brand-primary/20 font-serif">"</div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-brand-primary/20" />
                <div>
                  <h4 className="font-bold text-lg">سارة علي</h4>
                  <p className="text-sm text-gray-500">ولية أمر - السعودية 🇸🇦</p>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed italic relative z-10">
                "شرح مبسط وواضح جداً للمواد الشرعية. جزاكم الله خيراً على هذا المجهود الرائع، لوحة المتابعة طمأنتني كثيراً."
              </p>
            </Card>

            <Card className="bg-white border-none shadow-lg p-8 relative">
              <div className="absolute top-6 left-6 text-6xl text-brand-primary/20 font-serif">"</div>
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-14 h-14 rounded-full bg-gray-200 border-2 border-brand-primary/20" />
                <div>
                  <h4 className="font-bold text-lg">محمد إبراهيم</h4>
                  <p className="text-sm text-gray-500">ولي أمر - الكويت 🇰🇼</p>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed italic relative z-10">
                "نظام الامتحانات التجريبية ممتاز. ابني اعتاد على شكل الامتحان قبل موعده الفعلي وحصل على درجات عالية."
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* NEW: User Portal Section */}
      <UserPortalSection />

      {/* NEW: Target Audience Clarity Banner */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Globe className="w-10 h-10" />
            <h3 className="text-2xl md:text-3xl font-bold">
              {t('diasporaBanner.badge')}
            </h3>
          </div>
          <p className="text-lg text-indigo-200 max-w-3xl mx-auto">
            {t('diasporaBanner.description')}
          </p>
        </div>
      </section>

      {/* Tracks Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('nav.subjects')}</h2>
            <div className="h-1 w-20 bg-brand-primary mx-auto rounded-full"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* National School */}
            <div className="group relative rounded-2xl overflow-hidden bg-brand-dark text-white aspect-[3/4] flex flex-col justify-end p-8 hover:translate-y-[-5px] transition-all duration-300 shadow-xl cursor-pointer">
              {/* Background Image Logic would go here - for now using color/gradient */}
              <div className="absolute inset-0 bg-gray-800 transition-transform duration-700 group-hover:scale-110">
                {/* Reuse placeholder or use hero logic */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              </div>

              <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-brand-primary transition-colors">{t('nav.nationalSchool')}</h3>
                <p className="text-gray-300 mb-6 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{t('benefits.curriculum.description')}</p>
                <Link href="/national-school">
                  <Button className="w-full bg-brand-primary text-black font-bold hover:bg-white transition-colors">{t('courses.details')}</Button>
                </Link>
              </div>
            </div>

            {/* Azhar School */}
            <div className="group relative rounded-2xl overflow-hidden bg-brand-dark text-white aspect-[3/4] flex flex-col justify-end p-8 hover:translate-y-[-5px] transition-all duration-300 shadow-xl cursor-pointer">
              <div className="absolute inset-0 bg-gray-800 transition-transform duration-700 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              </div>
              <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-brand-primary transition-colors">{t('nav.alAzharSchool')}</h3>
                <p className="text-gray-300 mb-6 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{t('benefits.curriculum.description')}</p>
                <Link href="/al-azhar-school">
                  <Button className="w-full bg-brand-primary text-black font-bold hover:bg-white transition-colors">{t('courses.details')}</Button>
                </Link>
              </div>
            </div>

            {/* VR Eduverse */}
            <div className="group relative rounded-2xl overflow-hidden bg-brand-dark text-white aspect-[3/4] flex flex-col justify-end p-8 hover:translate-y-[-5px] transition-all duration-300 shadow-xl cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 transition-transform duration-700 group-hover:scale-110">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
              </div>
              <div className="absolute top-4 right-4 z-30">
                <span className="px-3 py-1 bg-purple-500 text-white text-xs rounded-full font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t('common.loading')}
                </span>
              </div>
              <div className="relative z-20 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-2xl font-bold mb-2 group-hover:text-brand-primary transition-colors">{t('nav.vrEducation')}</h3>
                <p className="text-gray-300 mb-6 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{t('usp.points.examSimulation')}</p>
                <Link href="/vr-eduverse">
                  <Button className="w-full bg-brand-primary text-black font-bold hover:bg-white transition-colors">{t('courses.details')}</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-brand-dark text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              {t('cta.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-400">
              {t('cta.description')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-brand-primary text-black hover:bg-brand-primary-hover font-bold px-8">
                  {t('cta.button')}
                </Button>
              </Link>
              <Link href="/exam-simulation">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8">
                  {t('hero.ctaSecondary')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
