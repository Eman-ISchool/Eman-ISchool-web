"use client";

import { useState, useMemo } from 'react';
import {
    Download,
    Search,
    BookOpen,
    GraduationCap,
    Filter,
    Globe
} from 'lucide-react';
import {
    getStages,
    getGrades,
    filterSubjectsByType,
    searchSubjects,
    exportCurriculumJSON,
    type Stage,
    type Grade,
    type Subject
} from '@/lib/curriculum';

type Language = 'ar' | 'en';
type SubjectFilter = 'all' | 'core' | 'activity';

export default function EgyptCurriculumPage() {
    const [language, setLanguage] = useState<Language>('ar');
    const [selectedStage, setSelectedStage] = useState<string>('primary');
    const [selectedGrade, setSelectedGrade] = useState<string>('g1');
    const [searchQuery, setSearchQuery] = useState('');
    const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');

    const stages = getStages();
    const grades = getGrades(selectedStage);

    // Reset grade when stage changes
    const handleStageChange = (stageId: string) => {
        setSelectedStage(stageId);
        const newGrades = getGrades(stageId);
        if (newGrades.length > 0) {
            setSelectedGrade(newGrades[0].id);
        }
    };

    // Get filtered subjects
    const subjects = useMemo(() => {
        return filterSubjectsByType(selectedStage, selectedGrade, subjectFilter);
    }, [selectedStage, selectedGrade, subjectFilter]);

    // Search results
    const searchResults = useMemo(() => {
        if (!searchQuery.trim()) return [];
        return searchSubjects(searchQuery);
    }, [searchQuery]);

    // Download curriculum JSON
    const handleDownload = () => {
        const json = exportCurriculumJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'egypt-curriculum.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isRTL = language === 'ar';

    // Text content based on language
    const text = {
        pageTitle: language === 'ar' ? 'المنهج المصري' : 'Egypt Curriculum',
        pageSubtitle: language === 'ar'
            ? '(المرحلة الابتدائية والإعدادية)'
            : '(Primary & Preparatory)',
        intro: language === 'ar'
            ? 'تعرف على المواد الدراسية الأساسية في المنهج المصري حسب المرحلة والصف الدراسي'
            : 'Explore the main subjects in the Egyptian curriculum by stage and grade level',
        searchPlaceholder: language === 'ar'
            ? 'ابحث عن مادة... (مثال: Math, علوم, English)'
            : 'Search subjects... (e.g., Math, علوم, English)',
        downloadBtn: language === 'ar' ? 'تحميل المنهج' : 'Download Curriculum',
        filterAll: language === 'ar' ? 'الكل' : 'All',
        filterCore: language === 'ar' ? 'مواد أساسية' : 'Core Subjects',
        filterActivity: language === 'ar' ? 'أنشطة' : 'Activities',
        selectGrade: language === 'ar' ? 'اختر الصف:' : 'Select Grade:',
        subjectsCount: language === 'ar' ? 'مادة' : 'subjects',
        core: language === 'ar' ? 'أساسي' : 'Core',
        activity: language === 'ar' ? 'نشاط' : 'Activity',
        searchResults: language === 'ar' ? 'نتائج البحث' : 'Search Results',
        noResults: language === 'ar' ? 'لا توجد نتائج' : 'No results found',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
                <div className="container mx-auto px-4 py-12">
                    {/* Language Toggle */}
                    <div className="flex justify-end mb-6">
                        <button
                            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-300 backdrop-blur-sm"
                        >
                            <Globe className="w-4 h-4" />
                            <span className="font-medium">{language === 'ar' ? 'EN' : 'عربي'}</span>
                        </button>
                    </div>

                    {/* Title */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full mb-4">
                            <span className="text-2xl">🇪🇬</span>
                            <span className="font-medium">{language === 'ar' ? 'جمهورية مصر العربية' : 'Arab Republic of Egypt'}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">
                            {text.pageTitle}
                        </h1>
                        <p className="text-xl text-blue-100 mb-4">{text.pageSubtitle}</p>
                        <p className="text-blue-200 max-w-2xl mx-auto">{text.intro}</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-8 max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className={`absolute top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 ${isRTL ? 'right-4' : 'left-4'}`} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={text.searchPlaceholder}
                                className={`w-full py-4 rounded-2xl bg-white text-gray-800 shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'}`}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Search Results */}
                {searchQuery.trim() && (
                    <div className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5 text-blue-600" />
                            {text.searchResults} ({searchResults.length})
                        </h2>
                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {searchResults.slice(0, 12).map((result, index) => (
                                    <div
                                        key={`${result.stage.id}-${result.grade.id}-${result.subject.id}-${index}`}
                                        className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl">{result.subject.icon}</span>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {language === 'ar' ? result.subject.name_ar : result.subject.name_en}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {language === 'ar' ? result.subject.name_en : result.subject.name_ar}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                {language === 'ar' ? result.stage.name_ar : result.stage.name_en}
                                            </span>
                                            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                {language === 'ar' ? result.grade.name_ar : result.grade.name_en}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">{text.noResults}</p>
                        )}
                    </div>
                )}

                {/* Stage Tabs */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar - Stage Selection */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-20">
                            <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                                {language === 'ar' ? 'المراحل الدراسية' : 'Educational Stages'}
                            </h3>
                            <div className="space-y-2">
                                {stages.map((stage) => (
                                    <button
                                        key={stage.id}
                                        onClick={() => handleStageChange(stage.id)}
                                        className={`w-full text-${isRTL ? 'right' : 'left'} px-4 py-3 rounded-xl transition-all duration-300 ${selectedStage === stage.id
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        <span className="font-medium">
                                            {language === 'ar' ? stage.name_ar : stage.name_en}
                                        </span>
                                        <span className="block text-sm opacity-70 mt-1">
                                            {stage.grades.length} {language === 'ar' ? 'صفوف' : 'grades'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                            >
                                <Download className="w-5 h-5" />
                                {text.downloadBtn}
                            </button>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1">
                        {/* Grade Selector */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                {/* Grade Tabs */}
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-600 mb-2 block">
                                        {text.selectGrade}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {grades.map((grade) => (
                                            <button
                                                key={grade.id}
                                                onClick={() => setSelectedGrade(grade.id)}
                                                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${selectedGrade === grade.id
                                                        ? 'bg-brand-primary text-black shadow-md'
                                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                            >
                                                {language === 'ar' ? grade.name_ar : grade.name_en}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Filter */}
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        value={subjectFilter}
                                        onChange={(e) => setSubjectFilter(e.target.value as SubjectFilter)}
                                        className="px-4 py-2 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                                    >
                                        <option value="all">{text.filterAll}</option>
                                        <option value="core">{text.filterCore}</option>
                                        <option value="activity">{text.filterActivity}</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Subjects Grid */}
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-blue-600" />
                                    {language === 'ar' ? 'المواد الدراسية' : 'Subjects'}
                                </h2>
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    {subjects.length} {text.subjectsCount}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {subjects.map((subject) => (
                                    <SubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        language={language}
                                        coreText={text.core}
                                        activityText={text.activity}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Subject Card Component
function SubjectCard({
    subject,
    language,
    coreText,
    activityText
}: {
    subject: Subject;
    language: Language;
    coreText: string;
    activityText: string;
}) {
    const isCore = subject.type === 'core';

    return (
        <div
            className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${isCore
                    ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-400'
                    : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:border-green-400'
                }`}
        >
            {/* Type Badge */}
            <div className={`absolute top-3 ${language === 'ar' ? 'left-3' : 'right-3'}`}>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isCore
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                    {isCore ? coreText : activityText}
                </span>
            </div>

            {/* Icon */}
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {subject.icon}
            </div>

            {/* Subject Names */}
            <h3 className="font-bold text-lg text-gray-800 mb-1">
                {language === 'ar' ? subject.name_ar : subject.name_en}
            </h3>
            <p className="text-sm text-gray-500">
                {language === 'ar' ? subject.name_en : subject.name_ar}
            </p>
        </div>
    );
}
