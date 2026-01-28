'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    BookOpen,
    Plus,
    Video,
    FileText,
    Clock,
    Users,
    Play,
    Upload,
    X,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';
import { StandardActionsDropdown } from '@/components/admin/DropdownMenu';

interface Lesson {
    id: string;
    title: string;
    description?: string;
    courseName: string;
    teacherName: string;
    className: string;
    startTime: Date;
    endTime: Date;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    type: 'direct' | 'group' | 'assignment';
    hasConclusion: boolean;
    materialsCount: number;
    attachments?: string[];
}

interface LessonFormData {
    title: string;
    description: string;
    courseName: string;
    teacherName: string;
    className: string;
    date: string;
    startTime: string;
    endTime: string;
    type: 'direct' | 'group' | 'assignment';
    attachments: string[];
}

const initialFormData: LessonFormData = {
    title: '',
    description: '',
    courseName: '',
    teacherName: '',
    className: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    type: 'direct',
    attachments: [],
};

// Mock data for dropdowns
const teachers = [
    { id: '1', name: 'أ. أحمد محمد' },
    { id: '2', name: 'أ. سارة أحمد' },
    { id: '3', name: 'أ. محمد علي' },
    { id: '4', name: 'أ. فاطمة حسن' },
    { id: '5', name: 'أ. خالد العمري' },
];

const classes = [
    { id: '1', name: 'الصف التاسع أ' },
    { id: '2', name: 'الصف التاسع ب' },
    { id: '3', name: 'الصف العاشر أ' },
    { id: '4', name: 'الصف العاشر ب' },
    { id: '5', name: 'الصف الثامن أ' },
    { id: '6', name: 'الصف الثامن ب' },
];

const courses = [
    { id: '1', name: 'الرياضيات' },
    { id: '2', name: 'الفيزياء' },
    { id: '3', name: 'الكيمياء' },
    { id: '4', name: 'اللغة العربية' },
    { id: '5', name: 'اللغة الإنجليزية' },
    { id: '6', name: 'العلوم' },
    { id: '7', name: 'التاريخ' },
];

