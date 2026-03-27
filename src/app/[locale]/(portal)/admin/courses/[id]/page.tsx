'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
    ArrowLeft,
    ArrowRight,
    Bold,
    Calendar,
    ChevronDown,
    Clock,
    Eye,
    FileText,
    Image as ImageIcon,
    Italic,
    Link2,
    List,
    ListOrdered,
    Loader2,
    Pencil,
    Plus,
    Save,
    Strikethrough,
    Trash2,
    Type,
    Underline,
    UploadCloud,
    Video,
    X,
} from 'lucide-react';
import { useLocale } from 'next-intl';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { withAdminPortalPrefix } from '@/lib/admin-portal-paths';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
    id: string;
    title: string;
    description?: string;
    start_date_time: string;
    end_date_time: string;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    meet_link?: string;
    meeting_provider?: string;
    teacher?: { id: string; name: string; image?: string } | null;
}

interface Assignment {
    id: string;
    title: string;
    description?: string;
    due_date: string;
    max_score: number;
    is_open?: boolean;
    is_exam?: boolean;
}

// ─── Shared UI helpers ────────────────────────────────────────────────────────

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="relative w-full max-w-lg rounded-[20px] bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#e5e7eb] px-6 py-4">
                    <h3 className="text-base font-semibold text-[#111111]">{title}</h3>
                    <button onClick={onClose} className="text-[#71717a] hover:text-[#111111]">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <Icon className="mb-4 h-12 w-12 text-[#d4d4d8]" strokeWidth={1.5} />
            <p className="text-sm text-[#71717a]">{message}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        draft: { label: 'مسودة', cls: 'bg-[#fef9c3] text-[#854d0e]' },
        scheduled: { label: 'مجدولة', cls: 'bg-blue-50 text-blue-600' },
        live: { label: 'مباشر', cls: 'bg-green-50 text-green-600' },
        completed: { label: 'منتهية', cls: 'bg-[#f4f4f5] text-[#52525b]' },
        cancelled: { label: 'ملغية', cls: 'bg-red-50 text-red-600' },
        open: { label: 'مفتوح', cls: 'bg-green-50 text-green-600' },
        closed: { label: 'مغلق', cls: 'bg-red-50 text-red-600' },
    };
    const { label, cls } = map[status] ?? { label: status, cls: 'bg-[#f4f4f5] text-[#52525b]' };
    return <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>{label}</span>;
}

// ─── Lessons Tab ──────────────────────────────────────────────────────────────

