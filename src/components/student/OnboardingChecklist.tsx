'use client';

import { useState } from 'react';
import { Check, Circle, Loader2 } from 'lucide-react';
import type { StudentOnboardingTask } from '@/types/enrollment';

interface OnboardingChecklistProps {
    tasks: StudentOnboardingTask[];
    locale: string;
    onComplete: (taskId: string, completed: boolean) => Promise<void>;
}

export function OnboardingChecklist({ tasks, locale, onComplete }: OnboardingChecklistProps) {
    const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
    const isAr = locale === 'ar';

    const sortedTasks = [...tasks].sort((a, b) => a.sort_order - b.sort_order);
    const completedCount = sortedTasks.filter((t) => t.is_completed).length;
    const totalCount = sortedTasks.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const handleToggle = async (task: StudentOnboardingTask) => {
        if (loadingTaskId) return;
        setLoadingTaskId(task.id);
        try {
            await onComplete(task.id, !task.is_completed);
        } finally {
            setLoadingTaskId(null);
        }
    };

    return (
        <div className="space-y-4">
            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">
                        {isAr ? 'التقدم' : 'Progress'}
                    </span>
                    <span className="text-slate-500">
                        {completedCount}/{totalCount} {isAr ? 'مكتمل' : 'completed'}
                    </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-teal-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Task list */}
            <div className="space-y-2">
                {sortedTasks.map((task) => {
                    const title = isAr ? task.title_ar : task.title_en;
                    const description = isAr ? task.description_ar : task.description_en;
                    const isLoading = loadingTaskId === task.id;

                    return (
                        <button
                            key={task.id}
                            onClick={() => handleToggle(task)}
                            disabled={isLoading}
                            className={`w-full flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                                task.is_completed
                                    ? 'border-emerald-200 bg-emerald-50/50'
                                    : task.is_required
                                      ? 'border-slate-200 bg-white hover:border-teal-300 hover:shadow-sm'
                                      : 'border-slate-100 bg-white hover:border-teal-300 hover:shadow-sm'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="mt-0.5 shrink-0">
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                                ) : task.is_completed ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                ) : (
                                    <Circle className="w-5 h-5 text-slate-300" />
                                )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-sm font-medium ${
                                            task.is_completed ? 'text-slate-500 line-through' : 'text-slate-800'
                                        }`}
                                    >
                                        {title}
                                    </span>
                                    {task.is_required && !task.is_completed && (
                                        <span className="text-[10px] font-bold text-red-500">*</span>
                                    )}
                                </div>
                                {description && (
                                    <p className={`text-xs mt-0.5 ${task.is_completed ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {description}
                                    </p>
                                )}
                                {task.is_completed && task.completed_at && (
                                    <p className="text-[11px] text-emerald-600 mt-1">
                                        {isAr ? 'اكتمل في' : 'Completed'}{' '}
                                        {new Date(task.completed_at).toLocaleDateString(isAr ? 'ar-AE' : 'en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}
                                    </p>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
