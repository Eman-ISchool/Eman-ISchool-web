"use client";

import { useState } from "react";
import { Shield, GraduationCap, Users, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const UserPortalSection = () => {
    const users = [
        {
            role: 'Admin',
            username: 'admin@eduverse.com',
            password: 'password123',
            icon: Shield,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20'
        },
        {
            role: 'Teacher',
            username: 'teacher@eduverse.com',
            password: 'password123',
            icon: GraduationCap,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            role: 'Student',
            username: 'student@eduverse.com',
            password: 'password123',
            icon: Users,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
        }
    ];

    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const copyToClipboard = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <section className="py-20 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4 text-brand-dark">
                        بوابة <span className="text-brand-primary">المستخدمين</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        استخدم بيانات الدخول التالية لتجربة النظام بأدوار مختلفة
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {users.map((user, index) => (
                        <Card
                            key={index}
                            className={`border hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white group ${user.borderColor}`}
                        >
                            <CardHeader className={`${user.bgColor} rounded-t-xl border-b ${user.borderColor}`}>
                                <div className="flex items-center justify-between">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white ${user.color}`}>
                                        <user.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${user.color}`}>{user.role}</span>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500 font-medium">اسم المستخدم</p>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <code className="text-sm font-mono text-gray-800">{user.username}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-brand-primary"
                                            onClick={() => copyToClipboard(user.username, index * 2)}
                                        >
                                            {copiedIndex === index * 2 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-sm text-gray-500 font-medium">كلمة المرور</p>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">
                                        <code className="text-sm font-mono text-gray-800">{user.password}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-gray-400 hover:text-brand-primary"
                                            onClick={() => copyToClipboard(user.password, index * 2 + 1)}
                                        >
                                            {copiedIndex === index * 2 + 1 ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UserPortalSection;
