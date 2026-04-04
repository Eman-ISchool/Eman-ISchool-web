'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, FileBox, CheckCircle2 } from 'lucide-react';
import { withLocalePrefix } from '@/lib/locale-path';
import Image from 'next/image';

export function ExamTaker({
    assessment,
    questions,
    submission,
    existingAnswers,
    locale
}: {
    assessment: any;
    questions: any[];
    submission: any;
    existingAnswers: any[];
    locale: string;
}) {
    const router = useRouter();

    // Map existing answers to state
    const initialAnswers = existingAnswers.reduce((acc, current) => {
        acc[current.question_id] = current.text_answer || current.selected_option_index?.toString() || current.file_url || '';
        return acc;
    }, {} as Record<string, string>);

    const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Timer Logic
    useEffect(() => {
        if (!assessment.duration_minutes) return;

        const startedAt = new Date(submission.started_at).getTime();
        const cutoff = startedAt + (assessment.duration_minutes * 60 * 1000);

        const updateTimer = () => {
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((cutoff - now) / 1000));
            setTimeLeft(remaining);

            if (remaining <= 0) {
                // Strict cutoff: Auto-submit
                handleAutoSubmit();
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [assessment.duration_minutes, submission.started_at]);

    const handleAutoSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        alert('Time is up! Your exam is being automatically submitted.');
        await processSubmission();
    };

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic validation for mandatory questions
        const missingMandatory = questions.filter(q => q.is_mandatory && !answers[q.id]);
        if (missingMandatory.length > 0) {
            alert(`Please answer all required questions. You missed ${missingMandatory.length} mandatory question(s).`);
            return;
        }

        if (confirm("Are you sure you want to submit? You cannot change your answers after submission.")) {
            setIsSubmitting(true);
            await processSubmission();
        }
    };

    const processSubmission = async () => {
        try {
            // First, process answers logic (evaluating multiple choice)
            // Note: Since we don't have is_correct on client for security, we evaluate on the backend in a real app via API.
            // Since this is MVP using Supabase direct calls, the student client CANNOT evaluate its own points if it can't see the answers.
            // Wait, we DO need an API route for submission to evaluate scores securely!
            // But I'll create `src/app/api/student/submit-exam/route.ts` to handle grading and finalizing submission.

            const payload = {
                submissionId: submission.id,
                assessmentId: assessment.id,
                answers
            };

            const response = await fetch(`/api/student/submit-exam`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error("Failed to submit exam");
            }

            router.push(withLocalePrefix('/student/assessments', locale));
            router.refresh();

        } catch (error: any) {
            console.error(error);
            alert("An error occurred while submitting: " + error.message);
            setIsSubmitting(false); // only re-enable if failed
        }
    };

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        return `${m}m ${s}s`;
    };

    return (
        <form onSubmit={handleManualSubmit} className="relative pb-24">
            {/* Header Stick */}
            <div className="sticky top-0 z-40 bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 truncate max-w-sm md:max-w-full">
                            {assessment.title}
                        </h1>
                    </div>
                    {timeLeft !== null && (
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-bold font-mono tracking-wider ${timeLeft < 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-800'
                            }`}>
                            <Clock className="h-4 w-4" />
                            {formatTime(timeLeft)}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-8 space-y-6">

                {assessment.long_description && (
                    <Card className="bg-blue-50 border-blue-100 shadow-sm">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
                            <p className="text-blue-800 text-sm whitespace-pre-wrap">{assessment.long_description}</p>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <Card key={q.id} className={q.is_mandatory && !answers[q.id] ? 'border-orange-200' : ''}>
                            <CardHeader className="bg-gray-50 border-b pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-gray-400">Q{index + 1}</span>
                                        <div>
                                            <CardTitle className="text-lg leading-relaxed font-medium text-gray-800">
                                                {q.question_text}
                                                {q.is_mandatory && <span className="text-red-500 ms-1" title="Required">*</span>}
                                            </CardTitle>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold bg-white border px-3 py-1 rounded text-gray-500">
                                        {q.points} point{q.points !== 1 ? 's' : ''}
                                    </div>
                                </div>
                                {q.image_url && (
                                    <div className="mt-4 relative h-48 w-full max-w-md bg-white border rounded p-2">
                                        <Image src={q.image_url} alt="Question image" fill className="object-contain" />
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="pt-6">
                                {q.question_type === 'multiple_choice' && (
                                    <div className="space-y-3">
                                        {q.options_json?.map((opt: any, i: number) => (
                                            <label
                                                key={i}
                                                className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === i.toString() ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400' : 'hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${q.id}`}
                                                    value={i}
                                                    checked={answers[q.id] === i.toString()}
                                                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{opt.text}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {q.question_type === 'text' && (
                                    <div>
                                        <Textarea
                                            placeholder="Type your answer here..."
                                            className="min-h-[120px] resize-y"
                                            value={answers[q.id] || ''}
                                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        />
                                    </div>
                                )}

                                {q.question_type === 'file_upload' && (
                                    <div className="p-8 border-2 border-dashed rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
                                        <FileBox className="h-10 w-10 text-gray-400 mb-3" />
                                        <p className="text-sm text-gray-500 mb-4">Upload your completed assignment file.</p>
                                        <div className="w-full max-w-xs">
                                            {/* Note: File upload logic is simplified as URL input for MVP. In a real app, this integrates with Supabase Storage bucket. */}
                                            <label className="block text-xs font-semibold text-gray-500 mb-1 text-left">Provide File URL (Placeholder for MVP)</label>
                                            <Input
                                                placeholder="https://..."
                                                value={answers[q.id] || ''}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(q.id, e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40 flex justify-end gap-4 lg:ps-64">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-brand-primary text-black hover:bg-yellow-400 px-8 font-bold gap-2 text-lg h-12"
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    {!isSubmitting && <CheckCircle2 className="h-5 w-5" />}
                </Button>
            </div>
        </form>
    );
}
