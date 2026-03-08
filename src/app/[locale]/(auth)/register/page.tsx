'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from "next/link";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { withLocalePrefix } from '@/lib/locale-path';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import {
    Loader2,
    GraduationCap,
    AlertCircle,
    BookOpen,
    Users,
    TrendingUp,
    ArrowLeft,
} from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const t = useTranslations('auth.register');
    const locale = useLocale();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        consentGiven: false,
    });

    const isArabic = locale === 'ar';

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signIn('google', { callbackUrl: withLocalePrefix('/dashboard', locale) });
        } catch {
            setError(t('error'));
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, type, checked, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    consentGiven: formData.consentGiven,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || t('error'));

            router.push(withLocalePrefix('/login?registered=true', locale));
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const features = isArabic ? [
        { icon: BookOpen,    text: 'دورات تعليمية متنوعة في جميع المواد' },
        { icon: TrendingUp,  text: 'تتبع أداؤك وتقدمك الدراسي' },
        { icon: Users,       text: 'تواصل مباشر مع المعلمين والزملاء' },
    ] : [
        { icon: BookOpen,    text: 'Diverse courses across all subjects' },
        { icon: TrendingUp,  text: 'Track your progress and performance' },
        { icon: Users,       text: 'Connect directly with teachers' },
    ];

    return (
        <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-3xl shadow-2xl shadow-teal-100/40 md:grid md:grid-cols-[2fr_3fr]">

            {/* ── Left: Brand Panel (desktop only) ─────────────────── */}
            <div className="relative hidden md:flex flex-col justify-center overflow-hidden bg-linear-to-br from-emerald-500 via-teal-600 to-teal-700 p-10 text-white">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute top-1/2 left-1/4 h-10 w-10 rounded-full bg-white/10" />

                {/* Logo */}
                <div className="relative mb-8 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                        <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-extrabold tracking-wide">Eduverse</span>
                </div>

                <h2 className="text-2xl font-extrabold leading-snug mb-2">
                    {isArabic ? 'انضم إلى مجتمعنا\nالتعليمي' : 'Join our learning\ncommunity'}
                </h2>
                <p className="text-sm text-white/70 mb-8">
                    {isArabic ? 'أنشئ حسابك وابدأ رحلتك التعليمية اليوم' : 'Create your account and start learning today'}
                </p>

                {/* Feature list */}
                <ul className="space-y-4">
                    {features.map(({ icon: Icon, text }) => (
                        <li key={text} className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <Icon className="h-3.5 w-3.5 text-white" />
                            </div>
                            <span className="text-sm text-white/85 leading-snug">{text}</span>
                        </li>
                    ))}
                </ul>

                {/* Bottom platform badge */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <span className="text-xs font-medium text-white/40 tracking-widest uppercase">
                        Eduverse Platform
                    </span>
                </div>
            </div>

            {/* ── Right: Form ───────────────────────────────────────── */}
            <div className="bg-white px-8 py-10 overflow-y-auto max-h-[90dvh] md:max-h-none">

                {/* Mobile-only header */}
                <div className="md:hidden mb-6 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-emerald-500 to-teal-600 mb-3">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{t('title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>

                {/* Desktop header */}
                <div className="hidden md:block mb-6">
                    <h2 className="text-xl font-extrabold text-gray-900">{t('title')}</h2>
                    <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Google sign-up */}
                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all hover:border-gray-300"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <svg className="ml-2 h-4 w-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                    )}
                    {t('googleBtn')}
                </Button>

                {/* Divider */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">{t('or')}</span>
                    </div>
                </div>

                {/* Registration form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="fullName" className="text-gray-700 font-medium text-sm">
                            {t('fullName')}
                        </Label>
                        <Input
                            id="fullName"
                            placeholder={t('placeholder.fullName')}
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            dir={isArabic ? 'rtl' : 'ltr'}
                            className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-gray-700 font-medium text-sm">
                            {t('email')}
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder={t('placeholder.email')}
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            dir="ltr"
                            className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                            {t('password')}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                            disabled={isLoading}
                            className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-gray-700 font-medium text-sm">
                            {t('phone')}
                        </Label>
                        <Input
                            id="phone"
                            placeholder={t('placeholder.phone')}
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={isLoading}
                            dir="ltr"
                            className="h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all"
                        />
                    </div>

                    {/* Consent */}
                    <div className="flex items-start gap-3 pt-1">
                        <input
                            id="consentGiven"
                            type="checkbox"
                            checked={formData.consentGiven}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="mt-1 h-4 w-4 shrink-0 rounded border-gray-300 accent-teal-600 cursor-pointer"
                        />
                        <Label
                            htmlFor="consentGiven"
                            className="text-sm font-normal text-gray-600 leading-snug cursor-pointer"
                        >
                            {t('consentLabel')}
                        </Label>
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        disabled={isLoading || !formData.consentGiven}
                        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                        {isLoading ? (
                            <><Loader2 className="ml-2 h-4 w-4 animate-spin" />{t('googleLoading')}</>
                        ) : (
                            t('submit')
                        )}
                    </Button>
                </form>

                {/* Sign-in link */}
                <div className="mt-6 flex flex-col items-center gap-3">
                    <p className="text-sm text-gray-500">
                        {t('hasAccount')}{' '}
                        <Link
                            href={withLocalePrefix('/login', locale)}
                            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                        >
                            {t('login')}
                        </Link>
                    </p>
                    <Link
                        href={withLocalePrefix('/login', locale)}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        {isArabic ? 'العودة لاختيار نوع الحساب' : 'Back to role selection'}
                    </Link>
                </div>
            </div>
        </div>
    );
}
