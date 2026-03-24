'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';

export default function StudentSupportPage() {
    const locale = useLocale();
    const isRTL = locale === 'ar';

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setSubject('');
        setMessage('');
    };

    return (
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {isRTL ? 'الدعم والمساعدة' : 'Support & Help'}
            </h1>

            <div className="card-soft p-6">
                {submitted ? (
                    <div className="text-center py-8">
                        <p className="text-lg font-semibold text-[var(--color-primary)]">
                            {isRTL ? 'تم إرسال رسالتك بنجاح!' : 'Your message has been sent successfully!'}
                        </p>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="mt-4 text-sm text-[var(--color-text-secondary)] underline"
                        >
                            {isRTL ? 'إرسال رسالة أخرى' : 'Send another message'}
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="support-subject"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                            >
                                {isRTL ? 'الموضوع' : 'Subject'}
                            </label>
                            <input
                                id="support-subject"
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                                placeholder={isRTL ? 'أدخل موضوع الرسالة' : 'Enter subject'}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="support-message"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
                            >
                                {isRTL ? 'الرسالة' : 'Message'}
                            </label>
                            <textarea
                                id="support-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                required
                                rows={5}
                                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
                                placeholder={isRTL ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-primary w-full"
                        >
                            {isRTL ? 'إرسال' : 'Send'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
