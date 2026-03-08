'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, CheckCircle, XCircle, Save, Download, FileText, Check } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { withLocalePrefix } from '@/lib/locale-path';
import Image from 'next/image';

export function SubmissionGrader({
    submission,
    assessment,
    mergedData,
    locale
}: {
    submission: any;
    assessment: any;
    mergedData: any[];
    locale: string;
}) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Initial state setup for manual grading
    const [grades, setGrades] = useState<Record<string, { points: number; feedback: string }>>(
        mergedData.reduce((acc, curr) => {
            const answerId = curr.answer?.id;
            if (answerId) {
                acc[answerId] = {
                    points: curr.answer.points_awarded || 0,
                    feedback: curr.answer.teacher_feedback || ''
                };
            }
            return acc;
        }, {} as Record<string, { points: number; feedback: string }>)
    );

    const updateGrade = (answerId: string, field: 'points' | 'feedback', value: any) => {
        setGrades(prev => ({
            ...prev,
            [answerId]: {
                ...prev[answerId],
                [field]: value
            }
        }));
    };

    const handleSaveGrades = async () => {
        setIsSaving(true);
        try {
            let totalManualPoints = 0;
            let totalAutoPoints = 0;

            // Prepare updates for assessment_answers
            const answerUpdates = mergedData.map(item => {
                if (!item.answer) return null;

                const qType = item.question.question_type;
                let finalPoints = item.answer.points_awarded || 0;

                if (qType === 'multiple_choice') {
                    // Auto graded, keep existing points
                    totalAutoPoints += finalPoints;
                    return null; // No need to update the DB answer row if it's already graded unless teacher overrides? Assuming no override.
                } else {
                    // Manual graded
                    const manualData = grades[item.answer.id];
                    finalPoints = manualData?.points || 0;
                    totalManualPoints += finalPoints;

                    return {
                        id: item.answer.id,
                        points_awarded: finalPoints,
                        teacher_feedback: manualData?.feedback || null,
                        is_correct: finalPoints > 0 // basic boolean flag based on points
                    };
                }
            }).filter(Boolean);

            // 1. Update answers individually
            for (const update of answerUpdates) {
                if (!update) continue;
                const { error } = await supabase
                    .from('assessment_answers')
                    .update({
                        points_awarded: update.points_awarded,
                        teacher_feedback: update.teacher_feedback,
                        is_correct: update.is_correct
                    })
                    .eq('id', update.id);

                if (error) throw error;
            }

            // Calculate total score dynamically here or assume the DB handles tracking it. Let's do it here.
            // Recalculate auto points if missing logic, but DB should have it. We'll just sum all.
            const totalScore = mergedData.reduce((sum, item) => {
                if (!item.answer) return sum;
                if (item.question.question_type === 'multiple_choice') {
                    return sum + (item.answer.points_awarded || 0);
                } else {
                    return sum + (grades[item.answer.id]?.points || 0);
                }
            }, 0);

            // 2. Update Submission status to 'graded'
            const { error: subError } = await supabase
                .from('assessment_submissions')
                .update({
                    total_score: totalScore,
                    status: 'graded',
                    manual_grading_required: false
                })
                .eq('id', submission.id);

            if (subError) throw subError;

            alert('Grades saved successfully!');
            router.push(withLocalePrefix(`/teacher/assessments/${assessment.id}/results`, locale));
            router.refresh();

        } catch (error: any) {
            console.error(error);
            alert("Failed to save grades: " + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="sm" asChild className="gap-2">
                    <Link href={withLocalePrefix(`/teacher/assessments/${assessment.id}/results`, locale)}>
                        <ArrowLeft className="h-4 w-4" /> Back to Results
                    </Link>
                </Button>
            </div>

            <Card className="bg-blue-50 border-blue-100 shadow-sm">
                <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                {submission.student?.name}
                                {submission.status === 'graded' && (
                                    <span className="text-sm font-normal px-2 py-0.5 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                        <Check className="h-3 w-3" /> Graded
                                    </span>
                                )}
                            </h2>
                            <p className="text-gray-500 text-sm">{submission.student?.email}</p>
                            <div className="flex gap-4 mt-4 text-sm text-gray-600 font-medium">
                                <div className="bg-white px-3 py-1 rounded shadow-sm border">
                                    Total Score: <span className="text-blue-700 font-bold">{submission.total_score || 0} / {submission.max_score || 0}</span>
                                </div>
                                <div className="bg-white px-3 py-1 rounded shadow-sm border">
                                    Time Taken: <span className="text-gray-900">{submission.time_taken_minutes || 0} mins</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-8">
                {mergedData.map((item, index) => {
                    const q = item.question;
                    const a = item.answer;
                    const isManual = q.question_type === 'text' || q.question_type === 'file_upload';

                    return (
                        <Card key={q.id} className={isManual ? 'border-yellow-200 shadow-sm' : ''}>
                            <CardHeader className="bg-gray-50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-gray-400">Q{index + 1}</span>
                                        <div>
                                            <CardTitle className="text-lg leading-relaxed">{q.question_text}</CardTitle>
                                            <div className="text-xs text-gray-500 uppercase mt-1 tracking-wider font-semibold">
                                                {q.question_type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold bg-gray-200 px-3 py-1 rounded">
                                        {q.points} pt{q.points !== 1 ? 's' : ''} max
                                    </div>
                                </div>
                                {q.image_url && (
                                    <div className="mt-4 relative h-48 w-full max-w-md bg-white border rounded p-2">
                                        <Image src={q.image_url} alt="Question image" fill className="object-contain" />
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="pt-6">
                                {/* Auto-graded rendering */}
                                {!isManual && (
                                    <div className="space-y-3">
                                        {q.options_json?.map((opt: any, i: number) => {
                                            const isSelected = a?.selected_option_index === i;
                                            const isCorrectAnswer = opt.is_correct;

                                            // Coloring logic
                                            let bgClass = "bg-gray-50 border-gray-200";
                                            if (isSelected && isCorrectAnswer) bgClass = "bg-green-100 border-green-300 text-green-900";
                                            if (isSelected && !isCorrectAnswer) bgClass = "bg-red-100 border-red-300 text-red-900";
                                            if (!isSelected && isCorrectAnswer) bgClass = "bg-green-50 border-green-200 text-green-700 outline outline-2 outline-green-400"; // highlight missed correct answer

                                            return (
                                                <div key={i} className={`p-3 rounded-lg border flex justify-between items-center ${bgClass}`}>
                                                    <span>{opt.text}</span>
                                                    {isSelected && isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-600" />}
                                                    {isSelected && !isCorrectAnswer && <XCircle className="h-5 w-5 text-red-500" />}
                                                    {!isSelected && isCorrectAnswer && <CheckCircle className="h-5 w-5 text-green-500 opacity-50" />}
                                                </div>
                                            );
                                        })}

                                        <div className="mt-4 flex justify-end font-semibold text-sm">
                                            Points Awarded:
                                            <span className={`ml-2 ${a?.points_awarded > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {a?.points_awarded || 0} / {q.points}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Manual graded rendering */}
                                {isManual && (
                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-50 border rounded-lg min-h-[100px]">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Student's Answer:</h4>

                                            {q.question_type === 'text' && (
                                                <p className="whitespace-pre-wrap text-gray-800">{a?.text_answer || <span className="italic text-gray-400">No answer provided.</span>}</p>
                                            )}

                                            {q.question_type === 'file_upload' && (
                                                <div className="flex items-center gap-2">
                                                    {a?.file_url ? (
                                                        <Button variant="outline" asChild className="gap-2">
                                                            <a href={a.file_url} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" /> Download Submitted File
                                                            </a>
                                                        </Button>
                                                    ) : (
                                                        <span className="italic text-gray-400">No file uploaded.</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Teacher Grading Block */}
                                        <div className="bg-yellow-50 p-4 border border-yellow-200 rounded-lg space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-semibold text-yellow-900 flex items-center gap-2">
                                                    <FileText className="h-4 w-4" /> Manual Grading
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <Label>Points:</Label>
                                                    <Input
                                                        type="number"
                                                        min="0"
                                                        max={q.points}
                                                        className="w-20 bg-white"
                                                        value={grades[a?.id]?.points ?? 0}
                                                        onChange={(e) => updateGrade(a?.id, 'points', Number(e.target.value))}
                                                    />
                                                    <span className="text-gray-500 text-sm">/ {q.points}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-yellow-900">Teacher Feedback (Optional)</Label>
                                                <Textarea
                                                    className="bg-white mt-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500"
                                                    placeholder="Great job explaining..."
                                                    value={grades[a?.id]?.feedback || ''}
                                                    onChange={(e) => updateGrade(a?.id, 'feedback', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10 flex justify-end gap-4 lg:pl-64">
                <Button
                    onClick={handleSaveGrades}
                    disabled={isSaving}
                    className="bg-brand-primary text-black hover:bg-yellow-400 gap-2"
                >
                    <Save className="h-4 w-4" />
                    Save Grades
                </Button>
            </div>
        </div>
    );
}
