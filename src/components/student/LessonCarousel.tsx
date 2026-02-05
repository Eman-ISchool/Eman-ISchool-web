'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LessonSlide, type Lesson } from './LessonSlide';
import { useLanguage } from '@/context/LanguageContext';
import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, withLocalePrefix } from '@/lib/locale-path';

interface LessonCarouselProps {
    lessons: Lesson[];
    title?: string;
    onSeeAll?: () => void;
}

export function LessonCarousel({ lessons, title, onSeeAll }: LessonCarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);
    const { t } = useLanguage();
    const pathname = usePathname();
    const locale = getLocaleFromPathname(pathname);

    // Default title handling if not provided
    const displayTitle = title || t('home.upcomingLessons');

    const scroll = (direction: 'left' | 'right') => {
        if (!carouselRef.current) return;
        const scrollAmount = 300;
        carouselRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth',
        });
    };

    if (lessons.length === 0) {
        return (
            <div className="card-soft p-8 text-center">
                <p className="text-[var(--color-text-secondary)]">{t('home.noLessons')}</p>
                <a href={withLocalePrefix('/student/calendar', locale)} className="text-[var(--color-primary)] text-sm font-medium mt-2 inline-block hover:underline">
                    {t('home.viewCalendar')}
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{displayTitle}</h2>
                <div className="flex items-center gap-2">
                    {onSeeAll && (
                        <button
                            onClick={onSeeAll}
                            className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                        >
                            {t('home.viewAll')}
                        </button>
                    )}
                    {/* Desktop only arrows */}
                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                            aria-label="Previous"
                        >
                            <ChevronLeft className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 rounded-full hover:bg-[var(--color-primary-light)] transition-colors"
                            aria-label="Next"
                        >
                            <ChevronRight className="w-5 h-5 text-[var(--color-text-secondary)]" />
                        </button>
                    </div>
                </div>
            </div>

            <div ref={carouselRef} className="carousel-container -mx-4 px-4">
                {lessons.map((lesson) => (
                    <div key={lesson.id} className="carousel-item">
                        <LessonSlide lesson={lesson} />
                    </div>
                ))}
            </div>
        </div>
    );
}
