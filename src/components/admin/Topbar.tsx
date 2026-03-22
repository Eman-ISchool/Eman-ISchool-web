'use client';

import { ReactNode, useState } from 'react';
import { Bell, Search, User, ChevronDown, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

interface TopbarProps {
    title?: string;
    subtitle?: string;
    actions?: ReactNode;
    onSearch?: (query: string) => void;
    showSearch?: boolean;
    showNotifications?: boolean;
    showUserMenu?: boolean;
}

export default function Topbar({
    title,
    subtitle,
    actions,
    onSearch,
    showSearch = true,
    showNotifications = true,
    showUserMenu = true,
}: TopbarProps) {
    const { data: session } = useSession();
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch?.(searchQuery);
    };

    return (
        <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div className="flex h-16 items-center justify-between px-4 md:px-6">
                {/* Left Side - Title & Subtitle */}
                <div className="flex items-center gap-4">
                    {(title || subtitle) && (
                        <div className="hidden md:block">
                            {title && (
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {title}
                                </h1>
                            )}
                            {subtitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Center - Search Bar */}
                {showSearch && onSearch && (
                    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
                        <div className="relative w-full">
                            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 rtl:right-auto rtl:left-3" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="بحث..."
                                className="h-9 w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white rtl:pl-4 rtl:pr-10"
                                dir="rtl"
                            />
                        </div>
                    </form>
                )}

                {/* Right Side - Actions */}
                <div className="flex items-center gap-2">
                    {/* Custom Actions */}
                    {actions}

                    {/* Notifications */}
                    {showNotifications && (
                        <button className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
                            <Bell className="h-5 w-5" />
                            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 rtl:right-auto rtl:left-1" />
                        </button>
                    )}

                    {/* User Menu */}
                    {showUserMenu && session?.user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold">
                                    {session.user.name?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                            </button>

                            {showUserDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 rtl:right-auto rtl:left-0">
                                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {session.user.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {session.user.email}
                                        </p>
                                    </div>
                                    <div className="p-1">
                                        <Link
                                            href="/dashboard/profile"
                                            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                            onClick={() => setShowUserDropdown(false)}
                                        >
                                            <User className="h-4 w-4" />
                                            <span>الملف الشخصي</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: '/login' });
                                                setShowUserDropdown(false);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span>تسجيل الخروج</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
