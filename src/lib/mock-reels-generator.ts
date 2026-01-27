/**
 * Mock Reels Generator
 * Generates realistic sample reel data for testing without Nanobana API
 */

export interface MockReelData {
    title_en: string;
    title_ar: string;
    description_en: string;
    description_ar: string;
    video_url: string;
    thumbnail_url: string;
    duration_seconds: number;
    subject: string;
    grade_level: string;
    keywords_en: string[];
    keywords_ar: string[];
    topics_en: string[];
    topics_ar: string[];
}

/**
 * Sample educational videos from public sources
 */
const SAMPLE_VIDEOS = [
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        duration: 90,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        duration: 75,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        duration: 60,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        duration: 85,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        duration: 70,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        duration: 65,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        duration: 80,
    },
    {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        duration: 95,
    },
];

/**
 * Educational content templates
 */
const EDUCATIONAL_CONTENT = [
    {
        subject: 'Mathematics',
        grade_level: 'Grade 8',
        title_en: 'Introduction to Algebra',
        title_ar: 'مقدمة في الجبر',
        description_en: 'Learn the basics of algebraic expressions and equations',
        description_ar: 'تعلم أساسيات التعبيرات والمعادلات الجبرية',
        keywords_en: ['algebra', 'equations', 'variables', 'expressions'],
        keywords_ar: ['جبر', 'معادلات', 'متغيرات', 'تعبيرات'],
        topics_en: ['Linear Equations', 'Variables', 'Solving for X'],
        topics_ar: ['المعادلات الخطية', 'المتغيرات', 'حل المعادلات'],
    },
    {
        subject: 'Science',
        grade_level: 'Grade 6',
        title_en: 'The Water Cycle',
        title_ar: 'دورة الماء',
        description_en: 'Understanding how water moves through our environment',
        description_ar: 'فهم كيفية تحرك الماء في بيئتنا',
        keywords_en: ['water cycle', 'evaporation', 'condensation', 'precipitation'],
        keywords_ar: ['دورة الماء', 'التبخر', 'التكثيف', 'الهطول'],
        topics_en: ['Evaporation', 'Condensation', 'Precipitation', 'Collection'],
        topics_ar: ['التبخر', 'التكثيف', 'الهطول', 'التجمع'],
    },
    {
        subject: 'English',
        grade_level: 'Grade 7',
        title_en: 'Present Perfect Tense',
        title_ar: 'زمن المضارع التام',
        description_en: 'Master the present perfect tense with examples',
        description_ar: 'إتقان زمن المضارع التام مع الأمثلة',
        keywords_en: ['grammar', 'tenses', 'present perfect', 'verbs'],
        keywords_ar: ['قواعد', 'أزمنة', 'مضارع تام', 'أفعال'],
        topics_en: ['Have/Has', 'Past Participle', 'Time Expressions'],
        topics_ar: ['have/has', 'التصريف الثالث', 'تعبيرات الوقت'],
    },
    {
        subject: 'Biology',
        grade_level: 'Grade 9',
        title_en: 'Photosynthesis Explained',
        title_ar: 'شرح عملية التمثيل الضوئي',
        description_en: 'How plants convert sunlight into energy',
        description_ar: 'كيف تحول النباتات ضوء الشمس إلى طاقة',
        keywords_en: ['photosynthesis', 'chlorophyll', 'sunlight', 'glucose'],
        keywords_ar: ['التمثيل الضوئي', 'الكلوروفيل', 'ضوء الشمس', 'الجلوكوز'],
        topics_en: ['Light Reactions', 'Dark Reactions', 'Chloroplasts'],
        topics_ar: ['التفاعلات الضوئية', 'التفاعلات الظلامية', 'البلاستيدات الخضراء'],
    },
    {
        subject: 'Mathematics',
        grade_level: 'Grade 7',
        title_en: 'Geometry: Triangles',
        title_ar: 'الهندسة: المثلثات',
        description_en: 'Types of triangles and their properties',
        description_ar: 'أنواع المثلثات وخصائصها',
        keywords_en: ['geometry', 'triangles', 'angles', 'shapes'],
        keywords_ar: ['هندسة', 'مثلثات', 'زوايا', 'أشكال'],
        topics_en: ['Equilateral', 'Isosceles', 'Scalene', 'Right Triangle'],
        topics_ar: ['متساوي الأضلاع', 'متساوي الساقين', 'مختلف الأضلاع', 'قائم الزاوية'],
    },
    {
        subject: 'Physics',
        grade_level: 'Grade 10',
        title_en: 'Newton\'s Laws of Motion',
        title_ar: 'قوانين نيوتن للحركة',
        description_en: 'Understanding the three fundamental laws of motion',
        description_ar: 'فهم القوانين الثلاثة الأساسية للحركة',
        keywords_en: ['physics', 'motion', 'force', 'acceleration'],
        keywords_ar: ['فيزياء', 'حركة', 'قوة', 'تسارع'],
        topics_en: ['Inertia', 'Force and Acceleration', 'Action-Reaction'],
        topics_ar: ['القصور الذاتي', 'القوة والتسارع', 'الفعل ورد الفعل'],
    },
    {
        subject: 'Chemistry',
        grade_level: 'Grade 9',
        title_en: 'The Periodic Table',
        title_ar: 'الجدول الدوري',
        description_en: 'Exploring elements and their organization',
        description_ar: 'استكشاف العناصر وتنظيمها',
        keywords_en: ['chemistry', 'elements', 'periodic table', 'atoms'],
        keywords_ar: ['كيمياء', 'عناصر', 'جدول دوري', 'ذرات'],
        topics_en: ['Groups', 'Periods', 'Metals', 'Non-metals'],
        topics_ar: ['المجموعات', 'الدورات', 'الفلزات', 'اللافلزات'],
    },
    {
        subject: 'History',
        grade_level: 'Grade 8',
        title_en: 'Ancient Civilizations',
        title_ar: 'الحضارات القديمة',
        description_en: 'Journey through early human civilizations',
        description_ar: 'رحلة عبر الحضارات الإنسانية المبكرة',
        keywords_en: ['history', 'civilizations', 'ancient', 'culture'],
        keywords_ar: ['تاريخ', 'حضارات', 'قديم', 'ثقافة'],
        topics_en: ['Egypt', 'Mesopotamia', 'Indus Valley', 'China'],
        topics_ar: ['مصر', 'بلاد الرافدين', 'وادي السند', 'الصين'],
    },
    {
        subject: 'Geography',
        grade_level: 'Grade 7',
        title_en: 'Climate Zones',
        title_ar: 'المناطق المناخية',
        description_en: 'Understanding different climate regions of Earth',
        description_ar: 'فهم المناطق المناخية المختلفة على الأرض',
        keywords_en: ['geography', 'climate', 'weather', 'zones'],
        keywords_ar: ['جغرافيا', 'مناخ', 'طقس', 'مناطق'],
        topics_en: ['Tropical', 'Temperate', 'Polar', 'Arid'],
        topics_ar: ['استوائي', 'معتدل', 'قطبي', 'جاف'],
    },
    {
        subject: 'Arabic',
        grade_level: 'Grade 6',
        title_en: 'Arabic Grammar Basics',
        title_ar: 'أساسيات قواعد اللغة العربية',
        description_en: 'Introduction to Arabic sentence structure',
        description_ar: 'مقدمة في تركيب الجملة العربية',
        keywords_en: ['arabic', 'grammar', 'sentence', 'structure'],
        keywords_ar: ['عربي', 'قواعد', 'جملة', 'تركيب'],
        topics_en: ['Subject', 'Predicate', 'Verb', 'Noun'],
        topics_ar: ['المبتدأ', 'الخبر', 'الفعل', 'الاسم'],
    },
];

