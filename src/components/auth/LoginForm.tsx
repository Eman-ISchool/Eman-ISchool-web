'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCountryInput } from '@/components/auth/PhoneCountryInput';
import Link from 'next/link';
import {
    Lock,
    Loader2,
    Eye,
    EyeOff,
    ShieldCheck,
    BookOpen,
    GraduationCap,
    ArrowLeft,
    AlertCircle,
    type LucideIcon,
} from 'lucide-react';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface LoginFormProps {
    role: 'admin' | 'teacher' | 'student';
    title: string;
    description: string;
}

const ROLE_CONFIG: Record<string, {
    icon: LucideIcon;
    gradient: string;
    accent: string;
}> = {
    admin: {
        icon: ShieldCheck,
        gradient: 'from-slate-700 to-slate-900',
        accent: 'focus-visible:ring-slate-400',
    },
    teacher: {
        icon: BookOpen,
        gradient: 'from-teal-600 to-teal-800',
        accent: 'focus-visible:ring-teal-400',
    },
    student: {
        icon: GraduationCap,
        gradient: 'from-emerald-500 to-teal-700',
        accent: 'focus-visible:ring-emerald-400',
    },
};

export default function LoginForm({ role, title, description }: LoginFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const toLocale = (href: string) => withLocalePrefix(href, locale);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countryCode, setCountryCode] = useState('962');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);

    const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.student;
    const RoleIcon = config.icon;

    const validateForm = (): boolean => {
        let isValid = true;
        setPhoneError(null);
        setPasswordError(null);

        if (!phone.trim()) {
            setPhoneError('يرجى إدخال رقم الهاتف');
            isValid = false;
        } else if (phone.replace(/\s/g, '').length < 9) {
            setPhoneError('رقم الهاتف قصير جداً');
            isValid = false;
        }

        if (!password) {
            setPasswordError('يرجى إدخال كلمة المرور');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                phone: `+${countryCode}${phone.replace(/\s/g, '')}`,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('بيانات الدخول غير صحيحة');
            } else {
                const session = await getSession();
                const userRole = (session?.user as any)?.role;
                const redirectUrl = (() => {
                    switch (userRole) {
                        case 'admin':    return '/admin';
                        case 'teacher':  return '/teacher/home';
                        case 'student':  return '/student/home';
                        case 'parent':   return '/parent-dashboard';
                        default:         return '/dashboard';
                    }
                })();
                router.push(toLocale(redirectUrl));
                router.refresh();
            }
        } catch {
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/api/auth/role-redirect' });
        } catch {
            setError('حدث خطأ أثناء الاتصال بـ Google.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-3xl shadow-2xl shadow-teal-100/40 md:grid md:grid-cols-[2fr_3fr]">

            {/* ── Left: Brand Panel (desktop only) ─────────────────── */}
            <div className={`relative hidden md:flex flex-col items-center justify-center overflow-hidden bg-linear-to-br ${config.gradient} p-10 text-white`}>
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute top-1/3 left-1/3 h-10 w-10 rounded-full bg-white/10" />

                {/* Role icon */}
                <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                    <RoleIcon className="h-8 w-8 text-white" />
                </div>

                <h2 className="text-xl font-extrabold text-center leading-snug">{title}</h2>
                <p className="mt-2 text-sm text-white/70 text-center leading-relaxed">{description}</p>

                {/* Platform badge */}
                <div className="absolute bottom-6 flex items-center gap-1.5 opacity-50">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span className="text-xs font-bold tracking-wide">Eduverse</span>
                </div>
            </div>

            {/* ── Right: Form ───────────────────────────────────────── */}
            <div className="bg-white px-8 py-10">
                {/* Mobile-only header */}
                <div className="md:hidden mb-6 text-center">
                    <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br ${config.gradient} mb-3`}>
                        <RoleIcon className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 flex items-start gap-2.5 rounded-xl bg-red-50 border border-red-100 p-3.5 text-sm text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4" data-testid={`login-form-${role}`}>
                    {/* Phone */}
                    <PhoneCountryInput
                        countryCode={countryCode}
                        locale={locale}
                        onCountryCodeChange={setCountryCode}
                        onPhoneChange={setPhone}
                        phone={phone}
                        disabled={isLoading}
                        label="رقم الهاتف"
                        required
                        error={phoneError}
                    />

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-gray-700 font-medium text-sm">
                                كلمة المرور
                            </Label>
                            <Link
                                href={toLocale('/auth/forgot-password')}
                                className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
                            >
                                نسيت كلمة المرور؟
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordError(null);
                                }}
                                required
                                disabled={isLoading}
                                data-testid="login-password-input"
                                className={`ps-10 h-11 border-gray-200 focus-visible:border-teal-500 focus-visible:ring-teal-200 transition-all ${
                                    passwordError ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-100' : ''
                                }`}
                                aria-invalid={!!passwordError}
                                aria-describedby={passwordError ? 'password-error' : undefined}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {passwordError && (
                            <p id="password-error" className="text-sm text-red-500" role="alert">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <Button
                        type="submit"
                        data-testid="login-submit-button"
                        disabled={isLoading}
                        className="w-full h-11 bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-lg shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {isLoading ? (
                            <><Loader2 className="ms-2 h-4 w-4 animate-spin" /> جاري التحقق...</>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </Button>
                </form>

                {/* Divider */}
                <div className="relative my-5">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">أو</span>
                    </div>
                </div>

                {/* Google */}
                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-all hover:border-gray-300"
                >
                    <svg className="ms-2 h-4 w-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    المتابعة بـ Google
                </Button>

                {/* Back link */}
                <div className="mt-6 text-center">
                    <Link
                        href={toLocale('/login')}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        العودة لاختيار نوع الحساب
                    </Link>
                </div>
            </div>
        </div>
    );
}
