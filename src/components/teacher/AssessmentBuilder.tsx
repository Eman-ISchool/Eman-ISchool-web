'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Check, X, Image as ImageIcon, Clock, Settings, Type } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Helper for generating unique question IDs in state
const generateId = () => Math.random().toString(36).substring(2, 9);

type QuestionType = 'multiple_choice' | 'text' | 'file_upload';

interface Option {
    id: string;
    text: string;
    is_correct: boolean;
}

interface Question {
    id: string;
    type: QuestionType;
    text: string;
    image_url: string;
    is_mandatory: boolean;
    points: number;
    options: Option[];
}

export function AssessmentBuilder({
    teacherId,
    courses,
    subjects,
    lessons
}: {
    teacherId: string;
    courses: any[];
    subjects: any[];
    lessons: any[];
}) {
    const router = useRouter();
    const locale = useLocale();
    const isArabic = locale === 'ar';
    const [isSaving, setIsSaving] = useState(false);

    // Assessment Metadata
    const [title, setTitle] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [longDescription, setLongDescription] = useState('');
    const [courseId, setCourseId] = useState('');
    const [durationMinutes, setDurationMinutes] = useState<number | ''>('');

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: generateId(), type: 'multiple_choice', text: '', image_url: '', is_mandatory: true, points: 1, options: [
                { id: generateId(), text: '', is_correct: true },
                { id: generateId(), text: '', is_correct: false }
            ]
        }
    ]);

    const addQuestion = (type: QuestionType) => {
        setQuestions([
            ...questions,
            {
                id: generateId(),
                type,
                text: '',
                image_url: '',
                is_mandatory: true,
                points: 1,
                options: type === 'multiple_choice' ? [
                    { id: generateId(), text: '', is_correct: true },
                    { id: generateId(), text: '', is_correct: false }
                ] : []
            }
        ]);
    };

    const removeQuestion = (qId: string) => {
        setQuestions(questions.filter(q => q.id !== qId));
    };

    const updateQuestion = (qId: string, updates: Partial<Question>) => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, ...updates } : q));
    };

    const addOption = (qId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: [...q.options, { id: generateId(), text: '', is_correct: false }] };
            }
            return q;
        }));
    };

    const updateOption = (qId: string, optId: string, text: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: q.options.map(opt => opt.id === optId ? { ...opt, text } : opt)
                };
            }
            return q;
        }));
    };

    const setCorrectOption = (qId: string, optId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return {
                    ...q,
                    options: q.options.map(opt => ({ ...opt, is_correct: opt.id === optId }))
                };
            }
            return q;
        }));
    };

    const removeOption = (qId: string, optId: string) => {
        setQuestions(questions.map(q => {
            if (q.id === qId) {
                return { ...q, options: q.options.filter(o => o.id !== optId) };
            }
            return q;
        }));
    };

    const handleSave = async (publish: boolean) => {
        if (!title) return alert(isArabic ? "العنوان مطلوب" : "Title is required");

        setIsSaving(true);
        try {
            // 1. Save Assessment
            const { data: assessment, error: assessmentError } = await supabase
                .from('assessments')
                .insert([{
                    teacher_id: teacherId,
                    title,
                    short_description: shortDescription,
                    long_description: longDescription,
                    course_id: courseId || null,
                    duration_minutes: durationMinutes === '' ? null : Number(durationMinutes),
                    is_published: publish
                }])
                .select()
                .single();

            if (assessmentError) throw assessmentError;

            // 2. Save Questions
            const questionsToInsert = questions.map((q, index) => ({
                assessment_id: assessment.id,
                question_type: q.type,
                question_text: q.text,
                image_url: q.image_url || null,
                is_mandatory: q.is_mandatory,
                points: q.points,
                sort_order: index,
                options_json: q.type === 'multiple_choice' ? q.options.map(o => ({
                    text: o.text,
                    is_correct: o.is_correct
                })) : null
            }));

            if (questionsToInsert.length > 0) {
                const { error: questionsError } = await supabase
                    .from('assessment_questions')
                    .insert(questionsToInsert);
                if (questionsError) throw questionsError;
            }

            router.push(`/${locale}/teacher/assessments`);
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(isArabic ? "فشل في حفظ التقييم: " + error.message : "Failed to save assessment: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Metadata Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {isArabic ? 'إعدادات الاختبار' : 'Test Settings'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label>{isArabic ? 'عنوان الاختبار *' : 'Test Title *'}</Label>
                        <Input
                            placeholder={isArabic ? 'مثال: امتحان الفيزياء النصفي' : 'e.g. Midterm Physics Exam'}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label>{isArabic ? 'سياق المادة' : 'Course Context'}</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                            >
                                <option value="">{isArabic ? 'عام (بدون مادة)' : 'General (No Course)'}</option>
                                {courses.map(c => (
                                    <option key={c.id} value={c.id}>{c.title}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>{isArabic ? 'المدة الزمنية (دقائق)' : 'Time Limit (Minutes)'}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder={isArabic ? 'اتركه فارغاً بدون توقيت' : 'Leave empty for untimed'}
                                    value={durationMinutes}
                                    onChange={(e) => setDurationMinutes(e.target.value ? parseInt(e.target.value) : '')}
                                />
                                <Clock className="h-5 w-5 text-gray-400" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <Label>{isArabic ? 'وصف مختصر' : 'Short Description'}</Label>
                        <Input
                            placeholder={isArabic ? 'وصف مختصر للطلاب' : 'Brief description for students'}
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label>{isArabic ? 'تعليمات تفصيلية / العنوان' : 'Detailed Instructions / Address'}</Label>
                        <Textarea
                            placeholder={isArabic ? 'التعليمات الكاملة أو تفاصيل العنوان أو القواعد المحددة لأداء هذا الامتحان...' : 'Full instructions, address details, or specific rules for taking this exam...'}
                            rows={3}
                            value={longDescription}
                            onChange={(e) => setLongDescription(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Questions Section */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">{isArabic ? 'الأسئلة' : 'Questions'} ({questions.length})</h2>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => addQuestion('multiple_choice')} className="gap-1">
                            <Plus className="h-4 w-4" /> {isArabic ? 'اختيار من متعدد' : 'Multiple Choice'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addQuestion('text')} className="gap-1">
                            <Type className="h-4 w-4" /> {isArabic ? 'إدخال نصي' : 'Text Input'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => addQuestion('file_upload')} className="gap-1">
                            <Plus className="h-4 w-4" /> {isArabic ? 'رفع ملف' : 'File Upload'}
                        </Button>
                    </div>
                </div>

                {questions.map((q, index) => (
                    <Card key={q.id} className="relative border-blue-100 shadow-sm">
                        <div className="absolute top-2 end-2 flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                                {isArabic ? `سؤال ${index + 1}` : `Question ${index + 1}`}
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs uppercase tracking-wider">
                                    {q.type.replace('_', ' ')}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>{isArabic ? 'نص السؤال *' : 'Question Prompt *'}</Label>
                                <Textarea
                                    className="resize-none"
                                    placeholder={isArabic ? 'أدخل سؤالك هنا...' : 'Enter your question here...'}
                                    value={q.text}
                                    onChange={(e) => updateQuestion(q.id, { text: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <Label className="flex items-center gap-1"><ImageIcon className="h-4 w-4" /> {isArabic ? 'رابط صورة (اختياري)' : 'Conditional Image URL (Optional)'}</Label>
                                    <Input
                                        placeholder="https://..."
                                        value={q.image_url}
                                        onChange={(e) => updateQuestion(q.id, { image_url: e.target.value })}
                                    />
                                </div>
                                <div className="w-24">
                                    <Label>{isArabic ? 'النقاط' : 'Points'}</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={q.points}
                                        onChange={(e) => updateQuestion(q.id, { points: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="flex items-end pb-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={q.is_mandatory}
                                            onChange={(e) => updateQuestion(q.id, { is_mandatory: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-medium">{isArabic ? 'مطلوب' : 'Required'}</span>
                                    </label>
                                </div>
                            </div>

                            {/* Multiple Choice Options */}
                            {q.type === 'multiple_choice' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-3 border">
                                    <Label>{isArabic ? 'خيارات الإجابة (اختر الصحيحة)' : 'Answer Options (Select the correct one)'}</Label>
                                    {q.options.map((opt, oIndex) => (
                                        <div key={opt.id} className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setCorrectOption(q.id, opt.id)}
                                                className={`h-8 w-8 rounded-full flex items-center justify-center border transition-colors ${opt.is_correct ? 'bg-green-500 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-300 hover:border-green-400'
                                                    }`}
                                            >
                                                <Check className="h-4 w-4" />
                                            </button>
                                            <Input
                                                value={opt.text}
                                                onChange={(e) => updateOption(q.id, opt.id, e.target.value)}
                                                placeholder={isArabic ? `خيار ${oIndex + 1}` : `Option ${oIndex + 1}`}
                                                className={opt.is_correct ? 'border-green-500 ring-1 ring-green-500' : ''}
                                            />
                                            <Button variant="ghost" size="icon" onClick={() => removeOption(q.id, opt.id)} className="text-gray-400 hover:text-red-500">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                    <Button variant="ghost" size="sm" onClick={() => addOption(q.id)} className="text-blue-600 mt-2">
                                        <Plus className="h-4 w-4 me-1" /> {isArabic ? 'إضافة خيار' : 'Add Option'}
                                    </Button>
                                </div>
                            )}

                            {/* Text Input Hint */}
                            {q.type === 'text' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed text-sm text-gray-500 text-center">
                                    {isArabic ? 'سيتم توفير مربع نص متعدد الأسطر للطلاب لكتابة إجابتهم. يتطلب هذا تصحيحاً يدوياً.' : 'Students will be provided a multi-line text box to write their answer. This requires manual grading.'}
                                </div>
                            )}

                            {/* File Upload Hint */}
                            {q.type === 'file_upload' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-dashed text-sm text-gray-500 text-center">
                                    {isArabic ? 'سيُطلب من الطلاب رفع ملف (PDF، صورة، مستندات). يتطلب هذا تصحيحاً يدوياً.' : 'Students will be prompted to upload a file (PDF, Image, Docs). This requires manual grading.'}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Bottom Sticky Action Bar */}
            <div className="fixed bottom-0 inset-x-0 p-4 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-end gap-4 shadow-top lg:ps-64">
                <Button
                    variant="outline"
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                >
                    {isArabic ? 'حفظ كمسودة' : 'Save as Draft'}
                </Button>
                <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="bg-brand-primary text-black hover:bg-yellow-400"
                >
                    {isArabic ? 'نشر الاختبار الآن' : 'Publish Test Now'}
                </Button>
            </div>
        </div>
    );
}
