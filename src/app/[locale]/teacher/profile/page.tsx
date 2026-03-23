'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Edit, Globe, GraduationCap, BookOpen, Settings, LogOut, ChevronRight, Camera } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TeacherProfilePage() {
    const { data: session } = useSession();
    const { language, toggleLanguage } = useLanguage();
    const [activeModal, setActiveModal] = useState<string | null>(null);

    const handleLogout = () => signOut({ callbackUrl: '/auth/signin' });

    const sections = [
        { id: 'edit', title: language === 'ar' ? 'تحديث الملف الشخصي' : 'Update Profile', desc: language === 'ar' ? 'تعديل المعلومات' : 'Edit info', icon: <Edit className="w-5 h-5" />, action: () => setActiveModal('edit') },
        { id: 'language', title: language === 'ar' ? 'اللغة' : 'Language', desc: language === 'ar' ? 'العربية' : 'English', icon: <Globe className="w-5 h-5" />, action: toggleLanguage },
        { id: 'classes', title: language === 'ar' ? 'فصولي' : 'My Classes', desc: language === 'ar' ? '3 فصول نشطة' : '3 active classes', icon: <GraduationCap className="w-5 h-5" />, action: () => setActiveModal('classes') },
        { id: 'subjects', title: language === 'ar' ? 'موادي' : 'My Subjects', desc: language === 'ar' ? 'رياضيات، فيزياء' : 'Math, Physics', icon: <BookOpen className="w-5 h-5" />, action: () => setActiveModal('subjects') },
        { id: 'settings', title: language === 'ar' ? 'الإعدادات' : 'Settings', desc: language === 'ar' ? 'الإشعارات والخصوصية' : 'Notifications & privacy', icon: <Settings className="w-5 h-5" />, action: () => setActiveModal('settings') },
    ];

    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="card-soft p-6">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden">
                            {session?.user?.image ? <img loading="lazy" decoding="async" src={session.user.image} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-[var(--color-primary)]" />}
                        </div>
                        <button className="absolute bottom-0 right-0 w-7 h-7 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white shadow-lg"><Camera className="w-4 h-4" /></button>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">{session?.user?.name || (language === 'ar' ? 'المعلم' : 'Teacher')}</h1>
                        <p className="text-sm text-[var(--color-text-secondary)]">{session?.user?.email || 'teacher@email.com'}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-full">{language === 'ar' ? 'معلم' : 'Teacher'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sections */}
            <div className="space-y-2">
                {sections.map((s) => (
                    <button key={s.id} onClick={s.action} className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow">
                        <div className="w-10 h-10 rounded-lg bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">{s.icon}</div>
                        <div className="flex-1"><h3 className="font-medium text-[var(--color-text-primary)]">{s.title}</h3><p className="text-sm text-[var(--color-text-secondary)]">{s.desc}</p></div>
                        {s.id === 'language' ? (
                            <div className="flex items-center gap-2">
                                <span className={`text-sm ${language === 'en' ? 'font-bold text-[var(--color-primary)]' : ''}`}>EN</span>
                                <div className="w-10 h-5 bg-[var(--color-primary-light)] rounded-full relative"><div className={`w-4 h-4 bg-[var(--color-primary)] rounded-full absolute top-0.5 transition-all ${language === 'ar' ? 'right-0.5' : 'left-0.5'}`} /></div>
                                <span className={`text-sm ${language === 'ar' ? 'font-bold text-[var(--color-primary)]' : ''}`}>ع</span>
                            </div>
                        ) : <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />}
                    </button>
                ))}
                <button onClick={handleLogout} className="card-soft w-full p-4 flex items-center gap-4 text-left hover:shadow-lg transition-shadow group">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 group-hover:bg-red-100 transition-colors"><LogOut className="w-5 h-5" /></div>
                    <div className="flex-1"><h3 className="font-medium text-red-500">{language === 'ar' ? 'تسجيل الخروج' : 'Logout'}</h3></div>
                </button>
            </div>

            {/* Classes Modal */}
            {activeModal === 'classes' && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card-soft p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-bold">{language === 'ar' ? 'فصولي' : 'My Classes'}</h2><button onClick={() => setActiveModal(null)}>&times;</button></div>
                        <div className="space-y-3">
                            {['Grade 10 - A (25)', 'Grade 10 - B (28)', 'Grade 11 - A (22)'].map((c, i) => (
                                <div key={i} className="p-4 bg-[var(--color-bg-soft)] rounded-lg"><p className="font-medium">{c}</p></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
