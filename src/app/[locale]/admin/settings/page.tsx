'use client';

import { useState } from 'react';
import {
    Settings as SettingsIcon,
    Users,
    Globe,
    Shield,
    Bell,
    Palette,
    Key,
    ChevronLeft,
} from 'lucide-react';

interface SettingsSection {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}

const settingsSections: SettingsSection[] = [
    {
        id: 'roles',
        icon: <Shield className="w-5 h-5" />,
        title: 'الأدوار والصلاحيات',
        description: 'إدارة أدوار المستخدمين وصلاحياتهم',
    },
    {
        id: 'users',
        icon: <Users className="w-5 h-5" />,
        title: 'إدارة المستخدمين',
        description: 'إضافة وتعديل حسابات المستخدمين',
    },
    {
        id: 'currency',
        icon: <Globe className="w-5 h-5" />,
        title: 'العملات وأسعار الصرف',
        description: 'إعداد العملات الأساسية وأسعار التحويل',
    },
    {
        id: 'notifications',
        icon: <Bell className="w-5 h-5" />,
        title: 'الإشعارات',
        description: 'إعدادات الإشعارات والتنبيهات',
    },
    {
        id: 'appearance',
        icon: <Palette className="w-5 h-5" />,
        title: 'المظهر',
        description: 'تخصيص ألوان وشعار المنصة',
    },
    {
        id: 'integrations',
        icon: <Key className="w-5 h-5" />,
        title: 'التكاملات',
        description: 'Google Meet, Stripe, وخدمات أخرى',
    },
];

function RolesSettings() {
    const roles = [
        { id: 'admin', name: 'مدير', description: 'صلاحيات كاملة', users: 2 },
        { id: 'manager', name: 'مدير تعليمي', description: 'إدارة الفصول والدروس', users: 3 },
        { id: 'teacher', name: 'معلم', description: 'إدارة الدروس والطلاب', users: 15 },
        { id: 'finance', name: 'مالي', description: 'إدارة الرسوم والمصروفات', users: 2 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">الأدوار</h3>
                <button className="admin-btn admin-btn-primary text-sm">
                    إضافة دور جديد
                </button>
            </div>
            <div className="space-y-3">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-teal-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{role.name}</p>
                                <p className="text-sm text-gray-500">{role.description}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-500">{role.users} مستخدم</span>
                            <ChevronLeft className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CurrencySettings() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">العملة الأساسية</h3>
                <div className="admin-card p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center text-2xl">
                                🇪🇬
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">الجنيه المصري (EGP)</p>
                                <p className="text-sm text-gray-500">العملة الأساسية للنظام</p>
                            </div>
                        </div>
                        <span className="admin-badge admin-badge-success">نشط</span>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">أسعار الصرف</h3>
                <div className="space-y-3">
                    <div className="admin-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🇦🇪</span>
                            <div>
                                <p className="font-medium text-gray-800">الدرهم الإماراتي (AED)</p>
                                <p className="text-sm text-gray-500">1 AED = 13.5 EGP</p>
                            </div>
                        </div>
                        <button className="admin-btn admin-btn-ghost text-sm">تحديث</button>
                    </div>
                    <div className="admin-card p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🇺🇸</span>
                            <div>
                                <p className="font-medium text-gray-800">الدولار الأمريكي (USD)</p>
                                <p className="text-sm text-gray-500">1 USD = 50.5 EGP</p>
                            </div>
                        </div>
                        <button className="admin-btn admin-btn-ghost text-sm">تحديث</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function IntegrationsSettings() {
    const integrations = [
        { id: 'google', name: 'Google Meet', status: 'connected', icon: '🔗' },
        { id: 'stripe', name: 'Stripe', status: 'pending', icon: '💳' },
        { id: 'sms', name: 'SMS Gateway', status: 'connected', icon: '📱' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">التكاملات</h3>
            <div className="space-y-3">
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className="admin-card p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{integration.icon}</span>
                            <div>
                                <p className="font-medium text-gray-800">{integration.name}</p>
                                <p className="text-sm text-gray-500">
                                    {integration.status === 'connected' ? 'متصل' : 'في انتظار الإعداد'}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`admin-badge ${integration.status === 'connected'
                                    ? 'admin-badge-success'
                                    : 'admin-badge-warning'
                                }`}
                        >
                            {integration.status === 'connected' ? 'متصل' : 'معلق'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState('roles');

    const renderContent = () => {
        switch (activeSection) {
            case 'roles':
                return <RolesSettings />;
            case 'currency':
                return <CurrencySettings />;
            case 'integrations':
                return <IntegrationsSettings />;
            default:
                return (
                    <div className="text-center py-12 text-gray-500">
                        قسم الإعدادات قيد التطوير
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">الإعدادات</h1>
                <p className="text-gray-500">إعدادات النظام والتكوين</p>
            </div>

            <div className="grid lg:grid-cols-4 gap-6">
                {/* Settings Menu */}
                <div className="lg:col-span-1">
                    <div className="admin-card p-2">
                        {settingsSections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg text-end transition-colors ${activeSection === section.id
                                        ? 'bg-teal-50 text-teal-700'
                                        : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeSection === section.id
                                            ? 'bg-teal-100 text-teal-600'
                                            : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {section.icon}
                                </div>
                                <div className="flex-1 text-start">
                                    <p className="font-medium">{section.title}</p>
                                    <p className="text-xs text-gray-500">{section.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Settings Content */}
                <div className="lg:col-span-3">
                    <div className="admin-card p-6">{renderContent()}</div>
                </div>
            </div>
        </div>
    );
}
