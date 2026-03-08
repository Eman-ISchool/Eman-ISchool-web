'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Mail, AlertCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { withLocalePrefix } from '@/lib/locale-path';

export default function ForgotPasswordPage({ params: { locale } }: { params: { locale: string } }) {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            // Always show success for security
            setIsSubmitted(true);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto px-4 py-8">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-teal-100/40">

                {/* ── Teal header strip ─────────────────────────────── */}
                <div className="relative overflow-hidden bg-linear-to-br from-teal-600 to-emerald-500 px-8 py-8 text-center text-white">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/10" />
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                        <Mail className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-xl font-extrabold">Forgot Password</h1>
                    <p className="text-teal-100 text-sm mt-1">
                        Enter your email to receive a reset link
                    </p>
                </div>

                {/* ── Form / Success ────────────────────────────────── */}
                <div className="px-8 py-8">
                    {!isSubmitted ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    placeholder="name@example.com"
                                    dir="ltr"
                                    className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                                ) : (
                                    <><Send className="mr-2 h-4 w-4" /> Send Reset Link</>
                                )}
                            </Button>
                        </form>
                    ) : (
                        /* Success state */
                        <div className="flex flex-col items-center text-center space-y-4 py-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <Mail className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-lg text-gray-900">Check your email</h3>
                                <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
                                    If an account exists for <span className="font-semibold text-gray-700">{email}</span>, we've sent a password reset link.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-11 border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                onClick={() => { setIsSubmitted(false); setEmail(''); }}
                            >
                                Try another email
                            </Button>
                        </div>
                    )}
                </div>

                {/* ── Back link ─────────────────────────────────────── */}
                <div className="border-t border-gray-100 px-8 py-4 text-center">
                    <Link
                        href={withLocalePrefix('/login', locale)}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
