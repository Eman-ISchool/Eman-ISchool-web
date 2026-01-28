'use client';

import { ShieldCheck, BookOpen, GraduationCap } from 'lucide-react';
import RoleCard from '@/components/auth/RoleCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">مرحباً بك في منصة Eman-Academy</h1>
                <p className="text-gray-500 dark:text-gray-400">اختر نوع الحساب لتسجيل الدخول</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RoleCard
                    title="الإدارة"
                    description="الدخول الخاص بمسؤولي النظام والمشرفين"
                    icon={ShieldCheck}
                    href="/login/admin"
                    colorClass="bg-red-500 text-red-500"
                />
                <RoleCard
                    title="المعلم"
                    description="الدخول الخاص بالمعلمين وإدارة الفصول"
                    icon={BookOpen}
                    href="/login/teacher"
                    colorClass="bg-blue-500 text-blue-500"
                />
                <RoleCard
                    title="الطالب"
                    description="الدخول الخاص بالطلاب وأولياء الأمور"
                    icon={GraduationCap}
                    href="/login/student"
                    colorClass="bg-brand-primary text-brand-primary" // Assuming brand-primary is yellow/gold
                />
            </div>

            <div className="text-center mt-8">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    ليس لديك حساب؟ <a href="/register" className="text-brand-primary hover:underline">سجل الآن</a>
                </p>
            </div>
        </div>
    );
}
