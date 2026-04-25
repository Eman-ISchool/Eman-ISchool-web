'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { withLocalePrefix } from '@/lib/locale-path';

interface ResetPasswordFormProps {
    locale: string;
    token: string | null;
}

export default function ResetPasswordForm({ locale, token }: ResetPasswordFormProps) {
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to reset password');

            setIsSuccess(true);
            setTimeout(() => router.push(withLocalePrefix('/login', locale)), 3000);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    // Invalid token state
    if (!token) {
        return (
            <div className="w-full max-w-md mx-auto px-4 py-8">
                <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-red-100/40">
                    <div className="relative overflow-hidden bg-linear-to-br from-red-500 to-rose-600 px-8 py-8 text-center text-white">
                        <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                        <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 mb-4">
                            <AlertCircle className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-xl font-extrabold">Invalid Link</h1>
                        <p className="text-red-100 text-sm mt-1">This password reset link is invalid or expired</p>
                    </div>
                    <div className="px-8 py-8">
                        <p className="text-gray-500 text-sm text-center mb-6">
                            Please request a new password reset link.
                        </p>
                        <Button
                            asChild
                            className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold transition-all hover:-translate-y-0.5"
                        >
                            <Link href={withLocalePrefix('/auth/forgot-password', locale)}>
                                Request New Link
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto px-4 py-8">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-teal-100/40">

                {/* Teal header strip */}
                <div className="relative overflow-hidden bg-linear-to-br from-teal-600 to-emerald-500 px-8 py-8 text-center text-white">
                    <div className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/10" />
                    <div className="relative inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                        <Lock className="h-7 w-7 text-white" />
                    </div>
                    <h1 className="text-xl font-extrabold">Reset Password</h1>
                    <p className="text-teal-100 text-sm mt-1">
                        Choose a strong new password
                    </p>
                </div>

                {/* Form / Success */}
                <div className="px-8 py-8">
                    {!isSuccess ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                    placeholder="Min. 6 characters"
                                    className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="confirmPassword" className="text-gray-700 font-medium text-sm">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    disabled={isLoading}
                                    placeholder="Repeat your password"
                                    className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isLoading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                                ) : (
                                    'Set New Password'
                                )}
                            </Button>
                        </form>
                    ) : (
                        /* Success state */
                        <div className="flex flex-col items-center text-center space-y-4 py-2">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <CheckCircle className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-lg text-gray-900">Password Updated!</h3>
                                <p className="text-gray-500 text-sm mt-1.5">
                                    Your password has been changed successfully.
                                    <br />Redirecting to sign in...
                                </p>
                            </div>
                            <div className="flex w-full items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500 shrink-0" />
                                <span className="text-xs text-emerald-600 font-medium">Redirecting in 3 seconds...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Back link */}
                {!isSuccess && (
                    <div className="border-t border-gray-100 px-8 py-4 text-center">
                        <Link
                            href={withLocalePrefix('/login', locale)}
                            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
