import { ReelsLearningComponent, type ReelClip } from '@/components/student/ReelsLearningComponent';

const demoVideo = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

const mockReels: ReelClip[] = [
    {
        id: 'reel-01',
        teacherId: 'teacher-01',
        groupId: 'group-01',
        subjectId: 'subject-01',
        lessonId: 'lesson-01',
        materialId: 'material-01',
        teacherName: 'Ms. Laila',
        subjectName: 'Biology',
        lessonTitle: 'Chapter 4',
        createdAt: hoursAgo(1),
        durationSec: 88,
        title: {
            en: 'Photosynthesis in 90 Seconds',
            ar: 'التمثيل الضوئي في 90 ثانية',
        },
        summary: {
            en: 'How plants convert sunlight into energy and oxygen.',
            ar: 'كيف تحول النباتات ضوء الشمس إلى طاقة وأكسجين.',
        },
        objective: {
            en: 'Identify inputs and outputs of photosynthesis.',
            ar: 'تحديد مدخلات ومخرجات التمثيل الضوئي.',
        },
        keywords: {
            en: ['chlorophyll', 'CO2', 'oxygen'],
            ar: ['الكلوروفيل', 'ثاني أكسيد الكربون', 'الأكسجين'],
        },
        captions: {
            en: 'Light + CO2 + H2O → glucose + oxygen.',
            ar: 'ضوء + ثاني أكسيد الكربون + ماء → جلوكوز + أكسجين.',
        },
        topics: {
            en: ['Energy Flow', 'Plant Cells'],
            ar: ['تدفق الطاقة', 'الخلايا النباتية'],
        },
        videoUrl: demoVideo,
        thumbnailUrl: '/course-science.png',
    },
    {
        id: 'reel-02',
        teacherId: 'teacher-02',
        groupId: 'group-01',
        subjectId: 'subject-02',
        lessonId: 'lesson-02',
        materialId: 'material-02',
        teacherName: 'Mr. Omar',
        subjectName: 'Mathematics',
        lessonTitle: 'Unit 2',
        createdAt: hoursAgo(4),
        durationSec: 75,
        title: {
            en: 'Linear Equations Quick Recap',
            ar: 'مراجعة سريعة للمعادلات الخطية',
        },
        summary: {
            en: 'Solve y = mx + b and read the graph in under a minute.',
            ar: 'حل y = mx + b وقراءة الرسم البياني خلال دقيقة.',
        },
        objective: {
            en: 'Interpret slope and intercept from an equation.',
            ar: 'تفسير الميل والقطع من المعادلة.',
        },
        keywords: {
            en: ['slope', 'intercept', 'graph'],
            ar: ['الميل', 'القطع', 'الرسم البياني'],
        },
        captions: {
            en: 'Slope = rise/run. Intercept is where the line crosses the y-axis.',
            ar: 'الميل = التغير الرأسي/الأفقي. والقطع هو تقاطع الخط مع محور y.',
        },
        topics: {
            en: ['Algebra Basics', 'Graph Reading'],
            ar: ['أساسيات الجبر', 'قراءة الرسم البياني'],
        },
        videoUrl: demoVideo,
        thumbnailUrl: '/course-math.png',
    },
    {
        id: 'reel-03',
        teacherId: 'teacher-03',
        groupId: 'group-02',
        subjectId: 'subject-03',
        lessonId: 'lesson-03',
        materialId: 'material-03',
        teacherName: 'Ms. Rana',
        subjectName: 'Arabic',
        lessonTitle: 'Grammar Basics',
        createdAt: daysAgo(2),
        durationSec: 110,
        title: {
            en: 'Nominal vs. Verbal Sentences',
            ar: 'الجملة الاسمية والجملة الفعلية',
        },
        summary: {
            en: 'Learn how to distinguish Arabic sentence structures.',
            ar: 'تعرف على الفرق بين تركيب الجملة الاسمية والفعلية.',
        },
        objective: {
            en: 'Identify subject, predicate, and verb in context.',
            ar: 'تحديد المبتدأ والخبر والفعل في السياق.',
        },
        keywords: {
            en: ['noun', 'verb', 'predicate'],
            ar: ['اسم', 'فعل', 'خبر'],
        },
        captions: {
            en: 'Nominal sentences start with a noun, verbal sentences start with a verb.',
            ar: 'الجملة الاسمية تبدأ باسم، والفعلية تبدأ بفعل.',
        },
        topics: {
            en: ['Grammar', 'Sentence Structure'],
            ar: ['النحو', 'تركيب الجملة'],
        },
        videoUrl: demoVideo,
        thumbnailUrl: '/course-arabic.png',
    },
    {
        id: 'reel-04',
        teacherId: 'teacher-04',
        groupId: 'group-03',
        subjectId: 'subject-04',
        lessonId: 'lesson-04',
        materialId: 'material-04',
        teacherName: 'Dr. Yusuf',
        subjectName: 'Physics',
        lessonTitle: "Newton's Laws",
        createdAt: daysAgo(5),
        durationSec: 95,
        title: {
            en: "Newton's First Law in Action",
            ar: 'قانون نيوتن الأول في الحياة اليومية',
        },
        summary: {
            en: 'Understand inertia with everyday examples.',
            ar: 'فهم القصور الذاتي من خلال أمثلة يومية.',
        },
        objective: {
            en: 'Explain why objects resist changes in motion.',
            ar: 'شرح سبب مقاومة الأجسام لتغير الحركة.',
        },
        keywords: {
            en: ['inertia', 'force', 'motion'],
            ar: ['القصور الذاتي', 'القوة', 'الحركة'],
        },
        captions: {
            en: 'Objects stay in motion unless acted on by a force.',
            ar: 'الأجسام تبقى في حالتها ما لم تؤثر عليها قوة خارجية.',
        },
        topics: {
            en: ['Forces', 'Motion'],
            ar: ['القوى', 'الحركة'],
        },
        videoUrl: demoVideo,
        thumbnailUrl: '/course-science.png',
    },
    {
        id: 'reel-05',
        teacherId: 'teacher-05',
        groupId: 'group-04',
        subjectId: 'subject-05',
        lessonId: 'lesson-05',
        materialId: 'material-05',
        teacherName: 'Ms. Dina',
        subjectName: 'History',
        lessonTitle: 'Industrial Revolution',
        createdAt: daysAgo(10),
        durationSec: 120,
        title: {
            en: 'Industrial Revolution Highlights',
            ar: 'أهم محطات الثورة الصناعية',
        },
        summary: {
            en: 'Key inventions and impacts on society.',
            ar: 'أبرز الاختراعات وتأثيرها على المجتمع.',
        },
        objective: {
            en: 'Connect technological changes to social shifts.',
            ar: 'ربط التطورات التقنية بالتغيرات الاجتماعية.',
        },
        keywords: {
            en: ['steam', 'factory', 'urbanization'],
            ar: ['البخار', 'المصانع', 'التحضر'],
        },
        captions: {
            en: 'Factories reshaped work, cities, and economies worldwide.',
            ar: 'المصانع غيرت أساليب العمل والمدن والاقتصاد عالمياً.',
        },
        topics: {
            en: ['Industrialization', 'Modern History'],
            ar: ['التصنيع', 'التاريخ الحديث'],
        },
        videoUrl: demoVideo,
        thumbnailUrl: '/course-science.png',
    },
];

export default function StudentReelsPage() {
    return (
        <div className="space-y-6">
            <ReelsLearningComponent reels={mockReels} />
        </div>
    );
}
