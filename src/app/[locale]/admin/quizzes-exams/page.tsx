'use client';

import { useState, useEffect } from 'react';
import {
    FileQuestion,
    Plus,
    Users,
    Clock,
    CheckCircle,
    BarChart3,
    Download,
    Play,
    Calendar,
    Award,
    TrendingUp,
    PlusCircle,
    Trash2,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState } from '@/components/admin/StateComponents';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';
import { StandardActionsDropdown } from '@/components/admin/DropdownMenu';

interface QuizExam {
    id: string;
    title: string;
    description?: string;
    type: 'quiz' | 'exam';
    subject: string;
    className: string;
    teacherName: string;
    scheduledAt: Date;
    duration: number;
    totalMarks: number;
    status: 'draft' | 'scheduled' | 'active' | 'completed';
    submissionsCount: number;
    totalStudents: number;
    averageScore?: number;
    passingScore: number;
    questionsCount: number;
}

interface QuizFormData {
    title: string;
    description: string;
    type: 'quiz' | 'exam';
    subject: string;
    className: string;
    teacherName: string;
    date: string;
    time: string;
    duration: number;
    totalMarks: number;
    passingScore: number;
    questionsCount: number;
}

const initialFormData: QuizFormData = {
    title: '',
    description: '',
    type: 'quiz',
    subject: '',
    className: '',
    teacherName: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: 30,
    totalMarks: 100,
    passingScore: 50,
    questionsCount: 20,
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

const subjects = [
    { id: '1', name: 'الرياضيات' },
    { id: '2', name: 'الفيزياء' },
    { id: '3', name: 'الكيمياء' },
    { id: '4', name: 'اللغة العربية' },
    { id: '5', name: 'اللغة الإنجليزية' },
];

export default function QuizzesExamsPage() {
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<QuizExam[]>([]);
    const [showNewModal, setShowNewModal] = useState(false);
    const [formData, setFormData] = useState<QuizFormData>(initialFormData);
    const [editingQuiz, setEditingQuiz] = useState<QuizExam | null>(null);
    const [selectedQuiz, setSelectedQuiz] = useState<QuizExam | null>(null);
    const [filterType, setFilterType] = useState<'all' | 'quiz' | 'exam'>('all');
    const [modalTab, setModalTab] = useState<'info' | 'sessions'>('info');
    const [sessions, setSessions] = useState<{ id: string; date: string; time: string; group: string; class: string; notes: string }[]>([]);
    const [newSession, setNewSession] = useState({ date: '', time: '', group: '', class: '', notes: '' });

    useEffect(() => {
        const today = new Date();
        const mockQuizzes: QuizExam[] = [
            {
                id: '1',
                title: 'اختبار الوحدة الأولى',
                description: 'اختبار شامل على الوحدة الأولى في مادة الرياضيات',
                type: 'quiz',
                subject: 'الرياضيات',
                className: 'الصف التاسع أ',
                teacherName: 'أ. أحمد محمد',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 9, 0),
                duration: 30,
                totalMarks: 50,
                status: 'scheduled',
                submissionsCount: 0,
                totalStudents: 25,
                passingScore: 25,
                questionsCount: 15,
            },
            {
                id: '2',
                title: 'امتحان نصف الفصل',
                description: 'امتحان نصف الفصل الدراسي في مادة الفيزياء',
                type: 'exam',
                subject: 'الفيزياء',
                className: 'الصف العاشر أ',
                teacherName: 'أ. خالد العمري',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 3, 10, 0),
                duration: 60,
                totalMarks: 100,
                status: 'completed',
                submissionsCount: 28,
                totalStudents: 28,
                averageScore: 72,
                passingScore: 50,
                questionsCount: 30,
            },
            {
                id: '3',
                title: 'اختبار القواعد النحوية',
                description: 'اختبار سريع على قواعد النحو',
                type: 'quiz',
                subject: 'اللغة العربية',
                className: 'الصف الثامن أ',
                teacherName: 'أ. محمد علي',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3, 11, 0),
                duration: 20,
                totalMarks: 30,
                status: 'scheduled',
                submissionsCount: 0,
                totalStudents: 22,
                passingScore: 15,
                questionsCount: 10,
            },
            {
                id: '4',
                title: 'امتحان الكيمياء العضوية',
                description: 'امتحان شامل على المركبات العضوية',
                type: 'exam',
                subject: 'الكيمياء',
                className: 'الصف العاشر ب',
                teacherName: 'أ. فاطمة حسن',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7, 9, 0),
                duration: 90,
                totalMarks: 100,
                status: 'completed',
                submissionsCount: 24,
                totalStudents: 26,
                averageScore: 68,
                passingScore: 50,
                questionsCount: 40,
            },
            {
                id: '5',
                title: 'اختبار المفردات الإنجليزية',
                description: 'Vocabulary test unit 5',
                type: 'quiz',
                subject: 'اللغة الإنجليزية',
                className: 'الصف التاسع ب',
                teacherName: 'أ. سارة أحمد',
                scheduledAt: new Date(),
                duration: 15,
                totalMarks: 25,
                status: 'active',
                submissionsCount: 12,
                totalStudents: 23,
                passingScore: 13,
                questionsCount: 25,
            },
            {
                id: '6',
                title: 'امتحان الهندسة الفراغية',
                description: 'امتحان على الأشكال ثلاثية الأبعاد',
                type: 'exam',
                subject: 'الرياضيات',
                className: 'الصف العاشر أ',
                teacherName: 'أ. أحمد محمد',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7, 8, 0),
                duration: 75,
                totalMarks: 100,
                status: 'draft',
                submissionsCount: 0,
                totalStudents: 25,
                passingScore: 50,
                questionsCount: 35,
            },
            {
                id: '7',
                title: 'اختبار قوانين الحركة',
                description: 'اختبار قصير على قوانين نيوتن',
                type: 'quiz',
                subject: 'الفيزياء',
                className: 'الصف التاسع أ',
                teacherName: 'أ. خالد العمري',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10, 10, 0),
                duration: 25,
                totalMarks: 40,
                status: 'completed',
                submissionsCount: 25,
                totalStudents: 25,
                averageScore: 82,
                passingScore: 20,
                questionsCount: 12,
            },
            {
                id: '8',
                title: 'امتحان نهاية الوحدة الثانية',
                description: 'امتحان شامل على الوحدة الثانية',
                type: 'exam',
                subject: 'اللغة العربية',
                className: 'الصف الثامن ب',
                teacherName: 'أ. محمد علي',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5, 9, 30),
                duration: 60,
                totalMarks: 80,
                status: 'scheduled',
                submissionsCount: 0,
                totalStudents: 20,
                passingScore: 40,
                questionsCount: 25,
            },
            {
                id: '9',
                title: 'اختبار التفاعلات الكيميائية',
                description: 'اختبار على موازنة المعادلات',
                type: 'quiz',
                subject: 'الكيمياء',
                className: 'الصف العاشر أ',
                teacherName: 'أ. فاطمة حسن',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5, 11, 0),
                duration: 30,
                totalMarks: 50,
                status: 'completed',
                submissionsCount: 24,
                totalStudents: 25,
                averageScore: 76,
                passingScore: 25,
                questionsCount: 18,
            },
            {
                id: '10',
                title: 'امتحان Grammar النهائي',
                description: 'Final grammar examination',
                type: 'exam',
                subject: 'اللغة الإنجليزية',
                className: 'الصف التاسع أ',
                teacherName: 'أ. سارة أحمد',
                scheduledAt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10, 8, 0),
                duration: 45,
                totalMarks: 100,
                status: 'draft',
                submissionsCount: 0,
                totalStudents: 25,
                passingScore: 50,
                questionsCount: 50,
            },
        ];

        setTimeout(() => {
            setQuizzes(mockQuizzes);
            setLoading(false);
        }, 500);
    }, []);

    const filteredQuizzes = quizzes.filter(q =>
        filterType === 'all' ? true : q.type === filterType
    );

    const handleFormChange = (field: keyof QuizFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const [year, month, day] = formData.date.split('-').map(Number);
        const [hour, min] = formData.time.split(':').map(Number);

        const newQuiz: QuizExam = {
            id: editingQuiz?.id || Date.now().toString(),
            title: formData.title,
            description: formData.description,
            type: formData.type,
            subject: formData.subject,
            className: formData.className,
            teacherName: formData.teacherName,
            scheduledAt: new Date(year, month - 1, day, hour, min),
            duration: formData.duration,
            totalMarks: formData.totalMarks,
            status: 'scheduled',
            submissionsCount: 0,
            totalStudents: 25,
            passingScore: formData.passingScore,
            questionsCount: formData.questionsCount,
        };

        if (editingQuiz) {
            setQuizzes(prev => prev.map(q => q.id === editingQuiz.id ? newQuiz : q));
        } else {
            setQuizzes(prev => [...prev, newQuiz]);
        }

        closeModal();
    };

    const closeModal = () => {
        setShowNewModal(false);
        setFormData(initialFormData);
        setEditingQuiz(null);
    };

    const handleEdit = (quiz: QuizExam) => {
        setEditingQuiz(quiz);
        setFormData({
            title: quiz.title,
            description: quiz.description || '',
            type: quiz.type,
            subject: quiz.subject,
            className: quiz.className,
            teacherName: quiz.teacherName,
            date: quiz.scheduledAt.toISOString().split('T')[0],
            time: quiz.scheduledAt.toTimeString().slice(0, 5),
            duration: quiz.duration,
            totalMarks: quiz.totalMarks,
            passingScore: quiz.passingScore,
            questionsCount: quiz.questionsCount,
        });
        setShowNewModal(true);
    };

    const columns: Column<QuizExam>[] = [
        {
            key: 'title',
            header: 'العنوان',
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.type === 'exam'
                        ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                        : 'bg-gradient-to-br from-teal-500 to-teal-600'
                        }`}>
                        {item.type === 'exam' ? (
                            <Award className="w-5 h-5 text-white" />
                        ) : (
                            <FileQuestion className="w-5 h-5 text-white" />
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-500">{item.subject} - {item.className}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'type',
            header: 'النوع',
            render: (item) => (
                <span className={`admin-badge ${item.type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                    }`}>
                    {item.type === 'exam' ? 'امتحان' : 'اختبار'}
                </span>
            ),
        },
        {
            key: 'scheduledAt',
            header: 'التاريخ',
            sortable: true,
            render: (item) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{item.scheduledAt.toLocaleDateString('ar-EG')}</span>
                </div>
            ),
        },
        {
            key: 'duration',
            header: 'المدة',
            render: (item) => (
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{item.duration} دقيقة</span>
                </div>
            ),
        },
        {
            key: 'status',
            header: 'الحالة',
            render: (item) => {
                const statusConfig = {
                    draft: { badge: 'bg-gray-100 text-gray-600', label: 'مسودة' },
                    scheduled: { badge: 'admin-badge-upcoming', label: 'مجدول' },
                    active: { badge: 'admin-badge-live', label: 'نشط' },
                    completed: { badge: 'admin-badge-success', label: 'مكتمل' },
                };
                const config = statusConfig[item.status];
                return <span className={`admin-badge ${config.badge}`}>{config.label}</span>;
            },
        },
        {
            key: 'submissionsCount',
            header: 'التقديمات',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{item.submissionsCount}/{item.totalStudents}</span>
                </div>
            ),
        },
    ];

    // Stats calculations
    const totalQuizzes = quizzes.length;
    const scheduledCount = quizzes.filter(q => q.status === 'scheduled').length;
    const completedCount = quizzes.filter(q => q.status === 'completed').length;
    const avgScore = quizzes
        .filter(q => q.averageScore !== undefined)
        .reduce((sum, q) => sum + (q.averageScore || 0), 0) /
        (quizzes.filter(q => q.averageScore !== undefined).length || 1);

    if (loading) {
        return <LoadingState message="جاري تحميل الاختبارات..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الاختبارات والامتحانات</h1>
                    <p className="text-gray-500">إدارة الاختبارات وبنك الأسئلة</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        تصدير النتائج
                    </button>
                    <button
                        onClick={() => {
                            setEditingQuiz(null);
                            setFormData(initialFormData);
                            setShowNewModal(true);
                        }}
                        className="admin-btn admin-btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        اختبار جديد
                    </button>
                </div>
            </div>

            {/* Stats Cards - Premium Design */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    className="admin-card p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">{totalQuizzes}</p>
                            <p className="text-blue-100 text-sm mt-1">إجمالي الاختبارات</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <FileQuestion className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div
                    className="admin-card p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">{scheduledCount}</p>
                            <p className="text-teal-100 text-sm mt-1">مجدولة</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <Clock className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div
                    className="admin-card p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">{completedCount}</p>
                            <p className="text-green-100 text-sm mt-1">مكتملة</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <CheckCircle className="w-6 h-6" />
                        </div>
                    </div>
                </div>
                <div
                    className="admin-card p-5 text-white hover:shadow-xl transition-all hover:-translate-y-1"
                    style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-3xl font-bold">{Math.round(avgScore)}%</p>
                            <p className="text-purple-100 text-sm mt-1">متوسط النتائج</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                            <TrendingUp className="w-6 h-6" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'all'
                        ? 'bg-teal-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    الكل ({quizzes.length})
                </button>
                <button
                    onClick={() => setFilterType('quiz')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'quiz'
                        ? 'bg-teal-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    اختبارات ({quizzes.filter(q => q.type === 'quiz').length})
                </button>
                <button
                    onClick={() => setFilterType('exam')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === 'exam'
                        ? 'bg-teal-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                >
                    امتحانات ({quizzes.filter(q => q.type === 'exam').length})
                </button>
            </div>

            {/* Table */}
            <DataTable
                data={filteredQuizzes}
                columns={columns}
                searchKey="title"
                searchPlaceholder="بحث عن اختبار..."
                emptyTitle="لا توجد اختبارات"
                emptyMessage="قم بإضافة اختبار جديد للبدء"
                onRowClick={(quiz) => setSelectedQuiz(quiz)}
                actions={(item) => (
                    <div className="flex items-center gap-2">
                        {item.status === 'active' && (
                            <button className="admin-btn admin-btn-primary text-sm py-1 px-2">
                                <Play className="w-4 h-4" />
                            </button>
                        )}
                        {item.status === 'completed' && (
                            <button className="admin-btn admin-btn-ghost text-sm py-1 px-2">
                                <BarChart3 className="w-4 h-4" />
                            </button>
                        )}
                        <StandardActionsDropdown
                            onViewDetails={() => setSelectedQuiz(item)}
                            onEdit={() => handleEdit(item)}
                            onDuplicate={() => {
                                const dup = { ...item, id: Date.now().toString(), title: `نسخة من ${item.title}`, status: 'draft' as const };
                                setQuizzes(prev => [...prev, dup]);
                            }}
                            onDelete={() => setQuizzes(prev => prev.filter(q => q.id !== item.id))}
                        />
                    </div>
                )}
            />

            {/* New/Edit Modal */}
            <Modal
                isOpen={showNewModal}
                onClose={closeModal}
                title={editingQuiz ? 'تعديل الاختبار' : 'اختبار جديد'}
                size="lg"
                footer={
                    <>
                        <button onClick={closeModal} className="admin-btn admin-btn-secondary">إلغاء</button>
                        <button type="submit" form="quiz-form" className="admin-btn admin-btn-primary">
                            {editingQuiz ? 'حفظ التغييرات' : 'إنشاء الاختبار'}
                        </button>
                    </>
                }
            >
                <form id="quiz-form" onSubmit={handleSubmit}>
                    <FormGroup>
                        <FormLabel required>العنوان</FormLabel>
                        <FormInput
                            value={formData.title}
                            onChange={(e) => handleFormChange('title', e.target.value)}
                            placeholder="عنوان الاختبار"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel>الوصف</FormLabel>
                        <FormTextarea
                            value={formData.description}
                            onChange={(e) => handleFormChange('description', e.target.value)}
                            placeholder="وصف مختصر للاختبار..."
                            rows={2}
                        />
                    </FormGroup>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required>النوع</FormLabel>
                            <FormSelect
                                value={formData.type}
                                onChange={(e) => handleFormChange('type', e.target.value)}
                                required
                            >
                                <option value="quiz">اختبار قصير</option>
                                <option value="exam">امتحان</option>
                            </FormSelect>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required>المادة</FormLabel>
                            <FormSelect
                                value={formData.subject}
                                onChange={(e) => handleFormChange('subject', e.target.value)}
                                required
                            >
                                <option value="">اختر المادة</option>
                                {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                            </FormSelect>
                        </FormGroup>
                    </div>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required>الفصل</FormLabel>
                            <FormSelect
                                value={formData.className}
                                onChange={(e) => handleFormChange('className', e.target.value)}
                                required
                            >
                                <option value="">اختر الفصل</option>
                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </FormSelect>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required>المعلم</FormLabel>
                            <FormSelect
                                value={formData.teacherName}
                                onChange={(e) => handleFormChange('teacherName', e.target.value)}
                                required
                            >
                                <option value="">اختر المعلم</option>
                                {teachers.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                            </FormSelect>
                        </FormGroup>
                    </div>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required>التاريخ</FormLabel>
                            <FormInput
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleFormChange('date', e.target.value)}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required>الوقت</FormLabel>
                            <FormInput
                                type="time"
                                value={formData.time}
                                onChange={(e) => handleFormChange('time', e.target.value)}
                                required
                            />
                        </FormGroup>
                    </div>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required>المدة (دقيقة)</FormLabel>
                            <FormInput
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                                min={5}
                                max={180}
                                required
                            />
                        </FormGroup>
                        <FormGroup>
                            <FormLabel required>الدرجة الكلية</FormLabel>
                            <FormInput
                                type="number"
                                value={formData.totalMarks}
                                onChange={(e) => handleFormChange('totalMarks', parseInt(e.target.value))}
                                min={10}
                                required
                            />
                        </FormGroup>
                    </div>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel required>درجة النجاح</FormLabel>
                            <FormInput
                                type="number"
                                value={formData.passingScore}
                                onChange={(e) => handleFormChange('passingScore', parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </FormGroup>
                        <FormGroup className="mb-0">
                            <FormLabel required>عدد الأسئلة</FormLabel>
                            <FormInput
                                type="number"
                                value={formData.questionsCount}
                                onChange={(e) => handleFormChange('questionsCount', parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </FormGroup>
                    </div>
                </form>
            </Modal>

            {/* Details Modal - Enhanced with Tabs */}
            <Modal
                isOpen={!!selectedQuiz}
                onClose={() => { setSelectedQuiz(null); setModalTab('info'); }}
                title={selectedQuiz?.title || 'تفاصيل الاختبار'}
                size="lg"
            >
                {selectedQuiz && (
                    <div className="space-y-4">
                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200 pb-2">
                            <button
                                onClick={() => setModalTab('info')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${modalTab === 'info'
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                المعلومات
                            </button>
                            <button
                                onClick={() => setModalTab('sessions')}
                                className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-2 ${modalTab === 'sessions'
                                        ? 'bg-teal-500 text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                <Calendar className="w-4 h-4" />
                                الجلسات
                            </button>
                        </div>

                        {/* Tab Content */}
                        {modalTab === 'info' && (
                            <div className="space-y-4">
                                <p className="text-gray-600">{selectedQuiz.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">المادة</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.subject}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">الفصل</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.className}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">المعلم</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.teacherName}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">التاريخ</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.scheduledAt.toLocaleDateString('ar-EG')}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">المدة</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.duration} دقيقة</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">عدد الأسئلة</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.questionsCount}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">الدرجة الكلية</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.totalMarks}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <span className="text-gray-500 block text-xs">درجة النجاح</span>
                                        <span className="font-medium text-gray-800">{selectedQuiz.passingScore}</span>
                                    </div>
                                </div>

                                {selectedQuiz.status === 'completed' && selectedQuiz.averageScore && (
                                    <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #EFF6FF 100%)' }}>
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">متوسط الدرجات:</span>
                                            <span className="text-2xl font-bold text-teal-600">{selectedQuiz.averageScore}%</span>
                                        </div>
                                        <div className="mt-2 h-2 bg-white rounded-full">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${selectedQuiz.averageScore}%`,
                                                    background: 'linear-gradient(90deg, #14B8A6 0%, #3B82F6 100%)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {modalTab === 'sessions' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-700">الجلسات المتزامنة ({sessions.length})</h4>
                                </div>

                                {/* Sessions List */}
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="text-gray-600">{session.date}</span>
                                                    <span className="text-teal-600 font-medium">{session.time}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{session.group}</span>
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{session.class}</span>
                                                </div>
                                                {session.notes && <p className="text-xs text-gray-400 mt-1">{session.notes}</p>}
                                            </div>
                                            <button
                                                onClick={() => setSessions(prev => prev.filter(s => s.id !== session.id))}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Session */}
                                <div className="p-4 border border-dashed border-gray-300 rounded-xl">
                                    <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <PlusCircle className="w-4 h-4 text-teal-500" />
                                        إضافة جلسة جديدة
                                    </h5>
                                    <div className="grid grid-cols-2 gap-3">
                                        <FormGroup className="mb-0">
                                            <FormLabel>التاريخ</FormLabel>
                                            <FormInput
                                                type="date"
                                                value={newSession.date}
                                                onChange={(e) => setNewSession(prev => ({ ...prev, date: e.target.value }))}
                                            />
                                        </FormGroup>
                                        <FormGroup className="mb-0">
                                            <FormLabel>الوقت</FormLabel>
                                            <FormInput
                                                type="time"
                                                value={newSession.time}
                                                onChange={(e) => setNewSession(prev => ({ ...prev, time: e.target.value }))}
                                            />
                                        </FormGroup>
                                        <FormGroup className="mb-0">
                                            <FormLabel>المجموعة</FormLabel>
                                            <FormSelect
                                                value={newSession.group}
                                                onChange={(e) => setNewSession(prev => ({ ...prev, group: e.target.value }))}
                                            >
                                                <option value="">اختر المجموعة</option>
                                                <option value="المجموعة أ">المجموعة أ</option>
                                                <option value="المجموعة ب">المجموعة ب</option>
                                                <option value="المجموعة ج">المجموعة ج</option>
                                            </FormSelect>
                                        </FormGroup>
                                        <FormGroup className="mb-0">
                                            <FormLabel>الفصل</FormLabel>
                                            <FormSelect
                                                value={newSession.class}
                                                onChange={(e) => setNewSession(prev => ({ ...prev, class: e.target.value }))}
                                            >
                                                <option value="">اختر الفصل</option>
                                                {classes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                            </FormSelect>
                                        </FormGroup>
                                    </div>
                                    <FormGroup className="mt-3 mb-0">
                                        <FormLabel>ملاحظات</FormLabel>
                                        <FormInput
                                            value={newSession.notes}
                                            onChange={(e) => setNewSession(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="أي ملاحظات إضافية..."
                                        />
                                    </FormGroup>
                                    <button
                                        onClick={() => {
                                            if (newSession.date && newSession.time && newSession.group && newSession.class) {
                                                setSessions(prev => [...prev, { ...newSession, id: Date.now().toString() }]);
                                                setNewSession({ date: '', time: '', group: '', class: '', notes: '' });
                                            }
                                        }}
                                        className="admin-btn admin-btn-primary w-full mt-4"
                                    >
                                        <PlusCircle className="w-4 h-4" />
                                        إضافة الجلسة
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-2 pt-4 border-t">
                            <button
                                onClick={() => {
                                    setSelectedQuiz(null);
                                    setModalTab('info');
                                    handleEdit(selectedQuiz);
                                }}
                                className="admin-btn admin-btn-primary flex-1"
                            >تعديل</button>
                            <button onClick={() => { setSelectedQuiz(null); setModalTab('info'); }} className="admin-btn admin-btn-secondary flex-1">إغلاق</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
