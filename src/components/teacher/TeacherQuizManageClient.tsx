'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  FileText,
  Plus,
  Settings,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { withLocalePrefix } from '@/lib/locale-path';

interface QuizQuestion {
  id: number;
  title: string;
  fileType: string;
}

function PillButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-[#171717] px-5 py-3 text-sm font-bold text-white transition hover:bg-black/85"
    >
      {children}
    </button>
  );
}

export default function TeacherQuizManageClient() {
  const { data: session } = useSession();
  const params = useParams();
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const quizId = params?.id as string;

  const [activeQuestionId, setActiveQuestionId] = useState(1);
  const [quizTitle, setQuizTitle] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editorText, setEditorText] = useState('');
  const [required, setRequired] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const activeQuestion = questions.find((q) => q.id === activeQuestionId) || questions[0];

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true);
      try {
        const res = await fetch(`/api/assessments?teacherId=${(session?.user as any)?.id}`);
        if (res.ok) {
          const data = await res.json();
          const quiz = (Array.isArray(data) ? data : []).find((a: any) => a.id === quizId);
          if (quiz) {
            setQuizTitle(quiz.title || '');
          }
        }
        setQuestions([]);
      } catch {
        setError(isArabic ? 'فشل في تحميل الاختبار' : 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    }
    if (session?.user) {
      fetchQuiz();
    }
  }, [quizId, session?.user, isArabic]);

  const showSaved = useCallback((msg?: string) => {
    setSavedMsg(msg || (isArabic ? 'تم الحفظ بنجاح' : 'Saved successfully'));
    setTimeout(() => setSavedMsg(null), 2500);
  }, [isArabic]);

  const handleSave = useCallback(async () => {
    if (!quizId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/quizzes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: quizId,
          title: quizTitle || undefined,
          description: description || undefined,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }
      showSaved();
    } catch (err: any) {
      setSavedMsg(null);
      setError(err.message || (isArabic ? 'فشل في حفظ الاختبار' : 'Failed to save quiz'));
    } finally {
      setSaving(false);
    }
  }, [quizId, quizTitle, description, showSaved, isArabic]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-[1.2rem] border border-slate-200 bg-white p-4">
            <div className="h-6 w-48 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-32 rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {savedMsg && (
        <div className="rounded-[1rem] bg-green-50 px-5 py-3 text-right text-sm font-semibold text-green-700">{savedMsg}</div>
      )}
      {error && (
        <div className="rounded-[1rem] bg-red-50 px-5 py-3 text-right text-sm font-semibold text-red-600">{error}</div>
      )}

      {/* Header bar */}
      <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => showSaved(isArabic ? 'جارٍ فتح إعدادات الاختبار...' : 'Opening quiz settings...')}
              className="h-12 rounded-full border-slate-200 bg-white px-5"
            >
              <Settings className="ms-2 h-4 w-4" />
              {isArabic ? 'إعدادات الاختبار' : 'Quiz Settings'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-12 rounded-full bg-[#171717] px-5 text-white hover:bg-black/85 disabled:opacity-50"
            >
              {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ' : 'Save')}
            </Button>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <Link
                href={withLocalePrefix('/teacher/quizzes', locale)}
                className="text-sm font-semibold text-slate-600"
              >
                {isArabic ? 'رجوع' : 'Back'}
              </Link>
              <h1 className="text-[2.15rem] font-black text-slate-950">{quizTitle || (isArabic ? 'اختبار جديد' : 'New Quiz')}</h1>
            </div>
            <p className="mt-2 text-sm text-slate-400">
              {isArabic ? 'إدارة إعدادات الاختبار والأسئلة وعرض التقديمات' : 'Manage quiz settings, questions, and view submissions'}
            </p>
          </div>
        </div>
      </div>

      {/* Question editor + sidebar */}
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        {/* Main editor */}
        <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div className="relative">
              <select
                defaultValue={activeQuestion?.fileType || (isArabic ? 'تحميل ملف' : 'File Upload')}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white px-4 ps-10 text-sm text-slate-700 outline-none"
              >
                <option>{isArabic ? 'تحميل ملف' : 'File Upload'}</option>
                <option>{isArabic ? 'اختيار متعدد' : 'Multiple Choice'}</option>
                <option>{isArabic ? 'نص حر' : 'Free Text'}</option>
              </select>
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              {isArabic ? 'سؤال' : 'Question'} {activeQuestion?.id || 1}
            </h2>
          </div>

          <div className="space-y-5">
            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">
                {isArabic ? 'عنوان السؤال *' : 'Question Title *'}
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 rounded-[1rem] border-slate-200 bg-white text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">
                {isArabic ? 'وصف السؤال' : 'Question Description'}
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isArabic ? 'أدخل تفاصيل إضافية أو تعليمات للسؤال...' : 'Enter additional details or instructions...'}
                className="min-h-[90px] rounded-[1rem] border-slate-200 bg-white text-right"
              />
            </div>

            <div className="space-y-2 text-right">
              <label className="text-sm font-semibold text-slate-700">
                {isArabic ? 'محتوى النص المنسق' : 'Rich Text Content'}
              </label>
              <div className="overflow-hidden rounded-[1.1rem] border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-end gap-1 border-b border-slate-200 px-3 py-2">
                  {['B', 'I', 'U'].map((item) => (
                    <button key={item} type="button" className="rounded-md px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      {item}
                    </button>
                  ))}
                  <div className="mx-2 h-5 w-px bg-slate-200" />
                  <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">list</button>
                  <button type="button" className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-50">link</button>
                </div>
                <Textarea
                  value={editorText}
                  onChange={(e) => setEditorText(e.target.value)}
                  placeholder={isArabic ? 'أدخل محتوى النص المنسق هنا...' : 'Enter rich text content here...'}
                  className="min-h-[90px] resize-none border-0 bg-transparent text-right shadow-none focus-visible:ring-0"
                />
              </div>
              <p className="text-xs text-slate-400">
                {isArabic
                  ? 'قم بتنسيق سؤالك باستخدام النص المنسق. سيتم عرض هذا للطالب.'
                  : 'Format your question using rich text. This will be displayed to the student.'}
              </p>
            </div>

            <div className="space-y-3 text-right">
              <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText className="h-4 w-4" />
                {isArabic ? 'صورة السؤال (اختياري)' : 'Question Image (optional)'}
              </label>
              <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-8 text-center">
                <UploadCloud className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                <p className="text-sm text-slate-500">
                  {isArabic ? 'ستطلب من الطالب تحميل ملف لهذا السؤال' : 'Students will be asked to upload a file for this question'}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {isArabic ? 'أنواع الملفات المسموحة (اختياري)' : 'Allowed file types (optional)'}
                </p>
                <Input
                  placeholder={isArabic ? 'مثال: pdf, jpg, docx' : 'e.g. pdf, jpg, docx'}
                  className="mt-4 h-11 rounded-xl border-slate-200 bg-white text-right"
                />
              </div>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setRequired((c) => !c)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${required ? 'bg-[#111111]' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${required ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <div className="text-right">
                  <h3 className="text-xl font-black text-slate-950">{isArabic ? 'الإعدادات' : 'Settings'}</h3>
                  <p className="mt-2 text-sm text-slate-400">{isArabic ? 'مطلوب' : 'Required'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions sidebar */}
        <div className="rounded-[1.6rem] border border-slate-200 bg-[#fafafa] p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <PillButton onClick={() => {
              const newId = (questions[questions.length - 1]?.id || 0) + 1;
              setQuestions((prev) => [...prev, {
                id: newId,
                title: `${isArabic ? 'سؤال' : 'Question'} ${newId}`,
                fileType: isArabic ? 'تحميل ملف' : 'File Upload',
              }]);
              setActiveQuestionId(newId);
              setTitle(`${isArabic ? 'سؤال' : 'Question'} ${newId}`);
            }}>
              <Plus className="h-4 w-4" />
              {isArabic ? 'إضافة' : 'Add'}
            </PillButton>
            <div className="text-right">
              <h2 className="text-2xl font-black text-slate-950">{isArabic ? 'الأسئلة' : 'Questions'}</h2>
              <p className="text-sm text-slate-400">
                {questions.length} {isArabic ? 'سؤال' : 'question(s)'}
              </p>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-white p-6 text-center">
              <p className="text-sm text-slate-400">
                {isArabic ? 'لا توجد أسئلة بعد. اضغط "إضافة" لبدء إنشاء الأسئلة.' : 'No questions yet. Click "Add" to start creating questions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {questions.map((question) => {
                const active = question.id === activeQuestionId;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => {
                      setActiveQuestionId(question.id);
                      setTitle(question.title);
                    }}
                    className={`w-full rounded-[1.2rem] border p-4 text-right shadow-sm transition ${
                      active ? 'border-slate-500 bg-white' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuestions((prev) => prev.filter((q) => q.id !== question.id));
                          if (activeQuestionId === question.id && questions.length > 1) {
                            const remaining = questions.filter((q) => q.id !== question.id);
                            setActiveQuestionId(remaining[0]?.id || 1);
                          }
                        }}
                      >
                        <Trash2 className="mt-1 h-4 w-4 text-slate-400 hover:text-red-500" />
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-end gap-2 text-xs text-slate-400">
                          <span>{question.id}</span>
                          <span className="rounded-full border border-slate-200 px-3 py-1 text-slate-700">{question.fileType}</span>
                        </div>
                        <p className="mt-3 text-sm font-semibold text-slate-800">{question.title}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
