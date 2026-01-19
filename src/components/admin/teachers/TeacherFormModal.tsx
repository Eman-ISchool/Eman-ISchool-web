'use client';

import { useState } from 'react';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';

export interface TeacherFormData {
    id?: string;
    // Personal Information
    name: string;
    email: string;
    phone: string;
    nationality: string;
    joinedDate: string;
    // Teaching Details
    subjects: string[];
    languagesTeaching: string[];
    assignedGroups: string[];
    // Financial Information
    salaryBase: number;
    lessonPrice: number;
    salaryBonus: number;
    bankName: string;
    bankAccountNumber: string;
    iban: string;
    // Status
    status: 'active' | 'inactive';
    notes: string;
}

interface TeacherFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TeacherFormData) => void;
    initialData?: Partial<TeacherFormData>;
    mode: 'create' | 'edit';
}

const SUBJECTS_OPTIONS = [
    'الرياضيات',
    'الفيزياء',
    'الكيمياء',
    'الأحياء',
    'اللغة العربية',
    'اللغة الإنجليزية',
    'التاريخ',
    'الجغرافيا',
    'العلوم',
    'الحاسوب',
];

const LANGUAGES_OPTIONS = ['العربية', 'الإنجليزية', 'الفرنسية', 'الألمانية'];

const GROUPS_OPTIONS = [
    'الصف الأول',
    'الصف الثاني',
    'الصف الثالث',
    'الصف الرابع',
    'الصف الخامس',
    'الصف السادس',
    'الصف السابع',
    'الصف الثامن',
    'الصف التاسع',
    'الصف العاشر',
    'الصف الحادي عشر',
    'الصف الثاني عشر',
];

const NATIONALITIES = [
    'إماراتي',
    'سعودي',
    'مصري',
    'أردني',
    'سوري',
    'لبناني',
    'فلسطيني',
    'عراقي',
    'مغربي',
    'تونسي',
    'أخرى',
];

const BANKS = [
    'بنك أبوظبي الأول',
    'بنك الإمارات دبي الوطني',
    'البنك الأهلي المتحد',
    'مصرف أبوظبي الإسلامي',
    'بنك المشرق',
    'بنك دبي التجاري',
    'أخرى',
];

const defaultFormData: TeacherFormData = {
    name: '',
    email: '',
    phone: '',
    nationality: '',
    joinedDate: new Date().toISOString().split('T')[0],
    subjects: [],
    languagesTeaching: [],
    assignedGroups: [],
    salaryBase: 0,
    lessonPrice: 0,
    salaryBonus: 0,
    bankName: '',
    bankAccountNumber: '',
    iban: '',
    status: 'active',
    notes: '',
};

