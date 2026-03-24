'use client';

import { useState } from 'react';
import { TabPanel, TabContent } from '@/components/admin';
import { BookOpen, Layers3, Users } from 'lucide-react';

export default function BundleDetailsPage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState('info');

    const tabs = [
        { id: 'info', label: 'معلومات الحزمة', icon: <Layers3 className="h-4 w-4" /> },
        { id: 'courses', label: 'المواد المرتبطة', icon: <BookOpen className="h-4 w-4" /> },
        { id: 'students', label: 'الطلاب', icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">تفاصيل الحزمة</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">معرف الحزمة: {params.id}</p>
            </div>

            <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabContent value="info" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">معلومات الحزمة</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">تجميع عدد من المواد الدراسية ضمن مسار موحد للطلاب.</p>
                    </div>
                </TabContent>

                <TabContent value="courses" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">المواد المرتبطة</h2>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>الرياضيات</li>
                            <li>اللغة العربية</li>
                            <li>العلوم</li>
                        </ul>
                    </div>
                </TabContent>

                <TabContent value="students" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">الطلاب</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">لا توجد بيانات طلاب مفصلة حالياً لهذه الحزمة.</p>
                    </div>
                </TabContent>
            </TabPanel>
        </div>
    );
}
