'use client';

import { useState, useEffect } from 'react';
import {
    GraduationCap,
    Plus,
    Mail,
    Phone,
    DollarSign,
    Download,
    CheckCircle,
    Clock,
    Calendar,
    Copy,
    User,
    CreditCard,
} from 'lucide-react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { LoadingState } from '@/components/admin/StateComponents';
import Modal from '@/components/admin/Modal';
import { StandardActionsDropdown } from '@/components/admin/DropdownMenu';

interface AttendanceRecord {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
}

interface FeePayment {
    id: string;
    amount: number;
    date: Date;
    method: 'cash' | 'card' | 'transfer';
    note?: string;
}

interface Student {
    id: string;
    name: string;
    email: string;
    phone: string;
    guardianPhone?: string;
    grade: string;
    className: string;
    feesStatus: 'paid' | 'partial' | 'pending';
    feesPaid: number;
    feesTotal: number;
    enrolledAt: Date;
    image?: string;
    attendanceRate: number;
    attendanceRecords: AttendanceRecord[];
    feePayments: FeePayment[];
}

interface Toast {
    message: string;
    visible: boolean;
}

export default function StudentsPage() {
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [activeDetailTab, setActiveDetailTab] = useState<'info' | 'fees' | 'attendance'>('info');
    const [toast, setToast] = useState<Toast>({ message: '', visible: false });
    const [activeFilter, setActiveFilter] = useState<'all' | 'paid' | 'partial' | 'pending'>('all');

    // Generate attendance records for the current month
    const generateAttendanceRecords = (): AttendanceRecord[] => {
        const records: AttendanceRecord[] = [];
        const today = new Date();
        for (let i = 1; i <= today.getDate(); i++) {
            // Skip weekends (Friday & Saturday)
            const date = new Date(today.getFullYear(), today.getMonth(), i);
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 5 || dayOfWeek === 6) continue;

            const random = Math.random();
            let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
            if (random > 0.9) status = 'absent';
            else if (random > 0.8) status = 'late';
            else if (random > 0.75) status = 'excused';

            records.push({
                date: date.toISOString().split('T')[0],
                status,
            });
        }
        return records;
    };

    // Generate fee payments
    const generateFeePayments = (total: number, paid: number): FeePayment[] => {
        if (paid === 0) return [];
        const payments: FeePayment[] = [];
        let remaining = paid;
        let paymentCount = Math.ceil(paid / 5000);

        for (let i = 0; i < paymentCount && remaining > 0; i++) {
            const amount = Math.min(5000, remaining);
            payments.push({
                id: `pay-${i}`,
                amount,
                date: new Date(Date.now() - (i * 30 * 24 * 60 * 60 * 1000)),
                method: ['cash', 'card', 'transfer'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'transfer',
            });
            remaining -= amount;
        }
        return payments;
    };

    useEffect(() => {
        // Extended mock data with 15 students
        const mockStudents: Student[] = [
            {
                id: '1',
                name: 'أحمد محمد سعيد',
                email: 'ahmed.s@school.com',
                phone: '+971501111111',
                guardianPhone: '+971502222222',
                grade: 'الصف التاسع',
                className: 'أ',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 95,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '2',
                name: 'فاطمة علي حسن',
                email: 'fatima.h@school.com',
                phone: '+971503333333',
                guardianPhone: '+971504444444',
                grade: 'الصف العاشر',
                className: 'ب',
                feesStatus: 'partial',
                feesPaid: 7500,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 88,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 7500),
            },
            {
                id: '3',
                name: 'محمد خالد أحمد',
                email: 'mohamed.k@school.com',
                phone: '+971505555555',
                grade: 'الصف الثامن',
                className: 'أ',
                feesStatus: 'pending',
                feesPaid: 0,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 72,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: [],
            },
            {
                id: '4',
                name: 'سارة عبدالله المنصوري',
                email: 'sara.m@school.com',
                phone: '+971506666666',
                guardianPhone: '+971507777777',
                grade: 'الصف التاسع',
                className: 'ب',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 98,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '5',
                name: 'عمر حسين الشامسي',
                email: 'omar.s@school.com',
                phone: '+971508888888',
                guardianPhone: '+971509999999',
                grade: 'الصف العاشر',
                className: 'أ',
                feesStatus: 'partial',
                feesPaid: 10000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 85,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 10000),
            },
            {
                id: '6',
                name: 'نورة سعيد الكعبي',
                email: 'noura.k@school.com',
                phone: '+971510000000',
                grade: 'الصف الثامن',
                className: 'ب',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 92,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '7',
                name: 'يوسف علي النعيمي',
                email: 'yousef.n@school.com',
                phone: '+971511111111',
                guardianPhone: '+971512222222',
                grade: 'الصف التاسع',
                className: 'أ',
                feesStatus: 'pending',
                feesPaid: 0,
                feesTotal: 15000,
                enrolledAt: new Date('2025-10-15'),
                attendanceRate: 68,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: [],
            },
            {
                id: '8',
                name: 'مريم خليفة الهاشمي',
                email: 'mariam.h@school.com',
                phone: '+971513333333',
                grade: 'الصف العاشر',
                className: 'ب',
                feesStatus: 'partial',
                feesPaid: 5000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 90,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 5000),
            },
            {
                id: '9',
                name: 'راشد محمد البلوشي',
                email: 'rashid.b@school.com',
                phone: '+971514444444',
                guardianPhone: '+971515555555',
                grade: 'الصف الثامن',
                className: 'أ',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 96,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '10',
                name: 'لينا أحمد المزروعي',
                email: 'lina.m@school.com',
                phone: '+971516666666',
                grade: 'الصف التاسع',
                className: 'ب',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 94,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '11',
                name: 'سلطان خالد العامري',
                email: 'sultan.a@school.com',
                phone: '+971517777777',
                guardianPhone: '+971518888888',
                grade: 'الصف العاشر',
                className: 'أ',
                feesStatus: 'partial',
                feesPaid: 12000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 82,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 12000),
            },
            {
                id: '12',
                name: 'هند عبدالرحمن الفلاسي',
                email: 'hind.f@school.com',
                phone: '+971519999999',
                grade: 'الصف الثامن',
                className: 'ب',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 99,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '13',
                name: 'حمدان سعيد الكتبي',
                email: 'hamdan.k@school.com',
                phone: '+971520000000',
                guardianPhone: '+971521111111',
                grade: 'الصف التاسع',
                className: 'أ',
                feesStatus: 'pending',
                feesPaid: 3000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-10-01'),
                attendanceRate: 75,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 3000),
            },
            {
                id: '14',
                name: 'شيخة محمد الظاهري',
                email: 'sheikha.d@school.com',
                phone: '+971522222222',
                grade: 'الصف العاشر',
                className: 'ب',
                feesStatus: 'paid',
                feesPaid: 15000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 97,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 15000),
            },
            {
                id: '15',
                name: 'طارق علي السويدي',
                email: 'tariq.s@school.com',
                phone: '+971523333333',
                guardianPhone: '+971524444444',
                grade: 'الصف الثامن',
                className: 'أ',
                feesStatus: 'partial',
                feesPaid: 8000,
                feesTotal: 15000,
                enrolledAt: new Date('2025-09-01'),
                attendanceRate: 86,
                attendanceRecords: generateAttendanceRecords(),
                feePayments: generateFeePayments(15000, 8000),
            },
        ];

        setTimeout(() => {
            setStudents(mockStudents);
            setLoading(false);
        }, 500);
    }, []);

    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 2000);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        showToast(`تم نسخ ${label}`);
    };

    const handleRowClick = (student: Student) => {
        setSelectedStudent(student);
        setActiveDetailTab('info');
    };

    const columns: Column<Student>[] = [
        {
            key: 'name',
            header: 'الطالب',
            sortable: true,
            render: (student) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-teal-100 flex items-center justify-center">
                        {student.image ? (
                            <img loading="lazy" decoding="async" src={student.image} alt={student.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-teal-600 font-medium">
                                {student.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'grade',
            header: 'الصف',
            sortable: true,
            render: (student) => (
                <span className="text-gray-700">
                    {student.grade} - {student.className}
                </span>
            ),
        },
        {
            key: 'phone',
            header: 'الهاتف',
            render: (student) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(student.phone, 'رقم الهاتف');
                    }}
                    className="text-gray-600 dir-ltr hover:text-teal-600 flex items-center gap-1 transition-colors"
                >
                    {student.phone}
                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                </button>
            ),
        },
        {
            key: 'feesStatus',
            header: 'حالة الرسوم',
            render: (student) => {
                const statusConfig = {
                    paid: { badge: 'admin-badge-success', label: 'مدفوع', icon: CheckCircle },
                    partial: { badge: 'admin-badge-warning', label: 'جزئي', icon: Clock },
                    pending: { badge: 'admin-badge-error', label: 'معلق', icon: Clock },
                };
                const config = statusConfig[student.feesStatus];
                return (
                    <div className="flex flex-col gap-1">
                        <span className={`admin-badge ${config.badge}`}>{config.label}</span>
                        <span className="text-xs text-gray-500">
                            {student.feesPaid.toLocaleString('ar-EG')} / {student.feesTotal.toLocaleString('ar-EG')} ج.م
                        </span>
                    </div>
                );
            },
        },
        {
            key: 'attendanceRate',
            header: 'نسبة الحضور',
            sortable: true,
            render: (student) => {
                const rate = student.attendanceRate;
                const color = rate >= 90 ? 'text-green-600' : rate >= 75 ? 'text-yellow-600' : 'text-red-600';
                const bg = rate >= 90 ? 'bg-green-100' : rate >= 75 ? 'bg-yellow-100' : 'bg-red-100';
                return (
                    <div className="flex items-center gap-2">
                        <div className={`w-12 h-2 rounded-full ${bg}`}>
                            <div
                                className={`h-full rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${rate}%` }}
                            />
                        </div>
                        <span className={`text-sm font-medium ${color}`}>{rate}%</span>
                    </div>
                );
            },
        },
        {
            key: 'enrolledAt',
            header: 'تاريخ التسجيل',
            sortable: true,
            render: (student) => (
                <span className="text-gray-600">
                    {student.enrolledAt.toLocaleDateString('ar-EG')}
                </span>
            ),
        },
    ];

    const paidCount = students.filter((s) => s.feesStatus === 'paid').length;
    const partialCount = students.filter((s) => s.feesStatus === 'partial').length;
    const pendingCount = students.filter((s) => s.feesStatus === 'pending').length;

    // Filter students based on active filter
    const filteredStudents = activeFilter === 'all'
        ? students
        : students.filter((s) => s.feesStatus === activeFilter);

    const handleFilterClick = (filter: 'all' | 'paid' | 'partial' | 'pending') => {
        setActiveFilter(activeFilter === filter ? 'all' : filter);
    };

    if (loading) {
        return <LoadingState message="جاري تحميل بيانات الطلاب..." />;
    }

    return (
        <div className="space-y-6">
            {/* Toast notification */}
            {toast.visible && (
                <div className="admin-toast">
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">الطلاب</h1>
                    <p className="text-gray-500">إدارة الطلاب والتسجيل والرسوم</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="admin-btn admin-btn-ghost">
                        <Download className="w-4 h-4" />
                        تصدير
                    </button>
                    <button
                        className="admin-btn admin-btn-primary"
                    >
                        <Plus className="w-5 h-5" />
                        طالب جديد
                    </button>
                </div>
            </div>

            {/* Stats - Clickable filter cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                    onClick={() => handleFilterClick('all')}
                    className={`admin-card p-4 hover:shadow-lg transition-all text-end ${activeFilter === 'all' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                            <p className="text-sm text-gray-500">إجمالي الطلاب</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => handleFilterClick('paid')}
                    className={`admin-card p-4 hover:shadow-lg transition-all text-end ${activeFilter === 'paid' ? 'ring-2 ring-green-500 ring-offset-2' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{paidCount}</p>
                            <p className="text-sm text-gray-500">رسوم مدفوعة</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => handleFilterClick('partial')}
                    className={`admin-card p-4 hover:shadow-lg transition-all text-end ${activeFilter === 'partial' ? 'ring-2 ring-yellow-500 ring-offset-2' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{partialCount}</p>
                            <p className="text-sm text-gray-500">دفع جزئي</p>
                        </div>
                    </div>
                </button>
                <button
                    onClick={() => handleFilterClick('pending')}
                    className={`admin-card p-4 hover:shadow-lg transition-all text-end ${activeFilter === 'pending' ? 'ring-2 ring-red-500 ring-offset-2' : ''
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                            <p className="text-sm text-gray-500">رسوم معلقة</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Active filter indicator */}
            {activeFilter !== 'all' && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>تصفية حسب: </span>
                    <span className={`admin-badge ${activeFilter === 'paid' ? 'admin-badge-success' :
                            activeFilter === 'partial' ? 'admin-badge-warning' : 'admin-badge-error'
                        }`}>
                        {activeFilter === 'paid' ? 'مدفوع' : activeFilter === 'partial' ? 'جزئي' : 'معلق'}
                    </span>
                    <button
                        onClick={() => setActiveFilter('all')}
                        className="text-teal-600 hover:underline"
                    >
                        مسح التصفية
                    </button>
                </div>
            )}

            {/* Students Table */}
            <DataTable
                data={filteredStudents}
                columns={columns}
                searchKey="name"
                searchPlaceholder="بحث بالاسم..."
                emptyTitle={activeFilter !== 'all' ? 'لا يوجد طلاب بهذه التصفية' : 'لا يوجد طلاب'}
                emptyMessage={activeFilter !== 'all' ? 'جرب تصفية مختلفة' : 'قم بإضافة طالب جديد للبدء'}
                onRowClick={handleRowClick}
                actions={(student) => (
                    <StandardActionsDropdown
                        onViewDetails={() => handleRowClick(student)}
                        onEdit={() => {}}
                        onDelete={() => {}}
                    />
                )}
            />

            {/* Student Details Modal */}
            <Modal
                isOpen={!!selectedStudent}
                onClose={() => setSelectedStudent(null)}
                title={selectedStudent?.name || 'تفاصيل الطالب'}
                size="xl"
            >
                {selectedStudent && (
                    <div>
                        {/* Detail Tabs */}
                        <div className="flex gap-2 mb-6 border-b pb-4">
                            <button
                                onClick={() => setActiveDetailTab('info')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDetailTab === 'info'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <User className="w-4 h-4 inline ml-2" />
                                المعلومات الشخصية
                            </button>
                            <button
                                onClick={() => setActiveDetailTab('fees')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDetailTab === 'fees'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <CreditCard className="w-4 h-4 inline ml-2" />
                                الرسوم والمدفوعات
                            </button>
                            <button
                                onClick={() => setActiveDetailTab('attendance')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeDetailTab === 'attendance'
                                    ? 'bg-teal-500 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Calendar className="w-4 h-4 inline ml-2" />
                                سجل الحضور
                            </button>
                        </div>

                        {/* Info Tab */}
                        {activeDetailTab === 'info' && (
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">البريد الإلكتروني</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedStudent.email, 'البريد الإلكتروني')}
                                            className="flex items-center gap-2 text-gray-800 hover:text-teal-600 transition-colors"
                                        >
                                            <Mail className="w-4 h-4" />
                                            {selectedStudent.email}
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">رقم الهاتف</label>
                                        <button
                                            onClick={() => copyToClipboard(selectedStudent.phone, 'رقم الهاتف')}
                                            className="flex items-center gap-2 text-gray-800 hover:text-teal-600 transition-colors dir-ltr"
                                        >
                                            <Phone className="w-4 h-4" />
                                            {selectedStudent.phone}
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    {selectedStudent.guardianPhone && (
                                        <div>
                                            <label className="text-sm text-gray-500">هاتف ولي الأمر</label>
                                            <button
                                                onClick={() => copyToClipboard(selectedStudent.guardianPhone!, 'هاتف ولي الأمر')}
                                                className="flex items-center gap-2 text-gray-800 hover:text-teal-600 transition-colors dir-ltr"
                                            >
                                                <Phone className="w-4 h-4" />
                                                {selectedStudent.guardianPhone}
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-gray-500">الصف</label>
                                        <p className="text-gray-800 font-medium">
                                            {selectedStudent.grade} - {selectedStudent.className}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">تاريخ التسجيل</label>
                                        <p className="text-gray-800 font-medium">
                                            {selectedStudent.enrolledAt.toLocaleDateString('ar-EG')}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">نسبة الحضور</label>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-3 bg-gray-100 rounded-full">
                                                <div
                                                    className={`h-full rounded-full ${selectedStudent.attendanceRate >= 90 ? 'bg-green-500' :
                                                        selectedStudent.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${selectedStudent.attendanceRate}%` }}
                                                />
                                            </div>
                                            <span className="font-bold text-gray-800">{selectedStudent.attendanceRate}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fees Tab */}
                        {activeDetailTab === 'fees' && (
                            <div className="space-y-6">
                                {/* Fee Summary */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-xl">
                                        <p className="text-sm text-gray-500">إجمالي الرسوم</p>
                                        <p className="text-2xl font-bold text-gray-800">
                                            {selectedStudent.feesTotal.toLocaleString('ar-EG')} ج.م
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl">
                                        <p className="text-sm text-green-600">المدفوع</p>
                                        <p className="text-2xl font-bold text-green-700">
                                            {selectedStudent.feesPaid.toLocaleString('ar-EG')} ج.م
                                        </p>
                                    </div>
                                    <div className="p-4 bg-red-50 rounded-xl">
                                        <p className="text-sm text-red-600">المتبقي</p>
                                        <p className="text-2xl font-bold text-red-700">
                                            {(selectedStudent.feesTotal - selectedStudent.feesPaid).toLocaleString('ar-EG')} ج.م
                                        </p>
                                    </div>
                                </div>

                                {/* Payment History */}
                                <div>
                                    <h4 className="font-semibold text-gray-800 mb-3">سجل المدفوعات</h4>
                                    {selectedStudent.feePayments.length === 0 ? (
                                        <p className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">
                                            لا توجد مدفوعات مسجلة
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedStudent.feePayments.map((payment) => (
                                                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-800">
                                                                {payment.amount.toLocaleString('ar-EG')} ج.م
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.date.toLocaleDateString('ar-EG')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="admin-badge bg-gray-100 text-gray-600">
                                                        {payment.method === 'cash' ? 'نقدي' :
                                                            payment.method === 'card' ? 'بطاقة' : 'تحويل'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Attendance Tab */}
                        {activeDetailTab === 'attendance' && (
                            <div className="space-y-4">
                                {/* Attendance Legend */}
                                <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded bg-green-500" />
                                        <span>حاضر</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded bg-red-500" />
                                        <span>غائب</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded bg-yellow-500" />
                                        <span>متأخر</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-4 h-4 rounded bg-blue-500" />
                                        <span>عذر</span>
                                    </div>
                                </div>

                                {/* Attendance Grid */}
                                <div className="grid grid-cols-7 gap-2">
                                    {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day) => (
                                        <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                                            {day}
                                        </div>
                                    ))}
                                    {selectedStudent.attendanceRecords.map((record, index) => {
                                        const colors = {
                                            present: 'bg-green-500',
                                            absent: 'bg-red-500',
                                            late: 'bg-yellow-500',
                                            excused: 'bg-blue-500',
                                        };
                                        const date = new Date(record.date);
                                        return (
                                            <div
                                                key={index}
                                                className={`aspect-square rounded-lg ${colors[record.status]} flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity`}
                                                title={`${date.toLocaleDateString('ar-EG')} - ${record.status === 'present' ? 'حاضر' :
                                                    record.status === 'absent' ? 'غائب' :
                                                        record.status === 'late' ? 'متأخر' : 'عذر'
                                                    }`}
                                            >
                                                {date.getDate()}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Attendance Stats */}
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {selectedStudent.attendanceRecords.filter(r => r.status === 'present').length}
                                        </p>
                                        <p className="text-sm text-green-600">حاضر</p>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <p className="text-2xl font-bold text-red-600">
                                            {selectedStudent.attendanceRecords.filter(r => r.status === 'absent').length}
                                        </p>
                                        <p className="text-sm text-red-600">غائب</p>
                                    </div>
                                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                        <p className="text-2xl font-bold text-yellow-600">
                                            {selectedStudent.attendanceRecords.filter(r => r.status === 'late').length}
                                        </p>
                                        <p className="text-sm text-yellow-600">متأخر</p>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {selectedStudent.attendanceRecords.filter(r => r.status === 'excused').length}
                                        </p>
                                        <p className="text-sm text-blue-600">عذر</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
