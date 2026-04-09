'use client';

import { useState } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { withLocalePrefix } from '@/lib/locale-path';

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: string } }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const isArabic = locale === 'ar';

    const copy = {
        title: isArabic ? 'نسيت كلمة المرور' : 'Forgot Password',
        subtitle: isArabic
            ? 'أدخل عنوان بريدك الإلكتروني وسنرسل لك رمزًا لإعادة تعيين كلمة المرور.'
            : 'Enter your email address and we will send you a code to reset your password.',
        emailLabel: isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
        emailPlaceholder: isArabic ? 'أدخل بريدك الإلكتروني' : 'Enter your email',
        send: isArabic ? 'إرسال الرمز' : 'Send Code',
        sending: isArabic ? 'جارٍ الإرسال...' : 'Sending...',
        back: isArabic ? 'العودة لتسجيل الدخول' : 'Back to Sign In',
        successTitle: isArabic ? 'تم إرسال الرمز' : 'Code Sent',
        successBody: isArabic
            ? 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني.'
            : 'A reset code has been sent to your email.',
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            setIsSubmitted(true);
        } catch {
            // Always show success for security
            setIsSubmitted(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className={`flex min-h-screen ${isArabic ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Image side */}
                <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#c8e649]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="h-24 w-24 text-white/30" />
                    </div>
                </div>

                {/* Form side */}
                <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
                    <div className="w-full max-w-md">
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">{copy.title}</h1>
                        <p className="text-sm text-gray-500 mb-8">{copy.subtitle}</p>

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-900">{copy.emailLabel}</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        placeholder={copy.emailPlaceholder}
                                        dir="ltr"
                                        className="w-full h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-12 rounded-full bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {copy.sending}
                                        </>
                                    ) : (
                                        copy.send
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                                <p className="font-semibold mb-1">{copy.successTitle}</p>
                                <p>{copy.successBody}</p>
                            </div>
                        )}

                        <div className="mt-6 text-center">
                            <Link
                                href={withLocalePrefix('/login', locale)}
                                className="text-sm text-gray-500 hover:text-gray-700 transition"
                            >
                                {copy.back}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
