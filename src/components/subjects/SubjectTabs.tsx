import { BookOpen, Calendar, Info, Users, CreditCard } from 'lucide-react';
import React from 'react';

export type SubjectTab = 'information' | 'courses' | 'calendar' | 'fees' | 'students';

interface SubjectTabsProps {
    activeTab: SubjectTab;
    setActiveTab: (tab: SubjectTab) => void;
    counts?: {
        courses?: number;
        students?: number;
    };
}

export function SubjectTabs({ activeTab, setActiveTab, counts }: SubjectTabsProps) {
    const tabs: { key: SubjectTab; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'information', label: 'Information', icon: <Info className="h-4 w-4" /> },
        { key: 'courses', label: 'Courses', icon: <BookOpen className="h-4 w-4" />, count: counts?.courses },
        { key: 'calendar', label: 'Table-Calendar', icon: <Calendar className="h-4 w-4" /> },
        { key: 'fees', label: 'Fees', icon: <CreditCard className="h-4 w-4" /> },
        { key: 'students', label: 'Students', icon: <Users className="h-4 w-4" />, count: counts?.students },
    ];

    return (
        <div className="border-b border-gray-200 bg-white">
            <div className="flex gap-2 -mb-px overflow-x-auto px-4 md:px-0">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.key
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {tab.count !== undefined && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs">
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}
