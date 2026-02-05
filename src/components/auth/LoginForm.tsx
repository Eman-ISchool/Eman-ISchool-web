'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Link from 'next/link';
import { Mail, Lock, Loader2, Chrome } from 'lucide-react'; // Assuming lucide-react is installed
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface LoginFormProps {
    role: 'admin' | 'teacher' | 'student';
    title: string;
    description: string;
}

export default function LoginForm({ role, title, description }: LoginFormProps) {
    const router = useRouter();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);
    const toLocale = (href: string) => withLocalePrefix(href, locale);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.');
            } else {
                // Get the updated session to check the user's role
                const session = await getSession();
                const userRole = (session?.user as any)?.role;
                const redirectUrl = (() => {
                    switch (userRole) {
                        case 'admin':
                            return '/admin';
                        case 'teacher':
                            return '/teacher/home';
                        case 'student':
                            return '/student/home';
                        case 'parent':
                            return '/parent-dashboard';
                        default:
                            return '/dashboard';
                    }
                })();
                const localizedRedirect = toLocale(redirectUrl);
                router.push(localizedRedirect);
                router.refresh();
            }
        } catch (err) {
            setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        try {
            // For Google sign-in, we use a callback URL that will handle role-based redirect
            // The middleware or a callback page will handle the proper redirect
            await signIn('google', { callbackUrl: '/api/auth/role-redirect' });
        } catch (err) {
            setError('حدث خطأ أثناء الاتصال بـ Google.');
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto border-0 shadow-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl ring-1 ring-gray-200 dark:ring-zinc-800">
            <CardHeader className="space-y-2 text-center pb-8">
                <div className="w-12 h-12 bg-brand-primary rounded-xl mx-auto mb-4 flex items-center justify-center transform rotate-3 shadow-lg">
                    <Lock className="w-6 h-6 text-black" />
                </div>
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                    {title}
                </CardTitle>
                <CardDescription className="text-gray-500 dark:text-gray-400 text-base">
                    {description}
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid gap-5" data-testid={`login-form-${role}`}>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">البريد الإلكتروني</Label>
                        <div className="relative group">
                            <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                data-testid="login-email-input"
                                className="pr-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 h-11 transition-all"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">كلمة المرور</Label>
                        </div>
                        <div className="relative group">
                            <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400 group-focus-within:text-brand-primary transition-colors" />
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                                data-testid="login-password-input"
                                className="pr-10 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 focus:border-brand-primary focus:ring-brand-primary/20 h-11 transition-all"
                            />
                        </div>
                    </div>
                    <Button
                        type="submit"
                        data-testid="login-submit-button"
                        className="w-full bg-brand-primary hover:bg-brand-primary-hover text-black font-bold h-11 shadow-lg shadow-brand-primary/20 hover:shadow-brand-primary/40 transition-all transform hover:-translate-y-0.5"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <><Loader2 className="ml-2 h-4 w-4 animate-spin" /> جاري التحقق...</>
                        ) : (
                            'تسجيل الدخول'
                        )}
                    </Button>
                </form>

                <div className="relative my-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200 dark:border-zinc-800" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-zinc-950 px-4 text-gray-500 dark:text-gray-400 font-medium">أو المتابعة باستخدام</span>
                    </div>
                </div>

                <Button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-zinc-800 font-medium h-11 transition-all hover:border-gray-300 dark:hover:border-zinc-700"
                >
                    <svg className="ml-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.04-3.71 1.04-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Google
                </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-4 pb-8">
                <div className="text-center text-sm">
                    <Link href={toLocale('/login')} className="text-gray-500 hover:text-brand-primary dark:text-gray-400 dark:hover:text-brand-primary transition-colors flex items-center justify-center gap-1">
                        <span>←</span>
                        <span>العودة لاختيار نوع الحساب</span>
                    </Link>
                </div>
            </CardFooter>
        </Card>
    );
}