export default function LessonsPage() {
    const [loading, setLoading] = useState(true);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'direct' | 'group' | 'assignments'>('all');
    const [showNewModal, setShowNewModal] = useState(false);
    const [formData, setFormData] = useState<LessonFormData>(initialFormData);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<Lesson | null>(null);
    const [detailsLesson, setDetailsLesson] = useState<Lesson | null>(null);

    useEffect(() => {
        // Extended mock data with 15+ lessons
        const today = new Date();
        const mockLessons: Lesson[] = [
            {
                id: '1',
                title: 'درس الجبر - المعادلات',
                description: 'شرح المعادلات من الدرجة الأولى وطرق حلها',
                courseName: 'الرياضيات',
                teacherName: 'أ. أحمد محمد',
                className: 'الصف التاسع أ',
                startTime: new Date(),
                endTime: new Date(Date.now() + 60 * 60 * 1000),
                status: 'live',
                type: 'direct',
                hasConclusion: false,
                materialsCount: 3,
            },
            {
                id: '2',
                title: 'درس الفيزياء - الحركة',
                description: 'قوانين الحركة والسرعة',
                courseName: 'الفيزياء',
                teacherName: 'أ. سارة أحمد',
                className: 'الصف العاشر ب',
                startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
                endTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
                status: 'scheduled',
                type: 'group',
                hasConclusion: false,
                materialsCount: 2,
            },
            {
                id: '3',
                title: 'درس اللغة العربية - النحو',
                description: 'قواعد النحو والإعراب',
                courseName: 'اللغة العربية',
                teacherName: 'أ. محمد علي',
                className: 'الصف الثامن أ',
                startTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
                status: 'completed',
                type: 'direct',
                hasConclusion: true,
                materialsCount: 5,
            },
            {
                id: '4',
                title: 'واجب الرياضيات - التكامل',
                description: 'حل تمارين التكامل صفحة 45-50',
                courseName: 'الرياضيات',
                teacherName: 'أ. أحمد محمد',
                className: 'الصف العاشر أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 23, 59),
                status: 'scheduled',
                type: 'assignment',
                hasConclusion: false,
                materialsCount: 1,
            },
            {
                id: '5',
                title: 'درس الكيمياء - التفاعلات',
                description: 'التفاعلات الكيميائية وموازنة المعادلات',
                courseName: 'الكيمياء',
                teacherName: 'أ. خالد العمري',
                className: 'الصف العاشر أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 10, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0),
                status: 'scheduled',
                type: 'group',
                hasConclusion: false,
                materialsCount: 4,
            },
            {
                id: '6',
                title: 'درس الإنجليزية - القراءة',
                description: 'Reading comprehension exercises',
                courseName: 'اللغة الإنجليزية',
                teacherName: 'أ. سارة أحمد',
                className: 'الصف الثامن ب',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 9, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 10, 0),
                status: 'scheduled',
                type: 'direct',
                hasConclusion: false,
                materialsCount: 2,
            },
            {
                id: '7',
                title: 'واجب الفيزياء - الطاقة',
                description: 'مسائل حول الطاقة الحركية والكامنة',
                courseName: 'الفيزياء',
                teacherName: 'أ. سارة أحمد',
                className: 'الصف العاشر ب',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 23, 59),
                status: 'scheduled',
                type: 'assignment',
                hasConclusion: false,
                materialsCount: 3,
            },
            {
                id: '8',
                title: 'درس العلوم - الخلية',
                description: 'تركيب الخلية ووظائفها',
                courseName: 'العلوم',
                teacherName: 'أ. فاطمة حسن',
                className: 'الصف الثامن أ',
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 23 * 60 * 60 * 1000),
                status: 'completed',
                type: 'group',
                hasConclusion: true,
                materialsCount: 6,
            },
            {
                id: '9',
                title: 'درس التاريخ - الدولة العباسية',
                description: 'نشأة وازدهار الدولة العباسية',
                courseName: 'التاريخ',
                teacherName: 'أ. محمد علي',
                className: 'الصف التاسع ب',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 12, 0),
                status: 'scheduled',
                type: 'direct',
                hasConclusion: false,
                materialsCount: 4,
            },
            {
                id: '10',
                title: 'مراجعة الرياضيات الشاملة',
                description: 'مراجعة جميع الوحدات السابقة',
                courseName: 'الرياضيات',
                teacherName: 'أ. أحمد محمد',
                className: 'الصف التاسع أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 14, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4, 16, 0),
                status: 'scheduled',
                type: 'group',
                hasConclusion: false,
                materialsCount: 8,
            },
            {
                id: '11',
                title: 'واجب اللغة العربية - الإنشاء',
                description: 'كتابة موضوع إنشائي عن البيئة',
                courseName: 'اللغة العربية',
                teacherName: 'أ. محمد علي',
                className: 'الصف الثامن أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 2, 0, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2, 23, 59),
                status: 'scheduled',
                type: 'assignment',
                hasConclusion: false,
                materialsCount: 1,
            },
            {
                id: '12',
                title: 'درس الهندسة الفراغية',
                description: 'الأشكال ثلاثية الأبعاد',
                courseName: 'الرياضيات',
                teacherName: 'أ. أحمد محمد',
                className: 'الصف العاشر ب',
                startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 47 * 60 * 60 * 1000),
                status: 'completed',
                type: 'direct',
                hasConclusion: false,
                materialsCount: 3,
            },
            {
                id: '13',
                title: 'درس الكهرباء الساكنة',
                description: 'الشحنات الكهربائية والمجالات',
                courseName: 'الفيزياء',
                teacherName: 'أ. خالد العمري',
                className: 'الصف العاشر أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 10, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 11, 30),
                status: 'scheduled',
                type: 'direct',
                hasConclusion: false,
                materialsCount: 5,
            },
            {
                id: '14',
                title: 'ورشة عمل جماعية - البرمجة',
                description: 'أساسيات البرمجة بلغة Python',
                courseName: 'العلوم',
                teacherName: 'أ. فاطمة حسن',
                className: 'الصف التاسع أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 13, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 6, 15, 0),
                status: 'scheduled',
                type: 'group',
                hasConclusion: false,
                materialsCount: 2,
            },
            {
                id: '15',
                title: 'واجب الكيمياء العضوية',
                description: 'تمارين على المركبات العضوية',
                courseName: 'الكيمياء',
                teacherName: 'أ. خالد العمري',
                className: 'الصف العاشر أ',
                startTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 0, 0),
                endTime: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 23, 59),
                status: 'scheduled',
                type: 'assignment',
                hasConclusion: false,
                materialsCount: 2,
            },
            {
                id: '16',
                title: 'درس القواعد النحوية المتقدمة',
                description: 'التوابع والأساليب',
                courseName: 'اللغة العربية',
                teacherName: 'أ. محمد علي',
                className: 'الصف التاسع ب',
                startTime: new Date(Date.now() - 72 * 60 * 60 * 1000),
                endTime: new Date(Date.now() - 71 * 60 * 60 * 1000),
                status: 'completed',
                type: 'direct',
                hasConclusion: true,
                materialsCount: 4,
            },
        ];

        setTimeout(() => {
            setLessons(mockLessons);
            setLoading(false);
        }, 500);
    }, []);

    // Filter lessons based on active tab
    const filteredLessons = useMemo(() => {
        switch (activeTab) {
            case 'direct':
                return lessons.filter(l => l.type === 'direct');
            case 'group':
                return lessons.filter(l => l.type === 'group');
            case 'assignments':
                return lessons.filter(l => l.type === 'assignment');
            default:
                return lessons;
        }
    }, [lessons, activeTab]);

    const handleFormChange = (field: keyof LessonFormData, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            title: lesson.title,
            description: lesson.description || '',
            courseName: lesson.courseName,
            teacherName: lesson.teacherName,
            className: lesson.className,
            date: lesson.startTime.toISOString().split('T')[0],
            startTime: lesson.startTime.toTimeString().slice(0, 5),
            endTime: lesson.endTime.toTimeString().slice(0, 5),
            type: lesson.type,
            attachments: lesson.attachments || [],
        });
        setShowNewModal(true);
    };

    const handleDelete = (lesson: Lesson) => {
        setShowDeleteConfirm(lesson);
    };

    const confirmDelete = () => {
        if (showDeleteConfirm) {
            setLessons(prev => prev.filter(l => l.id !== showDeleteConfirm.id));
            setShowDeleteConfirm(null);
        }
    };

    const handleDuplicate = (lesson: Lesson) => {
        const duplicated: Lesson = {
            ...lesson,
            id: Date.now().toString(),
            title: `نسخة من ${lesson.title}`,
            status: 'scheduled',
        };
        setLessons(prev => [...prev, duplicated]);
    };

    const handleShare = (lesson: Lesson) => {
        // Copy lesson link to clipboard
        const url = `${window.location.origin}/lesson/${lesson.id}`;
        navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط!');
    };

    const handleViewDetails = (lesson: Lesson) => {
        setDetailsLesson(lesson);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const [year, month, day] = formData.date.split('-').map(Number);
        const [startHour, startMin] = formData.startTime.split(':').map(Number);
        const [endHour, endMin] = formData.endTime.split(':').map(Number);

        const newLesson: Lesson = {
            id: editingLesson?.id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            courseName: formData.courseName,
            teacherName: formData.teacherName,
            className: formData.className,
            startTime: new Date(year, month - 1, day, startHour, startMin),
            endTime: new Date(year, month - 1, day, endHour, endMin),
            status: 'scheduled',
            type: formData.type,
            hasConclusion: false,
            materialsCount: formData.attachments.length,
            attachments: formData.attachments,
        };

        if (editingLesson) {
            setLessons(prev => prev.map(l =>
                l.id === editingLesson.id ? newLesson : l
            ));
        } else {
            setLessons(prev => [...prev, newLesson]);
        }

        closeModal();
    };

    const closeModal = () => {
        setShowNewModal(false);
        setFormData(initialFormData);
        setEditingLesson(null);
    };

    const columns: Column<Lesson>[] = [
        {
            key: 'title',
            header: 'الدرس',
            sortable: true,
            render: (lesson) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${lesson.status === 'live' ? 'bg-red-100' :
                        lesson.status === 'scheduled' ? 'bg-teal-100' : 'bg-gray-100'
                        }`}>
                        {lesson.status === 'live' ? (
                            <Video className="w-5 h-5 text-red-500" />
                        ) : lesson.type === 'assignment' ? (
                            <FileText className="w-5 h-5 text-orange-500" />
                        ) : (
                            <BookOpen className="w-5 h-5 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{lesson.title}</p>
                        <p className="text-sm text-gray-500">{lesson.courseName}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'teacherName',
            header: 'المعلم',
            render: (lesson) => <span className="text-gray-600">{lesson.teacherName}</span>,
        },
        {
            key: 'className',
            header: 'الفصل',
            render: (lesson) => <span className="text-gray-600">{lesson.className}</span>,
        },
        {
            key: 'startTime',
            header: 'الوقت',
            sortable: true,
            render: (lesson) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                        {lesson.startTime.toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'الحالة',
            render: (lesson) => {
                const statusConfig = {
                    scheduled: { badge: 'admin-badge-upcoming', label: 'مجدول' },
                    live: { badge: 'admin-badge-live', label: 'مباشر' },
                    completed: { badge: 'admin-badge-completed', label: 'منتهي' },
                    cancelled: { badge: 'bg-gray-100 text-gray-500', label: 'ملغي' },
                };
                const config = statusConfig[lesson.status];
                return <span className={`admin-badge ${config.badge}`}>{config.label}</span>;
            },
        },
        {
            key: 'materialsCount',
            header: 'المرفقات',
            render: (lesson) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{lesson.materialsCount}</span>
                </div>
            ),
        },
    ];

    const tabs = [
        { id: 'all', label: 'جميع الدروس', count: lessons.length },
        { id: 'direct', label: 'دروس مباشرة', count: lessons.filter(l => l.type === 'direct').length },
        { id: 'group', label: 'دروس جماعية', count: lessons.filter(l => l.type === 'group').length },
        { id: 'assignments', label: 'الواجبات', count: lessons.filter(l => l.type === 'assignment').length },
    ];

    if (loading) {
        return <LoadingState message="جاري تحميل الدروس..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الدروس</h1>
                    <p className="text-gray-500">إدارة الدروس والمواد التعليمية</p>
                </div>
                <button
                    onClick={() => {
                        setEditingLesson(null);
                        setFormData(initialFormData);
                        setShowNewModal(true);
                    }}
                    className="admin-btn admin-btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    درس جديد
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                        <Video className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {lessons.filter((l) => l.status === 'live').length}
                        </p>
                        <p className="text-sm text-gray-500">مباشر الآن</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {lessons.filter((l) => l.status === 'scheduled').length}
                        </p>
                        <p className="text-sm text-gray-500">مجدولة</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {lessons.filter((l) => l.status === 'completed').length}
                        </p>
                        <p className="text-sm text-gray-500">مكتملة</p>
                    </div>
                </div>
                <div className="admin-card p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-gray-800">
                            {lessons.filter((l) => !l.hasConclusion && l.status === 'completed').length}
                        </p>
                        <p className="text-sm text-gray-500">بدون خلاصة</p>
                    </div>
                </div>
            </div>

            {/* Tabs - horizontal row with counts */}
            <div className="flex items-center gap-2 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-teal-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-gray-100 text-gray-500'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <DataTable
                data={filteredLessons}
                columns={columns}
                searchKey="title"
                searchPlaceholder="بحث عن درس..."
                emptyTitle="لا توجد دروس"
                emptyMessage="قم بإضافة درس جديد للبدء"
                actions={(lesson) => (
                    <div className="flex items-center gap-2">
                        {lesson.status === 'live' && (
                            <button className="admin-btn admin-btn-primary text-sm py-1 px-2">
                                <Play className="w-4 h-4" />
                            </button>
                        )}
                        <StandardActionsDropdown
                            onViewDetails={() => handleViewDetails(lesson)}
                            onEdit={() => handleEdit(lesson)}
                            onDuplicate={() => handleDuplicate(lesson)}
                            onShare={() => handleShare(lesson)}
                            onDelete={() => handleDelete(lesson)}
                        />
                    </div>
                )}
            />

            {/* New/Edit Lesson Modal */}
            <Modal
                isOpen={showNewModal}
                onClose={closeModal}
                title={editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
                size="lg"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={closeModal}
                            className="admin-btn admin-btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            form="lesson-form"
                            className="admin-btn admin-btn-primary"
                        >
                            {editingLesson ? 'حفظ التغييرات' : 'إضافة الدرس'}
                        </button>
                    </>
                }
            >
                <form id="lesson-form" onSubmit={handleSubmit}>
                    <FormGroup>
                        <FormLabel required htmlFor="title">عنوان الدرس</FormLabel>
                        <FormInput
                            id="title"
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            placeholder="مثال: درس الجبر - المعادلات"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel htmlFor="description">الوصف</FormLabel>
                        <FormTextarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            placeholder="وصف مختصر للدرس..."
                            rows={2}
                        />
                    </FormGroup>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required htmlFor="date">التاريخ</FormLabel>
                            <FormInput
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleFormChange('date', e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required htmlFor="type">نوع الدرس</FormLabel>
                            <FormSelect
                                id="type"
                                value={formData.type}
                                onChange={(e) => handleFormChange('type', e.target.value)}
                                required
                            >
                                <option value="direct">درس مباشر</option>
                                <option value="group">درس جماعي</option>
                                <option value="assignment">واجب</option>
                            </FormSelect>
                        </FormGroup>
                    </div>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required htmlFor="startTime">وقت البداية</FormLabel>
                            <FormInput
                                id="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => handleFormChange('startTime', e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required htmlFor="endTime">وقت النهاية</FormLabel>
                            <FormInput
                                id="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => handleFormChange('endTime', e.target.value)}
                                required
                            />
                        </FormGroup>
                    </div>

                    <FormGroup>
                        <FormLabel required htmlFor="courseName">المادة</FormLabel>
                        <FormSelect
                            id="courseName"
                            value={formData.courseName}
                            onChange={(e) => handleFormChange('courseName', e.target.value)}
                            required
                        >
                            <option value="">اختر المادة</option>
                            {courses.map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                        </FormSelect>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel required htmlFor="teacherName">المعلم</FormLabel>
                        <FormSelect
                            id="teacherName"
                            value={formData.teacherName}
                            onChange={(e) => handleFormChange('teacherName', e.target.value)}
                            required
                        >
                            <option value="">اختر المعلم</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.name}>{t.name}</option>
                            ))}
                        </FormSelect>
                    </FormGroup>

                    <FormGroup>
                        <FormLabel required htmlFor="className">الفصل</FormLabel>
                        <FormSelect
                            id="className"
                            value={formData.className}
                            onChange={(e) => handleFormChange('className', e.target.value)}
                            required
                        >
                            <option value="">اختر الفصل</option>
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.name}>{cls.name}</option>
                            ))}
                        </FormSelect>
                    </FormGroup>

                    <FormGroup className="mb-0">
                        <FormLabel htmlFor="attachments">المرفقات</FormLabel>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-teal-300 transition-colors cursor-pointer">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">اسحب الملفات هنا أو انقر للتحميل</p>
                            <p className="text-xs text-gray-400 mt-1">PDF, DOC, PPT, Images (Max 10MB)</p>
                        </div>
                    </FormGroup>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(null)}
                title="تأكيد الحذف"
                size="sm"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(null)}
                            className="admin-btn admin-btn-secondary"
                        >
                            إلغاء
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            className="admin-btn bg-red-500 text-white hover:bg-red-600"
                        >
                            حذف
                        </button>
                    </>
                }
            >
                <p className="text-gray-600">
                    هل أنت متأكد من حذف الدرس "{showDeleteConfirm?.title}"؟
                    هذا الإجراء لا يمكن التراجع عنه.
                </p>
            </Modal>

            {/* Details Modal */}
            <Modal
                isOpen={!!detailsLesson}
                onClose={() => setDetailsLesson(null)}
                title="تفاصيل الدرس"
                size="md"
            >
                {detailsLesson && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">{detailsLesson.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{detailsLesson.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">المادة:</span>
                                <span className="text-gray-800 mr-2">{detailsLesson.courseName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">المعلم:</span>
                                <span className="text-gray-800 mr-2">{detailsLesson.teacherName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">الفصل:</span>
                                <span className="text-gray-800 mr-2">{detailsLesson.className}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">النوع:</span>
                                <span className="text-gray-800 mr-2">
                                    {detailsLesson.type === 'direct' ? 'مباشر' :
                                        detailsLesson.type === 'group' ? 'جماعي' : 'واجب'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">التاريخ:</span>
                                <span className="text-gray-800 mr-2">
                                    {detailsLesson.startTime.toLocaleDateString('ar-EG')}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">الوقت:</span>
                                <span className="text-gray-800 mr-2">
                                    {detailsLesson.startTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                    {' - '}
                                    {detailsLesson.endTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">المرفقات:</span>
                                <span className="text-gray-800 mr-2">{detailsLesson.materialsCount} ملف</span>
                            </div>
                            <div>
                                <span className="text-gray-500">الحالة:</span>
                                <span className={`admin-badge mr-2 ${detailsLesson.status === 'live' ? 'admin-badge-live' :
                                        detailsLesson.status === 'scheduled' ? 'admin-badge-upcoming' :
                                            'admin-badge-completed'
                                    }`}>
                                    {detailsLesson.status === 'live' ? 'مباشر' :
                                        detailsLesson.status === 'scheduled' ? 'مجدول' : 'منتهي'}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setDetailsLesson(null);
                                    handleEdit(detailsLesson);
                                }}
                                className="admin-btn admin-btn-primary flex-1"
                            >
                                تعديل
                            </button>
                            <button
                                onClick={() => setDetailsLesson(null)}
                                className="admin-btn admin-btn-secondary flex-1"
                            >
                                إغلاق
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
