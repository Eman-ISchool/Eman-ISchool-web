'use client';

import { useState } from 'react';
import { User, Mail, Phone, Camera, Lock } from 'lucide-react';
import { Button, InputField, FormField } from '@/components/admin';

export default function AdminProfilePage() {
    const [formData, setFormData] = useState({
        name: 'Admin User',
        email: 'admin@eduverse.com',
        phone: '+966 50 123 4567',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [isEditing, setIsEditing] = useState(false);

    const handleSave = () => {
        console.log('Saving profile:', formData);
        setIsEditing(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">الملف الشخصي</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">إدارة معلومات حسابك</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">الصورة الشخصية</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
                            A
                        </div>
                        <button
                            onClick={() => console.log('Upload photo')}
                            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">صورة حساب المدير</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">يمكنك تحديث الصورة الشخصية أو استبدالها بصورة جديدة.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex items-center justify-between">
                    <Button
                        variant={isEditing ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => setIsEditing((current) => !current)}
                    >
                        {isEditing ? 'إلغاء التعديل' : 'تعديل البيانات'}
                    </Button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">المعلومات الأساسية</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <InputField
                        label="الاسم"
                        value={formData.name}
                        onChange={(e) => setFormData((current) => ({ ...current, name: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<User className="h-4 w-4" />}
                    />
                    <InputField
                        label="البريد الإلكتروني"
                        type="email"
                        dir="ltr"
                        value={formData.email}
                        onChange={(e) => setFormData((current) => ({ ...current, email: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<Mail className="h-4 w-4" />}
                    />
                    <InputField
                        label="رقم الهاتف"
                        dir="ltr"
                        value={formData.phone}
                        onChange={(e) => setFormData((current) => ({ ...current, phone: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<Phone className="h-4 w-4" />}
                    />
                    <FormField label="المسمى الوظيفي" helperText="دور الحساب الحالي داخل المنصة">
                        <input
                            value="مدير النظام"
                            disabled
                            className="h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            dir="rtl"
                        />
                    </FormField>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">تغيير كلمة المرور</h2>
                <div className="grid gap-4">
                    <InputField
                        label="كلمة المرور الحالية"
                        type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData((current) => ({ ...current, currentPassword: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<Lock className="h-4 w-4" />}
                    />
                    <InputField
                        label="كلمة المرور الجديدة"
                        type="password"
                        value={formData.newPassword}
                        onChange={(e) => setFormData((current) => ({ ...current, newPassword: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<Lock className="h-4 w-4" />}
                    />
                    <InputField
                        label="تأكيد كلمة المرور"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData((current) => ({ ...current, confirmPassword: e.target.value }))}
                        disabled={!isEditing}
                        rightIcon={<Lock className="h-4 w-4" />}
                    />
                </div>
            </div>

            <div className="flex justify-start">
                <Button onClick={handleSave} disabled={!isEditing}>
                    حفظ التغييرات
                </Button>
            </div>
        </div>
    );
}
