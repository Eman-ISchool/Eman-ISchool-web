'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { withLocalePrefix } from '@/lib/locale-path';
import { ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

const GRADES = [
    { value: 'grade-1', label: 'الصف الأول الابتدائي' },
    { value: 'grade-2', label: 'الصف الثاني الابتدائي' },
    { value: 'grade-3', label: 'الصف الثالث الابتدائي' },
    { value: 'grade-4', label: 'الصف الرابع الابتدائي' },
    { value: 'grade-5', label: 'الصف الخامس الابتدائي' },
    { value: 'grade-6', label: 'الصف السادس الابتدائي' },
    { value: 'grade-7', label: 'الصف الأول الإعدادي' },
    { value: 'grade-8', label: 'الصف الثاني الإعدادي' },
    { value: 'grade-9', label: 'الصف الثالث الإعدادي' },
    { value: 'grade-10', label: 'الصف الأول الثانوي' },
    { value: 'grade-11', label: 'الصف الثاني الثانوي' },
    { value: 'grade-12', label: 'الصف الثالث الثانوي' },
];

export default function AddChildPage() {
    const router = useRouter();
    const params = useParams();
    const locale = (params?.locale as string) || 'ar';

    const [form, setForm] = useState({
        name: '',
        grade: '',
        studentId: '',
        email: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    function validate() {
        const errs: Record<string, string> = {};
        if (!form.name.trim()) errs.name = 'الاسم مطلوب';
        if (!form.grade) errs.grade = 'يرجى اختيار الصف الدراسي';
        if (!form.studentId.trim()) errs.studentId = 'رقم الطالب مطلوب';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            errs.email = 'البريد الإلكتروني غير صالح';
        }
        return errs;
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        setLoading(true);
        // Simulate API call — real implementation would POST to /api/parent/students
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoading(false);
        setSubmitted(true);
        setTimeout(() => {
            router.push(withLocalePrefix('/parent/home', locale));
        }, 1800);
    }

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 rtl">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-100">
                    <CheckCircle2 className="h-10 w-10 text-teal-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800">تمت الإضافة بنجاح!</h2>
                <p className="text-gray-500">جاري الرجوع إلى الصفحة الرئيسية...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8 rtl" dir="rtl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    href={withLocalePrefix('/parent/home', locale)}
                    className="flex items-center justify-center h-9 w-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    aria-label="رجوع"
                >
                    <ArrowRight className="h-4 w-4 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">إضافة ابن / ابنة</h1>
                    <p className="text-sm text-gray-500 mt-0.5">أدخل بيانات الطالب لربطه بحسابك</p>
                </div>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                {/* Icon banner */}
                <div className="bg-linear-to-br from-teal-600 to-emerald-500 p-6 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                        <UserPlus className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg">بيانات الطالب</p>
                        <p className="text-teal-100 text-sm">تأكد من صحة البيانات قبل الإرسال</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
                    {/* Name */}
                    <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                            الاسم <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="أدخل اسم الطالب كاملاً"
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* Grade */}
                    <div className="space-y-1.5">
                        <label htmlFor="grade" className="block text-sm font-semibold text-gray-700">
                            الصف الدراسي <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="grade"
                            name="grade"
                            value={form.grade}
                            onChange={handleChange}
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-colors focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${errors.grade ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        >
                            <option value="">اختر الصف الدراسي</option>
                            {GRADES.map(g => (
                                <option key={g.value} value={g.value}>{g.label}</option>
                            ))}
                        </select>
                        {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
                    </div>

                    {/* Student ID */}
                    <div className="space-y-1.5">
                        <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700">
                            رقم الطالب <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="studentId"
                            name="studentId"
                            type="text"
                            value={form.studentId}
                            onChange={handleChange}
                            placeholder="مثال: STU-2026-001"
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${errors.studentId ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                        />
                        {errors.studentId && <p className="text-xs text-red-500">{errors.studentId}</p>}
                    </div>

                    {/* Email (optional) */}
                    <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                            البريد الإلكتروني
                            <span className="mr-1.5 text-xs font-normal text-gray-400">(اختياري)</span>
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="student@example.com"
                            className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-teal-400 focus:border-teal-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                            dir="ltr"
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                        <Link
                            href={withLocalePrefix('/parent/home', locale)}
                            className="flex items-center justify-center rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            إلغاء
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                            {loading ? (
                                <>
                                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    جاري الإضافة...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4" />
                                    إضافة الطالب
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
