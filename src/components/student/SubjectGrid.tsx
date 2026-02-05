import { ChevronRight } from 'lucide-react';
import {
    BookOpen, Calculator, FlaskConical, Globe2,
    Languages, Music, Palette, Dumbbell
} from 'lucide-react';

interface Subject {
    id: string;
    name: string;
    icon?: string;
}

interface SubjectGridProps {
    subjects: Subject[];
    title?: string;
    onSeeAll?: () => void;
    onSubjectClick?: (subjectId: string) => void;
}

// Map subject names to icons
const subjectIcons: Record<string, React.ReactNode> = {
    math: <Calculator className="w-6 h-6" />,
    science: <FlaskConical className="w-6 h-6" />,
    english: <Languages className="w-6 h-6" />,
    arabic: <BookOpen className="w-6 h-6" />,
    geography: <Globe2 className="w-6 h-6" />,
    history: <BookOpen className="w-6 h-6" />,
    art: <Palette className="w-6 h-6" />,
    music: <Music className="w-6 h-6" />,
    pe: <Dumbbell className="w-6 h-6" />,
    default: <BookOpen className="w-6 h-6" />,
};

function getSubjectIcon(name: string) {
    const key = name.toLowerCase().replace(/\s+/g, '');
    return subjectIcons[key] || subjectIcons.default;
}

export function SubjectGrid({ subjects, title, onSeeAll, onSubjectClick }: SubjectGridProps) {
    if (subjects.length === 0) {
        return null;
    }

    // Show only first 8 subjects + "See all"
    const displaySubjects = subjects.slice(0, 8);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title || 'Subjects'}</h2>
                {onSeeAll && subjects.length > 8 && (
                    <button
                        onClick={onSeeAll}
                        className="flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
                    >
                        See all
                        <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-4 gap-3">
                {displaySubjects.map((subject) => (
                    <button
                        key={subject.id}
                        onClick={() => onSubjectClick?.(subject.id)}
                        className="card-soft p-3 flex flex-col items-center gap-2 hover:shadow-lg transition-shadow"
                    >
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)]">
                            {getSubjectIcon(subject.name)}
                        </div>
                        <span className="text-xs font-medium text-[var(--color-text-primary)] text-center line-clamp-1">
                            {subject.name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
