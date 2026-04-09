'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Clock, Mail, MapPin, Phone, Send, Loader2 } from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import PublicNav from '@/components/layout/PublicNav';

export default function ContactPage() {
  const locale = useLocale() as 'ar' | 'en';
  const isArabic = locale === 'ar';

  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, subject, message }),
      });
      setFormState('success');
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
      <PublicNav activeRoute="contact" />

      {/* Hero — NOTE: Reference shows English text even on Arabic locale */}
      <section className="py-12 px-4 text-center">
        <h1 className="text-4xl font-black text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          We are here to answer your questions and help you. Do not hesitate to contact us at any time.
        </p>
      </section>

      {/* Main Content */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="rounded-2xl bg-gray-50 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Send us a Message</h3>
            <p className="text-sm text-gray-500 mb-6">Fill out the form below and we will contact you as soon as possible</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter your phone number" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Message subject" className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-gray-400" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Message</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your message here..." rows={4} className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 resize-y" required />
              </div>

              <button type="submit" disabled={formState === 'loading'} className="w-full h-11 rounded-lg bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
                {formState === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {formState === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {formState === 'success' && <p className="text-sm text-emerald-600 text-center">Message sent successfully!</p>}
              {formState === 'error' && <p className="text-sm text-red-600 text-center">Failed to send. Please try again.</p>}
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-gray-50 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Contact Information</h3>
              <p className="text-sm text-gray-500 mb-6">You can contact us through the following methods</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Address</h4>
                    <p className="text-sm text-gray-600">Al Thawrah 74, Omdurman, Sudan</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Phone</h4>
                    <p className="text-sm text-gray-600">+249912672055</p>
                    <p className="text-sm text-gray-600">+971562792004</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Email</h4>
                    <p className="text-sm text-gray-600">info@azizaschool.online</p>
                    <p className="text-sm text-gray-600">admissions@azizaschool.online</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Working Hours</h4>
                    <p className="text-sm text-gray-600">Sunday - Thursday: 7:00 AM - 3:00 PM</p>
                    <p className="text-sm text-gray-600">Friday - Saturday: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl bg-gray-50 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Our Location</h3>
              <div className="rounded-xl bg-gray-200 h-48 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium">Interactive Map</p>
                  <p className="text-sm text-purple-500">Coming Soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { q: 'What are the registration times?', a: 'Registration for the new academic year starts in May and ends in August.' },
              { q: 'Do you provide school transportation?', a: 'Yes, we provide school transportation service to all areas in Riyadh.' },
              { q: 'What extracurricular activities are available?', a: 'We offer a variety of sports, cultural, and artistic activities.' },
              { q: 'How can I track my child\'s progress?', a: 'We provide an electronic system to track grades, attendance, and activities.' },
            ].map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-gray-50 p-6 text-left">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{faq.q}</h3>
                <p className="text-sm text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
