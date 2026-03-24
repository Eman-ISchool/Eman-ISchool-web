'use client';

import { useState } from 'react';
import { TabPanel, TabContent } from '@/components/admin';
import { FileQuestion, Settings, Users } from 'lucide-react';

export default function QuizManagePage({ params }: { params: { id: string } }) {
    const [activeTab, setActiveTab] = useState('questions');

    const tabs = [
        { id: 'questions', label: 'الأسئلة', icon: <FileQuestion className="h-4 w-4" /> },
        { id: 'settings', label: 'الإعدادات', icon: <Settings className="h-4 w-4" /> },
        { id: 'results', label: 'النتائج', icon: <Users className="h-4 w-4" /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الاختبار</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">معرف الاختبار: {params.id}</p>
            </div>

            <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
                <TabContent value="questions" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">الأسئلة</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">يمكن مراجعة أسئلة الاختبار وترتيبها من هذه الصفحة.</p>
                    </div>
                </TabContent>

                <TabContent value="settings" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">إعدادات الاختبار</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">مدة الاختبار، عدد المحاولات، وخيارات النشر.</p>
                    </div>
                </TabContent>

                <TabContent value="results" activeTab={activeTab}>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">النتائج</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400">لا توجد نتائج متاحة حالياً.</p>
                    </div>
                </TabContent>
            </TabPanel>
        </div>
    );
}
