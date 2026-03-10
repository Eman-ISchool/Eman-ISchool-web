'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
  const params = useParams<{ locale: string }>();
  const locale = params?.locale === 'en' ? 'en' : 'ar';
  const isArabic = locale === 'ar';

  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState<string | null>(null);

  const content = {
    badge: isArabic ? 'تواصل معنا' : 'Contact us',
    title: isArabic ? 'فريقنا جاهز للرد على استفساراتك.' : 'Our team is ready to answer your questions.',
    body: isArabic
      ? 'هذه الصفحة تضيف مسار تواصل مباشر كما في المرجع، مع نموذج فعلي وحالات نجاح وخطأ واضحة.'
      : 'This page adds the direct contact route present in the reference, with a real form endpoint and explicit success/error states.',
    name: isArabic ? 'الاسم' : 'Name',
    email: isArabic ? 'البريد الإلكتروني' : 'Email',
    message: isArabic ? 'رسالتك' : 'Your message',
    submit: isArabic ? 'إرسال الرسالة' : 'Send message',
    loading: isArabic ? 'جارٍ الإرسال...' : 'Sending...',
    success: isArabic ? 'تم استلام رسالتك بنجاح.' : 'Your message has been received successfully.',
    error: isArabic ? 'تعذر إرسال الرسالة حالياً.' : 'Unable to submit your message right now.',
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setFeedback(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || content.error);
      }

      setStatus('success');
      setFeedback(content.success);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : content.error);
    }
  };

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-700">
                {content.badge}
              </span>
              <h1 className="text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
                {content.title}
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-600">{content.body}</p>

              <div className="grid gap-4">
                {[
                  { icon: Mail, label: 'hello@eduverse.local', hint: isArabic ? 'البريد العام' : 'General inbox' },
                  { icon: Phone, label: '+962 79 000 0000', hint: isArabic ? 'الخط المباشر' : 'Direct line' },
                  { icon: MapPin, label: isArabic ? 'دبي / عمّان / الرياض' : 'Dubai / Amman / Riyadh', hint: isArabic ? 'فريق إقليمي' : 'Regional coverage' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <item.icon className="h-8 w-8 rounded-2xl bg-slate-950 p-1.5 text-white" />
                    <p className="mt-4 text-lg font-semibold text-slate-950">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.hint}</p>
                  </div>
                ))}
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              aria-busy={status === 'loading'}
              className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
            >
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">{content.name}</span>
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">{content.email}</span>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.email}
                    onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                    className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">{content.message}</span>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    className="min-h-40 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  />
                </label>

                {feedback && (
                  <div
                    role={status === 'success' ? 'status' : 'alert'}
                    aria-live={status === 'success' ? 'polite' : 'assertive'}
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      status === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border border-rose-200 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {feedback}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="h-12 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {status === 'loading' ? content.loading : content.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
