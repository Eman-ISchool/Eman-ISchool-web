'use client';

import { User, MessageCircle, ChevronRight } from 'lucide-react';

interface Teacher {
    id: string;
    name: string;
    image?: string;
    subjects?: string[];
    bio?: string;
}

interface TeacherCardListProps {
    teachers: Teacher[];
    title?: string;
    onSeeAll?: () => void;
    onMessage?: (teacherId: string) => void;
}

export function TeacherCardList({ teachers, title, onSeeAll, onMessage }: TeacherCardListProps) {
    if (teachers.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title || 'Teachers'}</h2>
                {onSeeAll && (
                    <button
                        onClick={onSeeAll}
                        className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                        See all
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="carousel-container -mx-4 px-4">
                {teachers.map((teacher) => (
                    <div key={teacher.id} className="carousel-item flex-shrink-0" style={{ flex: '0 0 180px' }}>
                        <div className="card-soft p-4 text-center h-full">
                            {/* Avatar */}
                            <div className="w-16 h-16 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center overflow-hidden mx-auto mb-3">
                                {teacher.image ? (
                                    <img
                                        src={teacher.image}
                                        alt={teacher.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-8 h-8 text-[var(--color-primary)]" />
                                )}
                            </div>

                            {/* Name */}
                            <h4 className="font-medium text-[var(--color-text-primary)] truncate mb-1">
                                {teacher.name}
                            </h4>

                            {/* Subjects */}
                            {teacher.subjects && teacher.subjects.length > 0 && (
                                <p className="text-xs text-[var(--color-text-secondary)] truncate mb-3">
                                    {teacher.subjects.slice(0, 2).join(', ')}
                                </p>
                            )}

                            {/* Message Button */}
                            {onMessage && (
                                <button
                                    onClick={() => onMessage(teacher.id)}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-full hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
