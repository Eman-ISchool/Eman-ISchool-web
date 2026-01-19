import curriculumData from '@/data/egypt-curriculum.json';

export interface Subject {
    id: string;
    name_en: string;
    name_ar: string;
    type: 'core' | 'activity';
    icon: string;
}

export interface Grade {
    id: string;
    name_en: string;
    name_ar: string;
    subjects: Subject[];
}

export interface Stage {
    id: string;
    name_en: string;
    name_ar: string;
    grades: Grade[];
}

export interface CurriculumData {
    country: string;
    country_ar: string;
    stages: Stage[];
}

const curriculum: CurriculumData = curriculumData as CurriculumData;

/**
 * Get all educational stages
 */
export function getStages(): Stage[] {
    return curriculum.stages;
}

/**
 * Get a specific stage by ID
 */
export function getStage(stageId: string): Stage | undefined {
    return curriculum.stages.find(stage => stage.id === stageId);
}

/**
 * Get all grades for a specific stage
 */
export function getGrades(stageId: string): Grade[] {
    const stage = getStage(stageId);
    return stage?.grades || [];
}

/**
 * Get a specific grade by stage and grade ID
 */
export function getGrade(stageId: string, gradeId: string): Grade | undefined {
    const grades = getGrades(stageId);
    return grades.find(grade => grade.id === gradeId);
}

/**
 * Get all subjects for a specific stage and grade
 */
export function getSubjects(stageId: string, gradeId: string): Subject[] {
    const grade = getGrade(stageId, gradeId);
    return grade?.subjects || [];
}

/**
 * Search subjects across all stages and grades
 * Searches in both English and Arabic names
 */
export function searchSubjects(keyword: string): {
    stage: Stage;
    grade: Grade;
    subject: Subject;
}[] {
    const results: { stage: Stage; grade: Grade; subject: Subject }[] = [];
    const searchTerm = keyword.toLowerCase().trim();

    if (!searchTerm) return results;

    for (const stage of curriculum.stages) {
        for (const grade of stage.grades) {
            for (const subject of grade.subjects) {
                if (
                    subject.name_en.toLowerCase().includes(searchTerm) ||
                    subject.name_ar.includes(searchTerm) ||
                    subject.id.toLowerCase().includes(searchTerm)
                ) {
                    results.push({ stage, grade, subject });
                }
            }
        }
    }

    return results;
}

/**
 * Filter subjects by type (core or activity)
 */
export function filterSubjectsByType(
    stageId: string,
    gradeId: string,
    type: 'core' | 'activity' | 'all'
): Subject[] {
    const subjects = getSubjects(stageId, gradeId);
    if (type === 'all') return subjects;
    return subjects.filter(subject => subject.type === type);
}

/**
 * Get the full curriculum data
 */
export function getCurriculum(): CurriculumData {
    return curriculum;
}

/**
 * Export curriculum as JSON string
 */
export function exportCurriculumJSON(): string {
    return JSON.stringify(curriculum, null, 2);
}