/**
 * Generate a random mock reel
 */
export function generateMockReel(): MockReelData {
    const video = SAMPLE_VIDEOS[Math.floor(Math.random() * SAMPLE_VIDEOS.length)];
    const content = EDUCATIONAL_CONTENT[Math.floor(Math.random() * EDUCATIONAL_CONTENT.length)];

    return {
        ...content,
        video_url: video.url,
        thumbnail_url: video.thumbnail,
        duration_seconds: video.duration,
    };
}

/**
 * Generate multiple mock reels
 */
export function generateMockReels(count: number): MockReelData[] {
    const reels: MockReelData[] = [];
    const usedIndices = new Set<number>();

    for (let i = 0; i < Math.min(count, EDUCATIONAL_CONTENT.length); i++) {
        let index;
        do {
            index = Math.floor(Math.random() * EDUCATIONAL_CONTENT.length);
        } while (usedIndices.has(index));

        usedIndices.add(index);

        const video = SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length];
        const content = EDUCATIONAL_CONTENT[index];

        reels.push({
            ...content,
            video_url: video.url,
            thumbnail_url: video.thumbnail,
            duration_seconds: video.duration,
        });
    }

    return reels;
}

/**
 * Get all available mock reels
 */
export function getAllMockReels(): MockReelData[] {
    return EDUCATIONAL_CONTENT.map((content, index) => ({
        ...content,
        video_url: SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length].url,
        thumbnail_url: SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length].thumbnail,
        duration_seconds: SAMPLE_VIDEOS[index % SAMPLE_VIDEOS.length].duration,
    }));
}