function LessonsTab({ courseId }: { courseId: string }) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Lesson | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', content: '', lessonDate: '', videoUrl: '', isPublished: false });

    const resetForm = () => setForm({ title: '', content: '', lessonDate: '', videoUrl: '', isPublished: false });
    const openCreate = () => { resetForm(); setEditTarget(null); setShowModal(true); };
    const openEdit = (l: Lesson) => {
        const start = l.start_date_time ? new Date(l.start_date_time).toISOString().slice(0, 16) : '';
        setForm({
            title: l.title, content: l.description || '',
            lessonDate: start,
            videoUrl: l.meet_link || '',
            isPublished: l.status === 'live' || l.status === 'completed',
        });
        setEditTarget(l);
        setShowModal(true);
    };

    useEffect(() => {
        fetch(`/api/courses/${courseId}/lessons`)
            .then((r) => r.json())
            .then((d) => setLessons(d.lessons || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [courseId]);

    const handleSave = async () => {
        if (!form.title) return;
        setSaving(true);
        const start = form.lessonDate ? new Date(form.lessonDate) : new Date();
        const end = new Date(start.getTime() + 60 * 60000);
        const payload = {
            title: form.title, description: form.content,
            startDateTime: start.toISOString(), endDateTime: end.toISOString(),
            courseId, meetLink: form.videoUrl || undefined,
            meetingProvider: form.videoUrl ? 'other' : undefined,
            ...(editTarget ? { id: editTarget.id } : {}),
        };
        const res = await fetch('/api/lessons', {
            method: editTarget ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const data = await res.json();
            const saved = data.lesson;
            setLessons((prev) => editTarget ? prev.map((l) => (l.id === saved.id ? saved : l)) : [saved, ...prev]);
            setShowModal(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل تريد حذف هذا الدرس؟')) return;
        const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' });
        if (res.ok) setLessons((prev) => prev.filter((l) => l.id !== id));
    };

    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString('ar', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <>
            {showModal && (
                <Modal title={editTarget ? 'تعديل الدرس' : 'إنشاء درس'} onClose={() => setShowModal(false)}>
                    <div className="space-y-5">
                        {/* Lesson Title */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#111111] text-end">عنوان الدرس</label>
                            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-12 rounded-xl bg-white border-[#e5e7eb] text-right" placeholder="أدخل عنوان الدرس" dir="rtl" />
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#111111] text-end">المحتوى</label>
                            <Textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="rounded-xl bg-white border-[#e5e7eb] resize-none text-right" rows={4} placeholder="أدخل محتوى الدرس" dir="rtl" />
                        </div>

                        {/* Lesson Date (Optional) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#111111] text-end">تاريخ الدرس (اختياري)</label>
                            <Input type="datetime-local" value={form.lessonDate} onChange={(e) => setForm((p) => ({ ...p, lessonDate: e.target.value }))} className="h-12 rounded-xl bg-white border-[#e5e7eb]" />
                        </div>

                        {/* Video Link (Optional) */}
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-[#111111] text-end">رابط الفيديو (اختياري)</label>
                            <div className="rounded-xl border-2 border-dashed border-[#d4d4d8] bg-[#fafafa] p-6 text-center">
                                <div className="flex flex-col items-center gap-3">
                                    <UploadCloud className="h-10 w-10 text-[#a1a1aa]" strokeWidth={1.5} />
                                    <p className="text-sm text-[#71717a]">قم بسحب الملف هنا أو</p>
                                    <button type="button" className="flex items-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm font-medium text-[#111111] shadow-sm hover:bg-[#f4f4f5]">
                                        <UploadCloud className="h-4 w-4" />
                                        اختر ملف
                                    </button>
                                    <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                                        mp4, mpeg, mov, webm, 3gp, 3g2, wmv, flv, mkv, avi, m4v, mpg, mpeg, m4p, m4v, f4v,
                                        <br />f4p, f4a, f4b (max 300MB)
                                    </p>
                                </div>
                            </div>
                            <Input value={form.videoUrl} onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))} className="h-12 rounded-xl bg-white border-[#e5e7eb] mt-2" placeholder="أو أدخل رابط الفيديو هنا" dir="ltr" />
                        </div>

                        {/* Publish Checkbox */}
                        <div className="flex items-center gap-3 justify-end pt-1">
                            <label className="text-sm font-medium text-[#111111] cursor-pointer" htmlFor="publish-lesson">نشر هذا الدرس</label>
                            <input
                                type="checkbox"
                                id="publish-lesson"
                                checked={form.isPublished}
                                onChange={(e) => setForm((p) => ({ ...p, isPublished: e.target.checked }))}
                                className="h-5 w-5 rounded border-[#d4d4d8] text-[#111111] focus:ring-[#111111]"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-start gap-3 pt-3">
                            <button onClick={handleSave} disabled={saving || !form.title} className="flex items-center gap-2 rounded-lg bg-[#111111] px-6 py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}إنشاء
                            </button>
                            <button onClick={() => setShowModal(false)} className="rounded-lg border border-[#e4e4e7] px-6 py-2.5 text-sm font-semibold text-[#111111] hover:bg-[#f4f4f5]">إلغاء</button>
                        </div>
                    </div>
                </Modal>
            )}
            <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm bg-[#fafafa]">
                <CardHeader className="pb-5 pt-7 border-b border-[#f4f4f5]">
                    <div className="flex items-center justify-between">
                        <button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-black/80">
                            <Plus className="h-4 w-4" />إضافة درس جديد
                        </button>
                        <div>
                            <CardTitle className="text-xl font-bold text-[#111111] text-start">دروس المادة الدراسية</CardTitle>
                            <CardDescription className="text-[#a1a1aa] text-sm mt-1 text-start">إدارة دروس هذه المادة الدراسية.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-7">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#d4d4d8]" /></div>
                    ) : lessons.length === 0 ? (
                        <EmptyState icon={Calendar} message="لا توجد دروس حتى الآن. أضف درسك الأول!" />
                    ) : (
                        <div className="divide-y divide-[#f4f4f5]">
                            {lessons.map((lesson) => (
                                <div key={lesson.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleDelete(lesson.id)} className="text-red-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        <button onClick={() => openEdit(lesson)} className="text-[#71717a] hover:text-[#111111]"><Pencil className="h-4 w-4" /></button>
                                        <button className="text-[#71717a] hover:text-[#111111]"><Eye className="h-4 w-4" /></button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <StatusBadge status={lesson.status === 'scheduled' ? 'draft' : lesson.status} />
                                        <span className="text-sm font-medium text-[#111111]">{lesson.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// ─── Assignments Tab ──────────────────────────────────────────────────────────

function AssignmentsTab({ courseId }: { courseId: string }) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Assignment | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: '100' });

    const resetForm = () => setForm({ title: '', description: '', dueDate: '', maxScore: '100' });
    const openCreate = () => { resetForm(); setEditTarget(null); setShowModal(true); };
    const openEdit = (a: Assignment) => {
        setForm({ title: a.title, description: a.description || '', dueDate: a.due_date?.slice(0, 10) || '', maxScore: String(a.max_score) });
        setEditTarget(a);
        setShowModal(true);
    };

    useEffect(() => {
        fetch(`/api/assignments?courseId=${courseId}`)
            .then((r) => r.json())
            .then((d) => setAssignments((d.assignments || []).filter((a: Assignment) => !a.is_exam)))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [courseId]);

    const handleSave = async () => {
        if (!form.title || !form.dueDate) return;
        setSaving(true);
        const payload = { courseId, title: form.title, description: form.description, dueDate: form.dueDate, maxScore: Number(form.maxScore) };
        const body = editTarget ? { ...payload, id: editTarget.id } : payload;
        const res = await fetch('/api/assignments', {
            method: editTarget ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const data = await res.json();
            const saved = data.assignment;
            setAssignments((prev) => editTarget ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev]);
            setShowModal(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل تريد حذف هذا الواجب؟')) return;
        const res = await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' });
        if (res.ok) setAssignments((prev) => prev.filter((a) => a.id !== id));
    };

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            {showModal && (
                <Modal title={editTarget ? 'تعديل الواجب' : 'إضافة واجب جديد'} onClose={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">عنوان الواجب *</label>
                            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" placeholder="عنوان الواجب" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">الوصف</label>
                            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[10px] bg-[#fafafa] border-[#e5e7eb] resize-none" rows={3} placeholder="وصف الواجب" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">تاريخ التسليم *</label>
                                <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">الدرجة القصوى</label>
                                <Input type="number" min="1" value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="rounded-full border border-[#e4e4e7] px-5 py-2 text-sm font-medium text-[#111111] hover:bg-[#f4f4f5]">إلغاء</button>
                            <button onClick={handleSave} disabled={saving || !form.title || !form.dueDate} className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}حفظ
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm bg-[#fafafa]">
                <CardHeader className="pb-5 pt-7 border-b border-[#f4f4f5]">
                    <div className="flex items-center justify-between">
                        <div />
                        <div>
                            <CardTitle className="text-xl font-bold text-[#111111] text-start">اختبارات المادة الدراسية</CardTitle>
                            <CardDescription className="text-[#a1a1aa] text-sm mt-1 text-start">إدارة اختبارات هذه المادة الدراسية.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-7">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#d4d4d8]" /></div>
                    ) : assignments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <p className="text-sm font-medium text-[#71717a]">لا توجد اختبارات</p>
                            <p className="text-xs text-[#a1a1aa] mt-1">قم بالاضافة من شاشة الدروس</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#f4f4f5]">
                            {assignments.map((a) => (
                                <div key={a.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(a)} className="text-[#71717a] hover:text-[#111111]"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(a.id)} className="text-[#71717a] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        <StatusBadge status={a.is_open === false ? 'closed' : 'open'} />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="text-end">
                                            <p className="text-sm font-medium text-[#111111]">{a.title}</p>
                                            <div className="mt-1 flex items-center justify-end gap-2 text-xs text-[#71717a]">
                                                <span>آخر موعد: {fmtDate(a.due_date)}</span>
                                                <span>·</span>
                                                <span>الدرجة: {a.max_score}</span>
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f4f5]">
                                            <FileText className="h-5 w-5 text-[#52525b]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// ─── Exams Tab ────────────────────────────────────────────────────────────────

function ExamsTab({ courseId }: { courseId: string }) {
    const [exams, setExams] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editTarget, setEditTarget] = useState<Assignment | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', dueDate: '', maxScore: '100' });

    const resetForm = () => setForm({ title: '', description: '', dueDate: '', maxScore: '100' });
    const openCreate = () => { resetForm(); setEditTarget(null); setShowModal(true); };
    const openEdit = (a: Assignment) => {
        setForm({ title: a.title, description: a.description || '', dueDate: a.due_date?.slice(0, 10) || '', maxScore: String(a.max_score) });
        setEditTarget(a);
        setShowModal(true);
    };

    useEffect(() => {
        fetch(`/api/assignments?courseId=${courseId}`)
            .then((r) => r.json())
            .then((d) => setExams((d.assignments || []).filter((a: Assignment) => a.is_exam === true)))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [courseId]);

    const handleSave = async () => {
        if (!form.title || !form.dueDate) return;
        setSaving(true);
        const payload = { courseId, title: form.title, description: form.description, dueDate: form.dueDate, maxScore: Number(form.maxScore), isExam: true };
        const body = editTarget ? { ...payload, id: editTarget.id } : payload;
        const res = await fetch('/api/assignments', {
            method: editTarget ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const data = await res.json();
            const saved = data.assignment;
            setExams((prev) => editTarget ? prev.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...prev]);
            setShowModal(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل تريد حذف هذا الامتحان؟')) return;
        const res = await fetch(`/api/assignments?id=${id}`, { method: 'DELETE' });
        if (res.ok) setExams((prev) => prev.filter((a) => a.id !== id));
    };

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <>
            {showModal && (
                <Modal title={editTarget ? 'تعديل الامتحان' : 'إضافة امتحان جديد'} onClose={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">عنوان الامتحان *</label>
                            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" placeholder="عنوان الامتحان" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">الوصف</label>
                            <Textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="rounded-[10px] bg-[#fafafa] border-[#e5e7eb] resize-none" rows={3} placeholder="وصف الامتحان" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">تاريخ الامتحان *</label>
                                <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">الدرجة القصوى</label>
                                <Input type="number" min="1" value={form.maxScore} onChange={(e) => setForm((p) => ({ ...p, maxScore: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="rounded-full border border-[#e4e4e7] px-5 py-2 text-sm font-medium text-[#111111] hover:bg-[#f4f4f5]">إلغاء</button>
                            <button onClick={handleSave} disabled={saving || !form.title || !form.dueDate} className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}حفظ
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
            {/* Section header */}
            <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm bg-[#fafafa]">
                <CardHeader className="pb-5 pt-7 border-b border-[#f4f4f5]">
                    <div className="flex items-center justify-between">
                        <button onClick={openCreate} className="flex items-center gap-2 rounded-full bg-[#111111] px-4 py-2 text-sm font-medium text-white hover:bg-black/80">
                            <Plus className="h-4 w-4" />إضافة امتحان جديد
                        </button>
                        <div>
                            <CardTitle className="text-xl font-bold text-[#111111] text-start">امتحانات المادة الدراسية</CardTitle>
                            <CardDescription className="text-[#a1a1aa] text-sm mt-1 text-start">إدارة امتحانات هذه المادة الدراسية.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-7">
                    {loading ? (
                        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-[#d4d4d8]" /></div>
                    ) : exams.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <FileText className="mb-4 h-12 w-12 text-[#d4d4d8]" strokeWidth={1.5} />
                            <p className="text-sm text-[#71717a]">لم يتم إضافة أي امتحانات بعد.</p>
                            <button onClick={openCreate} className="mt-6 flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-sm font-medium text-white hover:bg-black/80">
                                <Plus className="h-4 w-4" />قم بإضافة اول امتحان
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#f4f4f5]">
                            {exams.map((a) => (
                                <div key={a.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => openEdit(a)} className="text-[#71717a] hover:text-[#111111]"><Pencil className="h-4 w-4" /></button>
                                        <button onClick={() => handleDelete(a.id)} className="text-[#71717a] hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                                        <StatusBadge status={a.is_open === false ? 'closed' : 'open'} />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="text-end">
                                            <p className="text-sm font-medium text-[#111111]">{a.title}</p>
                                            <div className="mt-1 flex items-center justify-end gap-2 text-xs text-[#71717a]">
                                                <span>{fmtDate(a.due_date)}</span>
                                                <span>·</span>
                                                <span>الدرجة: {a.max_score}</span>
                                                <Calendar className="h-3.5 w-3.5" />
                                            </div>
                                        </div>
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f4f4f5]">
                                            <FileText className="h-5 w-5 text-[#52525b]" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </>
    );
}

// ─── Live Sessions Tab ────────────────────────────────────────────────────────

// ─── Calendar helpers ────────────────────────────────────────────────────────

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Fill leading days from previous month (week starts on Sunday)
    const startDow = firstDay.getDay();
    for (let i = startDow - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }

    // Fill trailing days
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
        for (let i = 1; i <= remaining; i++) {
            days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
        }
    }

    return days;
}

function isSameDay(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(d: Date) {
    return isSameDay(d, new Date());
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

// ─── Session Event Card ──────────────────────────────────────────────────────

function SessionEventCard({ lesson, expanded, onToggle }: { lesson: Lesson; expanded: boolean; onToggle: () => void }) {
    const startTime = new Date(lesson.start_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Amman' });
    const endTime = new Date(lesson.end_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Amman' });
    const teacherName = lesson.teacher?.name || 'ابراهيم محمد';
    const initials = teacherName.slice(0, 2);

    if (!expanded) {
        // Compact card – matches reference CalendarMonthView design
        return (
            <div
                onClick={onToggle}
                className="w-full overflow-hidden rounded-2xl border border-[#ffd3ad] bg-[#fff5eb] text-right shadow-sm cursor-pointer hover:bg-[#ffeddb] transition-colors"
            >
                <div className="flex items-start gap-2 border-r-[3px] border-r-[#ff8b17] p-2">
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#a45a12]">{startTime}</div>
                        <div className="mt-1 line-clamp-2 text-[11px] text-slate-500">{lesson.title}{lesson.description ? `\n${lesson.description}` : ''}</div>
                        <div className="mt-2 inline-flex items-center rounded-full bg-white/90 px-2 py-1 text-[11px] text-slate-600">
                            {teacherName}
                        </div>
                    </div>
                    <button
                        type="button"
                        title={lesson.meet_link ? 'انضمام إلى الفصل' : 'لا يوجد رابط اجتماع'}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (lesson.meet_link) {
                                window.open(lesson.meet_link, '_blank', 'noopener,noreferrer');
                            }
                        }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white ${lesson.meet_link ? 'bg-[#ff8b17] hover:bg-[#e67a10] cursor-pointer' : 'bg-[#ccc] cursor-not-allowed'}`}
                    >
                        <Video className="h-4 w-4" />
                    </button>
                </div>
            </div>
        );
    }

    // Expanded card (popup) with join meeting button
    return (
        <div className="absolute z-50 top-0 start-0 w-72 rounded-xl bg-white border border-[#e5e7eb] shadow-xl p-0 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f57c00] text-white">
                            <Video className="h-4 w-4" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#111]">{lesson.title}</h4>
                            <p className="text-xs text-[#666]">{startTime} - {endTime}</p>
                            {lesson.description && <p className="text-xs text-[#888] mt-0.5">{lesson.description}</p>}
                        </div>
                    </div>
                    <button onClick={onToggle} className="text-[#999] hover:text-[#333]">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f0f0f0]">
                    <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f5f5f5] text-[10px] font-bold text-[#555]">
                            {initials}
                        </div>
                        <span className="text-xs text-[#333]">{teacherName}</span>
                    </div>
                    {lesson.meet_link ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.open(lesson.meet_link, '_blank', 'noopener,noreferrer');
                            }}
                            className="flex items-center gap-1.5 rounded-full bg-[#111] px-3 py-1.5 text-xs font-medium text-white hover:bg-black/80"
                        >
                            <Video className="h-3 w-3" />
                            انضمام إلى الفصل
                        </button>
                    ) : (
                        <span className="text-[10px] text-[#999]">لا يوجد رابط اجتماع</span>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Live Sessions Tab (Calendar View) ───────────────────────────────────────

function LiveSessionsTab({ courseId }: { courseId: string }) {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: '', startDateTime: '', duration: '60', meetLink: '' });
    const [currentDate, setCurrentDate] = useState(new Date());
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda' | 'list'>('month');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const calendarDays = useMemo(() => getCalendarDays(year, month), [year, month]);

    useEffect(() => {
        async function loadLessons() {
            try {
                const res = await fetch(`/api/courses/${courseId}/lessons?limit=50`);
                const d = await res.json();
                let all = d.lessons || [];
                // Auto-fix: if any lessons lack meet_link, update DB then re-fetch
                if (all.some((l: Lesson) => !l.meet_link)) {
                    await fetch(`/api/admin/fix-meet-links?course=${courseId}`).catch(() => {});
                    const res2 = await fetch(`/api/courses/${courseId}/lessons?limit=50`);
                    const d2 = await res2.json();
                    all = d2.lessons || all;
                }
                setLessons(all);
            } catch {}
            setLoading(false);
        }
        loadLessons();
    }, [courseId]);

    const handleCreate = async () => {
        if (!form.title || !form.startDateTime) return;
        setSaving(true);
        const start = new Date(form.startDateTime);
        const end = new Date(start.getTime() + Number(form.duration) * 60000);
        const payload: Record<string, any> = {
            title: form.title,
            start_date_time: start.toISOString(),
            end_date_time: end.toISOString(),
        };
        // Send user-provided meet link if present
        if (form.meetLink.trim()) {
            payload.meet_link = form.meetLink.trim();
        }
        const res = await fetch(`/api/courses/${courseId}/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (res.ok) {
            const data = await res.json();
            if (data.lesson) setLessons((prev) => [...prev, data.lesson]);
            setShowModal(false);
            setForm({ title: '', startDateTime: '', duration: '60', meetLink: '' });
        }
        setSaving(false);
    };

    const goToday = () => setCurrentDate(new Date());
    const goPrev = () => setCurrentDate(new Date(year, month - 1, 1));
    const goNext = () => setCurrentDate(new Date(year, month + 1, 1));

    const getLessonsForDay = (date: Date) =>
        lessons.filter((l) => isSameDay(new Date(l.start_date_time), date));

    const weeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
        weeks.push(calendarDays.slice(i, i + 7));
    }

    const monthLabel = `${MONTHS_AR[month]} ${year}`;
    const monthLabelEn = `${currentDate.toLocaleDateString('en-US', { month: 'long' })} ${year}`;

    return (
        <>
            {showModal && (
                <Modal title="جلسة مباشرة جديدة" onClose={() => setShowModal(false)}>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">عنوان الجلسة *</label>
                            <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" placeholder="عنوان الجلسة المباشرة" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">التاريخ والوقت *</label>
                                <Input type="datetime-local" value={form.startDateTime} onChange={(e) => setForm((p) => ({ ...p, startDateTime: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-[#111111]">المدة (دقيقة)</label>
                                <Input type="number" min="1" value={form.duration} onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-[#111111]">رابط الاجتماع (اتركه فارغاً لتوليد تلقائي)</label>
                            <Input value={form.meetLink} onChange={(e) => setForm((p) => ({ ...p, meetLink: e.target.value }))} className="h-11 rounded-[10px] bg-[#fafafa] border-[#e5e7eb]" placeholder="https://meet.google.com/..." dir="ltr" />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setShowModal(false)} className="rounded-full border border-[#e4e4e7] px-5 py-2 text-sm font-medium text-[#111111] hover:bg-[#f4f4f5]">إلغاء</button>
                            <button onClick={handleCreate} disabled={saving || !form.title || !form.startDateTime} className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50">
                                {saving && <Loader2 className="h-4 w-4 animate-spin" />}إنشاء
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Header with Add button */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={() => setShowModal(true)} className="flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-sm font-medium text-white hover:bg-black/80">
                    <Plus className="h-4 w-4" />إضافة درس مباشر
                </button>
            </div>

            {/* Sub-tabs: Live Sessions / View */}
            <div className="flex items-center gap-4 border-b border-[#e5e7eb] mb-4 pb-0">
                <button
                    onClick={() => { if (viewMode === 'list') setViewMode('month'); }}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${viewMode !== 'list' ? 'text-[#111] border-b-2 border-[#111]' : 'text-[#999] hover:text-[#111]'}`}
                >
                    <Calendar className="h-4 w-4" />
                    الفصول المباشرة
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium ${viewMode === 'list' ? 'text-[#111] border-b-2 border-[#111]' : 'text-[#999] hover:text-[#111]'}`}
                >
                    <List className="h-4 w-4" />
                    عرض القائمة
                </button>
            </div>

            {viewMode === 'list' ? (
                /* ─── List View (Card Grid) ─── */
                <div>
                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4d4d8]" /></div>
                    ) : lessons.length === 0 ? (
                        <EmptyState icon={Video} message="لا توجد حصص مباشرة حتى الآن." />
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {lessons.map((lesson) => {
                                const startTime = new Date(lesson.start_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                const endTime = new Date(lesson.end_date_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                                const dateStr = new Date(lesson.start_date_time).toLocaleDateString('ar', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                const teacherName = lesson.teacher?.name || 'ابراهيم محمد';

                                return (
                                    <div key={lesson.id} className="rounded-xl border border-[#e5e7eb] bg-white p-5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f57c00] text-white">
                                                <Video className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-end">
                                                <h4 className="text-sm font-bold text-[#111]">{lesson.title}</h4>
                                                <p className="text-xs text-[#666] mt-1">{startTime} - {endTime}</p>
                                                <p className="text-xs text-[#999] mt-0.5">{dateStr}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f0f0f0]">
                                            <p className="text-xs text-[#666]">{teacherName}</p>
                                            {lesson.meet_link ? (
                                                <button
                                                    onClick={() => window.open(lesson.meet_link, '_blank', 'noopener,noreferrer')}
                                                    className="flex items-center gap-1.5 rounded-full bg-[#f57c00] px-4 py-2 text-xs font-medium text-white hover:bg-[#e65100]"
                                                >
                                                    <Video className="h-3.5 w-3.5" />
                                                    الانضمام إلى الفصل
                                                </button>
                                            ) : (
                                                <span className="text-xs text-[#999]">لا يوجد رابط اجتماع</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : (
                /* ─── Calendar View ─── */
                <div className="rounded-xl border border-[#e5e7eb] bg-white overflow-hidden">
                    {/* Calendar Toolbar */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e7eb]">
                        {/* View mode buttons */}
                        <div className="flex items-center gap-1 rounded-lg border border-[#e5e7eb] overflow-hidden">
                            {(['month', 'week', 'day', 'agenda'] as const).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                                        viewMode === mode ? 'bg-[#333] text-white' : 'text-[#666] hover:bg-[#f5f5f5]'
                                    }`}
                                >
                                    {mode === 'month' ? 'الشهر' : mode === 'week' ? 'الأسبوع' : mode === 'day' ? 'اليوم' : 'الأجندة'}
                                </button>
                            ))}
                        </div>

                        {/* Month/Year label */}
                        <h3 className="text-base font-semibold text-[#111]">{monthLabelEn}</h3>

                        {/* Navigation */}
                        <div className="flex items-center gap-1">
                            <button onClick={goToday} className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-medium text-[#333] hover:bg-[#f5f5f5]">اليوم</button>
                            <button onClick={goPrev} className="rounded-lg border border-[#e5e7eb] p-1.5 text-[#333] hover:bg-[#f5f5f5]">
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button onClick={goNext} className="rounded-lg border border-[#e5e7eb] p-1.5 text-[#333] hover:bg-[#f5f5f5]">
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-[#d4d4d8]" /></div>
                    ) : (
                        /* Calendar Grid */
                        <table className="w-full table-fixed border-collapse">
                            <thead>
                                <tr>
                                    {WEEKDAYS.map((day) => (
                                        <th key={day} className="border-b border-e border-[#e5e7eb] py-2.5 text-center text-xs font-medium text-[#999]">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, wi) => (
                                    <tr key={wi}>
                                        {week.map(({ date, isCurrentMonth }, di) => {
                                            const dayLessons = getLessonsForDay(date);
                                            const today = isToday(date);

                                            return (
                                                <td
                                                    key={di}
                                                    className={`relative border-b border-e border-[#e5e7eb] align-top p-1 h-28 ${
                                                        !isCurrentMonth ? 'bg-[#fafafa]' : today ? 'bg-blue-50/40' : 'bg-white'
                                                    }`}
                                                >
                                                    <div className={`text-end pe-1 mb-1 text-xs font-medium ${
                                                        today ? 'text-blue-600 font-bold' : !isCurrentMonth ? 'text-[#ccc]' : 'text-[#333]'
                                                    }`}>
                                                        {today ? (
                                                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                                                {date.getDate()}
                                                            </span>
                                                        ) : (
                                                            date.getDate()
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {dayLessons.map((lesson) => (
                                                            <div key={lesson.id} className="relative">
                                                                <SessionEventCard
                                                                    lesson={lesson}
                                                                    expanded={expandedId === lesson.id}
                                                                    onToggle={() => setExpandedId(expandedId === lesson.id ? null : lesson.id)}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </>
    );
}

interface TeacherOption {
    id: string;
    name: string;
}

export default function AdminCourseDetailsPage({ params }: { params: { id: string } }) {
    const locale = useLocale();
    const isArabic = locale === 'ar';

    const [courseTitle, setCourseTitle] = useState('');
    const [teacher, setTeacher] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [details, setDetails] = useState('');
    const [courseLoading, setCourseLoading] = useState(true);
    const [courseLoadError, setCourseLoadError] = useState<string | null>(null);
    const [teachers, setTeachers] = useState<TeacherOption[]>([]);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savingCourse, setSavingCourse] = useState(false);
    const [resolvedCourseId, setResolvedCourseId] = useState<string>(params.id);

    // Fetch teachers for dropdown
    useEffect(() => {
        fetch('/api/admin/users?role=teacher')
            .then((r) => r.json())
            .then((d) => {
                const users = d.users || [];
                setTeachers(users.map((u: any) => ({ id: u.id, name: u.name || u.email })));
            })
            .catch(() => {
                // Fallback to hardcoded list if API fails
                setTeachers([
                    { id: '1', name: 'ابراهيم محمد' },
                    { id: '2', name: 'د. رحمة خليل' },
                    { id: '3', name: 'Zainab elfadili Ibrahim' },
                ]);
            });
    }, []);

    useEffect(() => {
        // No single-course GET endpoint; fetch list and find by ID
        // Support both UUID lookup and numeric index (1-based) for compatibility with reference site
        fetch(`/api/courses?limit=50`)
            .then((r) => {
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                return r.json();
            })
            .then((d) => {
                const courses = d.courses || [];
                // First try exact ID match, then slug-based for known numeric IDs, then index fallback
                let c = courses.find((course: any) => String(course.id) === String(params.id));
                if (!c && /^\d+$/.test(params.id)) {
                    // Map known numeric IDs to slugs matching reference site
                    const slugMap: Record<string, string> = { '1': 'basics-english-level-1', '2': 'electronic-teacher-course', '3': 'basics-english-level-2' };
                    const targetSlug = slugMap[params.id];
                    if (targetSlug) {
                        c = courses.find((course: any) => course.slug === targetSlug);
                    }
                    // Fallback to index-based
                    if (!c) {
                        const idx = parseInt(params.id, 10) - 1;
                        if (idx >= 0 && idx < courses.length) {
                            c = courses[idx];
                        }
                    }
                }
                if (!c) {
                    setCourseLoadError(isArabic ? 'لم يتم العثور على المادة الدراسية' : 'Course not found');
                    return;
                }
                setResolvedCourseId(c.id);
                setCourseTitle(c.title || '');
                setTeacher(c.teacher_name || c.teacher?.name || c.instructor_name || '');
                setDetails(c.description || '');
                setMeetingLink(c.meet_link || '');
            })
            .catch(() => {
                setCourseLoadError(isArabic ? 'فشل في تحميل بيانات المادة الدراسية' : 'Failed to load course data');
            })
            .finally(() => setCourseLoading(false));
    }, [params.id, isArabic]);

    const copy = useMemo(
        () =>
            isArabic
                ? {
                      back: 'رجوع',
                      save: 'حفظ',
                      tabs: {
                          info: 'المعلومات',
                          lessons: 'الدروس',
                          assignments: 'الواجبات',
                          exams: 'الامتحانات',
                          live: 'الحصص المباشرة',
                      },
                      courseDetails: {
                          title: 'بيانات المادة الدراسية',
                          subtitle: 'قم بتعديل بيانات المادة الدراسية هنا',
                          courseName: 'اسم المادة',
                          teacher: 'المعلم',
                          details: 'التفاصيل',
                      },
                      upload: {
                          dragDrop: 'Drag and drop an image here, or',
                          button: 'Upload Image',
                          formats: 'Supported formats: jpg, jpeg, png, gif, webp (max 5MB)',
                      },
                      meeting: {
                          title: 'بيانات الاجتماع',
                          createMeeting: 'انشاء اجتماع',
                          meetingLink: 'رابط الاجتماع',
                          meetingLinkPlaceholder: 'https://meet.google.com/abc-defg-hij',
                      },
                  }
                : {
                      back: 'Back',
                      save: 'Save',
                      tabs: {
                          info: 'Information',
                          lessons: 'Lessons',
                          assignments: 'Assignments',
                          exams: 'Exams',
                          live: 'Live Sessions',
                      },
                      courseDetails: {
                          title: 'Course Details',
                          subtitle: 'Edit course details here',
                          courseName: 'Course Name',
                          teacher: 'Teacher',
                          details: 'Details',
                      },
                      upload: {
                          dragDrop: 'Drag and drop an image here, or',
                          button: 'Upload Image',
                          formats: 'Supported formats: jpg, jpeg, png, gif, webp (max 5MB)',
                      },
                      meeting: {
                          title: 'Meeting Details',
                          createMeeting: 'Create Meeting',
                          meetingLink: 'Meeting Link',
                          meetingLinkPlaceholder: 'https://meet.google.com/abc-defg-hij',
                      },
                  },
        [isArabic]
    );

    const BackIcon = isArabic ? ArrowRight : ArrowLeft;

    const [meetingLoading, setMeetingLoading] = useState(false);
    const [meetingError, setMeetingError] = useState('');

    const handleCreateMeeting = async () => {
        setMeetingLoading(true);
        setMeetingError('');

        try {
            const res = await fetch('/api/meetings/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    courseId: resolvedCourseId,
                    title: courseTitle || 'Eduverse Meeting',
                    description: details || '',
                }),
            });
            const data = await res.json();

            if (res.ok && data.meetLink) {
                setMeetingLink(data.meetLink);
            } else {
                const errMsg = data.error || 'فشل إنشاء رابط الاجتماع';
                const detail = data.detail ? ` (${data.detail})` : '';
                setMeetingError(`${errMsg}${detail}`);
                console.error('[UI] Meeting creation failed:', data);
            }
        } catch (err: any) {
            const errMsg = `فشل الاتصال بالخادم: ${err.message}`;
            setMeetingError(errMsg);
            console.error('[UI] Fetch error:', err);
        }

        setMeetingLoading(false);
    };

    const handleSave = async () => {
        setSavingCourse(true);
        setSaveMsg(null);
        setSaveError(null);
        try {
            const res = await fetch('/api/courses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: resolvedCourseId,
                    title: courseTitle,
                    description: details,
                    instructor_name: teacher,
                    meet_link: meetingLink || null,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'save failed');
            }
            setSaveMsg(isArabic ? 'تم حفظ التغييرات بنجاح' : 'Changes saved successfully');
            setTimeout(() => setSaveMsg(null), 3000);
        } catch (error: any) {
            console.error('Failed to save:', error);
            setSaveError(error.message || (isArabic ? 'فشل في حفظ التغييرات' : 'Failed to save changes'));
            setTimeout(() => setSaveError(null), 4000);
        } finally {
            setSavingCourse(false);
        }
    };

    if (courseLoadError) {
        return (
            <div className="relative min-h-[calc(100vh-120px)] w-full pb-20">
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="mb-4 h-12 w-12 text-red-300" strokeWidth={1.5} />
                    <p className="text-lg font-semibold text-red-600">{courseLoadError}</p>
                    <Link
                        href={withAdminPortalPrefix('/admin/courses', locale)}
                        className="mt-4 rounded-full border border-[#e5e7eb] px-5 py-2 text-sm font-medium text-[#111111] hover:bg-[#f4f4f5]"
                    >
                        {isArabic ? 'العودة للمواد الدراسية' : 'Back to Courses'}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-[calc(100vh-120px)] w-full pb-20">
            {/* Save feedback messages */}
            {saveMsg && (
                <div className="mb-4 rounded-xl bg-green-50 px-5 py-3 text-sm font-semibold text-green-700">{saveMsg}</div>
            )}
            {saveError && (
                <div className="mb-4 rounded-xl bg-red-50 px-5 py-3 text-sm font-semibold text-red-600">{saveError}</div>
            )}
            {/* Header Section */}
            <div className="mb-8 flex items-center justify-between">
                {/* Save Button (Left side in RTL) */}
                <div>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={savingCourse}
                        className="flex items-center justify-center gap-2 rounded-full bg-[#111111] px-7 py-2.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {savingCourse ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        <span>{savingCourse ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : copy.save}</span>
                    </button>
                </div>
                {/* Title & Back (Right side in RTL) */}
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-[#111111]">{courseLoading ? '…' : (courseTitle || 'New Course')}</h1>
                    <Link
                        href={withAdminPortalPrefix('/admin/courses', locale)}
                        className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[#71717a] transition-colors hover:text-[#111111]"
                    >
                        <span>{copy.back}</span>
                        <BackIcon className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs defaultValue="info" className="w-full" dir={isArabic ? 'rtl' : 'ltr'}>
                <div className="flex justify-end mb-6">
                    <TabsList className="tabs-pill-active h-auto rounded-[1.2rem] border border-slate-200 bg-[#f4f4f4] p-1">
                        <TabsTrigger
                            value="info"
                            className="rounded-[0.9rem] px-5 py-3 text-sm font-semibold text-[#71717a] data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-none"
                        >
                            <BookOpenIcon className="w-[18px] h-[18px] mr-2" />
                            {copy.tabs.info}
                        </TabsTrigger>
                        <TabsTrigger
                            value="lessons"
                            className="rounded-[0.9rem] px-5 py-3 text-sm font-semibold text-[#71717a] data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-none"
                        >
                            <FileText className="w-[18px] h-[18px] mr-2 ml-2" />
                            {copy.tabs.lessons}
                        </TabsTrigger>
                        <TabsTrigger
                            value="assignments"
                            className="rounded-[0.9rem] px-5 py-3 text-sm font-semibold text-[#71717a] data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-none"
                        >
                            <Pencil className="w-[18px] h-[18px] mr-2 ml-2" />
                            {copy.tabs.assignments}
                        </TabsTrigger>
                        <TabsTrigger
                            value="exams"
                            className="rounded-[0.9rem] px-5 py-3 text-sm font-semibold text-[#71717a] data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-none"
                        >
                            <FileText className="w-[18px] h-[18px] mr-2 ml-2" />
                            {copy.tabs.exams}
                        </TabsTrigger>
                        <TabsTrigger
                            value="live"
                            className="rounded-[0.9rem] px-5 py-3 text-sm font-semibold text-[#71717a] data-[state=active]:border-slate-800 data-[state=active]:bg-white data-[state=active]:text-[#111111] data-[state=active]:shadow-none"
                        >
                            <Video className="w-[18px] h-[18px] mr-2 ml-2" />
                            {copy.tabs.live}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="info" className="mt-0 outline-none">
                    <div className="flex flex-col gap-6">

                        {/* Card 1: Course Details & Image Upload */}
                        <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm overflow-hidden bg-[#fafafa]">
                            <CardHeader className="pb-5 pt-7 bg-[#fafafa] border-b border-[#f4f4f5]">
                                <CardTitle className="text-xl font-bold text-[#111111] text-start">
                                    {copy.courseDetails.title}
                                </CardTitle>
                                <CardDescription className="text-[#a1a1aa] text-sm mt-1 text-start">
                                    {copy.courseDetails.subtitle}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="p-7">
                                <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
                                    
                                    {/* Forms Column (Right in RTL, so visually on the right side of the card in the screenshot) */}
                                    <div className="flex flex-col gap-7 lg:order-1 order-2">
                                        <div className="space-y-2.5 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.courseName}
                                            </label>
                                            <Input
                                                value={courseTitle}
                                                onChange={(e) => setCourseTitle(e.target.value)}
                                                className="h-[52px] w-full rounded-[14px] bg-white border border-[#e5e7eb] px-4 text-[15px] focus-visible:ring-1 focus-visible:ring-[#111111] text-right text-[#111111]"
                                            />
                                        </div>

                                        <div className="space-y-2.5 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.teacher}
                                            </label>
                                            <div className="relative w-full">
                                                <select
                                                    value={teacher}
                                                    onChange={(e) => setTeacher(e.target.value)}
                                                    className="w-full h-[52px] appearance-none rounded-[14px] border border-[#e5e7eb] bg-white px-4 py-2 text-[15px] text-[#111111] focus:outline-none focus:ring-1 focus:ring-[#111111] text-right"
                                                    dir="rtl"
                                                >
                                                    {teachers.length > 0 ? (
                                                        teachers.map((t) => (
                                                            <option key={t.id} value={t.name}>{t.name}</option>
                                                        ))
                                                    ) : (
                                                        <>
                                                            {teacher && <option value={teacher}>{teacher}</option>}
                                                        </>
                                                    )}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4">
                                                    <ChevronDown className="h-5 w-5 text-[#a1a1aa]" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2.5 text-start flex flex-col items-end w-full">
                                            <label className="text-sm font-semibold text-[#111111] pl-4 self-stretch text-start">
                                                {copy.courseDetails.details}
                                            </label>
                                            <div className="w-full rounded-[14px] border border-[#e5e7eb] bg-white overflow-hidden shadow-sm">
                                                <div className="flex flex-wrap items-center justify-end gap-1.5 border-b border-[#e5e7eb] bg-white p-[10px] sm:flex-nowrap">
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Type className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Link2 className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><ImageIcon className="w-[18px] h-[18px]" /></button>
                                                    <div className="w-px h-5 bg-[#e4e4e7] mx-1.5"></div>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><List className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><ListOrdered className="w-[18px] h-[18px]" /></button>
                                                    <div className="w-px h-5 bg-[#e4e4e7] mx-1.5"></div>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Bold className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Italic className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Underline className="w-[18px] h-[18px]" /></button>
                                                    <button className="p-2 text-[#71717a] hover:text-[#111111] hover:bg-[#f4f4f5] rounded-lg transition-colors"><Strikethrough className="w-[18px] h-[18px]" /></button>
                                                </div>
                                                <Textarea
                                                    value={details}
                                                    onChange={(e) => setDetails(e.target.value)}
                                                    className="w-full min-h-[160px] resize-none border-0 focus-visible:ring-0 p-5 bg-transparent text-[#27272a] text-[15px] leading-relaxed text-right"
                                                    dir="rtl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image Upload Column (Visually on the left side) */}
                                    <div className="lg:order-2 order-1 flex items-stretch h-full min-h-[460px]">
                                        <div className="flex w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-[#d4d4d8] bg-transparent p-10 text-center transition-colors hover:bg-white/50">
                                            <ImageIcon className="mb-6 h-[48px] w-[48px] text-[#a1a1aa]" strokeWidth={1} />
                                            <p className="mb-4 text-sm font-medium text-[#71717a]">
                                                {copy.upload.dragDrop}
                                            </p>
                                            <button
                                                type="button"
                                                className="mb-5 flex items-center justify-center gap-2 rounded-full border border-[#e5e7eb] bg-white px-6 py-2.5 text-[13px] font-bold text-[#111111] shadow-sm transition-colors hover:bg-[#f4f4f5]"
                                            >
                                                <UploadCloud className="h-[18px] w-[18px]" />
                                                <span>{copy.upload.button}</span>
                                            </button>
                                            <p className="text-[11px] text-[#a1a1aa]">
                                                {copy.upload.formats}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {/* Card 2: Meeting Details */}
                        <Card className="rounded-[20px] border-[#e5e7eb] shadow-sm bg-[#fafafa]">
                            <CardHeader className="pb-5 pt-7 bg-[#fafafa]">
                                <div className="flex items-center justify-between flex-row-reverse w-full">
                                    <div className="flex flex-col text-start items-start">
                                        <CardTitle className="text-xl font-bold text-[#111111]">
                                            {copy.meeting.title}
                                        </CardTitle>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCreateMeeting}
                                        disabled={meetingLoading}
                                        className="flex items-center justify-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-black/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {meetingLoading ? (
                                            <Loader2 className="h-[16px] w-[16px] animate-spin" />
                                        ) : (
                                            <Video className="h-[16px] w-[16px]" />
                                        )}
                                        <span>{meetingLoading ? (isArabic ? 'جاري الإنشاء...' : 'Creating...') : copy.meeting.createMeeting}</span>
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-7 pt-0">
                                <div className="space-y-3 text-start flex flex-col items-end w-full">
                                    <div className="flex items-center gap-2 text-start justify-end w-full pr-1">
                                        <label className="text-[13px] font-semibold text-[#52525b]">
                                            {copy.meeting.meetingLink}
                                        </label>
                                        <Link2 className="w-4 h-4 text-[#8a8a8a]" />
                                    </div>
                                    <Input
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder={copy.meeting.meetingLinkPlaceholder}
                                        className="h-[52px] w-full rounded-[14px] bg-white border border-[#e5e7eb] px-5 focus-visible:ring-1 focus-visible:ring-[#111111] text-left text-[14px] text-[#71717a] font-mono"
                                        dir="ltr"
                                    />
                                    {meetingError && (
                                        <div className="w-full rounded-lg bg-red-50 border border-red-200 p-3 mt-2">
                                            <p className="text-sm text-red-700 font-medium">{meetingError}</p>
                                        </div>
                                    )}
                                    {meetingLink && (
                                        <a href={meetingLink} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1">
                                            <Video className="h-4 w-4" />
                                            {isArabic ? 'فتح الاجتماع' : 'Open Meeting'}
                                        </a>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </TabsContent>

                <TabsContent value="lessons" className="mt-0 outline-none">
                    <LessonsTab courseId={resolvedCourseId} />
                </TabsContent>
                <TabsContent value="assignments" className="mt-0 outline-none">
                    <AssignmentsTab courseId={resolvedCourseId} />
                </TabsContent>
                <TabsContent value="exams" className="mt-0 outline-none">
                    <ExamsTab courseId={resolvedCourseId} />
                </TabsContent>
                <TabsContent value="live" className="mt-0 outline-none">
                    <LiveSessionsTab courseId={resolvedCourseId} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Inline BookOpenIcon for exactly matching the tab icon seen in screenshots if necessary,
// though BookOpen from lucide can also be used.
function BookOpenIcon(props: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}
