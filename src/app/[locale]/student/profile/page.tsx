'use client';

import { useState, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    User, Edit, Globe, CreditCard, GraduationCap,
    FileText, ClipboardList, Settings, LogOut,
    ChevronRight, Camera, Check
} from 'lucide-react';

interface ProfileSection {
    id: string;
    title: string;
    icon: React.ReactNode;
    description?: string;
    action?: () => void;
}

export default function StudentProfilePage() {
    const { data: session } = useSession();
    const [language, setLanguage] = useState<'en' | 'ar'>('en');
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('Profile photo selected:', file.name);
        }
    };

    const toggleLanguage = () => {
        const newLang = language === 'en' ? 'ar' : 'en';
        setLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/auth/signin' });
    };

    const profileSections: ProfileSection[] = [
        {
            id: 'edit',
            title: 'Update Profile',
            icon: <Edit className="w-5 h-5" />,
            description: 'Edit your personal information',
            action: () => setActiveModal('edit'),
        },
        {
            id: 'language',
            title: 'Language',
            icon: <Globe className="w-5 h-5" />,
            description: language === 'en' ? 'English' : 'العربية',
            action: toggleLanguage,
        },
        {
            id: 'fees',
            title: 'Pay Fees',
            icon: <CreditCard className="w-5 h-5" />,
            description: 'View and pay outstanding fees',
            action: () => setActiveModal('fees'),
        },
        {
            id: 'class',
            title: 'My Class',
            icon: <GraduationCap className="w-5 h-5" />,
            description: 'Grade 10 - Section A',
            action: () => setActiveModal('class'),
        },
        {
            id: 'certificates',
            title: 'Certificates',
            icon: <FileText className="w-5 h-5" />,
            description: 'Download your certificates',
            action: () => setActiveModal('certificates'),
        },
        {
            id: 'exams',
            title: 'Exams & Results',
            icon: <ClipboardList className="w-5 h-5" />,
            description: 'View exam schedule and results',
            action: () => setActiveModal('exams'),
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: <Settings className="w-5 h-5" />,
            description: 'Notifications, privacy, and more',
            action: () => setActiveModal('settings'),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="card-soft p-6">
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'Profile'}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 text-[var(--color-primary)]" />
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-lg"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                            {session?.user?.name || 'Student Name'}
                        </h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {session?.user?.email || 'student@email.com'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full">
                                Grade 10
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                ID: STU-2024-001
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Sections */}
            <div className="space-y-2">
                {profileSections.map((section) => (
                    <button
                        key={section.id}
                        onClick={section.action}
                        className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow"
                    >
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                            {section.icon}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-medium text-[var(--color-text-primary)]">{section.title}</h3>
                            {section.description && (
                                <p className="text-sm text-[var(--color-text-secondary)]">{section.description}</p>
                            )}
                        </div>
                        {section.id === 'language' ? (
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${language === 'en' ? 'font-bold text-[var(--color-primary)]' : ''}`}>EN</span>
                                <div className="w-10 h-5 bg-[var(--color-primary-light)] rounded-full relative cursor-pointer">
                                    <div className={`w-4 h-4 bg-[var(--color-primary)] rounded-full absolute top-0.5 transition-all ${language === 'ar' ? 'right-0.5' : 'left-0.5'}`} />
                                </div>
                                <span className={`text-sm ${language === 'ar' ? 'font-bold text-[var(--color-primary)]' : ''}`}>ع</span>
                            </div>
                        ) : (
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                    </button>
                ))}

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow group"
                >
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-red-500">Logout</h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">Sign out of your account</p>
                    </div>
                </button>
            </div>

            {/* Modals would go here - keeping it simple for now */}
            {activeModal === 'fees' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-soft p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Pay Fees</h2>
                            <button onClick={() => setActiveModal(null)}>&times;</button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-[var(--color-bg-soft)] rounded-lg">
                                <p className="text-sm text-[var(--color-text-secondary)]">Outstanding Balance</p>
                                <p className="text-2xl font-bold text-[var(--color-primary)]">$1,250.00</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Tuition Fee (Term 2)</span>
                                    <span className="font-medium">$1,000.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Lab Fee</span>
                                    <span className="font-medium">$150.00</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Activity Fee</span>
                                    <span className="font-medium">$100.00</span>
                                </div>
                            </div>

                            <button className="btn-primary w-full">
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'exams' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-soft p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Exams & Results</h2>
                            <button onClick={() => setActiveModal(null)}>&times;</button>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium text-[var(--color-text-primary)]">Upcoming Exams</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-[var(--color-bg-soft)] rounded-lg">
                                    <p className="font-medium">Mathematics Mid-term</p>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Jan 20, 2026 • 9:00 AM</p>
                                </div>
                                <div className="p-3 bg-[var(--color-bg-soft)] rounded-lg">
                                    <p className="font-medium">Science Quiz</p>
                                    <p className="text-sm text-[var(--color-text-secondary)]">Jan 22, 2026 • 10:00 AM</p>
                                </div>
                            </div>

                            <h3 className="font-medium text-[var(--color-text-primary)] mt-6">Recent Results</h3>
                            <div className="space-y-2">
                                <div className="p-3 bg-[var(--color-bg-soft)] rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">English Essay</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Dec 15, 2025</p>
                                    </div>
                                    <span className="text-lg font-bold text-[var(--color-primary)]">A</span>
                                </div>
                                <div className="p-3 bg-[var(--color-bg-soft)] rounded-lg flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Math Chapter 4 Test</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Dec 10, 2025</p>
                                    </div>
                                    <span className="text-lg font-bold text-[var(--color-primary)]">85%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeModal === 'certificates' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-soft p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Certificates</h2>
                            <button onClick={() => setActiveModal(null)}>&times;</button>
                        </div>

                        <div className="space-y-3">
                            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                                    <div>
                                        <p className="font-medium">Academic Excellence 2024</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Issued Dec 2024</p>
                                    </div>
                                </div>
                                <button className="text-[var(--color-primary)] text-sm font-medium">Download</button>
                            </div>
                            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-[var(--color-primary)]" />
                                    <div>
                                        <p className="font-medium">Science Fair Winner</p>
                                        <p className="text-sm text-[var(--color-text-secondary)]">Issued Oct 2024</p>
                                    </div>
                                </div>
                                <button className="text-[var(--color-primary)] text-sm font-medium">Download</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
