'use client';

import { useState, useEffect } from 'react';
import {
    Plus,
    Bell,
    Image as ImageIcon,
    Layout,
    Calendar,
    Pin,
    Trash2,
    Eye,
    Upload,
    FolderOpen,
    Video,
    File,
} from 'lucide-react';
import { LoadingState, EmptyState } from '@/components/admin/StateComponents';
import Modal, { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from '@/components/admin/Modal';
import { StandardActionsDropdown } from '@/components/admin/DropdownMenu';

interface Announcement {
    id: string;
    title: string;
    content: string;
    priority: 'high' | 'medium' | 'low';
    target: 'all' | 'students' | 'teachers' | 'parents';
    publishedAt: Date;
    expiresAt?: Date;
    isPinned: boolean;
    views: number;
}

interface Page {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: 'published' | 'draft';
    updatedAt: Date;
    views: number;
}

interface MediaItem {
    id: string;
    name: string;
    type: 'image' | 'video' | 'document';
    url: string;
    size: number;
    uploadedAt: Date;
    uploadedBy: string;
}

type TabType = 'announcements' | 'pages' | 'media';

export default function ContentPage() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('announcements');
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [showPageModal, setShowPageModal] = useState(false);
    const [showMediaModal, setShowMediaModal] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [selectedPage, setSelectedPage] = useState<Page | null>(null);

    // Announcement form state
    const [announcementForm, setAnnouncementForm] = useState({
        title: '',
        content: '',
        priority: 'medium' as 'high' | 'medium' | 'low',
        target: 'all' as 'all' | 'students' | 'teachers' | 'parents',
        isPinned: false,
    });

    // Page form state
    const [pageForm, setPageForm] = useState({
        title: '',
        slug: '',
        content: '',
        status: 'draft' as 'published' | 'draft',
    });

    useEffect(() => {
        // Mock announcements
        const mockAnnouncements: Announcement[] = [
            {
                id: '1',
                title: 'إعلان هام: الامتحانات النهائية',
                content: 'نود إعلامكم بأن الامتحانات النهائية ستبدأ يوم الأحد القادم. يرجى الاستعداد جيداً ومراجعة جدول الامتحانات.',
                priority: 'high',
                target: 'all',
                publishedAt: new Date(),
                isPinned: true,
                views: 450,
            },
            {
                id: '2',
                title: 'تحديث: موعد اجتماع أولياء الأمور',
                content: 'تم تغيير موعد اجتماع أولياء الأمور إلى يوم الثلاثاء الساعة 4 مساءً.',
                priority: 'medium',
                target: 'parents',
                publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                isPinned: false,
                views: 234,
            },
            {
                id: '3',
                title: 'ورشة عمل المعلمين',
                content: 'دعوة لجميع المعلمين لحضور ورشة العمل حول أساليب التدريس الحديثة.',
                priority: 'medium',
                target: 'teachers',
                publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
                isPinned: false,
                views: 89,
            },
            {
                id: '4',
                title: 'إجازة عيد الفطر المبارك',
                content: 'تعلن المدرسة عن إجازة عيد الفطر المبارك ابتداءً من يوم... وحتى...',
                priority: 'high',
                target: 'all',
                publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
                isPinned: true,
                views: 678,
            },
            {
                id: '5',
                title: 'مسابقة الرياضيات السنوية',
                content: 'يسعدنا الإعلان عن انطلاق مسابقة الرياضيات السنوية. سجلوا الآن!',
                priority: 'low',
                target: 'students',
                publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
                isPinned: false,
                views: 145,
            },
        ];

        // Mock pages
        const mockPages: Page[] = [
            {
                id: '1',
                title: 'عن المدرسة',
                slug: 'about',
                content: 'نبذة تعريفية عن المدرسة ورؤيتها ورسالتها...',
                status: 'published',
                updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                views: 1250,
            },
            {
                id: '2',
                title: 'سياسة الخصوصية',
                slug: 'privacy-policy',
                content: 'سياسة الخصوصية وحماية البيانات...',
                status: 'published',
                updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                views: 342,
            },
            {
                id: '3',
                title: 'شروط الاستخدام',
                slug: 'terms',
                content: 'شروط وأحكام استخدام المنصة...',
                status: 'published',
                updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                views: 289,
            },
            {
                id: '4',
                title: 'الأسئلة الشائعة',
                slug: 'faq',
                content: 'الأسئلة المتكررة وإجاباتها...',
                status: 'published',
                updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
                views: 567,
            },
            {
                id: '5',
                title: 'التقويم الأكاديمي 2026',
                slug: 'academic-calendar-2026',
                content: 'جدول الفصول الدراسية والإجازات...',
                status: 'draft',
                updatedAt: new Date(),
                views: 0,
            },
        ];

        // Mock media
        const mockMedia: MediaItem[] = [
            {
                id: '1',
                name: 'شعار المدرسة.png',
                type: 'image',
                url: '/images/logo.png',
                size: 245000,
                uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. أحمد محمد',
            },
            {
                id: '2',
                name: 'فيديو_تعريفي.mp4',
                type: 'video',
                url: '/videos/intro.mp4',
                size: 45000000,
                uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. سارة أحمد',
            },
            {
                id: '3',
                name: 'دليل_الطالب.pdf',
                type: 'document',
                url: '/docs/student-guide.pdf',
                size: 2500000,
                uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. محمد علي',
            },
            {
                id: '4',
                name: 'صور_الفعاليات.jpg',
                type: 'image',
                url: '/images/events.jpg',
                size: 890000,
                uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. فاطمة حسن',
            },
            {
                id: '5',
                name: 'نموذج_الإذن.docx',
                type: 'document',
                url: '/docs/permission.docx',
                size: 45000,
                uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. خالد العمري',
            },
            {
                id: '6',
                name: 'جولة_افتراضية.mp4',
                type: 'video',
                url: '/videos/tour.mp4',
                size: 125000000,
                uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
                uploadedBy: 'أ. أحمد محمد',
            },
        ];

        setTimeout(() => {
            setAnnouncements(mockAnnouncements);
            setPages(mockPages);
            setMedia(mockMedia);
            setLoading(false);
        }, 500);
    }, []);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleAnnouncementSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAnnouncement: Announcement = {
            id: selectedAnnouncement?.id || Date.now().toString(),
            ...announcementForm,
            publishedAt: new Date(),
            views: selectedAnnouncement?.views || 0,
        };

        if (selectedAnnouncement) {
            setAnnouncements(prev => prev.map(a => a.id === selectedAnnouncement.id ? newAnnouncement : a));
        } else {
            setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
        closeAnnouncementModal();
    };

    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPage: Page = {
            id: selectedPage?.id || Date.now().toString(),
            ...pageForm,
            updatedAt: new Date(),
            views: selectedPage?.views || 0,
        };

        if (selectedPage) {
            setPages(prev => prev.map(p => p.id === selectedPage.id ? newPage : p));
        } else {
            setPages(prev => [newPage, ...prev]);
        }
        closePageModal();
    };

    const closeAnnouncementModal = () => {
        setShowAnnouncementModal(false);
        setSelectedAnnouncement(null);
        setAnnouncementForm({ title: '', content: '', priority: 'medium', target: 'all', isPinned: false });
    };

    const closePageModal = () => {
        setShowPageModal(false);
        setSelectedPage(null);
        setPageForm({ title: '', slug: '', content: '', status: 'draft' });
    };

    const editAnnouncement = (ann: Announcement) => {
        setSelectedAnnouncement(ann);
        setAnnouncementForm({
            title: ann.title,
            content: ann.content,
            priority: ann.priority,
            target: ann.target,
            isPinned: ann.isPinned,
        });
        setShowAnnouncementModal(true);
    };

    const editPage = (page: Page) => {
        setSelectedPage(page);
        setPageForm({
            title: page.title,
            slug: page.slug,
            content: page.content,
            status: page.status,
        });
        setShowPageModal(true);
    };

    const tabs = [
        { id: 'announcements', label: 'الإعلانات', icon: Bell, count: announcements.length },
        { id: 'pages', label: 'الصفحات', icon: Layout, count: pages.length },
        { id: 'media', label: 'الوسائط', icon: ImageIcon, count: media.length },
    ];

    const getMediaIcon = (type: MediaItem['type']) => {
        switch (type) {
            case 'image': return <ImageIcon className="w-8 h-8 text-blue-500" />;
            case 'video': return <Video className="w-8 h-8 text-purple-500" />;
            case 'document': return <File className="w-8 h-8 text-orange-500" />;
        }
    };

    if (loading) {
        return <LoadingState message="جاري تحميل المحتوى..." />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة المحتوى</h1>
                    <p className="text-gray-500">الإعلانات والصفحات والوسائط</p>
                </div>
                <button
                    onClick={() => {
                        if (activeTab === 'announcements') setShowAnnouncementModal(true);
                        else if (activeTab === 'pages') setShowPageModal(true);
                        else setShowMediaModal(true);
                    }}
                    className="admin-btn admin-btn-primary"
                >
                    <Plus className="w-5 h-5" />
                    {activeTab === 'announcements' ? 'إعلان جديد' :
                        activeTab === 'pages' ? 'صفحة جديدة' : 'رفع ملف'}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/25'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
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

            {/* Content Panels */}
            {activeTab === 'announcements' && (
                <div className="space-y-4">
                    {announcements.length === 0 ? (
                        <EmptyState
                            title="لا توجد إعلانات"
                            message="قم بإضافة إعلان جديد للبدء"
                            action={{ label: 'إضافة إعلان', onClick: () => setShowAnnouncementModal(true) }}
                        />
                    ) : (
                        announcements.map((ann) => (
                            <div key={ann.id} className={`admin-card p-4 hover:shadow-lg transition-all ${ann.isPinned ? 'border-r-4 border-teal-500' : ''}`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {ann.isPinned && <Pin className="w-4 h-4 text-teal-500" />}
                                            <h3 className="font-semibold text-gray-800">{ann.title}</h3>
                                            <span className={`admin-badge text-xs ${ann.priority === 'high' ? 'admin-badge-error' :
                                                ann.priority === 'medium' ? 'admin-badge-warning' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {ann.priority === 'high' ? 'عاجل' : ann.priority === 'medium' ? 'متوسط' : 'عادي'}
                                            </span>
                                            <span className="admin-badge bg-blue-100 text-blue-600 text-xs">
                                                {ann.target === 'all' ? 'الكل' :
                                                    ann.target === 'students' ? 'الطلاب' :
                                                        ann.target === 'teachers' ? 'المعلمين' : 'أولياء الأمور'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm line-clamp-2">{ann.content}</p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {ann.publishedAt.toLocaleDateString('ar-EG')}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="w-3 h-3" />
                                                {ann.views} مشاهدة
                                            </span>
                                        </div>
                                    </div>
                                    <StandardActionsDropdown
                                        onEdit={() => editAnnouncement(ann)}
                                        onDelete={() => setAnnouncements(prev => prev.filter(a => a.id !== ann.id))}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'pages' && (
                <div className="admin-card overflow-hidden">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>العنوان</th>
                                <th>الرابط</th>
                                <th>الحالة</th>
                                <th>آخر تحديث</th>
                                <th>المشاهدات</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {pages.map((page) => (
                                <tr key={page.id}>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <Layout className="w-4 h-4 text-gray-400" />
                                            <span className="font-medium text-gray-800">{page.title}</span>
                                        </div>
                                    </td>
                                    <td className="text-gray-500 dir-ltr">/{page.slug}</td>
                                    <td>
                                        <span className={`admin-badge ${page.status === 'published' ? 'admin-badge-success' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {page.status === 'published' ? 'منشور' : 'مسودة'}
                                        </span>
                                    </td>
                                    <td className="text-gray-500">{page.updatedAt.toLocaleDateString('ar-EG')}</td>
                                    <td className="text-gray-500">{page.views}</td>
                                    <td>
                                        <StandardActionsDropdown
                                            onEdit={() => editPage(page)}
                                            onViewDetails={() => window.open(`/${page.slug}`, '_blank')}
                                            onDelete={() => setPages(prev => prev.filter(p => p.id !== page.id))}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'media' && (
                <div>
                    {/* Upload Area */}
                    <div
                        className="admin-card p-8 mb-6 border-2 border-dashed border-gray-200 hover:border-teal-300 transition-colors cursor-pointer text-center"
                        onClick={() => setShowMediaModal(true)}
                    >
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">اسحب الملفات هنا أو انقر للرفع</p>
                        <p className="text-sm text-gray-400 mt-1">PNG, JPG, PDF, MP4 (Max 50MB)</p>
                    </div>

                    {/* Media Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {media.map((item) => (
                            <div key={item.id} className="admin-card p-4 hover:shadow-lg transition-all group">
                                <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                                    {getMediaIcon(item.type)}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-gray-700 hover:bg-gray-100">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setMedia(prev => prev.filter(m => m.id !== item.id))}
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-red-500 hover:bg-red-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-gray-400">{formatFileSize(item.size)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Announcement Modal */}
            <Modal
                isOpen={showAnnouncementModal}
                onClose={closeAnnouncementModal}
                title={selectedAnnouncement ? 'تعديل الإعلان' : 'إعلان جديد'}
                size="lg"
                footer={
                    <>
                        <button onClick={closeAnnouncementModal} className="admin-btn admin-btn-secondary">إلغاء</button>
                        <button type="submit" form="announcement-form" className="admin-btn admin-btn-primary">
                            {selectedAnnouncement ? 'حفظ التغييرات' : 'نشر الإعلان'}
                        </button>
                    </>
                }
            >
                <form id="announcement-form" onSubmit={handleAnnouncementSubmit}>
                    <FormGroup>
                        <FormLabel required>العنوان</FormLabel>
                        <FormInput
                            value={announcementForm.title}
                            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="عنوان الإعلان"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel required>المحتوى</FormLabel>
                        <FormTextarea
                            value={announcementForm.content}
                            onChange={(e) => setAnnouncementForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="نص الإعلان..."
                            rows={4}
                            required
                        />
                    </FormGroup>

                    <div className="admin-form-row">
                        <FormGroup>
                            <FormLabel>الأولوية</FormLabel>
                            <FormSelect
                                value={announcementForm.priority}
                                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, priority: e.target.value as any }))}
                            >
                                <option value="low">عادي</option>
                                <option value="medium">متوسط</option>
                                <option value="high">عاجل</option>
                            </FormSelect>
                        </FormGroup>
                        <FormGroup>
                            <FormLabel>الجمهور المستهدف</FormLabel>
                            <FormSelect
                                value={announcementForm.target}
                                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, target: e.target.value as any }))}
                            >
                                <option value="all">الجميع</option>
                                <option value="students">الطلاب</option>
                                <option value="teachers">المعلمين</option>
                                <option value="parents">أولياء الأمور</option>
                            </FormSelect>
                        </FormGroup>
                    </div>

                    <FormGroup className="mb-0">
                        <label className="admin-radio-item">
                            <input
                                type="checkbox"
                                checked={announcementForm.isPinned}
                                onChange={(e) => setAnnouncementForm(prev => ({ ...prev, isPinned: e.target.checked }))}
                            />
                            <span>تثبيت الإعلان</span>
                        </label>
                    </FormGroup>
                </form>
            </Modal>

            {/* Page Modal */}
            <Modal
                isOpen={showPageModal}
                onClose={closePageModal}
                title={selectedPage ? 'تعديل الصفحة' : 'صفحة جديدة'}
                size="lg"
                footer={
                    <>
                        <button onClick={closePageModal} className="admin-btn admin-btn-secondary">إلغاء</button>
                        <button type="submit" form="page-form" className="admin-btn admin-btn-primary">
                            {selectedPage ? 'حفظ التغييرات' : 'إنشاء الصفحة'}
                        </button>
                    </>
                }
            >
                <form id="page-form" onSubmit={handlePageSubmit}>
                    <FormGroup>
                        <FormLabel required>العنوان</FormLabel>
                        <FormInput
                            value={pageForm.title}
                            onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="عنوان الصفحة"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel required>الرابط (Slug)</FormLabel>
                        <FormInput
                            value={pageForm.slug}
                            onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                            placeholder="about-us"
                            className="dir-ltr text-start"
                            required
                        />
                    </FormGroup>

                    <FormGroup>
                        <FormLabel required>المحتوى</FormLabel>
                        <FormTextarea
                            value={pageForm.content}
                            onChange={(e) => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                            placeholder="محتوى الصفحة..."
                            rows={6}
                            required
                        />
                    </FormGroup>

                    <FormGroup className="mb-0">
                        <FormLabel>الحالة</FormLabel>
                        <FormSelect
                            value={pageForm.status}
                            onChange={(e) => setPageForm(prev => ({ ...prev, status: e.target.value as any }))}
                        >
                            <option value="draft">مسودة</option>
                            <option value="published">منشور</option>
                        </FormSelect>
                    </FormGroup>
                </form>
            </Modal>

            {/* Media Upload Modal */}
            <Modal
                isOpen={showMediaModal}
                onClose={() => setShowMediaModal(false)}
                title="رفع ملفات"
                size="md"
            >
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-medium mb-2">اسحب الملفات هنا</p>
                    <p className="text-sm text-gray-400 mb-4">أو</p>
                    <button className="admin-btn admin-btn-primary">
                        <FolderOpen className="w-4 h-4" />
                        اختر ملفات
                    </button>
                    <p className="text-xs text-gray-400 mt-4">الحد الأقصى: 50MB لكل ملف</p>
                </div>
            </Modal>
        </div>
    );
}
