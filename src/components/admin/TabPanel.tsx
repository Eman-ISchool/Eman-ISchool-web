'use client';

import { ReactNode } from 'react';

export interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
    badge?: string | number;
}

interface TabPanelProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    children: ReactNode;
    className?: string;
    variant?: 'default' | 'pills' | 'underline';
    size?: 'sm' | 'md' | 'lg';
}

export default function TabPanel({
    tabs,
    activeTab,
    onTabChange,
    children,
    className = '',
    variant = 'default',
    size = 'md',
}: TabPanelProps) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-5 py-2.5 text-base',
    };

    const variantClasses = {
        default: {
            container: 'border-b border-gray-200 dark:border-gray-700',
            tab: `border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-900 dark:data-[state=active]:border-blue-500 dark:data-[state=active]:text-blue-500 dark:hover:text-white`,
            tabActive: 'text-blue-600 dark:text-blue-500',
            tabInactive: 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
        },
        pills: {
            container: 'gap-2',
            tab: `rounded-full border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:data-[state=active]:bg-blue-600 dark:data-[state=active]:border-blue-600 dark:data-[state=active]:text-white dark:hover:bg-gray-800`,
            tabActive: 'bg-blue-600 border-blue-600 text-white',
            tabInactive: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-100 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800',
        },
        underline: {
            container: 'border-b border-gray-200 dark:border-gray-700',
            tab: `border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 hover:text-gray-900 dark:data-[state=active]:border-blue-500 dark:data-[state=active]:text-blue-500 dark:hover:text-white`,
            tabActive: 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500',
            tabInactive: 'border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
        },
    };

    return (
        <div className={className}>
            {/* Tab Navigation */}
            <div className={`flex ${variantClasses[variant].container} ${variant === 'pills' ? '' : 'gap-1'}`}>
                {tabs.map((tab) => {
                    const isActive = tab.id === activeTab;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => !tab.disabled && onTabChange(tab.id)}
                            disabled={tab.disabled}
                            className={`flex items-center gap-2 font-medium transition-all duration-200 ${sizeClasses[size]} ${
                                isActive
                                    ? variantClasses[variant].tabActive
                                    : variantClasses[variant].tabInactive
                            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            data-state={isActive ? 'active' : 'inactive'}
                            aria-selected={isActive}
                            role="tab"
                        >
                            {tab.icon && (
                                <span className="flex items-center">
                                    {tab.icon}
                                </span>
                            )}
                            <span>{tab.label}</span>
                            {tab.badge && (
                                <span className="ms-1.5 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {children}
            </div>
        </div>
    );
}

// Tab Content Component
export interface TabContentProps {
    value: string;
    activeTab: string;
    children: ReactNode;
    className?: string;
}

export function TabContent({ value, activeTab, children, className = '' }: TabContentProps) {
    if (value !== activeTab) return null;

    return (
        <div className={className} role="tabpanel" aria-labelledby={`tab-${value}`}>
            {children}
        </div>
    );
}
