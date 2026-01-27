/**
 * Seed Reels Script
 * Populates the database with sample educational reels for testing
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase credentials in .env file');
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Sample educational reels data
const SAMPLE_REELS = [
    {
        title_en: 'Introduction to Algebra',
        title_ar: 'مقدمة في الجبر',
        description_en: 'Learn the basics of algebraic expressions and equations',
        description_ar: 'تعلم أساسيات التعبيرات والمعادلات الجبرية',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        duration_seconds: 90,
        subject: 'Mathematics',
        grade_level: 'Grade 8',
    },
    {
        title_en: 'The Water Cycle',
        title_ar: 'دورة الماء',
        description_en: 'Understanding how water moves through our environment',
        description_ar: 'فهم كيفية تحرك الماء في بيئتنا',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        duration_seconds: 75,
        subject: 'Science',
        grade_level: 'Grade 6',
    },
    {
        title_en: 'Present Perfect Tense',
        title_ar: 'زمن المضارع التام',
        description_en: 'Master the present perfect tense with examples',
        description_ar: 'إتقان زمن المضارع التام مع الأمثلة',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
        duration_seconds: 60,
        subject: 'English',
        grade_level: 'Grade 7',
    },
    {
        title_en: 'Photosynthesis Explained',
        title_ar: 'شرح عملية التمثيل الضوئي',
        description_en: 'How plants convert sunlight into energy',
        description_ar: 'كيف تحول النباتات ضوء الشمس إلى طاقة',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
        duration_seconds: 85,
        subject: 'Biology',
        grade_level: 'Grade 9',
    },
    {
        title_en: 'Geometry: Triangles',
        title_ar: 'الهندسة: المثلثات',
        description_en: 'Types of triangles and their properties',
        description_ar: 'أنواع المثلثات وخصائصها',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
        duration_seconds: 70,
        subject: 'Mathematics',
        grade_level: 'Grade 7',
    },
    {
        title_en: 'Newton\'s Laws of Motion',
        title_ar: 'قوانين نيوتن للحركة',
        description_en: 'Understanding the three fundamental laws of motion',
        description_ar: 'فهم القوانين الثلاثة الأساسية للحركة',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
        duration_seconds: 65,
        subject: 'Physics',
        grade_level: 'Grade 10',
    },
    {
        title_en: 'The Periodic Table',
        title_ar: 'الجدول الدوري',
        description_en: 'Exploring elements and their organization',
        description_ar: 'استكشاف العناصر وتنظيمها',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerMeltdowns.jpg',
        duration_seconds: 80,
        subject: 'Chemistry',
        grade_level: 'Grade 9',
    },
    {
        title_en: 'Ancient Civilizations',
        title_ar: 'الحضارات القديمة',
        description_en: 'Journey through early human civilizations',
        description_ar: 'رحلة عبر الحضارات الإنسانية المبكرة',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        duration_seconds: 95,
        subject: 'History',
        grade_level: 'Grade 8',
    },
];

async function main() {
    console.log('🌱 Seeding Reels Database\n');
    console.log('─'.repeat(60));
    console.log('');

    try {
        // Check if reels table exists
        const { error: tableCheckError } = await supabase
            .from('reels')
            .select('id')
            .limit(1);

        if (tableCheckError) {
            console.error('❌ Reels table does not exist!');
            console.error('   Please run the migration first:');
            console.error('   1. Open Supabase Dashboard');
            console.error('   2. Go to SQL Editor');
            console.error('   3. Execute supabase/migrations/add_reels_tables.sql\n');
            process.exit(1);
        }

        // Get or create a teacher
        const { data: teachers, error: teacherError } = await supabase
            .from('users')
            .select('id, name')
            .eq('role', 'teacher')
            .limit(1);

        let teacherId: string;

        if (teacherError || !teachers || teachers.length === 0) {
            console.log('⚠️  No teacher found. Creating sample teacher...');

            const { data: newTeacher, error: createError } = await supabase
                .from('users')
                .insert({
                    email: 'teacher@eduverse.com',
                    name: 'Sample Teacher',
                    role: 'teacher',
                    google_id: `sample-teacher-${Date.now()}`
                })
                .select()
                .single();

            if (createError) {
                console.error('❌ Failed to create teacher:', createError.message);
                process.exit(1);
            }

            teacherId = newTeacher.id;
            console.log(`✅ Created teacher: ${newTeacher.name}\n`);
        } else {
            teacherId = teachers[0].id;
            console.log(`✅ Using teacher: ${teachers[0].name}\n`);
        }

        // Check if reels already exist
        const { data: existingReels, count } = await supabase
            .from('reels')
            .select('*', { count: 'exact' });

        if (count && count > 0) {
            console.log(`ℹ️  Found ${count} existing reels in database`);
            console.log('   Use --force flag to delete and recreate\n');

            const shouldForce = process.argv.includes('--force');

            if (!shouldForce) {
                console.log('✨ Seeding skipped (reels already exist)\n');
                process.exit(0);
            }

            console.log('🗑️  Deleting existing reels...\n');
            const { error: deleteError } = await supabase
                .from('reels')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (deleteError) {
                console.error('❌ Failed to delete existing reels:', deleteError.message);
                process.exit(1);
            }
        }

        // Prepare reels for insertion
        const reelsToInsert = SAMPLE_REELS.map(reel => ({
            ...reel,
            teacher_id: teacherId,
            status: 'approved',
            is_published: true,
        }));

        // Insert sample reels
        console.log(`📚 Inserting ${reelsToInsert.length} sample reels...\n`);

        const { data: insertedReels, error: insertError } = await supabase
            .from('reels')
            .insert(reelsToInsert)
            .select();

        if (insertError) {
            console.error('❌ Failed to insert reels:', insertError.message);
            process.exit(1);
        }

        console.log(`✅ Successfully created ${insertedReels?.length || 0} reels\n`);

        // Display created reels
        if (insertedReels) {
            console.log('📋 Created Reels:');
            console.log('─'.repeat(60));
            insertedReels.forEach((reel: any, index: number) => {
                console.log(`${index + 1}. ${reel.title_en}`);
                console.log(`   ${reel.title_ar}`);
                console.log(`   Subject: ${reel.subject} | Grade: ${reel.grade_level}`);
                console.log(`   Duration: ${reel.duration_seconds}s | Status: ${reel.status}`);
                console.log('');
            });
        }

        console.log('✨ Seeding complete!\n');
        console.log('Next steps:');
        console.log('1. Navigate to http://localhost:3456/student/reels');
        console.log('2. The reels should now be visible');
        console.log('3. Click on a reel to watch the video\n');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

main();
