'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, CheckCircle2, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type ReelClip = {
    id: string;
    teacherId: string;
    groupId: string;
    subjectId: string;
    lessonId: string;
    materialId: string;
    teacherName: string;
    subjectName: string;
    lessonTitle: string;
    createdAt: string;
    durationSec: number;
    title: { en: string; ar: string };
    summary: { en: string; ar: string };
    objective: { en: string; ar: string };
    keywords: { en: string[]; ar: string[] };
    captions: { en: string; ar: string };
    topics: { en: string[]; ar: string[] };
    videoUrl: string;
    thumbnailUrl?: string;
};

type DateFilter = 'today' | 'week' | 'all';

const formatDuration = (durationSec: number) => {
    const minutes = Math.floor(durationSec / 60);
    const seconds = Math.floor(durationSec % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const isSameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

const isWithinWeek = (date: Date, now: Date) => {
    const diff = now.getTime() - date.getTime();
    return diff >= 0 && diff <= 6 * 24 * 60 * 60 * 1000;
};

export function ReelsLearningComponent({ reels }: { reels: ReelClip[] }) {
    const { t, language } = useLanguage();
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [teacherFilter, setTeacherFilter] = useState('all');
    const [lessonFilter, setLessonFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState<DateFilter>('today');
    const [muted, setMuted] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [progress, setProgress] = useState<Record<string, number>>({});
    const [saved, setSaved] = useState<Set<string>>(new Set());
    const [completed, setCompleted] = useState<Set<string>>(new Set());
    const feedRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    const safeReels = useMemo(
        () => reels.filter((reel) => reel.durationSec <= 120),
        [reels]
    );

    const subjectOptions = useMemo(
        () => Array.from(new Set(safeReels.map((reel) => reel.subjectName))),
        [safeReels]
    );

    const teacherOptions = useMemo(
        () => Array.from(new Set(safeReels.map((reel) => reel.teacherName))),
        [safeReels]
    );

    const lessonOptions = useMemo(
        () => Array.from(new Set(safeReels.map((reel) => reel.lessonTitle))),
        [safeReels]
    );

    const filteredReels = useMemo(() => {
        const now = new Date();
        return safeReels.filter((reel) => {
            const createdAt = new Date(reel.createdAt);
            const matchesDate =
                dateFilter === 'all' ||
                (dateFilter === 'today' && isSameDay(createdAt, now)) ||
                (dateFilter === 'week' && isWithinWeek(createdAt, now));
            const matchesSubject = subjectFilter === 'all' || reel.subjectName === subjectFilter;
            const matchesTeacher = teacherFilter === 'all' || reel.teacherName === teacherFilter;
            const matchesLesson = lessonFilter === 'all' || reel.lessonTitle === lessonFilter;
            return matchesDate && matchesSubject && matchesTeacher && matchesLesson;
        });
    }, [safeReels, subjectFilter, teacherFilter, lessonFilter, dateFilter]);

    useEffect(() => {
        setActiveIndex(0);
    }, [subjectFilter, teacherFilter, lessonFilter, dateFilter]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const index = Number(entry.target.getAttribute('data-index'));
                    setActiveIndex(index);
                    videoRefs.current.forEach((video, videoIndex) => {
                        if (!video) return;
                        if (videoIndex === index) {
                            video.play().catch(() => null);
                        } else {
                            video.pause();
                        }
                    });
                });
            },
            {
                root: feedRef.current,
                threshold: 0.7,
            }
        );

        itemRefs.current.forEach((item) => item && observer.observe(item));
        return () => observer.disconnect();
    }, [filteredReels]);

    const toggleSave = (id: string) => {
        setSaved((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleComplete = (id: string) => {
        setCompleted((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const togglePlayback = (index: number) => {
        const video = videoRefs.current[index];
        if (!video) return;
        if (video.paused) {
            video.play().catch(() => null);
        } else {
            video.pause();
        }
    };

    const scrollNext = (index: number) => {
        const nextItem = itemRefs.current[index + 1];
        if (nextItem) {
            nextItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleTimeUpdate = (id: string, event: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = event.currentTarget;
        if (!video.duration || Number.isNaN(video.duration)) return;
        const pct = Math.min(100, (video.currentTime / video.duration) * 100);
        setProgress((prev) => ({ ...prev, [id]: pct }));
        if (pct >= 98) {
            setCompleted((prev) => {
                if (prev.has(id)) return prev;
                const next = new Set(prev);
                next.add(id);
                return next;
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                        {t('reels.title')}
                    </h1>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {t('reels.subtitle')}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-full bg-white shadow-sm border border-gray-100 p-1">
                        {(['today', 'week', 'all'] as DateFilter[]).map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setDateFilter(option)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                                    dateFilter === option
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-secondary)]'
                                }`}
                            >
                                {option === 'today'
                                    ? t('reels.today')
                                    : option === 'week'
                                        ? t('reels.week')
                                        : t('reels.all')}
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setMuted((prev) => !prev)}
                        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                        {muted ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                        {muted ? t('reels.unmute') : t('reels.mute')}
                    </button>
                </div>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {t('reels.filter.subject')}
                    <select
                        value={subjectFilter}
                        onChange={(event) => setSubjectFilter(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    >
                        <option value="all">{t('reels.subjectAll')}</option>
                        {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                                {subject}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {t('reels.filter.teacher')}
                    <select
                        value={teacherFilter}
                        onChange={(event) => setTeacherFilter(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    >
                        <option value="all">{t('reels.teacherAll')}</option>
                        {teacherOptions.map((teacher) => (
                            <option key={teacher} value={teacher}>
                                {teacher}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {t('reels.filter.lesson')}
                    <select
                        value={lessonFilter}
                        onChange={(event) => setLessonFilter(event.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--color-text-primary)]"
                    >
                        <option value="all">{t('reels.lessonAll')}</option>
                        {lessonOptions.map((lesson) => (
                            <option key={lesson} value={lesson}>
                                {lesson}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div
                ref={feedRef}
                className="no-scrollbar flex flex-col gap-6 overflow-y-auto snap-y snap-mandatory scroll-smooth h-[72vh] md:h-[78vh]"
            >
                {filteredReels.length === 0 ? (
                    <div className="card-soft p-8 text-center text-[var(--color-text-secondary)]">
                        {t('reels.noResults')}
                    </div>
                ) : (
                    filteredReels.map((reel, index) => (
                        <div
                            key={reel.id}
                            data-index={index}
                            ref={(el) => {
                                itemRefs.current[index] = el;
                            }}
                            className="snap-start h-[72vh] md:h-[78vh]"
                        >
                            <div
                                className="relative h-full w-full overflow-hidden rounded-[28px] bg-black shadow-lg"
                                onClick={() => togglePlayback(index)}
                            >
                                <video
                                    ref={(el) => {
                                        videoRefs.current[index] = el;
                                    }}
                                    src={reel.videoUrl}
                                    poster={reel.thumbnailUrl}
                                    playsInline
                                    muted={muted}
                                    preload={index <= activeIndex + 1 ? 'auto' : 'metadata'}
                                    className="h-full w-full object-cover"
                                    onTimeUpdate={(event) => handleTimeUpdate(reel.id, event)}
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                                <div className="absolute inset-0 flex flex-col justify-between p-4">
                                    <div className="flex items-center justify-between text-xs text-white/80">
                                        <span className="rounded-full bg-white/15 px-3 py-1">
                                            {(language === 'ar' ? reel.topics.ar : reel.topics.en)[0]}
                                        </span>
                                        <span className="rounded-full bg-black/40 px-3 py-1 text-[11px]">
                                            {t('reels.duration')} {formatDuration(reel.durationSec)}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="max-w-md rounded-xl bg-black/50 px-3 py-2 text-sm text-white">
                                            <span className="text-white/70">{t('reels.captions')}:</span>{' '}
                                            {language === 'ar' ? reel.captions.ar : reel.captions.en}
                                        </div>

                                        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                                            <div className="space-y-2">
                                                <h2 className="text-xl font-semibold text-white">
                                                    {language === 'ar' ? reel.title.ar : reel.title.en}
                                                </h2>
                                                <p className="text-sm text-white/80">
                                                    {language === 'ar' ? reel.summary.ar : reel.summary.en}
                                                </p>
                                                <div className="text-xs text-white/70">
                                                    {reel.teacherName} • {reel.subjectName} • {reel.lessonTitle}
                                                </div>
                                                <div className="text-xs text-white/80">
                                                    <span className="text-white/60">{t('reels.objective')}:</span>{' '}
                                                    {language === 'ar' ? reel.objective.ar : reel.objective.en}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {(language === 'ar' ? reel.keywords.ar : reel.keywords.en).map(
                                                        (keyword) => (
                                                            <span
                                                                key={keyword}
                                                                className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white/80"
                                                            >
                                                                {keyword}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleSave(reel.id);
                                                    }}
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                                                        saved.has(reel.id)
                                                            ? 'bg-white text-[var(--color-primary)]'
                                                            : 'bg-white/15 text-white'
                                                    }`}
                                                >
                                                    <Bookmark className="w-4 h-4" />
                                                    {saved.has(reel.id) ? t('reels.saved') : t('reels.save')}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        toggleComplete(reel.id);
                                                    }}
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                                                        completed.has(reel.id)
                                                            ? 'bg-[var(--color-primary)] text-white'
                                                            : 'bg-white/15 text-white'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    {completed.has(reel.id)
                                                        ? t('reels.completed')
                                                        : t('reels.markCompleted')}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        scrollNext(index);
                                                    }}
                                                    className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white"
                                                >
                                                    <ChevronDown className="w-4 h-4" />
                                                    {t('reels.next')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full rounded-full bg-white/20">
                                        <div
                                            className="h-1.5 rounded-full bg-[var(--color-primary)] transition-all"
                                            style={{ width: `${progress[reel.id] || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
