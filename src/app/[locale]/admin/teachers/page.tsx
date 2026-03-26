'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Users,
    Plus,
    DollarSign,
    Download,
    MoreHorizontal,
    Star,
    Eye,
    Edit,
    Calendar,
    MessageSquare,
    FileText,
    UserX,
    Trash2,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState } from '@/components/admin/StateComponents';
import TeacherFormModal, { TeacherFormData } from '@/components/admin/teachers/TeacherFormModal';
import TeacherDetailModal from '@/components/admin/teachers/TeacherDetailModal';
import AttendanceCalendar from '@/components/admin/teachers/AttendanceCalendar';

interface Teacher {
    id: string;
    name: string;
    email: string;
    phone: string;
    subjects: string[];
    lessonsCount: number;
    salaryBase: number;
    lessonPrice: number;
    status: 'active' | 'inactive';
    image?: string;
    // Extended fields
    bankName?: string;
    bankAccountNumber?: string;
    iban?: string;
    salaryBonus?: number;
    performanceRating: number;
    classesThisMonth: number;
    attendanceRate: number;
    assignedGroups: string[];
    languagesTeaching: string[];
    joinedDate: string;
    nationality?: string;
}

function TeacherActions({ teacher, onView, onEdit, onDelete }: {
    teacher: Teacher;
    onView: (t: Teacher) => void;
    onEdit: (t: Teacher) => void;
    onDelete: (t: Teacher) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const actions = [
        { icon: Eye, label: 'عرض التفاصيل', onClick: () => { onView(teacher); setIsOpen(false); } },
        { icon: Edit, label: 'تعديل', onClick: () => { onEdit(teacher); setIsOpen(false); } },
        { icon: Calendar, label: 'عرض الحضور', onClick: () => { onView(teacher); setIsOpen(false); } },
        { icon: MessageSquare, label: 'عرض التقييمات', onClick: () => { onView(teacher); setIsOpen(false); } },
        { icon: FileText, label: 'المستندات', onClick: () => { onView(teacher); setIsOpen(false); } },
        { divider: true },
        { icon: UserX, label: teacher.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل', onClick: () => setIsOpen(false) },
        { icon: Trash2, label: 'حذف', danger: true, onClick: () => { onDelete(teacher); setIsOpen(false); } },
    ];

    return (
        <div className="admin-dropdown-container" ref={dropdownRef}>
            <button
                className="admin-btn admin-btn-ghost admin-btn-icon"
                onClick={() => setIsOpen(!isOpen)}
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>
            {isOpen && (
                <div className="admin-dropdown">
                    {actions.map((action, idx) =>
                        action.divider ? (
                            <div key={idx} className="admin-dropdown-divider" />
                        ) : (
                            <button
                                key={idx}
                                className={`admin-dropdown-item ${action.danger ? 'admin-dropdown-item-danger' : ''}`}
                                onClick={action.onClick}
                            >
                                {action.icon && <action.icon className="w-4 h-4" />}
                                {action.label}
                            </button>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

function PerformanceStars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

export default function TeachersPage() {
    const [loading, setLoading] = useState(true);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

    useEffect(() => {
        // Enhanced mock data with all new fields
        const mockTeachers: Teacher[] = [
            {
                id: '1',
                name: 'أ. أحمد محمد',
                email: 'ahmed@school.com',
                phone: '+971501234567',
                subjects: ['الرياضيات', 'الفيزياء'],
                lessonsCount: 45,
                salaryBase: 5000,
                lessonPrice: 150,
                status: 'active',
                bankName: 'بنك أبوظبي الأول',
                bankAccountNumber: '1234567890',
                iban: 'AE123456789012345678901',
                salaryBonus: 500,
                performanceRating: 5,
                classesThisMonth: 18,
                attendanceRate: 98,
                assignedGroups: ['الصف السادس', 'الصف السابع', 'الصف الثامن'],
                languagesTeaching: ['العربية', 'الإنجليزية'],
                joinedDate: '2024-01-15',
                nationality: 'مصري',
            },
            {
                id: '2',
                name: 'أ. سارة أحمد',
                email: 'sara@school.com',
                phone: '+971502345678',
                subjects: ['اللغة العربية'],
                lessonsCount: 38,
                salaryBase: 4500,
                lessonPrice: 130,
                status: 'active',
                bankName: 'بنك الإمارات دبي الوطني',
                bankAccountNumber: '0987654321',
                iban: 'AE987654321098765432109',
                salaryBonus: 300,
                performanceRating: 4,
                classesThisMonth: 15,
                attendanceRate: 95,
                assignedGroups: ['الصف الخامس', 'الصف السادس'],
                languagesTeaching: ['العربية'],
                joinedDate: '2024-03-20',
                nationality: 'إماراتي',
            },
            {
                id: '3',
                name: 'أ. محمد علي',
                email: 'mohamed@school.com',
                phone: '+971503456789',
                subjects: ['الكيمياء', 'الأحياء'],
                lessonsCount: 52,
                salaryBase: 5500,
                lessonPrice: 160,
                status: 'active',
                bankName: 'مصرف أبوظبي الإسلامي',
                bankAccountNumber: '5678901234',
                iban: 'AE567890123456789012345',
                salaryBonus: 700,
                performanceRating: 5,
                classesThisMonth: 22,
                attendanceRate: 100,
                assignedGroups: ['الصف التاسع', 'الصف العاشر', 'الصف الحادي عشر'],
                languagesTeaching: ['العربية', 'الإنجليزية'],
                joinedDate: '2023-09-01',
                nationality: 'أردني',
            },
            {
                id: '4',
                name: 'أ. فاطمة خالد',
                email: 'fatima@school.com',
                phone: '+971504567890',
                subjects: ['اللغة الإنجليزية'],
                lessonsCount: 40,
                salaryBase: 4800,
                lessonPrice: 140,
                status: 'inactive',
                bankName: 'بنك المشرق',
                bankAccountNumber: '3456789012',
                iban: 'AE345678901234567890123',
                salaryBonus: 200,
                performanceRating: 3,
                classesThisMonth: 0,
                attendanceRate: 85,
                assignedGroups: ['الصف الرابع', 'الصف الخامس'],
                languagesTeaching: ['الإنجليزية'],
                joinedDate: '2024-06-10',
                nationality: 'سوري',
            },
            {
                id: '5',
                name: 'أ. عمر حسن',
                email: 'omar@school.com',
                phone: '+971505678901',
                subjects: ['التاريخ', 'الجغرافيا'],
                lessonsCount: 35,
                salaryBase: 4200,
                lessonPrice: 120,
                status: 'active',
                bankName: 'بنك دبي التجاري',
                bankAccountNumber: '7890123456',
                iban: 'AE789012345678901234567',
                salaryBonus: 400,
                performanceRating: 4,
                classesThisMonth: 14,
                attendanceRate: 92,
                assignedGroups: ['الصف السابع', 'الصف الثامن', 'الصف التاسع'],
                languagesTeaching: ['العربية'],
                joinedDate: '2024-02-28',
                nationality: 'لبناني',
            },
        ];

        setTimeout(() => {
            setTeachers(mockTeachers);
            setLoading(false);
        }, 500);
    }, []);

    const handleAddTeacher = () => {
        setSelectedTeacher(null);
        setFormMode('create');
        setShowFormModal(true);
    };

    const handleEditTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setFormMode('edit');
        setShowFormModal(true);
    };

    const handleViewTeacher = (teacher: Teacher) => {
        setSelectedTeacher(teacher);
        setShowDetailModal(true);
    };

    const handleDeleteTeacher = (teacher: Teacher) => {
        if (confirm(`هل أنت متأكد من حذف ${teacher.name}؟`)) {
            setTeachers(prev => prev.filter(t => t.id !== teacher.id));
        }
    };

    const handleSaveTeacher = (data: TeacherFormData) => {
        if (formMode === 'create') {
            const newTeacher: Teacher = {
                id: Date.now().toString(),
                ...data,
                lessonsCount: 0,
                performanceRating: 0,
                classesThisMonth: 0,
                attendanceRate: 0,
            };
            setTeachers(prev => [...prev, newTeacher]);
        } else if (selectedTeacher) {
            setTeachers(prev => prev.map(t =>
                t.id === selectedTeacher.id
                    ? { ...t, ...data }
                    : t
            ));
        }
    };

    const columns: Column<Teacher>[] = [
        {
            key: 'name',
            header: 'المعلم',
            sortable: true,
            render: (teacher) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        {teacher.image ? (
                            <img loading="lazy" decoding="async" src={teacher.image} alt={teacher.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-teal-600 font-medium">
                                {teacher.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{teacher.name}</p>
                        <p className="text-sm text-gray-500">{teacher.subjects.join('، ')}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'البريد الإلكتروني',
            render: (teacher) => (
                <span className="text-gray-600">{teacher.email}</span>
            ),
        },
        {
            key: 'phone',
            header: 'الهاتف',
            render: (teacher) => (
                <span className="text-gray-600 dir-ltr">{teacher.phone}</span>
            ),
        },
        {
            key: 'assignedGroups',
            header: 'الصفوف',
            render: (teacher) => (
                <div className="flex flex-wrap gap-1">
                    {teacher.assignedGroups.slice(0, 2).map((group, idx) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                            {group}
                        </span>
                    ))}
                    {teacher.assignedGroups.length > 2 && (
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                            +{teacher.assignedGroups.length - 2}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'lessonsCount',
            header: 'الدروس',
            sortable: true,
            render: (teacher) => (
                <span className="font-medium text-gray-800">{teacher.lessonsCount}</span>
            ),
        },
        {
            key: 'performanceRating',
            header: 'الأداء',
            sortable: true,
            render: (teacher) => <PerformanceStars rating={teacher.performanceRating} />,
        },
        {
            key: 'attendanceRate',
            header: 'الحضور',
            sortable: true,
            render: (teacher) => (
                <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${teacher.attendanceRate >= 90 ? 'bg-green-500' :
                                teacher.attendanceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                            style={{ width: `${teacher.attendanceRate}%` }}
                        />
                    </div>
                    <span className="text-sm text-gray-600">{teacher.attendanceRate}%</span>
                </div>
            ),
        },
        {
            key: 'salary',
            header: 'الراتب',
            sortable: true,
            render: (teacher) => (
                <div>
                    <p className="font-medium text-gray-800">
                        {((teacher.salaryBase || 0) + (teacher.salaryBonus || 0)).toLocaleString('ar-EG')} د.إ
                    </p>
                    {teacher.salaryBonus && teacher.salaryBonus > 0 && (
                        <p className="text-xs text-green-600">+{teacher.salaryBonus.toLocaleString('ar-EG')} مكافأة</p>
                    )}
                </div>
            ),
        },
        {
            key: 'bankName',
            header: 'البنك',
            render: (teacher) => (
                <div>
                    <p className="text-sm text-gray-600">{teacher.bankName || '-'}</p>
                    {teacher.bankAccountNumber && (
                        <p className="text-xs text-gray-400">****{teacher.bankAccountNumber.slice(-4)}</p>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: 'الحالة',
            render: (teacher) => (
                <span
                    className={`admin-badge ${teacher.status === 'active' ? 'admin-badge-success' : 'admin-badge-error'
                        }`}
                >
                    {teacher.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
            ),
        },
    ];

    if (loading) {
        return <LoadingState message="جاري تحميل بيانات المعلمين..." />;
    }

    const totalSalary = teachers.reduce((sum, t) => sum + (t.salaryBase || 0) + (t.salaryBonus || 0), 0);
    const avgPerformance = teachers.length > 0
        ? (teachers.reduce((sum, t) => sum + t.performanceRating, 0) / teachers.length).toFixed(1)
        : 0;
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">المعلمون</h1>
                    <p className="text-gray-500">إدارة المعلمين والرواتب</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                    <button
                        onClick={handleAddTeacher}
                        className="admin-btn admin-btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        معلم جديد
                    </button>
                </div>
            </div>

            {/* Stats - Enhanced */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="admin-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
                            <p className="text-sm text-gray-500">إجمالي المعلمين</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {teachers.filter((t) => t.status === 'active').length}
                            </p>
                            <p className="text-sm text-gray-500">نشط</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {teachers.reduce((sum, t) => sum + t.lessonsCount, 0)}
                            </p>
                            <p className="text-sm text-gray-500">إجمالي الدروس</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                            <Star className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800 flex items-center gap-1">
                                {avgPerformance}
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            </p>
                            <p className="text-sm text-gray-500">متوسط الأداء</p>
                        </div>
                    </div>
                </div>
                <div className="admin-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">
                                {totalSalary.toLocaleString('ar-EG')}
                            </p>
                            <p className="text-sm text-gray-500">إجمالي الرواتب</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Teachers Table */}
            <DataTable
                data={teachers}
                columns={columns}
                searchKey="name"
                searchPlaceholder="بحث بالاسم..."
                emptyTitle="لا يوجد معلمون"
                emptyMessage="قم بإضافة معلم جديد للبدء"
                onRowClick={handleViewTeacher}
                actions={(teacher) => (
                    <TeacherActions
                        teacher={teacher}
                        onView={handleViewTeacher}
                        onEdit={handleEditTeacher}
                        onDelete={handleDeleteTeacher}
                    />
                )}
            />

            {/* Attendance Calendar Section */}
            <AttendanceCalendar showSummaryOnly={false} />

            {/* Add/Edit Teacher Modal */}
            <TeacherFormModal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                onSave={handleSaveTeacher}
                mode={formMode}
                initialData={selectedTeacher ? {
                    name: selectedTeacher.name,
                    email: selectedTeacher.email,
                    phone: selectedTeacher.phone,
                    nationality: selectedTeacher.nationality || '',
                    joinedDate: selectedTeacher.joinedDate,
                    subjects: selectedTeacher.subjects,
                    languagesTeaching: selectedTeacher.languagesTeaching,
                    assignedGroups: selectedTeacher.assignedGroups,
                    salaryBase: selectedTeacher.salaryBase,
                    lessonPrice: selectedTeacher.lessonPrice,
                    salaryBonus: selectedTeacher.salaryBonus || 0,
                    bankName: selectedTeacher.bankName || '',
                    bankAccountNumber: selectedTeacher.bankAccountNumber || '',
                    iban: selectedTeacher.iban || '',
                    status: selectedTeacher.status,
                    notes: '',
                } : undefined}
            />

            {/* Teacher Detail Modal */}
            <TeacherDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                teacher={selectedTeacher}
            />
        </div>
    );
}
