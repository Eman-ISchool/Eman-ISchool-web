"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, LogOut, User, LayoutDashboard } from 'lucide-react';

import { useCartStore } from '@/lib/store';
import { ShoppingCart } from 'lucide-react';

export function Header() {
    const { data: session, status } = useSession();
    const cartItems = useCartStore((state) => state.items);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const router = useRouter();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const q = formData.get('q');
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q.toString())}`);
            setIsMenuOpen(false);
        }
    };

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/' });
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white text-gray-900 shadow-sm transition-all duration-300">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity">
                    <span className="text-brand-primary">Eman</span>-Academy
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/" className="hover:text-brand-primary transition-colors hover:translate-y-[-1px] transform duration-200">الرئيسية</Link>
                    <Link href="/about-us" className="hover:text-brand-primary transition-colors hover:translate-y-[-1px] transform duration-200">من نحن</Link>
                    <Link href="/product/by-subject" className="hover:text-brand-primary transition-colors hover:translate-y-[-1px] transform duration-200">المواد الدراسية</Link>
                    <div className="group relative">
                        <button className="flex items-center gap-1 hover:text-brand-primary transition-colors py-2 focus:outline-none">
                            ادرس معنا
                        </button>
                        {/* Simple Dropdown using group-hover */}
                        <div className="absolute top-full right-0 mt-0 w-52 bg-white border border-gray-100 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
                            <div className="flex flex-col py-2">
                                <Link href="/national-school" className="px-4 py-2 hover:bg-gray-50 hover:text-brand-primary text-right">تعليم عام (لغات)</Link>
                                <Link href="/al-azhar-school" className="px-4 py-2 hover:bg-gray-50 hover:text-brand-primary text-right">تعليم أزهري</Link>
                                <Link href="/vr-eduverse" className="px-4 py-2 hover:bg-gray-50 hover:text-brand-primary text-right">تجربة VR التعليمية ✨</Link>
                                <div className="border-t border-gray-100 my-1"></div>
                                <Link href="/exam-simulation" className="px-4 py-2 hover:bg-gray-50 hover:text-brand-primary text-right">محاكاة الامتحانات</Link>
                                <Link href="/parent-dashboard" className="px-4 py-2 hover:bg-gray-50 hover:text-brand-primary text-right">لوحة ولي الأمر</Link>
                            </div>
                        </div>
                    </div>
                    <Link href="/blogs" className="hover:text-brand-primary transition-colors hover:translate-y-[-1px] transform duration-200">المدونة</Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    {/* Search Bar - Desktop */}
                    <form onSubmit={handleSearch} className="hidden lg:block relative group">
                        <input
                            type="text"
                            name="q"
                            placeholder="ابحث عن كورس..."
                            className="pl-4 pr-10 py-1.5 rounded-full border border-gray-200 text-sm focus:border-brand-primary focus:outline-none w-48 transition-all focus:w-64 bg-gray-50 focus:bg-white"
                        />
                        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </button>
                    </form>

                    <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group">
                        <ShoppingCart className="w-5 h-5 group-hover:text-brand-primary transition-colors" />
                        {cartItems.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-brand-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full animate-bounce">
                                {cartItems.length}
                            </span>
                        )}
                    </Link>

                    {/* User Auth Section */}
                    {status === 'loading' ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                    ) : session ? (
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pr-3 transition-colors"
                            >
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                                        <User className="w-4 h-4 text-black" />
                                    </div>
                                )}
                                <span className="hidden md:block text-sm font-medium max-w-24 truncate">
                                    {session.user?.name?.split(' ')[0]}
                                </span>
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg py-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <Link
                                        href="/dashboard"
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-right"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        لوحة التحكم
                                    </Link>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600 w-full text-right"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link href="/login" className="hidden md:inline-flex px-4 py-2 rounded-md bg-brand-primary text-black font-semibold hover:bg-brand-primary-hover hover:scale-105 transition-all shadow-sm">
                            سجل الآن
                        </Link>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 top-16 shadow-lg animate-in slide-in-from-top-5 fade-in duration-200">
                    <nav className="flex flex-col p-4 space-y-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                name="q"
                                placeholder="ابحث..."
                                className="w-full px-4 py-2 rounded-md border border-gray-200 focus:border-brand-primary focus:outline-none"
                            />
                        </form>
                        <Link href="/" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
                        <Link href="/about-us" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>من نحن</Link>
                        <Link href="/product/by-subject" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>المواد الدراسية</Link>
                        <Link href="/national-school" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>تعليم عام</Link>
                        <Link href="/al-azhar-school" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>تعليم أزهري</Link>
                        <Link href="/vr-eduverse" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>تجربة VR ✨</Link>
                        <div className="border-t border-gray-100 my-2"></div>
                        <Link href="/exam-simulation" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>محاكاة الامتحانات</Link>
                        <Link href="/parent-dashboard" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>لوحة ولي الأمر</Link>
                        <Link href="/blogs" className="px-2 py-1 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>المدونة</Link>

                        {/* Mobile Auth Section */}
                        <div className="pt-2 border-t border-gray-100">
                            {session ? (
                                <div className="space-y-2">
                                    <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 hover:text-brand-primary font-medium" onClick={() => setIsMenuOpen(false)}>
                                        <LayoutDashboard className="w-4 h-4" />
                                        لوحة التحكم
                                    </Link>
                                    <button
                                        onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                        className="flex items-center gap-2 px-2 py-2 text-red-600 font-medium w-full"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        تسجيل الخروج
                                    </button>
                                </div>
                            ) : (
                                <Link href="/login" className="block w-full text-center px-4 py-2 rounded-md bg-brand-primary text-black font-bold" onClick={() => setIsMenuOpen(false)}>
                                    سجل الآن
                                </Link>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