export default function TeacherFormModal({
    isOpen,
    onClose,
    onSave,
    initialData,
    mode,
}: TeacherFormModalProps) {
    const [formData, setFormData] = useState<TeacherFormData>({
        ...defaultFormData,
        ...initialData,
    });
    const [activeSection, setActiveSection] = useState<'personal' | 'teaching' | 'financial' | 'status'>('personal');
    const [newSubject, setNewSubject] = useState('');

    const handleInputChange = (field: keyof TeacherFormData, value: string | number | string[]) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleMultiSelectAdd = (field: 'subjects' | 'languagesTeaching' | 'assignedGroups', value: string) => {
        if (value && !formData[field].includes(value)) {
            setFormData((prev) => ({
                ...prev,
                [field]: [...prev[field], value],
            }));
        }
    };

    const handleMultiSelectRemove = (field: 'subjects' | 'languagesTeaching' | 'assignedGroups', value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: prev[field].filter((item) => item !== value),
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const sections = [
        { id: 'personal', label: 'المعلومات الشخصية' },
        { id: 'teaching', label: 'تفاصيل التدريس' },
        { id: 'financial', label: 'المعلومات المالية' },
        { id: 'status', label: 'الحالة والملاحظات' },
    ] as const;

    const renderMultiSelect = (
        field: 'subjects' | 'languagesTeaching' | 'assignedGroups',
        options: string[],
        label: string
    ) => (
        <FormGroup>
            <FormLabel>{label}</FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
                {formData[field].map((item) => (
                    <span
                        key={item}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-sm"
                    >
                        {item}
                        <button
                            type="button"
                            onClick={() => handleMultiSelectRemove(field, item)}
                            className="hover:text-teal-900"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <FormSelect
                    value=""
                    onChange={(e) => handleMultiSelectAdd(field, e.target.value)}
                    className="flex-1"
                >
                    <option value="">اختر {label}...</option>
                    {options
                        .filter((opt) => !formData[field].includes(opt))
                        .map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                </FormSelect>
            </div>
        </FormGroup>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'create' ? 'إضافة معلم جديد' : 'تعديل بيانات المعلم'}
            size="xl"
            footer={
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="admin-btn admin-btn-secondary">
                        إلغاء
                    </button>
                    <button type="submit" form="teacher-form" className="admin-btn admin-btn-primary">
                        {mode === 'create' ? 'إضافة المعلم' : 'حفظ التغييرات'}
                    </button>
                </div>
            }
        >
            <form id="teacher-form" onSubmit={handleSubmit}>
                {/* Section Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4 overflow-x-auto">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            type="button"
                            onClick={() => setActiveSection(section.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeSection === section.id
                                    ? 'bg-teal-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Personal Information Section */}
                {activeSection === 'personal' && (
                    <div className="space-y-4">
                        <div className="admin-form-row">
                            <FormGroup>
                                <FormLabel required>الاسم الكامل</FormLabel>
                                <FormInput
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    placeholder="أدخل اسم المعلم"
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel required>البريد الإلكتروني</FormLabel>
                                <FormInput
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="example@school.com"
                                    required
                                />
                            </FormGroup>
                        </div>

                        <div className="admin-form-row">
                            <FormGroup>
                                <FormLabel required>رقم الهاتف</FormLabel>
                                <FormInput
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+971 50 123 4567"
                                    required
                                    dir="ltr"
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>الجنسية</FormLabel>
                                <FormSelect
                                    value={formData.nationality}
                                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                                >
                                    <option value="">اختر الجنسية</option>
                                    {NATIONALITIES.map((nat) => (
                                        <option key={nat} value={nat}>
                                            {nat}
                                        </option>
                                    ))}
                                </FormSelect>
                            </FormGroup>
                        </div>

                        <FormGroup>
                            <FormLabel>تاريخ الانضمام</FormLabel>
                            <FormInput
                                type="date"
                                value={formData.joinedDate}
                                onChange={(e) => handleInputChange('joinedDate', e.target.value)}
                            />
                        </FormGroup>
                    </div>
                )}

                {/* Teaching Details Section */}
                {activeSection === 'teaching' && (
                    <div className="space-y-4">
                        {renderMultiSelect('subjects', SUBJECTS_OPTIONS, 'المواد الدراسية')}
                        {renderMultiSelect('languagesTeaching', LANGUAGES_OPTIONS, 'لغات التدريس')}
                        {renderMultiSelect('assignedGroups', GROUPS_OPTIONS, 'الصفوف المخصصة')}
                    </div>
                )}

                {/* Financial Information Section */}
                {activeSection === 'financial' && (
                    <div className="space-y-4">
                        <div className="admin-form-row">
                            <FormGroup>
                                <FormLabel required>الراتب الأساسي (د.إ)</FormLabel>
                                <FormInput
                                    type="number"
                                    value={formData.salaryBase}
                                    onChange={(e) => handleInputChange('salaryBase', parseFloat(e.target.value) || 0)}
                                    placeholder="5000"
                                    required
                                    min="0"
                                />
                            </FormGroup>
                            <FormGroup>
                                <FormLabel>سعر الحصة (د.إ)</FormLabel>
                                <FormInput
                                    type="number"
                                    value={formData.lessonPrice}
                                    onChange={(e) => handleInputChange('lessonPrice', parseFloat(e.target.value) || 0)}
                                    placeholder="150"
                                    min="0"
                                />
                            </FormGroup>
                        </div>

                        <FormGroup>
                            <FormLabel>المكافأة (د.إ)</FormLabel>
                            <FormInput
                                type="number"
                                value={formData.salaryBonus}
                                onChange={(e) => handleInputChange('salaryBonus', parseFloat(e.target.value) || 0)}
                                placeholder="0"
                                min="0"
                            />
                        </FormGroup>

                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">معلومات الحساب البنكي</h4>
                            <div className="admin-form-row">
                                <FormGroup>
                                    <FormLabel>اسم البنك</FormLabel>
                                    <FormSelect
                                        value={formData.bankName}
                                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                                    >
                                        <option value="">اختر البنك</option>
                                        {BANKS.map((bank) => (
                                            <option key={bank} value={bank}>
                                                {bank}
                                            </option>
                                        ))}
                                    </FormSelect>
                                </FormGroup>
                                <FormGroup>
                                    <FormLabel>رقم الحساب</FormLabel>
                                    <FormInput
                                        type="text"
                                        value={formData.bankAccountNumber}
                                        onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                                        placeholder="1234567890"
                                        dir="ltr"
                                    />
                                </FormGroup>
                            </div>
                            <FormGroup>
                                <FormLabel>رقم IBAN</FormLabel>
                                <FormInput
                                    type="text"
                                    value={formData.iban}
                                    onChange={(e) => handleInputChange('iban', e.target.value)}
                                    placeholder="AE12 3456 7890 1234 5678 901"
                                    dir="ltr"
                                />
                            </FormGroup>
                        </div>

                        {/* Total Salary Preview */}
                        <div className="bg-teal-50 rounded-lg p-4 mt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-teal-700 font-medium">إجمالي الراتب الشهري</span>
                                <span className="text-2xl font-bold text-teal-600">
                                    {(formData.salaryBase + formData.salaryBonus).toLocaleString('ar-EG')} د.إ
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Section */}
                {activeSection === 'status' && (
                    <div className="space-y-4">
                        <FormGroup>
                            <FormLabel>حالة المعلم</FormLabel>
                            <div className="flex gap-4">
                                <label className="admin-radio-item">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={formData.status === 'active'}
                                        onChange={() => handleInputChange('status', 'active')}
                                    />
                                    <span className="text-sm text-gray-700">نشط</span>
                                </label>
                                <label className="admin-radio-item">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={formData.status === 'inactive'}
                                        onChange={() => handleInputChange('status', 'inactive')}
                                    />
                                    <span className="text-sm text-gray-700">غير نشط</span>
                                </label>
                            </div>
                        </FormGroup>

                        <FormGroup>
                            <FormLabel>ملاحظات</FormLabel>
                            <FormTextarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                placeholder="أضف أي ملاحظات إضافية..."
                                rows={4}
                            />
                        </FormGroup>
                    </div>
                )}
            </form>
        </Modal>
    );
}
