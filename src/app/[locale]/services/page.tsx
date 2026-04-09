'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  BookOpen,
  Bus,
  ChevronLeft,
  Dumbbell,
  Globe,
  GraduationCap,
  Heart,
  Laptop,
  Music,
  Palette,
  Shield,
  Sparkles,
  TestTube,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import PublicNav from '@/components/layout/PublicNav';

export default function ServicesPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  return (
    <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <PublicNav activeRoute="services" />

      {/* Hero — NOTE: Reference shows English text even on Arabic locale */}
      <section className="py-16 px-4 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm text-indigo-700 mb-6">
            <Sparkles className="h-4 w-4" />
            Excellence in Education
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Our Educational Services</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            We offer a comprehensive range of educational services and diverse activities to ensure comprehensive development of the student&apos;s personality and prepare them for a bright future.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="inline-flex items-center gap-2 rounded-full bg-indigo-600 text-white px-6 py-3 text-sm font-medium hover:bg-indigo-700 transition">
              Explore Our Services
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </button>
            <Link href={withLocalePrefix('/contact', locale)} className="rounded-full border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Book Consultation
            </Link>
          </div>
        </div>
      </section>

      {/* Core Educational Services */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-blue-600 mb-3">Core Educational Services</h2>
          <p className="text-gray-500 mb-12">Advanced educational services designed to build strong foundations for learning and academic growth</p>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: BookOpen, title: 'Primary Education', desc: 'Comprehensive educational programs for elementary, middle, and high school levels', tags: ['Accredited curriculum', 'Qualified teachers', 'Interactive classrooms'] },
              { icon: Globe, title: 'Bilingual Education', desc: 'Educational programs in both Arabic and English to prepare an outstanding generation', tags: ['Arabic Language', 'English Language', 'Global Culture'] },
              { icon: Laptop, title: 'Digital Learning', desc: 'Using the latest technologies and digital tools in education', tags: ['Learning platforms', 'Interactive content', 'Electronic assessment'] },
              { icon: Users, title: 'Collaborative Learning', desc: 'Educational environment that encourages teamwork and interaction among students', tags: ['Group projects', 'Interactive discussions', 'Active learning'] },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl border border-gray-100 p-6 text-left">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                  <s.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{s.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Services */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-pink-600 mb-3">Support Services</h2>
          <p className="text-gray-500 mb-12">Comprehensive services that support the learning journey and provide a safe, comfortable environment for all students</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Bus, title: 'School Transportation', desc: 'Safe and comfortable transportation service for all students' },
              { icon: UtensilsCrossed, title: 'School Meals', desc: 'Healthy and balanced meals that meet students\' needs' },
              { icon: Shield, title: 'Security & Safety', desc: 'Safe and secure environment to ensure the safety of all students' },
              { icon: Heart, title: 'Psychological Counseling', desc: 'Psychological and social support for students by specialists' },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-white p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Extracurricular Activities */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-purple-600 mb-3">Extracurricular Activities</h2>
          <p className="text-gray-500 mb-12">Diverse activities that nurture talents and develop students&apos; personal and social skills</p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Dumbbell, title: 'Sports Activities', items: ['Football', 'Basketball', 'Swimming', 'Athletics'] },
              { icon: Palette, title: 'Artistic Activities', items: ['Drawing', 'Sculpture', 'Photography', 'Handicrafts'] },
              { icon: Music, title: 'Musical Activities', items: ['Choir', 'Instrumental', 'Composition', 'Rhythm'] },
              { icon: TestTube, title: 'Scientific Activities', items: ['Laboratories', 'Science fairs', 'Competitions', 'Research'] },
            ].map((a) => (
              <div key={a.title} className="rounded-2xl border border-gray-100 p-6 text-left">
                <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                  <a.icon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">{a.title}</h3>
                <ul className="space-y-1.5">
                  {a.items.map((i) => (
                    <li key={i} className="text-xs text-gray-500 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialized Programs */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Specialized Programs</h2>
          <p className="text-gray-500 mb-12">Specially designed programs to meet diverse needs and develop individual capabilities of each student</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Sparkles, title: 'Gifted Program', desc: 'Special program to nurture gifted students and develop their exceptional abilities through advanced curricula and enrichment activities', color: 'blue' },
              { icon: Heart, title: 'Learning Support Program', desc: 'Specialized support for students facing learning challenges with innovative teaching strategies and individual follow-up', color: 'green' },
              { icon: GraduationCap, title: 'Leadership Program', desc: 'Developing leadership and personal skills in students through training workshops and practical leadership projects', color: 'purple' },
            ].map((p) => (
              <div key={p.title} className={`rounded-2xl bg-gradient-to-b from-${p.color}-50 to-white border border-${p.color}-100 p-6`}>
                <div className={`w-12 h-12 rounded-xl bg-${p.color}-100 flex items-center justify-center mx-auto mb-4`}>
                  <p.icon className={`h-6 w-6 text-${p.color}-600`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.desc}</p>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                  Learn More <ChevronLeft className="h-3 w-3 rotate-180" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <h2 className="text-2xl font-bold mb-3">Interested in Our Services?</h2>
        <p className="text-indigo-100 max-w-2xl mx-auto mb-8">
          Contact us today to learn more about our outstanding educational programs and how we can help your child reach their full potential and achieve the highest levels of academic excellence.
        </p>
        <div className="flex items-center justify-center gap-4 mb-6">
          <Link href={withLocalePrefix('/contact', locale)} className="inline-flex items-center gap-2 rounded-full bg-white text-indigo-600 px-6 py-3 text-sm font-medium hover:bg-indigo-50 transition">
            Schedule a Visit <ChevronLeft className="h-4 w-4 rotate-180" />
          </Link>
          <button className="rounded-full border border-white/30 text-white px-6 py-3 text-sm font-medium hover:bg-white/10 transition">
            Download Brochure
          </button>
        </div>
        <p className="text-sm text-indigo-200">Or contact us directly:</p>
        <p className="text-lg font-bold mt-1">+966 123 456 789</p>
      </section>
    </div>
  );
}
